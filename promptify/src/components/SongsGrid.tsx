import React from "react";
import { Grid } from "@nextui-org/react";
import SongCard from "./SongCard";
import { PromptifySong, saveTrack, unsaveTrack } from "../spotify-utils";
import { SongsToPlay, Playlist, navbarHeight } from "../App";

interface SongsGridProps {
	songs: PromptifySong[];
	playlist: Playlist;
	songsToPlay: SongsToPlay | null;
	setSongs: React.Dispatch<React.SetStateAction<PromptifySong[]>>;
	setPlaylist: React.Dispatch<React.SetStateAction<Playlist>>;
	setSongsToPlay: React.Dispatch<React.SetStateAction<SongsToPlay | null>>;
}

function SongsGrid(props: SongsGridProps) {
	const {
		songs,
		playlist,
		songsToPlay,
		setSongs,
		setPlaylist,
		setSongsToPlay,
	} = props;

	const handleSaveClick = async (
		e: React.MouseEvent<HTMLDivElement | undefined>,
		updatedSong: PromptifySong
	) => {
		e.stopPropagation();
		if (updatedSong.saved) {
			await unsaveTrack(updatedSong.id);
		} else {
			await saveTrack(updatedSong.id);
		}
		setSongs((prevSongs: PromptifySong[]) =>
			prevSongs.map((prevSong) => {
				return prevSong.id === updatedSong.id
					? { ...updatedSong, saved: !updatedSong.saved }
					: prevSong;
			})
		);
	};

	return (
		<Grid.Container
			gap={4}
			justify="center"
			css={{
				"@md": { justifyContent: "flex-start" },
				mb: songsToPlay !== null ? navbarHeight : 0,
			}}
		>
			{songs.map((song: PromptifySong) => (
				<Grid xs={8} sm={8} md={6} lg={6} xl={4} key={song.id}>
					<SongCard
						song={song}
						handleSaveClick={handleSaveClick}
						playlist={playlist}
						setPlaylist={setPlaylist}
						setSongsToPlay={setSongsToPlay}
					/>
				</Grid>
			))}
		</Grid.Container>
	);
}

export default SongsGrid;
