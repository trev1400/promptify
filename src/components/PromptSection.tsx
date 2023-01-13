import React from "react";
import { Container, Button } from "@nextui-org/react";
import ControlledTextArea from "./TypewriterTextarea";
import { FiXCircle } from "react-icons/fi";
import { accessToken } from "../spotify-utils";

interface PromptSectionProps {
	prompt: string;
	isGenerating: boolean;
	isMobile: boolean;
	handlePromptChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
	handlePromptClear: () => void;
	fetchCompletions: () => void;
}

function PromptSection(props: PromptSectionProps) {
	const {
		prompt,
		isGenerating,
		isMobile,
		handlePromptChange,
		handlePromptClear,
		fetchCompletions,
	} = props;
	return (
		<Container
			as="section"
			css={{
				d: "flex",
				fd: "column",
				fw: "nowrap",
				ai: "center",
				p: "$12 $20",
				mw: "100%",
				rowGap: "$8",
				"@xsMax": {
					p: "$6 $8",
				},
			}}
		>
			<ControlledTextArea
				prompts={[
					"early 2010s rap songs to workout to",
					"taylor swift's greatest hits",
					"songs to listen to on a crisp autumn day",
					"tropical house edm bangers for an afternoon by the pool",
				]}
				value={prompt}
				onChange={handlePromptChange}
				aria-label="Prompt"
			/>
			<Container
				css={{
					d: "flex",
					fw: "nowrap",
					ai: "center",
					jc: "flex-end",
					as: "flex-start",
					gap: "$8",
					p: 0,
					m: 0,
					"@smMax": {
						maxWidth: "none",
					},
				}}
			>
				<Button
					color="error"
					size={isMobile ? "sm" : "md"}
					iconRight={<FiXCircle size={20} />}
					disabled={prompt === "" || isGenerating || !accessToken}
					onPress={handlePromptClear}
				>
					Clear
				</Button>
				<Button
					size={isMobile ? "sm" : "md"}
					onPress={fetchCompletions}
					disabled={prompt === "" || isGenerating || !accessToken}
				>
					Generate
				</Button>
			</Container>
		</Container>
	);
}

export default PromptSection;
