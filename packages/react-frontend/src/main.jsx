import React from "react";
import ReactDOMClient from "react-dom/client";
import "./main.css";
import App from "./App1.jsx";

// Create the container
const container = document.getElementById("root");

// Create a root
const root = ReactDOMClient.createRoot(container);

// Initial render: Render an element to the Root
root.render(<App />);
