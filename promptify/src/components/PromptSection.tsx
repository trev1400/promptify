import React from "react";
import { Container, Button } from "@nextui-org/react";
import ControlledTextArea from "./TypewriterTextarea";
import { FiXCircle } from "react-icons/fi";

interface PromptSectionProps {
	prompt: string;
	isGenerating: boolean;
	handlePromptChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
	handlePromptClear: () => void;
	fetchCompletions: () => void;
}

function PromptSection(props: PromptSectionProps) {
	const {
		prompt,
		isGenerating,
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
				rowGap: "$4",
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
					as: "flex-start",
					gap: "$8",
					p: 0,
					m: 0,
				}}
			>
				<Button
					size="lg"
					onPress={fetchCompletions}
					disabled={prompt === "" || isGenerating}
				>
					Generate
				</Button>
				<Button
					color="error"
					size="lg"
					iconRight={<FiXCircle size={20} />}
					disabled={prompt === "" || isGenerating}
					onPress={handlePromptClear}
				>
					Clear
				</Button>
			</Container>
		</Container>
	);
}

export default PromptSection;
