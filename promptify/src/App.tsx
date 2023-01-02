import React, { useState, useEffect } from "react";
import "./App.css";
import axios from "axios";
import { Button, Container, Text, Progress } from "@nextui-org/react";
import { FiXCircle } from "react-icons/fi";
import PromptifyNavbar from "./components/PromptifyNavbar";
import ControlledTextArea from "./components/TypewriterTextarea";
import {
	accessToken,
	search,
	PromptifySong,
	formatSpotifySongToPromptifySong,
} from "./spotify-utils.js";

export const urlWithProxy = "/api";

function App() {
	const [spotifyToken, setSpotifyToken] = useState<string | null>(null);
	const [isGenerating, setIsGenerating] = useState<boolean>(false);
	const [songs, setSongs] = useState<PromptifySong[]>([]);
	const [prompt, setPrompt] = useState<string>("");

	useEffect(() => {
		setSpotifyToken(accessToken);
	}, []);

	const fetchCompletions = async () => {
		try {
			setIsGenerating(true);
			const uniqueCompletions = new Set<string>();
			for (let i = 0; i < 3; i++) {
				const completions = await axios.post(
					`${urlWithProxy}/completion`,
					{
						prompt: prompt,
					}
				);
				// Check that Open AI returned results
				if (completions.data.result.length > 0) {
					const result: string[] =
						completions.data.result[0].text.split("\n");
					result
						.filter((song: string) => song !== "")
						.map((song: string) => {
							uniqueCompletions.add(
								song.replaceAll('"', "").replace(/\d+\./gm, "")
							);
						});
				}
			}
			// We can safely cast array to PromptifySong[] becasue of our null check
			const promptifySongs: PromptifySong[] = (
				await Promise.all(
					Array.from(uniqueCompletions).map((song: string) => {
						return getSongFromCompletion(song);
					})
				)
			).filter(
				(promptifySong) => promptifySong !== null
			) as PromptifySong[];
			setSongs(promptifySongs);
			setIsGenerating(false);
		} catch (error) {
			console.log(error);
		}
	};

	const getSongFromCompletion = async (songName: string) => {
		try {
			const spotifyResponse = await search(songName, "track");
			const spotifySongs = spotifyResponse.data.tracks.items;
			if (spotifySongs && spotifySongs.length > 0) {
				return formatSpotifySongToPromptifySong(spotifySongs[0]);
			}
		} catch (e) {
			console.error(e);
		}
		return null;
	};

	const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
		setPrompt(e.target.value);
	};

	const handlePromptClear = () => {
		setPrompt("");
	};

	return (
		<div className="App">
			<PromptifyNavbar spotifyToken={spotifyToken} />
			<Container
				as="main"
				css={{
					position: "relative",
					minWidth: "100%",
					minHeight: "100vh",
					px: 0,
					pb: "$20",
					ox: "hidden",
				}}
			>
				<Container
					as="section"
					css={{
						d: "flex",
						fd: "column",
						fw: "nowrap",
						ai: "center",
						p: "$12 $20",
						mw: "100%",
						rowGap: "$4",
					}}
				>
					<ControlledTextArea
						prompts={[
							"early 2010s rap songs to workout to",
							"taylor swift's greatest hits",
							"songs to listen to on a crisp autumn day",
							"tropical house edm bangers for an afternoon by the pool",
						]}
						value={prompt}
						onChange={handlePromptChange}
						aria-label="Prompt"
					/>
					<Container
						css={{
							d: "flex",
							fw: "nowrap",
							ai: "center",
							as: "flex-start",
							gap: "$8",
							p: 0,
							m: 0,
						}}
					>
						<Button
							size="lg"
							onPress={fetchCompletions}
							disabled={prompt === "" || isGenerating}
						>
							Generate
						</Button>
						<Button
							color="error"
							size="lg"
							iconRight={<FiXCircle size={20} />}
							disabled={prompt === "" || isGenerating}
							onPress={handlePromptClear}
						>
							Clear
						</Button>
					</Container>
				</Container>
				{isGenerating && (
					<Container
						as="section"
						css={{
							d: "flex",
							fd: "column",
							fw: "nowrap",
							ai: "center",
							p: "$12 $20",
							mw: "100%",
							gap: "$8",
						}}
					>
						<Text h3>Promptifying, please be patient...</Text>
						<Progress
							indeterminated
							color="primary"
							status="primary"
							css={{ maxWidth: "75%" }}
						/>
					</Container>
				)}
			</Container>
		</div>
	);
}

export default App;
