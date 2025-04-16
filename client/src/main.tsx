import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Add error handling for client-side errors
if (process.env.NODE_ENV === 'development') {
  window.addEventListener('error', (event) => {
    console.error('Global error caught:', event.error);
  });

  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
  });
}

const rootElement = document.getElementById("root");

if (!rootElement) {
  console.error("Failed to find the root element");
} else {
  try {
    const root = createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    console.log("Application successfully rendered");
  } catch (error) {
    console.error("Error rendering the application:", error);
  }
}
