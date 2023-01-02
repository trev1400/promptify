import React, { useEffect, useRef, useState } from "react";
import { styled } from "@stitches/react";

interface TypewriterTextAreaProps {
	prompts: string[];
	value: string;
	onChange: React.ChangeEventHandler<HTMLTextAreaElement> | undefined;
	[x: string]: any;
}

interface TypewriterTextAreaPlaceholderState {
	placeholder: string;
	placeholderIndex: number;
}

interface PromptIndex {
	value: number;
	isActive: boolean;
}

const Textarea = styled("textarea", {
	fontSize: "var(--nextui-fontSizes-2xl)",
	fontWeight: "var(--nextui-fontWeights-medium)",
	height: "25vh",
	padding: "var(--nextui-space-md) var(--nextui-space-lg)",
	backgroundColor: "var(--nextui-colors-accents0)",
	borderRadius: "var(--nextui-space-6)",
	width: "100%",
	resize: "none",
	border: "none",
	outline: "none",
});

const ControlledTextArea = ({
	prompts,
	value,
	onChange,
	...rest
}: TypewriterTextAreaProps) => {
	const initialPlaceholderState: TypewriterTextAreaPlaceholderState = {
		placeholder: "",
		placeholderIndex: 0,
	};

	const [placeholderState, setPlaceholderState] =
		useState<TypewriterTextAreaPlaceholderState>(initialPlaceholderState);
	const [promptIndex, setPromptIndex] = useState<PromptIndex>({
		value: 0,
		isActive: true,
	});
	const ref = useRef<HTMLTextAreaElement>(null);

	useEffect(() => {
		if (promptIndex.isActive) {
			const prompt = prompts[promptIndex.value];
			const wordAnimation = setInterval(() => {
				setPlaceholderState((placeholderState) => {
					if (placeholderState.placeholderIndex > prompt.length - 1) {
						clearInterval(wordAnimation);
						setPromptIndex({
							...promptIndex,
							value:
								promptIndex.value < prompts.length - 1
									? promptIndex.value + 1
									: 0,
						});
						return initialPlaceholderState;
					}
					return {
						placeholder:
							placeholderState.placeholder +
							prompt[placeholderState.placeholderIndex],
						placeholderIndex: placeholderState.placeholderIndex + 1,
					};
				});
			}, 120);

			return () => clearInterval(wordAnimation);
		}
	}, [promptIndex]);

	const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
		const cursorPos = e.target.selectionStart;
		const textarea = e.target;
		window.requestAnimationFrame(() => {
			textarea.selectionStart = cursorPos;
			textarea.selectionEnd = cursorPos;
		});
		onChange && onChange(e);
	};

	const handleFocus = () => {
		setPromptIndex({ ...promptIndex, isActive: false });
	};

	const handleBlur = () => {
		if (value === "") {
			setPromptIndex({ ...promptIndex, isActive: true });
		}
	};

	return (
		<Textarea
			ref={ref}
			value={value}
			placeholder={placeholderState.placeholder}
			onChange={handleChange}
			onFocus={handleFocus}
			onBlur={handleBlur}
			{...rest}
		/>
	);
};

export default ControlledTextArea;
