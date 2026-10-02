// Camp-approved total per room per night, including three meals for each guest.
export const luxRoomPricing = {
  singleTotal: 450000,
  coupleTotal: 650000,
  mealsIncluded: ['breakfast', 'lunch', 'dinner'],
} as const;

// Camp-approved family room total per night, including three meals.
export const familyRoomPricing = {
  roomTotal: 650000,
  mealsIncluded: ['breakfast', 'lunch', 'dinner'],
} as const;
