import { Configuration, OpenAIApi } from "openai";
import querystring from "querystring";
import axios from "axios";
import { nanoid } from "nanoid";
import cookieParser from "cookie-parser";
import express from "express";
import bodyParser from "body-parser";

const app = express();

const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const SPOTIFY_REDIRECT_URI = process.env.SPOTIFY_REDIRECT_URI;
const SPOTIFY_SCOPE =
	"user-library-modify \
	playlist-modify-public \
	playlist-modify-private \
	user-library-read \
	streaming \
	user-read-email \
	user-read-private \
	user-read-playback-state \
	user-modify-playback-state";

// Configure OpenAI
const configuration = new Configuration({
	apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

// Enable express to parse request bodies
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());
// Set secret for all cookies to be signed with using cookie-parser
app.use(cookieParser(process.env.COOKIE_SECRET));

// Endpoint for fetching a completion from OpenAI
app.post("/api/completion", async (req, res) => {
	try {
		const completion = await openai.createCompletion({
			model: "text-davinci-003",
			prompt: `song list of ${req.body.prompt}`,
			temperature: 0.7,
			max_tokens: 256,
			top_p: 1,
			frequency_penalty: 0,
			presence_penalty: 0,
		});
		res.status(200).json({ result: completion.data.choices });
	} catch (error) {
		if (error.response) {
			res.status(error.response.status).json({
				error: error.response.data,
			});
		} else {
			res.json({ error: error.message });
		}
	}
});

// Endpoint for authorizing with Spotify
app.get("/api/login", (req, res) => {
	const stateParam = nanoid(15);
	// store state parameter in cookie, set maxAge, and set signed to true
	res.cookie("stateParam", stateParam, {
		maxAge: 1000 * 60 * 5,
		signed: true,
	});
	const queryParams = querystring.stringify({
		client_id: SPOTIFY_CLIENT_ID,
		response_type: "code",
		redirect_uri: SPOTIFY_REDIRECT_URI,
		scope: SPOTIFY_SCOPE,
		state: stateParam,
	});
	res.redirect(`https://accounts.spotify.com/authorize?${queryParams}`);
});

app.get("/api/callback", async (req, res) => {
	//Extracting code and state
	const { code, state } = req.query;
	//Extracting state parameter previously signed and stored in cookies
	const { stateParam } = req.signedCookies;

	//Comparing state parameters
	if (state !== stateParam) {
		//throwing unprocessable entity error
		res.status(422).send("Invalid State");
		return;
	}

	const data = querystring.stringify({
		grant_type: "authorization_code",
		code: code,
		redirect_uri: SPOTIFY_REDIRECT_URI,
	});

	const headers = {
		"content-type": "application/x-www-form-urlencoded",
		Authorization: `Basic ${new Buffer.from(
			`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`
		).toString("base64")}`,
	};

	try {
		const tokenRes = await axios.post(
			"https://accounts.spotify.com/api/token",
			data,
			{
				headers: headers,
			}
		);
		if (tokenRes.status === 200) {
			const { access_token, refresh_token, expires_in } = tokenRes.data;
			const queryParams = querystring.stringify({
				access_token,
				refresh_token,
				expires_in,
			});
			res.redirect(`${process.env.BASE_URL}?${queryParams}`);
		} else {
			res.send(process.env.BASE_URL);
		}
	} catch (error) {
		res.send(error);
	}
});

app.get("/api/refresh_token", async (req, res) => {
	const { refresh_token } = req.query;

	const data = querystring.stringify({
		grant_type: "refresh_token",
		refresh_token: refresh_token,
	});

	const headers = {
		"content-type": "application/x-www-form-urlencoded",
		Authorization: `Basic ${new Buffer.from(
			`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`
		).toString("base64")}`,
	};

	try {
		const tokenRes = await axios.post(
			"https://accounts.spotify.com/api/token",
			data,
			{
				headers: headers,
			}
		);
		res.send(tokenRes.data);
	} catch (error) {
		res.send(error);
	}
});

export default app;
