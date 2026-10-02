export type Room = 'standard' | 'deluxe' | 'family';
export function roomStayPrice(room: Room, guests: number, nights: number) {
  if (!Number.isInteger(guests) || guests < 1 || guests > 50 || !Number.isInteger(nights) || nights < 1) return null;
  const day = room === 'standard' ? guests * 260000 + (guests % 2 ? 130000 : 0)
    : room === 'deluxe' ? Math.floor(guests / 2) * 650000 + (guests % 2 ? 450000 : 0)
    : Math.ceil(guests / 6) * 650000;
  return day * nights;
}
