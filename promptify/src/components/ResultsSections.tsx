import React, { Fragment } from "react";
import { Container, Text, Progress } from "@nextui-org/react";
import SongsGrid from "./SongsGrid";
import { PromptifySong } from "../spotify-utils";

interface ResultsSectionProps {
	isGenerating: boolean;
	songs: PromptifySong[];
	setSongs: React.Dispatch<React.SetStateAction<PromptifySong[]>>;
}

function ResultsSections(props: ResultsSectionProps) {
	const { isGenerating, songs, setSongs } = props;
	return (
		<Container
			as="section"
			css={{
				d: "flex",
				fd: "column",
				fw: "nowrap",
				ai: "center",
				p: isGenerating || songs.length === 0 ? "$20" : "$4 $16",
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
				<Text h3>Generate some songs!</Text>
			) : (
				<SongsGrid songs={songs} setSongs={setSongs} />
			)}
		</Container>
	);
}

export default ResultsSections;
