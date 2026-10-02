import React from 'react';
import {roomStayPrice, type Room} from '../roomStayPrice';

const USD_RATE = 3595.63; // Mongolbank closing rate, 2026-09-30; display estimate only.
const usd = (mnt: number) => new Intl.NumberFormat("en-US", {style:"currency", currency:"USD"}).format(mnt / USD_RATE);
const rooms = {standard:'Энгийн өрөө', deluxe:'Люкс өрөө', family:'Гэр бүлийн өрөө'};
export function RoomBooking({initialRoom, onClose, reactRuntime}: {initialRoom?: string; onClose: () => void; reactRuntime: typeof React}) {
  // The existing application embeds its own React runtime; hooks must use that renderer.
  const useState = reactRuntime.useState;
  const [room, setRoom] = useState<Room>(initialRoom && initialRoom in rooms ? initialRoom as Room : 'standard');
  const [guests, setGuests] = useState(2);
  const [arrival, setArrival] = useState('');
  const [departure, setDeparture] = useState('');
  const nights = arrival && departure ? Math.round((Date.parse(departure) - Date.parse(arrival))/86400000) : 0;
  const total = roomStayPrice(room, guests, nights);
  const roomCount = Math.ceil(guests / (room === 'family' ? 6 : 2));
  const bookingUrl = 'https://bataar-sanctuary-payments.erdii4812.workers.dev/booking?' + new URLSearchParams({arrival, departure, persons:String(guests), room:rooms[room]}).toString();
  return <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm">
    <section role="dialog" aria-modal="true" aria-label="Өрөөний захиалга" className="bg-white text-stone-900 max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-4">
      <button onClick={onClose} className="float-right border px-3 py-1">Хаах</button>
      <h2 className="text-2xl font-semibold">Өрөөний захиалга</h2>
      <p className="text-sm">Баазын байр + өдрийн 3 хоол. Аяллын төлбөр тусдаа.</p>
      <label className="block">Өрөөний төрөл<select className="block border p-2 w-full" value={room} onChange={e=>setRoom(e.target.value as Room)}>{Object.entries(rooms).map(([id,label])=><option key={id} value={id}>{label}</option>)}</select></label>
      <label className="block">Хүний тоо<input className="block border p-2 w-full" type="number" min="1" max="50" value={guests} onChange={e=>setGuests(Number(e.target.value))}/></label>
      <label className="block">Ирэх огноо<input className="block border p-2 w-full" type="date" value={arrival} onChange={e=>setArrival(e.target.value)}/></label>
      <label className="block">Гарах огноо<input className="block border p-2 w-full" type="date" min={arrival} value={departure} onChange={e=>setDeparture(e.target.value)}/></label>
      <div className="border bg-amber-50 p-4 space-y-2" aria-live="polite">
        <p>{rooms[room]} — {room === 'standard' ? `${usd(260000)} / хүн, хоног; ганцаар ${usd(390000)}` : room === 'deluxe' ? `Ганцаар ${usd(450000)}; хосоороо нийт ${usd(650000)} / хоног` : `${usd(650000)} / өрөө, хоног`}</p>
        <p>{roomCount} өрөө · {guests} хүн · {nights > 0 ? nights : '—'} хоног</p>
        <p className="font-semibold">Байр + 3 хоол: {total === null ? 'Ирэх, гарах огноогоо сонгоно уу' : usd(total)}</p>
        <p className="text-xs">Тооцооны ханш: 1 USD = 3,595.63₮ · 2026-09-30 · Монголбанк. Долларын дүн нь энэ ханшаар хөрвүүлсэн тооцоо.</p>
        <p className="text-sm">Аяллын үнэ энэ дүнд ороогүй. Бааз өрөөний боломж, хуваарилалт, эцсийн үнийг батална.</p>
      </div>
      <a className="block bg-stone-900 text-white p-3 text-center" href={bookingUrl}>Захиалгын хүсэлт илгээх</a>
      <p className="text-xs">Дараагийн маягтад холбоо барих мэдээллээ бөглөнө. Бааз сул байр болон эцсийн үнийг баталсны дараа QPay төлбөрийн холбоос өгнө.</p>
    </section>
  </div>;
}
