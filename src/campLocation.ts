// Google Maps: Motherland Of Bataar, phone 9953 0099, FF72+MWP.
// Verified against the named listing on 2026-10-21. Keep camera coordinates
// separate from the place's !3d/!4d coordinates when copying Google Maps URLs.
export const CAMP_LOCATION = Object.freeze({
  latitude: 43.4642132,
  longitude: 100.4523248,
  dms: '43°27′51.17″N 100°27′08.37″E',
});
export const CAMP_DIRECTIONS_URL = `https://www.google.com/maps/dir/?api=1&destination=${CAMP_LOCATION.latitude},${CAMP_LOCATION.longitude}&travelmode=driving`;
