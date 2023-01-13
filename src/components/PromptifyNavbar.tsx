import React from "react";
import {
	Button,
	Navbar,
	Text,
	Image,
	Popover,
	Container,
} from "@nextui-org/react";
import { FiInfo } from "react-icons/fi";
import { logout } from "../spotify-utils";
import { urlWithProxy, drawerWidth, muiTheme } from "../App";
import { useMediaQuery } from "@mui/material";

interface PromptifyNavbarProps {
	spotifyToken: string | null;
	isMobile: boolean;
	handlePlaylistToggle: () => void;
}

function PromptifyNavbar(props: PromptifyNavbarProps) {
	const { spotifyToken, isMobile, handlePlaylistToggle } = props;
	const hideDrawer: boolean = useMediaQuery(muiTheme.breakpoints.down("md"));

	return (
		<Navbar
			variant="static"
			maxWidth="xl"
			disableShadow
			css={{
				width: `calc(100vw - ${drawerWidth}%)`,
				background: "$background",
				px: "$6",
				"@smMax": {
					width: "100vw",
				},
			}}
		>
			<Navbar.Brand css={{ d: "flex", ai: "center", gap: "$4" }}>
				<Image src="/logo.png" width={42} alt="Promptify logo" />
				<Text h4 color="inherit" hideIn="xs" css={{ mt: "$1", mb: 0 }}>
					Promptify
				</Text>
			</Navbar.Brand>
			<Navbar.Content>
				<Navbar.Link>
					<Popover>
						<Popover.Trigger>
							<div
								style={{
									display: "flex",
									alignItems: "center",
									justifyContent: "center",
									gap: "6px",
								}}
							>
								About
								<FiInfo size={16} style={{ marginTop: 1 }} />
							</div>
						</Popover.Trigger>
						<Popover.Content css={{ p: "$8" }}>
							<Container
								css={{
									maxWidth: "35vw",
									"@xsMax": {
										maxWidth: "75vw",
										fontSize: "$sm",
									},
								}}
							>
								Promptify was built as a capstone project for
								Brown University's CSCI 1300: User Interfaces
								and User Experience. It uses OpenAI's GPT-3 API
								to interpret the inputted prompt and Spotify's
								Web API to fetch the suggested songs. Any odd
								results are likely due to quirks in GPT-3's
								responses.
								<br />
								<br />
								Note: Users must have a Spotify Premium account.
							</Container>
						</Popover.Content>
					</Popover>
				</Navbar.Link>
				{hideDrawer && (
					<Navbar.Item
						variant="underline"
						onClick={() => handlePlaylistToggle()}
					>
						Playlist
					</Navbar.Item>
				)}
				<Navbar.Item>
					{!spotifyToken ? (
						<a href={`${urlWithProxy}/login`}>
							<Button auto size={isMobile ? "sm" : "md"}>
								Log In
							</Button>
						</a>
					) : (
						<>
							<Button
								auto
								size={isMobile ? "sm" : "md"}
								onClick={logout}
							>
								Log Out
							</Button>
						</>
					)}
				</Navbar.Item>
			</Navbar.Content>
		</Navbar>
	);
}

export default PromptifyNavbar;
