/**
 * Shared data generators for mock hotel connectors.
 *
 * Provides realistic guest names, rate calculations, occupancy patterns,
 * confirmation numbers, and date utilities used by both Opera PMS and RMS mocks.
 */

// ─── Guest Name Generator ────────────────────────────────────────────────────

const FIRST_NAMES = [
  "James", "Maria", "Robert", "Sarah", "Michael", "Jennifer", "David",
  "Lisa", "Thomas", "Emily", "Christopher", "Amanda", "Daniel", "Jessica",
  "Matthew", "Ashley", "Andrew", "Stephanie", "Joshua", "Nicole",
  "Ryan", "Megan", "Brandon", "Rachel", "Justin", "Lauren", "Kevin",
  "Samantha", "Tyler", "Kayla", "William", "Elizabeth", "Carlos",
  "Patricia", "Anthony", "Angela", "Raj", "Priya", "Wei", "Yuki",
  "Hassan", "Fatima", "Jorge", "Isabella", "Alexander", "Natasha",
  "Dmitri", "Svetlana", "Hiroshi", "Chen",
];

const LAST_NAMES = [
  "Wilson", "Garcia", "Johnson", "Chen", "Brown", "Davis", "Martinez",
  "Anderson", "Taylor", "White", "Lee", "Harris", "Clark", "Lewis",
  "Robinson", "Walker", "Hall", "Allen", "Young", "King",
  "Wright", "Scott", "Green", "Adams", "Baker", "Nelson", "Hill",
  "Moore", "Campbell", "Mitchell", "Thompson", "Patel", "Nguyen",
  "Kim", "Tanaka", "Rodriguez", "Singh", "Muller", "Fernandez",
  "Ivanov", "Yamamoto", "O'Brien", "Johansson", "Schmidt", "Rossi",
  "DeSilva", "Okafor", "Petrov", "Takahashi", "Chang",
];

/** Generate a realistic guest name from first + last name pools. */
export function generateGuestName(seed: number): string {
  const first = FIRST_NAMES[seed % FIRST_NAMES.length];
  const last = LAST_NAMES[(seed * 7 + 13) % LAST_NAMES.length];
  return `${first} ${last}`;
}

/** Generate a batch of unique guest names. */
export function generateGuestNames(count: number, startSeed = 0): string[] {
  const names: string[] = [];
  const used = new Set<string>();
  let seed = startSeed;
  while (names.length < count) {
    const name = generateGuestName(seed);
    if (!used.has(name)) {
      names.push(name);
      used.add(name);
    }
    seed++;
  }
  return names;
}

// ─── Confirmation Number Generator ───────────────────────────────────────────

/** Generate a realistic Opera-style confirmation number (e.g., "OPR-20250615-3847"). */
export function generateConfirmationNumber(
  date: Date,
  index: number,
): string {
  const dateStr = formatDate(date).replace(/-/g, "");
  const seq = String(1000 + (index * 37 + 847) % 9000);
  return `OPR-${dateStr}-${seq}`;
}

// ─── Rate Generator ──────────────────────────────────────────────────────────

/** Room type base rate multipliers relative to a property's BAR. */
const ROOM_TYPE_MULTIPLIERS: Record<string, number> = {
  "King": 1.0,
  "Double Queen": 0.95,
  "Suite": 1.55,
  "ADA King": 1.0,
  "Junior Suite": 1.3,
  "Executive Suite": 1.85,
};

/** Day-of-week rate adjustments. Fri/Sat premium for leisure, Tue-Thu for business. */
const DOW_RATE_FACTORS: Record<number, number> = {
  0: 0.88,  // Sunday
  1: 0.95,  // Monday
  2: 1.02,  // Tuesday
  3: 1.05,  // Wednesday
  4: 1.03,  // Thursday
  5: 1.12,  // Friday
  6: 1.15,  // Saturday
};

/** Seasonal rate multipliers by month (0-11). */
const SEASONAL_FACTORS: Record<number, number> = {
  0: 0.88,  // January — post-holiday slump
  1: 0.92,  // February
  2: 1.05,  // March — spring break
  3: 1.08,  // April — spring events
  4: 1.04,  // May
  5: 1.02,  // June
  6: 0.95,  // July — summer lull (business)
  7: 0.93,  // August
  8: 1.06,  // September — fall conferences
  9: 1.10,  // October — peak convention
  10: 0.96, // November
  11: 0.85, // December — holiday dip
};

/**
 * Generate a rate for a room type on a specific date.
 *
 * @param baseAdr  Property-level base ADR (e.g. 215 for Marriott Dallas)
 * @param roomType Room type (e.g. "King", "Suite")
 * @param date     Target date
 * @param jitter   Optional random jitter factor (0-1 range, used to add ±5% variance)
 */
export function generateRate(
  baseAdr: number,
  roomType: string,
  date: Date,
  jitter = 0,
): number {
  const typeMultiplier = ROOM_TYPE_MULTIPLIERS[roomType] ?? 1.0;
  const dowFactor = DOW_RATE_FACTORS[date.getDay()] ?? 1.0;
  const seasonFactor = SEASONAL_FACTORS[date.getMonth()] ?? 1.0;
  const jitterFactor = 1.0 + (jitter - 0.5) * 0.1; // ±5%

  return round2(baseAdr * typeMultiplier * dowFactor * seasonFactor * jitterFactor);
}

// ─── Occupancy Pattern Generator ─────────────────────────────────────────────

/**
 * Generate expected occupancy for a date.
 *
 * @param baseOcc  Base occupancy (0-1), e.g. 0.78
 * @param date     Target date
 * @param eventBoost Additional boost from events (0-0.15 typically)
 * @param jitter   Random jitter (0-1 range)
 */
export function generateOccupancy(
  baseOcc: number,
  date: Date,
  eventBoost = 0,
  jitter = 0,
): number {
  const dow = date.getDay();
  // Business hotels peak Tue-Thu, leisure on weekends
  const dowFactor = dow >= 1 && dow <= 4 ? 1.06 : 0.87;
  const seasonFactor = SEASONAL_FACTORS[date.getMonth()] ?? 1.0;
  const jitterAmount = (jitter - 0.5) * 0.06; // ±3%

  const raw = baseOcc * dowFactor * seasonFactor + eventBoost + jitterAmount;
  return Math.min(0.99, Math.max(0.35, round2(raw)));
}

// ─── Date Utilities ──────────────────────────────────────────────────────────

/** Format a Date as YYYY-MM-DD. */
export function formatDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/** Add (or subtract) days from a Date. */
export function addDays(d: Date, n: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

/** Day-of-week short labels. */
const DOW_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

/** Return 3-letter day-of-week label for a date. */
export function dayOfWeek(d: Date): string {
  return DOW_LABELS[d.getDay()];
}

/** Generate a date range from start to start+days (exclusive). */
export function dateRange(start: Date, days: number): Date[] {
  return Array.from({ length: days }, (_, i) => addDays(start, i));
}

// ─── Seeded Random ───────────────────────────────────────────────────────────

/** Simple deterministic hash-based random from a seed string. */
export function seededRandom(seed: string): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (Math.imul(31, h) + seed.charCodeAt(i)) | 0;
  }
  return ((h >>> 0) % 10000) / 10000;
}

/** Seeded random in a range [min, max]. */
export function seededRange(seed: string, min: number, max: number): number {
  return round2(min + seededRandom(seed) * (max - min));
}

/** Seeded random integer in [min, max] (inclusive). */
export function seededInt(seed: string, min: number, max: number): number {
  return Math.floor(min + seededRandom(seed) * (max - min + 1));
}

/** Pick a random item from an array using a seed. */
export function seededPick<T>(seed: string, arr: T[]): T {
  return arr[seededInt(seed, 0, arr.length - 1)];
}

// ─── Rounding ────────────────────────────────────────────────────────────────

/** Round to 2 decimal places. */
export function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

// ─── Showcase Properties ─────────────────────────────────────────────────────

/** The 3 showcase properties used across connectors. */
export const SHOWCASE_PROPERTIES = [
  {
    slug: "marriott-dallas",
    name: "Marriott Dallas Downtown",
    market: "Dallas",
    totalRooms: 340,
    baseAdr: 215,
    baseOcc: 0.78,
    floorsStart: 2,
    floorsEnd: 18,
    roomsPerFloor: 20,
  },
  {
    slug: "hilton-houston",
    name: "Hilton Houston Galleria",
    market: "Houston",
    totalRooms: 280,
    baseAdr: 195,
    baseOcc: 0.75,
    floorsStart: 2,
    floorsEnd: 15,
    roomsPerFloor: 20,
  },
  {
    slug: "hyatt-denver",
    name: "Hyatt Regency Denver",
    market: "Denver",
    totalRooms: 450,
    baseAdr: 230,
    baseOcc: 0.77,
    floorsStart: 2,
    floorsEnd: 22,
    roomsPerFloor: 22,
  },
] as const;

/** Room types available at each property. */
export const ROOM_TYPES = ["King", "Double Queen", "Suite", "ADA King"] as const;

/** Booking sources. */
export const BOOKING_SOURCES = [
  "Direct", "Direct", "Direct",       // weighted: ~33%
  "Booking.com", "Expedia",           // OTAs: ~22%
  "Corporate", "Corporate",           // Corporate: ~22%
  "Travel Agent", "Marriott.com",     // Other: ~22%
  "Group Block",
] as const;

/** Reservation statuses. */
export const RESERVATION_STATUSES = [
  "confirmed", "confirmed", "confirmed", "confirmed",  // weighted heavily
  "checked-in", "checked-in", "checked-in",
  "checked-out",
  "cancelled",
  "no-show",
] as const;

/** VIP tiers. */
export const VIP_TIERS = [
  undefined, undefined, undefined, undefined, undefined,  // 50% no VIP
  undefined, undefined, undefined, undefined, undefined,
  "Gold", "Gold", "Gold",                                  // 15%
  "Platinum", "Platinum",                                  // 10%
  "Diamond",                                               // 5%
] as const;

/** Special requests pool. */
export const SPECIAL_REQUESTS = [
  "Extra pillows",
  "Late checkout requested",
  "Connecting room with adjacent",
  "Hypoallergenic bedding",
  "Crib needed",
  "Anniversary package",
  "Extra towels",
  "Feather-free room",
  "Rollaway bed",
  "Mini-fridge stocked",
  "High floor preferred",
  "Quiet room requested",
  "Airport shuttle at 6am",
  "Champagne and strawberries for arrival",
  "Kosher meal options",
  "Early check-in requested",
] as const;

/** Room statuses for Opera PMS room updates. */
export const ROOM_STATUSES = [
  "clean", "clean", "clean",          // 30%
  "dirty", "dirty",                    // 20%
  "inspected", "inspected",            // 20%
  "occupied", "occupied", "occupied",  // 30%
  "out-of-order",                      // minimal
] as const;

/** Housekeeping statuses. */
export const HK_STATUSES = [
  "clean", "clean", "clean",
  "dirty", "dirty",
  "inspected", "inspected",
  "ooo",
] as const;

/** Competitor hotels by market. */
export const COMP_SET_HOTELS: Record<string, { name: string; baseAdr: number; baseOcc: number }[]> = {
  Dallas: [
    { name: "Hyatt Regency Dallas", baseAdr: 208, baseOcc: 0.76 },
    { name: "Sheraton Dallas Hotel", baseAdr: 189, baseOcc: 0.72 },
    { name: "The Adolphus, Autograph Collection", baseAdr: 245, baseOcc: 0.71 },
    { name: "Omni Dallas Hotel", baseAdr: 232, baseOcc: 0.74 },
    { name: "Hilton Dallas Lincoln Centre", baseAdr: 178, baseOcc: 0.69 },
  ],
  Houston: [
    { name: "The Westin Houston Medical Center", baseAdr: 188, baseOcc: 0.73 },
    { name: "JW Marriott Houston Galleria", baseAdr: 212, baseOcc: 0.77 },
    { name: "Hotel Granduca Houston", baseAdr: 235, baseOcc: 0.68 },
    { name: "The Houstonian Hotel", baseAdr: 248, baseOcc: 0.70 },
  ],
  Denver: [
    { name: "Marriott Denver City Center", baseAdr: 222, baseOcc: 0.74 },
    { name: "Sheraton Denver Downtown", baseAdr: 198, baseOcc: 0.71 },
    { name: "The Westin Denver Downtown", baseAdr: 238, baseOcc: 0.75 },
    { name: "Grand Hyatt Denver", baseAdr: 242, baseOcc: 0.73 },
  ],
};

/** Market events that affect demand. */
export const MARKET_EVENTS: Record<string, { name: string; startDate: string; endDate: string; demandImpact: string; eventType: string }[]> = {
  Dallas: [
    { name: "State Fair of Texas", startDate: "2025-09-26", endDate: "2025-10-19", demandImpact: "high", eventType: "Festival" },
    { name: "North Texas Business Expo", startDate: "2025-02-20", endDate: "2025-02-22", demandImpact: "medium", eventType: "Convention" },
    { name: "Dallas Marathon", startDate: "2025-03-15", endDate: "2025-03-16", demandImpact: "low", eventType: "Sports" },
    { name: "Southwest Medical Conference", startDate: "2025-04-05", endDate: "2025-04-08", demandImpact: "medium", eventType: "Convention" },
    { name: "Texas Rangers Home Opener", startDate: "2025-04-01", endDate: "2025-04-01", demandImpact: "low", eventType: "Sports" },
  ],
  Houston: [
    { name: "Houston Livestock Show & Rodeo", startDate: "2025-02-25", endDate: "2025-03-16", demandImpact: "high", eventType: "Festival" },
    { name: "Offshore Technology Conference", startDate: "2025-05-05", endDate: "2025-05-08", demandImpact: "high", eventType: "Trade Show" },
    { name: "Houston Energy Summit", startDate: "2025-03-25", endDate: "2025-03-28", demandImpact: "medium", eventType: "Convention" },
    { name: "Texas Medical Center Symposium", startDate: "2025-03-10", endDate: "2025-03-12", demandImpact: "medium", eventType: "Convention" },
  ],
  Denver: [
    { name: "National Western Stock Show", startDate: "2025-01-11", endDate: "2025-01-26", demandImpact: "high", eventType: "Festival" },
    { name: "Great American Beer Festival", startDate: "2025-10-02", endDate: "2025-10-04", demandImpact: "high", eventType: "Festival" },
    { name: "Rocky Mountain Healthcare Conference", startDate: "2025-04-15", endDate: "2025-04-18", demandImpact: "medium", eventType: "Convention" },
    { name: "Denver Startup Week", startDate: "2025-09-15", endDate: "2025-09-19", demandImpact: "medium", eventType: "Convention" },
    { name: "Colorado Rockies Home Opener", startDate: "2025-04-04", endDate: "2025-04-04", demandImpact: "low", eventType: "Sports" },
  ],
};
