import "./bataar-app.js";
import "./index.css";
import React from "react";
import ReactDOM from "react-dom/client";
import { createPortal } from "react-dom";
import { AIAssistantWidget } from "./components/AIAssistantWidget";
import { LiveUpdateManager } from "./components/LiveUpdateManager";

// The existing site is bundled separately; attach this entry to its contact column.
const FooterAdminLink = () => {
  const [target, setTarget] = React.useState<HTMLElement | null>(null);
  React.useEffect(() => {
    let mount: HTMLDivElement | null = null;
    const attach = () => {
      const footer = document.querySelector("footer");
      if (!footer) return;
      const email = footer.querySelector('a[href="mailto:bataartravel@gmail.com"]');
      let column = email?.parentElement ?? null;
      while (column && column !== footer && !column.querySelector(":scope > h4")) column = column.parentElement;
      if (!column || column === footer) column = footer.querySelector("div") ?? footer;
      if (mount?.isConnected && mount.parentElement === column) return;
      mount?.remove();
      mount = document.createElement("div");
      mount.id = "bataar-footer-admin-entry";
      mount.className = "mt-5";
      column.appendChild(mount);
      setTarget(mount);
    };
    const observer = new MutationObserver(attach);
    observer.observe(document.body, {childList: true, subtree: true});
    attach();
    return () => { observer.disconnect(); mount?.remove(); };
  }, []);
  return target ? createPortal(
    <a href="/admin/" className="inline-flex items-center gap-2 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-xs font-medium text-stone-700 transition hover:border-amber-500 hover:bg-amber-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600">
      <span aria-hidden="true">🔒</span> Админ нэвтрэх
    </a>, target) : null;
};

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
      <FooterAdminLink />
    </React.StrictMode>
  );
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", mountWidgets);
} else {
  mountWidgets();
}
