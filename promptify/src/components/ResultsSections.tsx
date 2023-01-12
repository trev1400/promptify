import React, { Fragment, useState } from "react";
import { Container, Text, Progress } from "@nextui-org/react";
import SongsGrid from "./SongsGrid";
import SortAndFilterCollapse from "./SortAndFilterCollapse";
import { PromptifySong } from "../spotify-utils";
import { SongsToPlay, Playlist } from "../App";
import { accessToken } from "../spotify-utils";

interface ResultsSectionProps {
	isGenerating: boolean;
	songs: PromptifySong[];
	playlist: Playlist;
	songsToPlay: SongsToPlay | null;
	setSongs: React.Dispatch<React.SetStateAction<PromptifySong[]>>;
	setPlaylist: React.Dispatch<React.SetStateAction<Playlist>>;
	setSongsToPlay: React.Dispatch<React.SetStateAction<SongsToPlay | null>>;
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
	const {
		isGenerating,
		songs,
		playlist,
		songsToPlay,
		setSongs,
		setPlaylist,
		setSongsToPlay,
	} = props;
	const [sort, setSort] = useState<string>(Sort.MostPopular);
	const [lyricTypes, setLyricTypes] = useState<Set<string>>(new Set());
	const [releaseTypes, setReleaseTypes] = useState<Set<string>>(new Set());
	const [libraryStatuses, setLibraryStatuses] = useState<Set<string>>(
		new Set()
	);

	// Function that returns different sort functions depending on which sort option is selected
	const fetchSortFunction = () => {
		if (sort === Sort.LeastPopular) {
			// Sort using the popularity property
			return (a: PromptifySong, b: PromptifySong) =>
				a.popularity - b.popularity;
		} else if (sort === Sort.Longest) {
			// Sort using the duration property
			return (a: PromptifySong, b: PromptifySong) =>
				b.duration_ms - a.duration_ms;
		} else if (sort === Sort.Shortest) {
			// Sort using the duration property
			return (a: PromptifySong, b: PromptifySong) =>
				a.duration_ms - b.duration_ms;
		} else if (sort === Sort.Newest) {
			// Sort using the release_date property
			return (a: PromptifySong, b: PromptifySong) =>
				b.release_date.getTime() - a.release_date.getTime();
		} else if (sort === Sort.Oldest) {
			// Sort using the release_date property
			return (a: PromptifySong, b: PromptifySong) =>
				a.release_date.getTime() - b.release_date.getTime();
		} else {
			// Sort using the popularity property as default
			return (a: PromptifySong, b: PromptifySong) =>
				b.popularity - a.popularity;
		}
	};

	const handleSortChange = (sort: string) => {
		setSort(sort);
	};

	const handleFilterChange = (
		updatedFilters: string[],
		setSelectedFilters: React.Dispatch<React.SetStateAction<Set<string>>>
	) => {
		setSelectedFilters(new Set(updatedFilters));
	};

	// Helper function that checks if a song satisfies a filter by checking
	// if all of the filter values are present in the song's relevant property
	const songSatisfiesFilters = (
		songPropreties: Set<string>,
		filters: Set<string>
	) =>
		filters.size > 0 &&
		[...filters].every((value) => songPropreties.has(value));

	// Generic function that takes in a song's property as a set and the
	// set of selected filters to compare the property to
	const filterByProperty = (
		songProperties: Set<string>,
		selectedFilters: Set<string>
	) => {
		if (selectedFilters.size === 0) {
			return true;
		} else if (songSatisfiesFilters(songProperties, selectedFilters)) {
			return true;
		} else {
			return false;
		}
	};

	// Filters the songs by lyric type, release type, library status, and then sorts them using the
	// relevant sorting function before passing to the SongsGrid
	const filteredAndSortedSongs = songs
		.filter((song: PromptifySong) =>
			filterByProperty(new Set([song.release_type]), releaseTypes)
		)
		.filter((song: PromptifySong) =>
			filterByProperty(
				song.explicit ? new Set(["Explicit"]) : new Set(["Clean"]),
				lyricTypes
			)
		)
		.filter((song: PromptifySong) =>
			filterByProperty(
				song.saved ? new Set(["Liked"]) : new Set(["Unliked"]),
				libraryStatuses
			)
		)
		.sort(fetchSortFunction());

	return (
		<Container
			as="section"
			css={{
				d: "flex",
				fd: "column",
				fw: "nowrap",
				ai: "center",
				p: isGenerating || songs.length === 0 ? "$40" : "0 $16",
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
			) : songs.length === 0 ? (
				accessToken ? (
					<Text h3>Generate some songs!</Text>
				) : (
					<Text h3>Log in to generate some songs!</Text>
				)
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
						songs={filteredAndSortedSongs}
						setSongs={setSongs}
						playlist={playlist}
						setPlaylist={setPlaylist}
						songsToPlay={songsToPlay}
						setSongsToPlay={setSongsToPlay}
					/>
				</Fragment>
			)}
		</Container>
	);
}

export default ResultsSections;
