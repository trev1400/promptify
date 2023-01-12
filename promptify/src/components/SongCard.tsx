import React from "react";
import { Card, Container, Grid, Text, Button } from "@nextui-org/react";
import { FiClock, FiPlus, FiTrash } from "react-icons/fi";
import { HiHeart, HiOutlineHeart } from "react-icons/hi";
import { MdOutlineExplicit } from "react-icons/md";
import { PromptifySong } from "../spotify-utils";
import { SongsToPlay, Playlist } from "../App";

interface SongCardProps {
	song: PromptifySong;
	playlist: Playlist;
	handleSaveClick: (
		e: React.MouseEvent<HTMLDivElement | undefined>,
		updatedSong: PromptifySong
	) => void;
	setPlaylist: React.Dispatch<React.SetStateAction<Playlist>>;
	setSongsToPlay: React.Dispatch<React.SetStateAction<SongsToPlay | null>>;
}

function SongCard(props: SongCardProps) {
	const { song, playlist, handleSaveClick, setPlaylist, setSongsToPlay } =
		props;

	const inPlaylist = song.id in playlist.songs;

	// Toggles a song's membership in the playlist
	const togglePlaylistMembership = () => {
		// If the song is in the playlist, delete the song from the playlist and then update
		if (inPlaylist) {
			const newPlaylist = {
				...playlist,
			};
			delete newPlaylist.songs[song.id];
			setPlaylist(newPlaylist);
		} else {
			// Otherwise, add the song to the playlist and also add a date_added field to preserve the correct
			// order when rendering the songs in the playlist
			const newPlaylist = {
				...playlist,
				songs: {
					...playlist.songs,
					[song.id]: { ...song, time_added_to_playlist: new Date() },
				},
			};
			setPlaylist(newPlaylist);
		}
	};

	const handleCardPress = () => {
		setSongsToPlay({
			queue: [song.uri],
			currentSongURI: song.uri,
			playing: true,
		});
		setPlaylist({
			...playlist,
			playing: null,
		});
	};

	return (
		<Card
			isPressable
			isHoverable
			onClick={handleCardPress}
			css={{
				w: "100%",
				aspectRatio: "5/6",
			}}
		>
			<Card.Header
				onClick={(e: React.MouseEvent<HTMLDivElement | undefined>) =>
					handleSaveClick(e, song)
				}
				css={{
					position: "absolute",
					d: "flex",
					jc: "center",
					ai: "center",
					zIndex: 1,
					w: 44,
					h: 44,
					right: 0,
					m: "12px 12px 0 0",
					bgBlur: "rgba(255,255,255,0.75)",
					borderRadius: "14px",
					color: "#1b2028",
					"&:hover": { cursor: "pointer", color: "#23a9d5" },
				}}
			>
				{song.saved ? (
					<HiHeart size={28} style={{ color: "23a9d5" }} />
				) : (
					<HiOutlineHeart size={28} style={{ color: "inherit" }} />
				)}
			</Card.Header>
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
					bgBlur: "rgba(255,255,255,0.65)",
					borderTop:
						"$borderWeights$light solid rgba(255, 255, 255, 0.2)",
					bottom: 0,
					zIndex: 1,
				}}
			>
				<Grid.Container css={{ p: "$4" }}>
					<Grid
						xs={12}
						css={{ d: "flex", fd: "column", ai: "flex-start" }}
					>
						<Container
							css={{
								d: "flex",
								ai: "center",
								p: 0,
								m: 0,
								gap: "$3",
							}}
						>
							<Text
								h4
								color="$background"
								css={{
									m: 0,
									fontWeight: "$semibold",
								}}
							>
								{song.name}
							</Text>
							{song.explicit && (
								<MdOutlineExplicit
									size={22}
									style={{
										color: "#1b2028",
										marginTop: 1,
									}}
								/>
							)}
						</Container>
						<Text color="$background" css={{ marginTop: "$2" }}>
							<b>Artist: </b>
							{song.artists}
						</Text>
						<Text color="$background">
							<b>Album: </b>
							{song.album_name}
						</Text>
						<Text color="$background">
							<b>Released: </b>
							{song.release_date_string}
						</Text>
						<Text color="$background">
							<b>Release Type: </b>
							{song.release_type}
						</Text>
						<Container
							css={{
								d: "flex",
								jc: "space-between",
								ai: "center",
								p: 0,
								marginTop: "$2",
							}}
						>
							<Container
								css={{
									d: "flex",
									ai: "center",
									p: 0,
									m: 0,
									w: "fit-content",
									gap: "$3",
								}}
							>
								<FiClock
									style={{ color: "#1b2028", marginTop: 2 }}
								/>
								<Text color="$background">
									{song.duration_string}
								</Text>
							</Container>
							<Button
								auto
								rounded
								color={inPlaylist ? "error" : "primary"}
								icon={inPlaylist ? <FiTrash /> : <FiPlus />}
								css={{ m: 0 }}
								onClick={togglePlaylistMembership}
							>
								<Text
									css={{ color: "inherit" }}
									size={12}
									weight="bold"
									transform="uppercase"
								>
									{inPlaylist ? "Remove" : "Add"}
								</Text>
							</Button>
						</Container>
					</Grid>
				</Grid.Container>
			</Card.Footer>
		</Card>
	);
}

export default SongCard;
