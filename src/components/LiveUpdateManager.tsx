import React, { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";

export const LiveUpdateManager: React.FC = () => {
  const [hasUpdate, setHasUpdate] = useState(false);
  useEffect(() => {
    let version: string | null = null;
    let checking = false;
    const controller = new AbortController();
    const check = async () => {
      if (checking || document.visibilityState !== "visible") return;
      checking = true;
      try {
        const res = await fetch(`/app-version.json?_t=${Date.now()}`, { cache: "no-store", signal: controller.signal });
        if (!res.ok) return;
        const data = await res.json();
        const next = data.version || String(data.buildTime || "");
        if (next && version && next !== version) setHasUpdate(true);
        if (next && !version) version = next;
      } catch { /* Keep the current page usable when offline. */ }
      finally { checking = false; }
    };
    const onControllerChange = () => setHasUpdate(true);
    void check();
    const interval = setInterval(check, 60000);
    document.addEventListener("visibilitychange", check);
    window.addEventListener("online", check);
    navigator.serviceWorker?.addEventListener("controllerchange", onControllerChange);
    return () => {
      controller.abort();
      clearInterval(interval);
      document.removeEventListener("visibilitychange", check);
      window.removeEventListener("online", check);
      navigator.serviceWorker?.removeEventListener("controllerchange", onControllerChange);
    };
  }, []);
  if (!hasUpdate) return null;
  return <div role="status" className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] bg-stone-900 text-amber-300 px-4 py-2 rounded-xl shadow-xl text-xs">
    <span>Шинэ хувилбар бэлэн. Ажлаа дуусгасны дараа шинэчлээрэй.</span>
    <button className="ml-3 font-bold" onClick={() => {
      if (window.confirm("Хадгалаагүй мэдээлэл арилж болзошгүй. Хуудсыг шинэчлэх үү?")) window.location.reload();
    }}><RefreshCw className="inline w-3 h-3 mr-1" />Шинэчлэх</button>
  </div>;
};
