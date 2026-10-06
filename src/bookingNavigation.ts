const langs = ['mn','en','ko','zh','ja','ru','de','fr','it'];
const language = new URLSearchParams(location.search).get('lang');
try {
  if (language && langs.includes(language)) localStorage.setItem('bataar_lang', language);
  else if (!localStorage.getItem('bataar_lang')) {
    const preferred = navigator.language.toLowerCase().split('-')[0];
    localStorage.setItem('bataar_lang', langs.includes(preferred) ? preferred : 'en');
  }
} catch {}
const RETURN_KEY = 'bataar_booking_return';
const navigationType = (performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined)?.type;
const isReturn = (!location.search && !location.hash) || navigationType === 'back_forward';
export function rememberBookingOrigin() {
  try { sessionStorage.setItem(RETURN_KEY, JSON.stringify({url:location.href, y:scrollY, time:Date.now()})); } catch {}
}
let saved: {url:string; y:number; time:number} | null = null;
try {
  const raw = sessionStorage.getItem(RETURN_KEY);
  if (raw) {
    const value = JSON.parse(raw);
    const target = new URL(value.url);
    if (isReturn && target.origin === location.origin && target.pathname === location.pathname && (!language || target.search === location.search) && Number.isFinite(value.y) && value.y >= 0 && Date.now()-value.time < 30*60*1000 && Date.now() >= value.time) {
      saved = value;
      // Restore the section before the bundled application reads the hash.
      history.replaceState(history.state, '', target.pathname + target.search + target.hash);
    }
    sessionStorage.removeItem(RETURN_KEY);
  }
} catch {}
window.addEventListener('pageshow', event => {
  if (event.persisted) { try { sessionStorage.removeItem(RETURN_KEY); } catch {} }
});
export function restoreBookingOrigin() {
  if (!saved) return;
  const top = saved.y;
  // React renders asynchronously; wait for page height, rather than scrolling an empty root.
  let attempts = 0;
  const restore = () => {
    if (document.documentElement.scrollHeight >= top + innerHeight || attempts++ >= 30) {
      scrollTo({top, behavior:'instant'}); return;
    }
    requestAnimationFrame(restore);
  };
  requestAnimationFrame(restore);
  saved = null;
}
document.addEventListener('click', event => {
  const link = (event.target as Element)?.closest?.('a[href]');
  if (!(link instanceof HTMLAnchorElement) || event.defaultPrevented) return;
  const url = new URL(link.href);
  if (url.origin === 'https://bataar-sanctuary-payments.erdii4812.workers.dev' && url.pathname === '/booking' && !link.target && !(event as MouseEvent).ctrlKey && !(event as MouseEvent).metaKey) rememberBookingOrigin();
});
