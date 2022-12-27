import { useState, useEffect } from "react";
import "./App.css";
import axios from "axios";
import { Textarea } from "@nextui-org/react";
import { accessToken, logout, search } from "./spotify-utils.js";

function App() {
	const [spotifyToken, setSpotifyToken] = useState<string | null>(null);
	const [songs, setSongs] = useState<string[]>([]);
	const urlWithProxy = "/api";

	useEffect(() => {
		setSpotifyToken(accessToken);
	}, []);

	const fetchCompletions = async () => {
		try {
			const completions = await axios.post(`${urlWithProxy}/completion`, {
				prompt: "popular 2012 rap songs",
			});
			// Check that Open AI returned results
			if (completions.data.result.length > 0) {
				const result: string[] =
					completions.data.result[0].text.split("\n");
				const songs: string[] = result
					.filter((song) => song !== "")
					.map((song: string) => {
						return song.replaceAll('"', "").replace(/\d+\./gm, "");
					});
				songs.map((song) => {
					getSongsFromCompletion(song);
				});
				setSongs(songs);
			}
		} catch (error) {
			console.log(error);
		}
	};

	const getSongsFromCompletion = async (songName: string) => {
		try {
			const data = await search(songName, "track");
			console.log(songName, data);
		} catch (e) {
			console.error(e);
		}
	};

	return (
		<div className="App">
			<Textarea placeholder="Describe the types of songs you want..." />
			{!spotifyToken ? (
				<>
					<button onClick={logout}>Log Out</button>
				</>
			) : (
				<a href={`http://localhost:5000${urlWithProxy}/login`}>
					<button>Log In</button>
				</a>
			)}
			<button onClick={fetchCompletions}>Generate</button>
		</div>
	);
}

export default App;
