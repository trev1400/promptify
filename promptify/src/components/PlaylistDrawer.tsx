import React, { useState, useEffect } from "react";
import { SongsToPlay, drawerWidth, Playlist } from "../App";
import { GoPrimitiveDot } from "react-icons/go";
import { IoPlayCircle, IoPauseCircle } from "react-icons/io5";
import { FiCheck, FiMoreVertical, FiTrash } from "react-icons/fi";
import {
	Card,
	Container,
	Text,
	Grid,
	Image,
	Button,
	Dropdown,
} from "@nextui-org/react";
import { styled } from "@stitches/react";
import Drawer from "@mui/material/Drawer";
import { createPlaylist, PromptifySong } from "../spotify-utils";

interface PlaylistDrawerProps {
	playlist: Playlist;
	songsToPlay: SongsToPlay | null;
	setSongsToPlay: React.Dispatch<React.SetStateAction<SongsToPlay | null>>;
	setPlaylist: React.Dispatch<React.SetStateAction<Playlist>>;
}

const Input = styled("input", {
	display: "inline-flex",
	alignItems: "center",
	width: "100%",
	padding: "var(--nextui-space-6)",
	outline: "none",
	marginRight: "auto",
	marginLeft: "auto",
	fontSize: "var(--nextui-fontSizes-xl)",
	fontWeight: "600",
	color: "#ccccb5",
	borderRadius: "var(--nextui-space-6)",
	border: "none",
	background: "var(--nextui-colors-accents0)",
});

// This function converts milliseconds to time in playlist duration format
const millisecondsToTimeString = (milliseconds: number) => {
	const hours: number = Math.floor(milliseconds / (1000 * 3600));
	const minutes: number = Math.floor(milliseconds / (1000 * 60)) % 60;
	const seconds: number = Math.floor(milliseconds / 1000) % 60;
	return (
		(hours === 0 ? "" : `${hours.toString()} hr `) +
		(minutes === 0 ? "0 min " : `${minutes.toString()} min `) +
		`${seconds.toString()} sec`
	);
};

function PlaylistDrawer(props: PlaylistDrawerProps) {
	const { playlist, songsToPlay, setSongsToPlay, setPlaylist } = props;
	const [playlistName, setPlaylistName] =
		useState<string>("Promptify Playlist");
	const [playlistAdded, setPlaylistAdded] = useState<boolean>(false);

	const songURIs: string[] = Object.values(playlist.songs).map((song) => {
		return song.uri;
	});

	useEffect(() => {
		if (songsToPlay && playlist.playing) {
			setSongsToPlay({
				...songsToPlay,
				queue: [
					...songsToPlay.queue.slice(
						songsToPlay.queue.indexOf(songsToPlay.currentSongURI)
					),
					songURIs[songURIs.length - 1],
				],
			});
		}
	}, [playlist.songs]);

	useEffect(() => {
		if (playlistAdded) {
			setPlaylistAdded(false);
		}
	}, [playlist.songs, playlistName]);

	const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const cursorPos = e.target.selectionStart;
		const input = e.target;
		window.requestAnimationFrame(() => {
			input.selectionStart = cursorPos;
			input.selectionEnd = cursorPos;
		});
		setPlaylistName(e.target.value);
	};

	const handlePlaylistPlay = () => {
		setSongsToPlay(
			songsToPlay && playlist.playing !== null
				? {
						...songsToPlay,
						playing: true,
				  }
				: {
						queue: songURIs,
						currentSongURI: songURIs[0],
						playing: true,
				  }
		);
		setPlaylist({
			...playlist,
			playing: true,
		});
	};

	const handlePlaylistPause = () => {
		if (songsToPlay) {
			setSongsToPlay({
				...songsToPlay,
				playing: false,
			});
			setPlaylist({
				...playlist,
				playing: false,
			});
		}
	};

	const handlePlaylistSongPause = () => {
		if (songsToPlay) {
			setSongsToPlay({
				...songsToPlay,
				playing: false,
			});
			setPlaylist({
				...playlist,
				playing: false,
			});
		}
	};

	const handlePlaylistSongPlay = (song: PromptifySong) => {
		setSongsToPlay({
			queue: songURIs.slice(songURIs.indexOf(song.uri)),
			currentSongURI: song.uri,
			playing: true,
		});
		setPlaylist({
			...playlist,
			playing: true,
		});
	};

	const handlePlaylistSongRemove = (song: PromptifySong) => {
		const newPlaylist = {
			...playlist,
		};
		delete newPlaylist.songs[song.id];
		setPlaylist(newPlaylist);
	};

	return (
		<Drawer
			sx={{
				"& .MuiDrawer-paper": {
					width: `${drawerWidth}%`,
					color: "#ccccb5",
					boxSizing: "border-box",
					background: "transparent",
					borderColor: "#4b5975",
					pt: 2,
					zIndex: 1000,
				},
			}}
			variant="permanent"
			anchor="right"
		>
			<Container css={{ p: 0 }}>
				<Container css={{ p: "$6 $6 0 $6" }}>
					<Input
						aria-label="Playlist name input"
						value={playlistName}
						onChange={handleNameChange}
					/>
					<Container
						css={{
							d: "flex",
							ai: "center",
							m: "$6 0 0 $2",
							p: 0,
							gap: "$2",
						}}
					>
						{Object.keys(playlist.songs).length > 0 ? (
							songsToPlay &&
							songsToPlay.playing &&
							playlist.playing ? (
								<IoPauseCircle
									size={48}
									className="play-pause-icon"
									onClick={handlePlaylistPause}
								/>
							) : (
								<IoPlayCircle
									size={48}
									className="play-pause-icon"
									onClick={handlePlaylistPlay}
								/>
							)
						) : (
							<></>
						)}
						<span style={{ marginLeft: 6 }}>{`${
							Object.keys(playlist.songs).length
						} ${
							Object.keys(playlist.songs).length === 1
								? "song"
								: "songs"
						}`}</span>
						<GoPrimitiveDot style={{ margin: "0 6px" }} />
						<span>{`${millisecondsToTimeString(
							Object.values(playlist.songs).reduce(
								(prevTotalDuration, song) =>
									prevTotalDuration + song.duration_ms,
								0
							)
						)}`}</span>
					</Container>
					<Container display="flex" justify="center">
						{playlistAdded ? (
							<Container
								display="flex"
								alignItems="center"
								justify="center"
								css={{ gap: "$3" }}
							>
								<Text
									h5
									color="$backgroundContrast"
									css={{ mt: "$5" }}
								>
									Playlist Added
								</Text>
								<FiCheck style={{ color: "#4b5975" }} />
							</Container>
						) : (
							Object.keys(playlist.songs).length > 0 && (
								<Button
									onClick={() => {
										createPlaylist(
											playlistName,
											songURIs.join(",")
										);
										setPlaylistAdded(true);
									}}
									css={{
										w: "25%",
										minWidth: "fit-content",
										backgroundColor: "$text",
										"&:hover": {
											borderColor: "#ededdf",
										},
										"&:focus": {
											outline: "#ededdf",
										},
									}}
								>
									Save Playlist
								</Button>
							)
						)}
					</Container>
				</Container>
				<Container css={{ w: "100%", p: 0 }}>
					{Object.values(playlist.songs)
						.sort(
							(a, b) =>
								(a.time_added_to_playlist
									? a.time_added_to_playlist.getTime()
									: 1) -
								(b.time_added_to_playlist
									? b.time_added_to_playlist.getTime()
									: 0)
						)
						.map((song, index) => (
							<Card
								key={song.id}
								isHoverable
								css={{
									w: "100%",
									borderRadius: 0,
									p: "$8",
									background: "$background",
								}}
							>
								<Card.Header css={{ p: 0, gap: "$6" }}>
									<Text h4 css={{ m: 0 }}>
										{`${index + 1}.`}
									</Text>
									<Image
										alt={`${song.name} cover art`}
										src={song.image.url}
										width="64px"
									/>
									<Grid.Container>
										<Grid xs={12}>
											<Text
												h5
												css={{
													m: 0,
												}}
											>
												{song.name}
											</Text>
										</Grid>
										<Grid xs={12}>
											<Text
												css={{
													fontSize: "$xs",
													color: "$accents8",
												}}
											>
												{song.artists}
											</Text>
										</Grid>
									</Grid.Container>
									<Container
										css={{
											d: "flex",
											fw: "nowrap",
											fd: "row",
											ai: "center",
											p: 0,
											m: 0,
											w: "fit-content",
											gap: "$4",
											marginRight: "$6",
										}}
									>
										{songsToPlay &&
										songsToPlay.currentSongURI ===
											song.uri &&
										songsToPlay?.playing ? (
											<IoPauseCircle
												size={26}
												className="hoverable-icon"
												onClick={
													handlePlaylistSongPause
												}
											/>
										) : (
											<IoPlayCircle
												size={26}
												className="hoverable-icon"
												onClick={() =>
													handlePlaylistSongPlay(song)
												}
											/>
										)}
										<Text css={{ mb: "$1" }}>
											{song.duration_string}
										</Text>
										<Dropdown>
											<Dropdown.Trigger>
												<div
													style={{
														display: "flex",
														alignItems: "center",
														justifyContent:
															"center",
													}}
												>
													<FiMoreVertical className="hoverable-icon" />
												</div>
											</Dropdown.Trigger>
											<Dropdown.Menu
												aria-label="Playlist item actions"
												css={{
													background: "$accents0",
												}}
											>
												<Dropdown.Item
													key="remove"
													icon={<FiTrash />}
												>
													<div
														onClick={() =>
															handlePlaylistSongRemove(
																song
															)
														}
													>
														Remove song
													</div>
												</Dropdown.Item>
											</Dropdown.Menu>
										</Dropdown>
									</Container>
								</Card.Header>
							</Card>
						))}
				</Container>
			</Container>
		</Drawer>
	);
}

export default PlaylistDrawer;
