import React, { useState, useEffect } from "react";
import "./App.css";
import axios, { AxiosResponse } from "axios";
import { Container } from "@nextui-org/react";
import PromptifyNavbar from "./components/PromptifyNavbar";
import PromptSection from "./components/PromptSection";
import ResultsSections from "./components/ResultsSections";
import SpotifyPlayer, { CallbackState } from "react-spotify-web-playback";
import PlaylistDrawer from "./components/PlaylistDrawer";
import { createTheme, useMediaQuery } from "@mui/material";
import {
	accessToken,
	search,
	getSavedStatus,
	PromptifySong,
	formatSpotifySongToPromptifySong,
} from "./spotify-utils.js";

export const urlWithProxy = "/api";
export const drawerWidth = 25;
export const navbarHeight = 76;

interface PlaylistSongs {
	[id: string]: PromptifySong;
}

export interface Playlist {
	songs: PlaylistSongs;
	playing: boolean | null;
}

export interface SongsToPlay {
	queue: string[];
	currentSongURI: string;
	playing: boolean;
}

export const muiTheme = createTheme({
	breakpoints: {
		values: {
			xs: 0,
			sm: 650,
			md: 960,
			lg: 1280,
			xl: 1400,
		},
	},
});

function App() {
	const isMobile: boolean = useMediaQuery(muiTheme.breakpoints.down("sm"));
	const [spotifyToken, setSpotifyToken] = useState<string | null>(null);
	const [isGenerating, setIsGenerating] = useState<boolean>(false);
	const [songs, setSongs] = useState<PromptifySong[]>([]);
	const [error, setError] = useState<boolean>(false);
	const [playlist, setPlaylist] = useState<Playlist>({
		songs: {},
		playing: null,
	});
	const [playlistOpen, setPlaylistOpen] = useState<boolean>(false);
	const [songsToPlay, setSongsToPlay] = useState<SongsToPlay | null>(null);
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
			const timeoutID: number = setTimeout(() => {
				setIsGenerating(false);
				setError(true);
				setTimeout(() => setError(false), 5000);
			}, 25000);
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
			if (successfulCompletions.length === 0) {
				setError(true);
				setTimeout(() => setError(false), 5000);
			} else {
				successfulCompletions
					.filter((song: string) => song !== "")
					.map((song: string) => {
						const artistSubstring = song
							.substring(0, song.indexOf('"'))
							.concat(song.substring(song.lastIndexOf('"') + 1))
							.replace(/\d+\./gm, "");
						const songName: string = song.substring(
							song.indexOf('"') + 1,
							song.lastIndexOf('"')
						);
						const artistName: string = artistSubstring
							.replace("by ", "")
							.replace("- ", "")
							.replace("– ", "");
						uniqueCompletions.add(`${songName} ${artistName}`);
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
				const uniquePromptifySongs: PromptifySong[] =
					promptifySongs.filter(
						({ id }, index) => !songIds.includes(id, index + 1)
					);
				// Get the saved status of the songs
				const uniquePromptifySongsWithSaved: PromptifySong[] =
					await Promise.all(
						uniquePromptifySongs.map(async (song) => {
							const savedStatus = await getSavedStatus(song.id);
							return { ...song, saved: savedStatus.data[0] };
						})
					);
				setSongs(uniquePromptifySongsWithSaved);
				clearTimeout(timeoutID);
				setIsGenerating(false);
			}
		} catch (error) {
			setError(true);
			setIsGenerating(false);
			setTimeout(() => setError(false), 5000);
		}
	};

	const getSongFromCompletion = async (songName: string) => {
		try {
			const spotifyResponse = await search(songName, "track");
			const spotifySongs = spotifyResponse.data.tracks.items;
			if (spotifySongs && spotifySongs.length > 0) {
				spotifySongs.sort(
					(
						a: SpotifyApi.TrackObjectFull,
						b: SpotifyApi.TrackObjectFull
					) => {
						return b.popularity - a.popularity;
					}
				);
				return formatSpotifySongToPromptifySong(spotifySongs[0]);
			}
		} catch (e) {
			setError(true);
			setIsGenerating(false);
			setTimeout(() => setError(false), 5000);
		}
		return null;
	};

	const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
		setPrompt(e.target.value);
	};

	const handlePromptClear = () => {
		setPrompt("");
	};

	const handleSpotifyPlayerChanges = (state: CallbackState) => {
		if (songsToPlay !== null) {
			if (state.type === "player_update") {
				setSongsToPlay({
					...songsToPlay,
					playing: state.isPlaying,
				});
			} else if (state.type === "track_update") {
				setSongsToPlay({
					...songsToPlay,
					currentSongURI: state.track.uri,
					playing: state.isPlaying,
				});
			}
		}
	};

	const handlePlaylistToggle = () => {
		setPlaylistOpen(!playlistOpen);
	};

	return (
		<div className="App">
			<PromptifyNavbar
				spotifyToken={spotifyToken}
				isMobile={isMobile}
				handlePlaylistToggle={handlePlaylistToggle}
			/>
			<Container
				as="main"
				css={{
					d: "flex",
					fd: "column",
					width: `calc(100vw - ${drawerWidth}%)`,
					minHeight: `calc(100vh - ${2 * navbarHeight + 4}px)`,
					px: 0,
					ox: "hidden",
					oy: "hidden",
					mx: 0,
					"@smMax": {
						width: "100vw",
						maxWidth: "100vw",
					},
				}}
			>
				<PromptSection
					prompt={prompt}
					isGenerating={isGenerating}
					isMobile={isMobile}
					handlePromptChange={handlePromptChange}
					handlePromptClear={handlePromptClear}
					fetchCompletions={fetchCompletions}
				/>
				<ResultsSections
					isGenerating={isGenerating}
					songs={songs}
					setSongs={setSongs}
					playlist={playlist}
					setPlaylist={setPlaylist}
					songsToPlay={songsToPlay}
					setSongsToPlay={setSongsToPlay}
					error={error}
					isMobile={isMobile}
				/>
			</Container>
			<PlaylistDrawer
				playlist={playlist}
				setPlaylist={setPlaylist}
				songsToPlay={songsToPlay}
				setSongsToPlay={setSongsToPlay}
				playlistOpen={playlistOpen}
				handlePlaylistToggle={handlePlaylistToggle}
			/>
			{songsToPlay !== null && (
				<SpotifyPlayer
					token={accessToken ?? ""}
					autoPlay
					play={songsToPlay.playing}
					showSaveIcon
					uris={songsToPlay.queue}
					callback={handleSpotifyPlayerChanges}
					styles={{
						color: "var(--nextui-colors-text)",
						bgColor: "var(--nextui-colors-accents0)",
						activeColor: "var(--nextui-colors-primary)",
						trackNameColor: "var(--nextui-colors-text)",
						sliderColor: "var(--nextui-colors-primary)",
						sliderTrackColor:
							"var(--nextui-colors-backgroundContrast",
						sliderHandleColor: "var(--nextui-colors-text)",
						height: navbarHeight,
					}}
				/>
			)}
		</div>
	);
}

export default App;
