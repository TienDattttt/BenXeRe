// Seat layout configurations for different bus capacities
export const AVAILABLE_CAPACITIES = [5, 7, 9, 16, 24, 29, 35, 45];

export const getCapacityOptions = () => {
  return AVAILABLE_CAPACITIES.map(capacity => ({
    value: capacity,
    label: `${capacity} chỗ ngồi`
  }));
};

export const generateSeatLayout = (capacity) => {
  switch (capacity) {
    case 5:
      // 5-seat SUV/Crossover layout (2-3)
      return [
        [null, { id: 1, number: 1 }, { id: 2, number: 2 }, null], // Driver + Front passenger
        [{ id: 3, number: 3 }, { id: 4, number: 4 }, { id: 5, number: 5 }] // Rear bench
      ];

    case 7:
      // 7-seat MPV layout (2-2-3)
      return [
        [null, { id: 1, number: 1 }, { id: 2, number: 2 }, null], // Driver + Front passenger
        [null, { id: 3, number: 3 }, { id: 4, number: 4 }, null], // Middle row - 2 seats
        [{ id: 5, number: 5 }, { id: 6, number: 6 }, { id: 7, number: 7 }] // Rear row - 3 seats
      ];

    case 9:
      // 9-seat Limousine layout (2-2-2-3)
      return [
        [null, { id: 1, number: 1 }, { id: 2, number: 2 }, null], // Driver + Front passenger
        [{ id: 3, number: 3 }, { id: 4, number: 4 }], // Second row
        [{ id: 5, number: 5 }, { id: 6, number: 6 }], // Third row
        [{ id: 7, number: 7 }, { id: 8, number: 8 }, { id: 9, number: 9 }] // Fourth row
      ];

    case 16:
      // 16-seat Transit layout (2-3-3-3-4)
      return [
        [null, { id: 1, number: 1 }, { id: 2, number: 2 }, null], // Driver + Front passenger
        [{ id: 3, number: 3 }, { id: 4, number: 4 }, { id: 5, number: 5 }], // Second row
        [{ id: 6, number: 6 }, { id: 7, number: 7 }, { id: 8, number: 8 }], // Third row
        [{ id: 9, number: 9 }, { id: 10, number: 10 }, { id: 11, number: 11 }], // Fourth row
        [{ id: 12, number: 12 }, { id: 13, number: 13 }, { id: 14, number: 14 }, { id: 15, number: 15 }], // Fifth row
        [{ id: 16, number: 16 }] // Last seat
      ];

    case 24:
      // 24-seat Mini Bus layout (2-2 pattern per row)
      return [
        [null, { id: 1, number: 1 }, { id: 2, number: 2 }, null], // Driver + Front passenger
        [{ id: 3, number: 3 }, { id: 4, number: 4 }, { id: 5, number: 5 }, { id: 6, number: 6 }], // 2-2 pattern
        [{ id: 7, number: 7 }, { id: 8, number: 8 }, { id: 9, number: 9 }, { id: 10, number: 10 }],
        [{ id: 11, number: 11 }, { id: 12, number: 12 }, { id: 13, number: 13 }, { id: 14, number: 14 }],
        [{ id: 15, number: 15 }, { id: 16, number: 16 }, { id: 17, number: 17 }, { id: 18, number: 18 }],
        [{ id: 19, number: 19 }, { id: 20, number: 20 }, { id: 21, number: 21 }, { id: 22, number: 22 }],
        [{ id: 23, number: 23 }, { id: 24, number: 24 }]
      ];

    case 29:
      // 29-seat Mini Bus layout (2-1 pattern per row)
      return [
        [null, { id: 1, number: 1 }, { id: 2, number: 2 }, null], // Driver + Front passenger
        [{ id: 3, number: 3 }, null, { id: 4, number: 4 }], // 2-1 pattern
        [{ id: 5, number: 5 }, null, { id: 6, number: 6 }],
        [{ id: 7, number: 7 }, null, { id: 8, number: 8 }],
        [{ id: 9, number: 9 }, null, { id: 10, number: 10 }],
        [{ id: 11, number: 11 }, null, { id: 12, number: 12 }],
        [{ id: 13, number: 13 }, null, { id: 14, number: 14 }],
        [{ id: 15, number: 15 }, null, { id: 16, number: 16 }],
        [{ id: 17, number: 17 }, null, { id: 18, number: 18 }],
        [{ id: 19, number: 19 }, null, { id: 20, number: 20 }],
        [{ id: 21, number: 21 }, null, { id: 22, number: 22 }],
        [{ id: 23, number: 23 }, null, { id: 24, number: 24 }],
        [{ id: 25, number: 25 }, null, { id: 26, number: 26 }],
        [{ id: 27, number: 27 }, null, { id: 28, number: 28 }],
        [{ id: 29, number: 29 }]
      ];

    case 35:
      // 35-seat Bus layout (2-2 pattern per row)
      return [
        [null, { id: 1, number: 1 }, { id: 2, number: 2 }, null], // Driver + Front passenger
        [{ id: 3, number: 3 }, { id: 4, number: 4 }, { id: 5, number: 5 }, { id: 6, number: 6 }], // 2-2 pattern
        [{ id: 7, number: 7 }, { id: 8, number: 8 }, { id: 9, number: 9 }, { id: 10, number: 10 }],
        [{ id: 11, number: 11 }, { id: 12, number: 12 }, { id: 13, number: 13 }, { id: 14, number: 14 }],
        [{ id: 15, number: 15 }, { id: 16, number: 16 }, { id: 17, number: 17 }, { id: 18, number: 18 }],
        [{ id: 19, number: 19 }, { id: 20, number: 20 }, { id: 21, number: 21 }, { id: 22, number: 22 }],
        [{ id: 23, number: 23 }, { id: 24, number: 24 }, { id: 25, number: 25 }, { id: 26, number: 26 }],
        [{ id: 27, number: 27 }, { id: 28, number: 28 }, { id: 29, number: 29 }, { id: 30, number: 30 }],
        [{ id: 31, number: 31 }, { id: 32, number: 32 }, { id: 33, number: 33 }, { id: 34, number: 34 }],
        [{ id: 35, number: 35 }]
      ];

    case 45:
      // 45-seat Coach layout with double-decker structure (2-2 pattern per row)
      // Split into lower floor (seats 1-22) and upper floor (seats 23-45)
      return [
        // Lower floor
        [{ id: "level-lower", number: "Tầng dưới", type: "level-indicator" }],
        [null, { id: 1, number: 1 }, { id: 2, number: 2 }, null], // Driver + Front passenger
        [{ id: 3, number: 3 }, { id: 4, number: 4 }, { id: 5, number: 5 }, { id: 6, number: 6 }], // 2-2 pattern
        [{ id: 7, number: 7 }, { id: 8, number: 8 }, { id: 9, number: 9 }, { id: 10, number: 10 }],
        [{ id: 11, number: 11 }, { id: 12, number: 12 }, { id: 13, number: 13 }, { id: 14, number: 14 }],
        [{ id: 15, number: 15 }, { id: 16, number: 16 }, { id: 17, number: 17 }, { id: 18, number: 18 }],
        [{ id: 19, number: 19 }, { id: 20, number: 20 }, { id: 21, number: 21 }, { id: 22, number: 22 }],
        
        // Upper floor
        [{ id: "level-upper", number: "Tầng trên", type: "level-indicator" }],
        [{ id: 23, number: 23 }, { id: 24, number: 24 }, { id: 25, number: 25 }, { id: 26, number: 26 }],
        [{ id: 27, number: 27 }, { id: 28, number: 28 }, { id: 29, number: 29 }, { id: 30, number: 30 }],
        [{ id: 31, number: 31 }, { id: 32, number: 32 }, { id: 33, number: 33 }, { id: 34, number: 34 }],
        [{ id: 35, number: 35 }, { id: 36, number: 36 }, { id: 37, number: 37 }, { id: 38, number: 38 }],
        [{ id: 39, number: 39 }, { id: 40, number: 40 }, { id: 41, number: 41 }, { id: 42, number: 42 }],
        [{ id: 43, number: 43 }, { id: 44, number: 44 }, { id: 45, number: 45 }]
      ];

    default:
      return [];
  }
}; 