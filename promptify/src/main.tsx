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
			primaryLight: "$green200",
			primaryLightHover: "$green300",
			primaryLightActive: "$green400",
			primaryLightContrast: "$green600",
			primary: "#4ADE7B",
			primaryBorder: "$green500",
			primaryBorderHover: "$green600",
			primarySolidHover: "$green700",
			primarySolidContrast: "$white",
			primaryShadow: "$green500",

			gradient:
				"linear-gradient(112deg, $blue100 -25%, $pink500 -10%, $purple500 80%)",
			link: "#5E1DAD",
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
