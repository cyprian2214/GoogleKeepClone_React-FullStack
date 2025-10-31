import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import LoginPage from "./LoginPage";
import "./styles.css";

const root = createRoot(document.getElementById("root"));

// Navigate to /login to see the standalone login UI.
if (window.location.pathname === "/login") {
	root.render(<LoginPage />);
} else {
	root.render(<App />);
}
