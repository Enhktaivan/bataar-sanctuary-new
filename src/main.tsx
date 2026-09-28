import "./bataar-app.js";
import "./index.css";
import React from "react";
import ReactDOM from "react-dom/client";
import { AIAssistantWidget } from "./components/AIAssistantWidget";
import { PWAInstallManager } from "./components/PWAInstallManager";

// Mount AI Concierge and PWA App Manager
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
      <AIAssistantWidget />
    </React.StrictMode>
  );

  let pwaContainer = document.getElementById("bataar-pwa-install-root");
  if (!pwaContainer) {
    pwaContainer = document.createElement("div");
    pwaContainer.id = "bataar-pwa-install-root";
    document.body.appendChild(pwaContainer);
  }
  const pwaRoot = ReactDOM.createRoot(pwaContainer);
  pwaRoot.render(
    <React.StrictMode>
      <PWAInstallManager />
    </React.StrictMode>
  );
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", mountWidgets);
} else {
  mountWidgets();
}

