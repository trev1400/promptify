import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { createTheme, NextUIProvider } from "@nextui-org/react";
import "./index.css";

const theme = createTheme({
	type: "dark",
	theme: {
		colors: {
			// brand colors
			text: "#ccccb5",
			background: "#1b2028",
			backgroundAlpha: "#1b2028",
			backgroundContrast: "#4b5975",
			primary: "#23a9d5",
		},
		fonts: {
			sans: "",
			mono: "Source Code Pro, monospace, Menlo, Monaco, 'Lucida Console', 'Liberation Mono', 'DejaVu Sans Mono', 'Bitstream Vera Sans Mono'",
		},
	},
});

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
	<React.StrictMode>
		<NextUIProvider theme={theme}>
			<App />
		</NextUIProvider>
	</React.StrictMode>
);
