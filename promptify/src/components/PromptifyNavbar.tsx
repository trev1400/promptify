import React from "react";
import { Button, Navbar, Text } from "@nextui-org/react";
import { logout } from "../spotify-utils";
import { urlWithProxy } from "../App";

interface PromptifyNavbarProps {
	spotifyToken: string | null;
}

function PromptifyNavbar(props: PromptifyNavbarProps) {
	const { spotifyToken } = props;
	return (
		<Navbar variant="static" css={{ width: "100vw" }}>
			<Navbar.Brand>
				<Text b color="inherit" hideIn="xs">
					Promptify
				</Text>
			</Navbar.Brand>
			<Navbar.Content>
				<Navbar.Item>
					{!spotifyToken ? (
						<a href={`http://localhost:5000${urlWithProxy}/login`}>
							<Button auto>Log In</Button>
						</a>
					) : (
						<>
							<Button auto onClick={logout}>
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
