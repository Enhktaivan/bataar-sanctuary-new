import React, { useState, useEffect } from "react";
import { 
  Smartphone, 
  Download, 
  Share, 
  PlusSquare, 
  Check, 
  X, 
  Sparkles, 
  Wifi, 
  WifiOff, 
  ShieldCheck, 
  ExternalLink,
  ChevronRight,
  Info
} from "lucide-react";
import { usePWAInstall } from "../hooks/usePWAInstall";

export function PWAInstallManager() {
  const { isInstallable, isInstalled, isIOS, isAndroid, install } = usePWAInstall();
  const [isOpen, setIsOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(typeof navigator !== "undefined" ? navigator.onLine : true);
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Show a gentle prompt after 4 seconds if not installed
  useEffect(() => {
    if (!isInstalled) {
      const timer = setTimeout(() => {
        setShowNotification(true);
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [isInstalled]);

  const handleInstallClick = async () => {
    if (isInstallable) {
      const success = await install();
      if (success) {
        setIsOpen(false);
        setShowNotification(false);
      }
    } else {
      setIsOpen(true);
    }
  };

  return (
    <>
      {/* Offline Toast Banner */}
      {!isOnline && (
        <div className="fixed top-3 left-1/2 -translate-x-1/2 z-[9999] flex items-center gap-2.5 px-4 py-2 bg-stone-900/95 border border-amber-500/40 text-amber-200 text-xs font-medium rounded-full shadow-2xl backdrop-blur-md animate-pulse">
          <WifiOff className="w-3.5 h-3.5 text-amber-400" />
          <span>Офлайн горим идэвхжсэн — Кэшлэгдсэн мэдээлэл харагдаж байна</span>
        </div>
      )}

      {/* Floating Install App Banner / Pill (Top-right or bottom-left) */}
      {!isInstalled && (
        <div className="fixed top-4 right-24 z-[9990] flex items-center gap-2">
          <button
            onClick={() => setIsOpen(true)}
            className="group relative flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-amber-500/20 via-stone-900 to-amber-600/20 hover:from-amber-500/30 hover:to-amber-600/30 border border-amber-500/40 hover:border-amber-400/80 text-amber-200 shadow-lg hover:shadow-amber-500/20 backdrop-blur-md transition-all duration-300 text-xs font-medium cursor-pointer"
            title="Bataar Travel албан ёсны Аппликейшнийг утсандаа суулгах"
          >
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
            </span>
            <Smartphone className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform" />
            <span className="tracking-wide">Апп суулгах</span>
            <span className="hidden sm:inline text-[10px] text-amber-400/70 border-l border-amber-500/30 pl-1.5 font-sans">
              PWA
            </span>
          </button>
        </div>
      )}

      {/* Gentle Bottom-Left Install Toast Prompt on first visit */}
      {!isInstalled && showNotification && !isOpen && (
        <div className="fixed bottom-6 left-6 z-[9980] max-w-sm w-[calc(100vw-3rem)] p-4 rounded-2xl bg-stone-950/95 border border-amber-500/40 text-stone-100 shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-bottom-5 duration-500">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 p-0.5 shadow-md shrink-0 flex items-center justify-center">
              <img
                src="./favicon.png"
                alt="Bataar Logo"
                className="w-full h-full object-cover rounded-[10px]"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-semibold text-amber-200 uppercase tracking-wider">
                  Bataar Travel Апп
                </h4>
                <button
                  onClick={() => setShowNotification(false)}
                  className="text-stone-400 hover:text-stone-200 p-0.5"
                  aria-label="Хаах"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-[11px] text-stone-300 mt-0.5 leading-snug">
                Утсандаа суулган интернэтгүй үед ч хөтөч, газрын зураг, ресортын мэдээллээ хялбар үзээрэй.
              </p>
              <div className="mt-2.5 flex items-center gap-2">
                <button
                  onClick={handleInstallClick}
                  className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 font-semibold text-xs transition shadow-md shadow-amber-500/20"
                >
                  <Download className="w-3 h-3" />
                  <span>{isInstallable ? "Шууд суулгах" : "Заавар харах"}</span>
                </button>
                <button
                  onClick={() => setShowNotification(false)}
                  className="py-1.5 px-2.5 rounded-lg border border-stone-800 text-stone-400 hover:text-stone-200 text-xs"
                >
                  Дараа
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Full Luxury Install Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg rounded-2xl bg-gradient-to-b from-stone-900 via-stone-950 to-stone-950 border border-amber-500/40 p-6 sm:p-7 shadow-2xl text-stone-100 max-h-[90vh] overflow-y-auto">
            {/* Close Button */}
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-stone-400 hover:text-stone-100 hover:bg-stone-800/60 transition"
              aria-label="Хаах"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="flex items-center gap-4 border-b border-stone-800/80 pb-5">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 via-amber-600 to-amber-900 p-0.5 shadow-xl shrink-0 flex items-center justify-center">
                <img
                  src="./favicon.png"
                  alt="Bataar App Icon"
                  className="w-full h-full object-cover rounded-[14px]"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              </div>
              <div>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] uppercase font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                  <Sparkles className="w-2.5 h-2.5" /> Албан ёсны Web App
                </span>
                <h3 className="text-lg font-bold text-stone-100 mt-1 font-serif tracking-tight">
                  Батаарын Өлгий | Bataar Travel
                </h3>
                <p className="text-xs text-stone-400">
                  bataartravel.mn • Үлэг гүрвэлийн өлгий нутгийн портал
                </p>
              </div>
            </div>

            {/* App Highlights */}
            <div className="my-5 grid grid-cols-2 gap-2.5">
              <div className="p-3 rounded-xl bg-stone-900/60 border border-stone-800 flex items-start gap-2.5">
                <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 shrink-0">
                  <Smartphone className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-stone-200">Нүүр дэлгэц дээр</div>
                  <div className="text-[11px] text-stone-400 leading-tight">Яг л апп шиг хурдан нээгдэнэ</div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-stone-900/60 border border-stone-800 flex items-start gap-2.5">
                <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 shrink-0">
                  <Wifi className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-stone-200">Офлайн горим</div>
                  <div className="text-[11px] text-stone-400 leading-tight">Сүлжээгүй үед ч уншина</div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-stone-900/60 border border-stone-800 flex items-start gap-2.5">
                <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-stone-200">Бүрэн аюулгүй</div>
                  <div className="text-[11px] text-stone-400 leading-tight">Сул зай эзлэхгүй, хөнгөн</div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-stone-900/60 border border-stone-800 flex items-start gap-2.5">
                <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-stone-200">24/7 AI Хөтөч</div>
                  <div className="text-[11px] text-stone-400 leading-tight">Шууд захиалга & туслах</div>
                </div>
              </div>
            </div>

            {/* Install Flow Conditional */}
            {isInstallable ? (
              <div className="mt-4 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-center">
                <p className="text-xs text-amber-200 mb-3">
                  Таны төхөөрөмж 1 товшилтоор суулгахыг дэмжиж байна!
                </p>
                <button
                  onClick={async () => {
                    await install();
                    setIsOpen(false);
                  }}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-bold text-sm tracking-wide shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer transition"
                >
                  <Download className="w-4 h-4" />
                  Утсандаа шууд суулгах
                </button>
              </div>
            ) : isIOS ? (
              /* iOS Safari Instructions */
              <div className="mt-4 p-4 rounded-xl bg-stone-900/80 border border-stone-800">
                <div className="flex items-center gap-2 text-xs font-semibold text-amber-300 uppercase tracking-wider mb-2">
                  <Smartphone className="w-4 h-4" /> iPhone / iPad (Safari) дээр суулгах заавар:
                </div>
                <ol className="space-y-3 text-xs text-stone-300">
                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-[10px] shrink-0">
                      1
                    </span>
                    <div>
                      Safari хөтчийнхөө доод талын{" "}
                      <strong className="text-amber-200 inline-flex items-center gap-1 bg-stone-800 px-1.5 py-0.5 rounded border border-stone-700">
                        <Share className="w-3 h-3" /> Share (Хуваалцах)
                      </strong>{" "}
                      товчийг дарна.
                    </div>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-[10px] shrink-0">
                      2
                    </span>
                    <div>
                      Цэснээс доош гүйлгээд{" "}
                      <strong className="text-amber-200 inline-flex items-center gap-1 bg-stone-800 px-1.5 py-0.5 rounded border border-stone-700">
                        <PlusSquare className="w-3 h-3" /> Add to Home Screen (Нүүр дэлгэцэнд нэмэх)
                      </strong>{" "}
                      сонголтыг сонгоно.
                    </div>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-[10px] shrink-0">
                      3
                    </span>
                    <div>
                      Баруун дээд булангийн <strong className="text-amber-200">"Add" (Нэмэх)</strong> товчийг дарснаар таны утасны нүүр дэлгэц дээр Апп болон харагдах болно!
                    </div>
                  </li>
                </ol>
              </div>
            ) : (
              /* Android Chrome or Desktop Browser Instructions */
              <div className="mt-4 p-4 rounded-xl bg-stone-900/80 border border-stone-800">
                <div className="flex items-center gap-2 text-xs font-semibold text-amber-300 uppercase tracking-wider mb-2">
                  <Smartphone className="w-4 h-4" /> Android / Компьютер дээр суулгах заавар:
                </div>
                <ol className="space-y-3 text-xs text-stone-300">
                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-[10px] shrink-0">
                      1
                    </span>
                    <div>
                      Chrome хөтчийн баруун дээд булангийн{" "}
                      <strong className="text-amber-200">3 цэг (⋮)</strong> цэсийг дарна.
                    </div>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-[10px] shrink-0">
                      2
                    </span>
                    <div>
                      <strong className="text-amber-200">"Апп суулгах" (Install App)</strong> эсвэл{" "}
                      <strong className="text-amber-200">"Нүүр дэлгэцэнд нэмэх"</strong> гэснийг сонгоно.
                    </div>
                  </li>
                </ol>
              </div>
            )}

            {/* Footer Notice */}
            <div className="mt-5 pt-4 border-t border-stone-800/80 flex items-center justify-between text-[11px] text-stone-400">
              <span className="flex items-center gap-1.5 text-stone-400">
                <Info className="w-3.5 h-3.5 text-amber-500/80" />
                Play Store / App Store-оос татах шаардлагагүй, шууд ажиллана.
              </span>
              <button
                onClick={() => setIsOpen(false)}
                className="px-3 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 font-medium transition"
              >
                Хаах
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
