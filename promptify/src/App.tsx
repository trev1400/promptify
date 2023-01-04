import React, { useState, useEffect } from "react";
import "./App.css";
import axios, { AxiosResponse } from "axios";
import { Container } from "@nextui-org/react";
import PromptifyNavbar from "./components/PromptifyNavbar";
import PromptSection from "./components/PromptSection";
import ResultsSections from "./components/ResultsSections";
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

	const fetchCompletion = () => {
		return axios.post(`${urlWithProxy}/completion`, {
			prompt: prompt,
		});
	};

	const fetchCompletions = async () => {
		try {
			setIsGenerating(true);
			const uniqueCompletions = new Set<string>();
			// Send 3 concurrent API requests to OpenAI to get a completion for the prompt
			const completions = (await Promise.allSettled([
				fetchCompletion(),
				fetchCompletion(),
			])) as {
				status: "fulfilled" | "rejected";
				value: AxiosResponse<any, any>;
			}[];
			// Filter out any rejected API requests
			completions
				.filter((completion) => completion.status === "fulfilled")
				.map((completion) => {
					// Check that Open AI returned results
					if (completion.value.data.result.length > 0) {
						// Result is an array of the items from the completion that was returned.
						// This is usually in a line-separated text string, so we split out the new lines
						const result: string[] =
							completion.value.data.result[0].text.split("\n");
						// Filter the result to exclude empty string values from array, then map to exclude
						// duplicate completion items
						result
							.filter((song: string) => song !== "")
							.map((song: string) => {
								uniqueCompletions.add(
									song
										.replaceAll('"', "")
										// Replaces digits and periods since OpenAI completion lists are numbered
										.replace(/\d+\./gm, "")
								);
							});
					}
				});
			console.log(uniqueCompletions);
			// We can safely cast array to PromptifySong[] because of our null check
			const promptifySongs: PromptifySong[] = (
				await Promise.all(
					Array.from(uniqueCompletions).map((song: string) => {
						return getSongFromCompletion(song);
					})
				)
			).filter(
				(promptifySong) => promptifySong !== null
			) as PromptifySong[];
			// Filter out any dupes that the Spotify API returns
			const songIds = promptifySongs.map((song) => song.id);
			const uniquePromptifySongs: PromptifySong[] = promptifySongs.filter(
				({ id }, index) => !songIds.includes(id, index + 1)
			);
			setSongs(uniquePromptifySongs);
			setIsGenerating(false);
		} catch (error) {
			console.log(error);
		}
	};

	const getSongFromCompletion = async (songName: string) => {
		try {
			const spotifyResponse = await search(songName, "track");
			const spotifySongs = spotifyResponse.data.tracks.items;
			console.log(songName, spotifySongs);
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
					d: "flex",
					fd: "column",
					minWidth: "100%",
					minHeight: "calc(100vh - 76px)",
					px: 0,
					pb: "$20",
					ox: "hidden",
				}}
			>
				<PromptSection
					prompt={prompt}
					isGenerating={isGenerating}
					handlePromptChange={handlePromptChange}
					handlePromptClear={handlePromptClear}
					fetchCompletions={fetchCompletions}
				/>
				<ResultsSections isGenerating={isGenerating} songs={songs} />
			</Container>
		</div>
	);
}

export default App;
