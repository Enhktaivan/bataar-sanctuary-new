import "./bataar-app.js";
import "./index.css";
import React from "react";
import ReactDOM from "react-dom/client";
import { AIAssistantWidget } from "./components/AIAssistantWidget";

// Mount AI Concierge and Notion CRM Hub
const mountAIAssistant = () => {
  let container = document.getElementById("bataar-ai-concierge-root");
  if (!container) {
    container = document.createElement("div");
    container.id = "bataar-ai-concierge-root";
    document.body.appendChild(container);
  }
  const root = ReactDOM.createRoot(container);
  root.render(
    <React.StrictMode>
      <AIAssistantWidget />
    </React.StrictMode>
  );
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", mountAIAssistant);
} else {
  mountAIAssistant();
}

