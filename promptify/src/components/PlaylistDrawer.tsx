import React, { useState } from "react";
import { drawerWidth } from "../App";
import { Container, FormElement } from "@nextui-org/react";
import { styled } from "@stitches/react";
import Drawer from "@mui/material/Drawer";

interface PlaylistDrawerProps {}

const Input = styled("input", {
	display: "inline-flex",
	alignItems: "center",
	padding: "var(--nextui-space-6)",
	outline: "none",
	marginRight: "auto",
	marginLeft: "auto",
	fontSize: "var(--nextui-fontSizes-xl)",
	fontWeight: "600",
	color: "#ccccb5",
	borderRadius: "var(--nextui-space-8)",
	border: "none",
	background: "var(--nextui-colors-accents0)",
});

function PlaylistDrawer(props: PlaylistDrawerProps) {
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
	return (
		<Drawer
			sx={{
				width: `${drawerWidth}%`,
				"& .MuiDrawer-paper": {
					width: `${drawerWidth}%`,
					boxSizing: "border-box",
					background: "transparent",
					borderColor: "#4b5975",
					p: 3,
				},
			}}
			variant="permanent"
			anchor="right"
		>
			<Container css={{ p: 0 }}>
				<Input
					aria-label="Playlist name input"
					value={playlistName}
					onChange={handleNameChange}
				/>
			</Container>
		</Drawer>
	);
}

export default PlaylistDrawer;
