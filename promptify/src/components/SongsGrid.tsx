import React from "react";
import { Grid } from "@nextui-org/react";
import SongCard from "./SongCard";
import { PromptifySong } from "../spotify-utils";

interface SongsGridProps {
	songs: PromptifySong[];
}

function SongsGrid(props: SongsGridProps) {
	const { songs } = props;
	return (
		<Grid.Container
			gap={4}
			justify="center"
			css={{
				"@sm": { justifyContent: "flex-start" },
			}}
		>
			{songs.map((song: PromptifySong) => (
				<Grid xs={8} sm={6} md={4} lg={4} xl={3} key={song.id}>
					<SongCard song={song} />
				</Grid>
			))}
		</Grid.Container>
	);
}

export default SongsGrid;
