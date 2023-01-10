import React, { Fragment, useState } from "react";
import { Container, Text, Progress } from "@nextui-org/react";
import SongsGrid from "./SongsGrid";
import SortAndFilterCollapse from "./SortAndFilterCollapse";
import { PromptifySong } from "../spotify-utils";
import { Playlist } from "../App";

interface ResultsSectionProps {
	isGenerating: boolean;
	songs: PromptifySong[];
	playlist: Playlist;
	setSongs: React.Dispatch<React.SetStateAction<PromptifySong[]>>;
	setPlaylist: React.Dispatch<React.SetStateAction<Playlist>>;
}

export const Sort = {
	MostPopular: "Most Popular",
	LeastPopular: "Least Popular",
	Shortest: "Shortest",
	Longest: "Longest",
	Newest: "Newest",
	Oldest: "Oldest",
};

export const ReleaseType = {
	Album: "Album",
	Single: "Single",
	Compilation: "Compilation",
};

export const LyricType = {
	Explicit: "Explicit",
	Clean: "Clean",
};

export const LibraryStatus = {
	Liked: "Liked",
	Unliked: "Unliked",
};

function ResultsSections(props: ResultsSectionProps) {
	const { isGenerating, songs, playlist, setSongs, setPlaylist } = props;
	const [sort, setSort] = useState<string>(Sort.MostPopular);
	const [lyricTypes, setLyricTypes] = useState<Set<string>>(new Set());
	const [releaseTypes, setReleaseTypes] = useState<Set<string>>(new Set());
	const [libraryStatuses, setLibraryStatuses] = useState<Set<string>>(
		new Set()
	);

	const handleSortChange = (sort: string) => {
		setSort(sort);
	};

	const handleFilterChange = (
		updatedFilters: string[],
		setSelectedFilters: React.Dispatch<React.SetStateAction<Set<string>>>
	) => {
		setSelectedFilters(new Set(updatedFilters));
	};

	return (
		<Container
			as="section"
			css={{
				d: "flex",
				fd: "column",
				fw: "nowrap",
				ai: "center",
				p: isGenerating || songs.length === 0 ? "$20" : "0 $16",
				mw: "100%",
				gap: "$8",
			}}
		>
			{isGenerating ? (
				<Fragment>
					<Text h3>Promptifying, please be patient...</Text>
					<Progress
						indeterminated
						color="primary"
						status="primary"
						css={{ maxWidth: "75%" }}
					/>
				</Fragment>
			) : songs.length !== 0 ? (
				<Text h3>Generate some songs!</Text>
			) : (
				<Fragment>
					<SortAndFilterCollapse
						sort={sort}
						setLyricTypes={setLyricTypes}
						setReleaseTypes={setReleaseTypes}
						setLibraryStatuses={setLibraryStatuses}
						handleSortChange={handleSortChange}
						handleFilterChange={handleFilterChange}
					/>
					<SongsGrid
						songs={songs}
						setSongs={setSongs}
						playlist={playlist}
						setPlaylist={setPlaylist}
					/>
				</Fragment>
			)}
		</Container>
	);
}

export default ResultsSections;
