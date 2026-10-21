import {luxRoomPricing} from './luxRoomPricing';
import {standardRoomPricing as standard} from './standardRoomPricing';
export type Room = 'standard' | 'deluxe' | 'family';
export function deluxeBreakdown(guests: number, nights = 1, meals = true) {
  const rooms = Math.ceil(guests / luxRoomPricing.capacity);
  const lodging = rooms * luxRoomPricing.accommodationPerRoom * nights;
  const breakfast = meals ? guests * standard.breakfast * nights : 0;
  const lunch = meals ? guests * standard.lunch * nights : 0;
  const dinner = meals ? guests * standard.dinner * nights : 0;
  return {rooms, lodging, breakfast, lunch, dinner, total: lodging + breakfast + lunch + dinner};
}
export function roomStayPrice(room: Room, guests: number, nights: number) {
  if (!Number.isInteger(guests) || guests < 1 || guests > 50 || !Number.isInteger(nights) || nights < 1) return null;
  const day = room === 'standard' ? guests * standard.sharedTotal + (guests % 2 ? standard.accommodationShared : 0)
    : room === 'deluxe' ? deluxeBreakdown(guests).total
    : Math.ceil(guests / 6) * 650000;
  return day * nights;
}
