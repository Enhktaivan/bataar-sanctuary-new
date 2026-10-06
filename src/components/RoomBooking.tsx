import React from 'react';
import {roomStayPrice, type Room} from '../roomStayPrice';
import {roomBookingCopy, type RoomBookingLanguage} from '../roomBookingCopy';
import bookingPolicy from '../bookingPolicy.json';
const USD_RATE = 3595.63; // Display estimate only; unchanged dated rate.
const usd = (mnt: number) => new Intl.NumberFormat('en-US', {style:'currency', currency:'USD'}).format(mnt / USD_RATE);
const rooms = {standard:'Энгийн өрөө', deluxe:'Люкс өрөө', family:'Гэр бүлийн өрөө'};
export function RoomBooking({initialRoom, currentLang = 'mn', onClose, reactRuntime}: {initialRoom?: string; currentLang?: string; onClose: () => void; reactRuntime: typeof React}) {
  // Hooks must use the renderer embedded in the existing application.
  const useState = reactRuntime.useState;
  const lang: RoomBookingLanguage = Object.hasOwn(roomBookingCopy, currentLang) ? currentLang as RoomBookingLanguage : 'en';
  const t = roomBookingCopy[lang];
  const labels = {standard:t[7], deluxe:t[8], family:t[9]};
  const [room, setRoom] = useState<Room>(initialRoom && Object.hasOwn(rooms, initialRoom) ? initialRoom as Room : 'standard');
  const [guests, setGuests] = useState(2);
  const [arrival, setArrival] = useState('');
  const [departure, setDeparture] = useState('');
  const nights = arrival && departure ? Math.round((Date.parse(departure) - Date.parse(arrival))/86400000) : 0;
  const total = roomStayPrice(room, guests, nights);
  const roomCount = Math.ceil(guests / (room === 'family' ? 6 : 2));
  // Keep the backend's existing room intent while carrying the selected language.
  const bookingUrl = 'https://bataar-sanctuary-payments.erdii4812.workers.dev/booking?' + new URLSearchParams({lang, arrival, departure, persons:String(guests), room:rooms[room]}).toString();
  return <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm">
    <section lang={lang} role="dialog" aria-modal="true" aria-label={t[0]} className="bg-white text-stone-900 max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-4">
      <button onClick={onClose} className="float-right border px-3 py-1">{t[1]}</button>
      <h2 className="text-2xl font-semibold">{t[0]}</h2>
      <p className="text-sm">{t[2]}</p>
      <label className="block">{t[3]}<select className="block border p-2 w-full" value={room} onChange={e=>setRoom(e.target.value as Room)}>{Object.entries(labels).map(([id,label])=><option key={id} value={id}>{label}</option>)}</select></label>
      <label className="block">{t[4]}<input className="block border p-2 w-full" type="number" min="1" max="50" value={guests} onChange={e=>setGuests(Number(e.target.value))}/></label>
      <label className="block">{t[5]}<input className="block border p-2 w-full" type="date" value={arrival} onChange={e=>setArrival(e.target.value)}/></label>
      <label className="block">{t[6]}<input className="block border p-2 w-full" type="date" min={arrival} value={departure} onChange={e=>setDeparture(e.target.value)}/></label>
      <div className="border bg-amber-50 p-4 space-y-2" aria-live="polite">
        <p>{labels[room]} · {roomCount} {t[10]} · {guests} {t[11]} · {nights > 0 ? nights : '—'} {t[12]}</p>
        <p className="font-semibold">{t[13]}: {total === null ? t[14] : total.toLocaleString('en-US') + ' MNT ≈ ' + usd(total)}</p>
        <p className="text-xs">{t[18]} 1 USD = 3,595.63 MNT · 2026-09-30 · Mongolbank</p>
        <p className="text-sm">{t[15]}</p>
      </div>
      <div className="border p-3 text-sm space-y-2">
        <a href={'/booking-terms.html?lang='+lang} target="_blank" rel="noopener noreferrer" className="underline font-semibold">{bookingPolicy[lang][0]}</a>
        <p>{bookingPolicy[lang][1]}</p>
        <p>{bookingPolicy[lang][2]}</p>
        <p className="text-xs">{bookingPolicy[lang][4]}</p>
      </div>
      <a className="block bg-stone-900 text-white p-3 text-center" href={bookingUrl}>{t[16]}</a>
      <p className="text-xs">{t[17]}</p>
    </section>
  </div>;
}

