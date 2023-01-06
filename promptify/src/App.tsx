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
			// Send 2 concurrent API requests to OpenAI to get a completion for the prompt
			const completions = (await Promise.allSettled([
				fetchCompletion(),
				fetchCompletion(),
			])) as {
				status: "fulfilled" | "rejected";
				value: AxiosResponse<any, any>;
			}[];
			// Filter out any rejected API requests
			const successfulCompletions = completions
				.filter((completion) => completion.status === "fulfilled")
				.map((completion) => {
					if (completion.value.data.result.length > 0) {
						return completion.value.data.result[0].text.split("\n");
					}
				})
				.flat();
			successfulCompletions
				.filter((song: string) => song !== "")
				.map((song: string) => {
					const artistSubstring = song
						.substring(0, song.indexOf('"'))
						.concat(song.substring(song.lastIndexOf('"') + 1))
						.replace(/\d+\./gm, "");
					const songName: string[] | null = song.match(/"([^"]+)"/);
					const artistName: string = artistSubstring
						.replace("by ", "")
						.replace("- ", "")
						.replace("– ", "");
					if (songName !== null && songName.length > 1) {
						uniqueCompletions.add(`${songName[1]} ${artistName}`);
					}
				});
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
