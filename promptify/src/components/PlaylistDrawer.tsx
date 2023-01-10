import React, { useState } from "react";
import { drawerWidth, Playlist } from "../App";
import { GoPrimitiveDot } from "react-icons/go";
import { IoPlayCircle } from "react-icons/io5";
import { Card, Container, Text, Grid, Image, Button } from "@nextui-org/react";
import { styled } from "@stitches/react";
import Drawer from "@mui/material/Drawer";
import { PromptifySong } from "../spotify-utils";

interface PlaylistDrawerProps {
	playlist: Playlist;
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

function PlaylistDrawer(props: PlaylistDrawerProps) {
	const { playlist } = props;
	const [playlistName, setPlaylistName] =
		useState<string>("Promptify Playlist");

	const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const cursorPos = e.target.selectionStart;
		const input = e.target;
		window.requestAnimationFrame(() => {
			input.selectionStart = cursorPos;
			input.selectionEnd = cursorPos;
		});
		setPlaylistName(e.target.value);
	};

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
	return (
		<Drawer
			sx={{
				"& .MuiDrawer-paper": {
					color: "#ccccb5",
					width: `${drawerWidth}%`,
					boxSizing: "border-box",
					background: "transparent",
					borderColor: "#4b5975",
					py: 3,
				},
			}}
			variant="permanent"
			anchor="right"
		>
			<Container css={{ p: 0 }}>
				<Container css={{ p: "$6" }}>
					<Input
						aria-label="Playlist name input"
						value={playlistName}
						onChange={handleNameChange}
					/>
					<Container
						css={{ d: "flex", ai: "center", m: "$6 0 0 $2", p: 0 }}
					>
						<span>{`${Object.keys(playlist).length} ${
							Object.keys(playlist).length === 1
								? "song"
								: "songs"
						}`}</span>
						<GoPrimitiveDot style={{ margin: "0 6px" }} />
						<span>{`${millisecondsToTimeString(
							Object.values(playlist).reduce(
								(prevTotalDuration, song) =>
									prevTotalDuration + song.duration_ms,
								0
							)
						)}`}</span>
					</Container>
				</Container>
				<Container css={{ w: "100%", p: 0 }}>
					{Object.values(playlist)
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
										<IoPlayCircle
											size={26}
											className="play-icon"
										/>
										<Text css={{ mb: "$1" }}>
											{song.duration_string}
										</Text>
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
