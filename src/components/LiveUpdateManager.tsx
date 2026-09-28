import React, { useEffect, useState, useRef } from "react";
import { RefreshCw } from "lucide-react";

interface VersionInfo {
  version: string;
  buildTime: number;
}

export const LiveUpdateManager: React.FC = () => {
  const [hasUpdate, setHasUpdate] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const currentVersionRef = useRef<string | null>(null);
  const isCheckingRef = useRef(false);

  const applyUpdate = async () => {
    setIsUpdating(true);
    try {
      // Unregister old service workers or ask active SW to update
      if ("serviceWorker" in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const reg of registrations) {
          await reg.update().catch(() => {});
        }
      }
      // Clear cache storage
      if ("caches" in window) {
        const cacheKeys = await caches.keys();
        await Promise.all(cacheKeys.map((key) => caches.delete(key)));
      }
    } catch (e) {
      console.warn("Cache clear notice:", e);
    }

    // Force reload bypassing cache
    window.location.reload();
  };

  const checkForUpdate = async () => {
    if (isCheckingRef.current) return;
    isCheckingRef.current = true;

    try {
      // 1. Check Service Worker for updates
      if ("serviceWorker" in navigator) {
        const reg = await navigator.serviceWorker.getRegistration();
        if (reg) {
          await reg.update().catch(() => {});
        }
      }

      // 2. Fetch version file with timestamp to prevent caching
      const res = await fetch(`/app-version.json?_t=${Date.now()}`, {
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          "Pragma": "no-cache",
        },
      });

      if (res.ok) {
        const data: VersionInfo = await res.json();
        const remoteVersion = data.version || data.buildTime?.toString();

        if (remoteVersion) {
          if (!currentVersionRef.current) {
            // Initial load: save current running version
            currentVersionRef.current = remoteVersion;
          } else if (currentVersionRef.current !== remoteVersion) {
            // New version detected!
            console.log("⚡ New version detected:", remoteVersion, "Current:", currentVersionRef.current);
            setHasUpdate(true);
            // Automatically apply update smoothly after a tiny delay so user sees feedback
            setTimeout(() => {
              applyUpdate();
            }, 600);
          }
        }
      }
    } catch {
      // Silent fail if offline
    } finally {
      isCheckingRef.current = false;
    }
  };

  useEffect(() => {
    // Check immediately on mount
    checkForUpdate();

    // Check periodically every 15 seconds
    const interval = setInterval(checkForUpdate, 15000);

    // Check when user returns to tab / unlocks phone
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        checkForUpdate();
      }
    };

    const handleFocus = () => checkForUpdate();
    const handleOnline = () => checkForUpdate();

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleFocus);
    window.addEventListener("online", handleOnline);

    // Listen to service worker controller change (SW skipWaiting / clientsClaim)
    if ("serviceWorker" in navigator) {
      let refreshing = false;
      const handleControllerChange = () => {
        if (!refreshing) {
          refreshing = true;
          window.location.reload();
        }
      };
      navigator.serviceWorker.addEventListener("controllerchange", handleControllerChange);

      return () => {
        clearInterval(interval);
        document.removeEventListener("visibilitychange", handleVisibilityChange);
        window.removeEventListener("focus", handleFocus);
        window.removeEventListener("online", handleOnline);
        navigator.serviceWorker.removeEventListener("controllerchange", handleControllerChange);
      };
    }

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("online", handleOnline);
    };
  }, []);

  if (!hasUpdate) return null;

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] pointer-events-auto animate-fade-in">
      <div className="bg-stone-900/95 text-amber-300 border border-amber-500/60 shadow-[0_10px_30px_rgba(217,119,6,0.35)] backdrop-blur-xl px-4 py-2 rounded-full flex items-center gap-2.5 text-xs font-semibold tracking-wide">
        <RefreshCw className={`w-3.5 h-3.5 text-amber-400 ${isUpdating ? "animate-spin" : ""}`} />
        <span>{isUpdating ? "Шинэчлэгдэж байна..." : "Шинэ шинэчлэлт орлоо. Шинэчилж байна..."}</span>
        <button
          onClick={applyUpdate}
          className="ml-1 px-2.5 py-0.5 rounded-full bg-amber-500 text-stone-950 font-bold text-[10px] hover:bg-amber-400 transition cursor-pointer"
        >
          Шинэчлэх
        </button>
      </div>
    </div>
  );
};
