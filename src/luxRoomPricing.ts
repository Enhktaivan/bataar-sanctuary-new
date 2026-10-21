// Owner-approved 2026-10-21: two-person room charge applies to single use too.
export const luxRoomPricing = {
  accommodationPerPersonShared: 320000,
  accommodationPerRoom: 640000,
  capacity: 2,
  mealsIncluded: false,
} as const;

// Camp-approved family room total per night, including three meals.
export const familyRoomPricing = {
  roomTotal: 650000,
  mealsIncluded: ['breakfast', 'lunch', 'dinner'],
} as const;
