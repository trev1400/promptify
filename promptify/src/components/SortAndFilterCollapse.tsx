import React, { useState } from "react";
import { Container, Collapse, Radio, Checkbox, Grid } from "@nextui-org/react";
import { Sort, ReleaseType, LyricType, LibraryStatus } from "./ResultsSections";

interface SortAndFilterCollapseProps {
	sort: string;
	setReleaseTypes: React.Dispatch<React.SetStateAction<Set<string>>>;
	setLyricTypes: React.Dispatch<React.SetStateAction<Set<string>>>;
	setLibraryStatuses: React.Dispatch<React.SetStateAction<Set<string>>>;
	handleSortChange: (sort: string) => void;
	handleFilterChange: (
		updatedFilters: string[],
		setSelectedFilters: React.Dispatch<React.SetStateAction<Set<string>>>
	) => void;
}

function SortAndFilterCollapse(props: SortAndFilterCollapseProps) {
	const {
		sort,
		setReleaseTypes,
		setLyricTypes,
		setLibraryStatuses,
		handleSortChange,
		handleFilterChange,
	} = props;
	const [expanded, setExpanded] = useState<boolean>(false);

	const handleReleaseTypeFilterChange = (updatedReleaseTypes: string[]) => {
		const filteredReleaseTypes: string[] = updatedReleaseTypes.filter(
			(releaseType: string) =>
				Object.values(ReleaseType).includes(releaseType)
		);
		handleFilterChange(filteredReleaseTypes, setReleaseTypes);
	};

	const handleLyricTypeFilterChange = (updatedLyricTypes: string[]) => {
		const filteredLyricTypes: string[] = updatedLyricTypes.filter(
			(lyricType: string) => Object.values(LyricType).includes(lyricType)
		);
		handleFilterChange(filteredLyricTypes, setLyricTypes);
	};

	const handleLibraryStatusFilterChange = (
		updatedLibraryStatuses: string[]
	) => {
		const filteredLibraryStatuses: string[] = updatedLibraryStatuses.filter(
			(libraryStatus: string) =>
				Object.values(LibraryStatus).includes(libraryStatus)
		);
		handleFilterChange(filteredLibraryStatuses, setLibraryStatuses);
	};

	return (
		<Container display="flex" justify="flex-start" css={{ p: 0 }}>
			<Collapse
				bordered
				divider={false}
				title="Sort & Filter"
				onChange={(event, index, value) => {
					setExpanded(value ?? false);
				}}
				css={{
					w: expanded ? "100%" : "25%",
					background: "$accents0",
					m: "0 0 0 $12",
				}}
				className="filter-collapse"
			>
				<Grid.Container gap={2}>
					<Grid xs={12} sm={6} md={3}>
						<Radio.Group
							label="Sort By"
							value={sort}
							onChange={handleSortChange}
						>
							<Radio value={Sort.MostPopular}>Most Popular</Radio>
							<Radio value={Sort.LeastPopular}>
								Least Popular
							</Radio>
							<Radio value={Sort.Shortest}>Shortest</Radio>
							<Radio value={Sort.Longest}>Longest</Radio>
							<Radio value={Sort.Newest}>Newest</Radio>
							<Radio value={Sort.Oldest}>Oldest</Radio>
						</Radio.Group>
					</Grid>
					<Grid xs={12} sm={6} md={3}>
						<Checkbox.Group
							label="Release Type"
							onChange={handleReleaseTypeFilterChange}
						>
							<Checkbox value={ReleaseType.Album}>Album</Checkbox>
							<Checkbox value={ReleaseType.Single}>
								Single
							</Checkbox>
							<Checkbox value={ReleaseType.Compilation}>
								Compilation
							</Checkbox>
						</Checkbox.Group>
					</Grid>
					<Grid xs={12} sm={6} md={3}>
						<Checkbox.Group
							label="Lyric Type"
							onChange={handleLyricTypeFilterChange}
						>
							<Checkbox value={LyricType.Explicit}>
								Explicit
							</Checkbox>
							<Checkbox value={LyricType.Clean}>Clean</Checkbox>
						</Checkbox.Group>
					</Grid>
					<Grid xs={12} sm={6} md={3}>
						<Checkbox.Group
							label="Library Status"
							onChange={handleLibraryStatusFilterChange}
						>
							<Checkbox value={LibraryStatus.Liked}>
								Liked
							</Checkbox>
							<Checkbox value={LibraryStatus.Unliked}>
								Unliked
							</Checkbox>
						</Checkbox.Group>
					</Grid>
				</Grid.Container>
			</Collapse>
		</Container>
	);
}

export default SortAndFilterCollapse;
