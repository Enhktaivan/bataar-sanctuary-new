import "./bataar-app.js";
import "./index.css";
import React from "react";
import ReactDOM from "react-dom/client";
import { AIAssistantWidget } from "./components/AIAssistantWidget";
import { LiveUpdateManager } from "./components/LiveUpdateManager";

// Mount AI Concierge and Real-time Live Update Manager
const mountWidgets = () => {
  let conciergeContainer = document.getElementById("bataar-ai-concierge-root");
  if (!conciergeContainer) {
    conciergeContainer = document.createElement("div");
    conciergeContainer.id = "bataar-ai-concierge-root";
    document.body.appendChild(conciergeContainer);
  }
  const conciergeRoot = ReactDOM.createRoot(conciergeContainer);
  conciergeRoot.render(
    <React.StrictMode>
      <LiveUpdateManager />
      <AIAssistantWidget />
    </React.StrictMode>
  );
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", mountWidgets);
} else {
  mountWidgets();
}

