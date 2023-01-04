import React from "react";
import { Card, Container, Grid, Text, Button } from "@nextui-org/react";
import { PromptifySong } from "../spotify-utils";

interface SongCardProps {
	song: PromptifySong;
}

function SongCard(props: SongCardProps) {
	const { song } = props;
	return (
		<Card css={{ w: "100%", aspectRatio: "5/6" }}>
			<Card.Body css={{ p: 0 }}>
				<Card.Image
					src={song.image.url}
					width="100%"
					height="100%"
					objectFit="cover"
					alt="Song cover art"
				/>
			</Card.Body>
			<Card.Footer
				isBlurred
				css={{
					position: "absolute",
					bgBlur: "#ffffff66",
					borderTop:
						"$borderWeights$light solid rgba(255, 255, 255, 0.2)",
					bottom: 0,
					zIndex: 1,
				}}
			>
				<Grid.Container css={{ p: "$4" }}>
					<Grid
						xs={8}
						css={{ d: "flex", fd: "column", ai: "flex-start" }}
					>
						<Text
							h4
							color="$background"
							css={{ m: 0, fontWeight: "$semibold" }}
						>
							{song.name}
						</Text>
						<Text color="$background">
							{song.artists
								.map((artist) => artist.name)
								.join(", ")}
						</Text>
						<Text color="$background">{song.album_name}</Text>
					</Grid>
					<Grid xs={4} justify="flex-end" alignItems="flex-end">
						<Button auto rounded color="primary">
							<Text
								css={{ color: "inherit" }}
								size={12}
								weight="bold"
								transform="uppercase"
							>
								Playlist
							</Text>
						</Button>
					</Grid>
				</Grid.Container>
			</Card.Footer>
		</Card>
	);
}

export default SongCard;
