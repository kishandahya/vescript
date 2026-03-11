import { internalMutation } from "./_generated/server";
import { Id } from "./_generated/dataModel";

// ─── Helpers ────────────────────────────────────────────────────────────────

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/** Deterministic pseudo-random based on a seed string. */
function seededRandom(seed: string): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (Math.imul(31, h) + seed.charCodeAt(i)) | 0;
  }
  return ((h >>> 0) % 10000) / 10000;
}

function seededRange(seed: string, min: number, max: number): number {
  return round2(min + seededRandom(seed) * (max - min));
}

function seededInt(seed: string, min: number, max: number): number {
  return Math.floor(min + seededRandom(seed) * (max - min + 1));
}

async function getPropertyId(
  ctx: any,
  slug: string,
): Promise<Id<"properties">> {
  const prop = await ctx.db
    .query("properties")
    .filter((q: any) => q.eq(q.field("slug"), slug))
    .first();
  if (!prop) throw new Error(`Property not found: ${slug}`);
  return prop._id;
}

/** Return YYYY-MM-DD for a Date. */
function fmtDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/** Day-of-week short label. */
const DOW_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

function dayOfWeek(d: Date): string {
  return DOW_LABELS[d.getDay()];
}

/** Add days to a date. */
function addDays(d: Date, n: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

// ─── Property slug list ─────────────────────────────────────────────────────

const ALL_SLUGS = [
  "marriott-dallas",
  "hilton-houston",
  "courtyard-austin",
  "hampton-san-antonio",
  "fairfield-dallas",
  "ac-fort-worth",
  "hie-houston",
  "ihg-nashville",
  "residence-atlanta",
  "sheraton-new-orleans",
  "doubletree-charlotte",
  "hgi-orlando",
  "hyatt-denver",
  "embassy-phoenix",
  "westin-austin",
];

/** Showcase properties that get detailed operational data. */
const SHOWCASE_SLUGS = ["marriott-dallas", "hilton-houston", "hyatt-denver"];

// Property room counts for reference
const ROOM_COUNTS: Record<string, number> = {
  "marriott-dallas": 340,
  "hilton-houston": 280,
  "courtyard-austin": 154,
  "hampton-san-antonio": 169,
  "fairfield-dallas": 110,
  "ac-fort-worth": 252,
  "hie-houston": 124,
  "ihg-nashville": 304,
  "residence-atlanta": 132,
  "sheraton-new-orleans": 1100,
  "doubletree-charlotte": 187,
  "hgi-orlando": 198,
  "hyatt-denver": 450,
  "embassy-phoenix": 232,
  "westin-austin": 366,
};

const BASE_ADR: Record<string, number> = {
  "marriott-dallas": 215,
  "hilton-houston": 195,
  "courtyard-austin": 132,
  "hampton-san-antonio": 125,
  "fairfield-dallas": 112,
  "ac-fort-worth": 205,
  "hie-houston": 118,
  "ihg-nashville": 225,
  "residence-atlanta": 135,
  "sheraton-new-orleans": 165,
  "doubletree-charlotte": 175,
  "hgi-orlando": 140,
  "hyatt-denver": 230,
  "embassy-phoenix": 185,
  "westin-austin": 220,
};

const BASE_OCC: Record<string, number> = {
  "marriott-dallas": 0.78,
  "hilton-houston": 0.75,
  "courtyard-austin": 0.82,
  "hampton-san-antonio": 0.79,
  "fairfield-dallas": 0.76,
  "ac-fort-worth": 0.74,
  "hie-houston": 0.80,
  "ihg-nashville": 0.80,
  "residence-atlanta": 0.85,
  "sheraton-new-orleans": 0.70,
  "doubletree-charlotte": 0.73,
  "hgi-orlando": 0.86,
  "hyatt-denver": 0.77,
  "embassy-phoenix": 0.76,
  "westin-austin": 0.79,
};

const REGION_MAP: Record<string, string> = {
  "marriott-dallas": "texas-south-central",
  "hilton-houston": "texas-south-central",
  "courtyard-austin": "texas-south-central",
  "hampton-san-antonio": "texas-south-central",
  "fairfield-dallas": "texas-south-central",
  "ac-fort-worth": "texas-south-central",
  "hie-houston": "texas-south-central",
  "ihg-nashville": "southeast",
  "residence-atlanta": "southeast",
  "sheraton-new-orleans": "southeast",
  "doubletree-charlotte": "southeast",
  "hgi-orlando": "southeast",
  "hyatt-denver": "mountain-west",
  "embassy-phoenix": "mountain-west",
  "westin-austin": "mountain-west",
};

// ─── Groups ─────────────────────────────────────────────────────────────────

async function seedGroups(
  ctx: any,
  propIds: Record<string, Id<"properties">>,
) {
  const groups = [
    {
      propertyId: propIds["marriott-dallas"],
      name: "Acme Corp Annual Meeting",
      contact: "Sandra Whitfield",
      stage: "tentative",
      startDate: "2025-03-15",
      endDate: "2025-03-18",
      roomNights: 600,
      rate: 165,
      revenueEstimate: 99000,
      deadline: "2025-02-15",
      blockSize: 200,
      pickedUp: 0,
      notes: "Requires AV setup in Grand Ballroom. CEO keynote on Day 2.",
    },
    {
      propertyId: propIds["hyatt-denver"],
      name: "Tech Conference 2025",
      contact: "Derek Huang",
      stage: "lead",
      startDate: "2025-04-10",
      endDate: "2025-04-14",
      roomNights: 1200,
      rate: 175,
      revenueEstimate: 210000,
      blockSize: 300,
      pickedUp: 0,
      notes: "Breakout rooms needed for 12 concurrent sessions.",
    },
    {
      propertyId: propIds["hilton-houston"],
      name: "Johnson-Martinez Wedding",
      contact: "Patricia Johnson",
      stage: "definite",
      startDate: "2025-02-22",
      endDate: "2025-02-24",
      roomNights: 240,
      rate: 155,
      revenueEstimate: 37200,
      blockSize: 120,
      pickedUp: 80,
      cutoffDate: "2025-02-08",
      notes: "Rehearsal dinner Fri evening. Ballroom reception Sat.",
    },
    {
      propertyId: propIds["marriott-dallas"],
      name: "Southwest Regional Sales Kickoff",
      contact: "Mark Reynolds",
      stage: "definite",
      startDate: "2025-02-05",
      endDate: "2025-02-07",
      roomNights: 150,
      rate: 185,
      revenueEstimate: 27750,
      blockSize: 75,
      pickedUp: 68,
      notes: "Board room reserved for executive track.",
    },
    {
      propertyId: propIds["hyatt-denver"],
      name: "Denver Medical Association",
      contact: "Dr. Helen Pratt",
      stage: "prospect",
      startDate: "2025-05-20",
      endDate: "2025-05-23",
      roomNights: 450,
      rate: 195,
      revenueEstimate: 87750,
      blockSize: 150,
      pickedUp: 0,
      notes: "CME credits session space required.",
    },
    {
      propertyId: propIds["hilton-houston"],
      name: "Houston Energy Summit",
      contact: "Raj Patel",
      stage: "tentative",
      startDate: "2025-03-25",
      endDate: "2025-03-28",
      roomNights: 750,
      rate: 170,
      revenueEstimate: 127500,
      blockSize: 250,
      pickedUp: 0,
      notes: "Exhibition hall needed for 40+ vendor booths.",
    },
    {
      propertyId: propIds["fairfield-dallas"],
      name: "Dallas Auto Show Overflow",
      contact: "Kevin Brooks",
      stage: "actualized",
      startDate: "2025-01-10",
      endDate: "2025-01-14",
      roomNights: 180,
      rate: 125,
      revenueEstimate: 22500,
      blockSize: 45,
      pickedUp: 42,
      notes: "Shuttle service coordinated with main venue.",
    },
    {
      propertyId: propIds["sheraton-new-orleans"],
      name: "National Teachers Convention",
      contact: "Dr. Angela Morrison",
      stage: "lead",
      startDate: "2025-06-15",
      endDate: "2025-06-20",
      roomNights: 2500,
      rate: 145,
      revenueEstimate: 362500,
      blockSize: 500,
      pickedUp: 0,
      notes: "Full convention center usage. Plenary hall for 2,000+ attendees.",
    },
  ];

  for (const g of groups) {
    await ctx.db.insert("groups", g);
  }
}

// ─── Invoices ───────────────────────────────────────────────────────────────

interface InvoiceDef {
  vendor: string;
  category: string;
  amount: number;
  flags: string[];
  description: string;
}

async function seedInvoices(
  ctx: any,
  propIds: Record<string, Id<"properties">>,
) {
  const invoicesByProp: Record<string, InvoiceDef[]> = {
    "marriott-dallas": [
      { vendor: "Sysco Food Services", category: "F&B Supplies", amount: 8450, flags: [], description: "Monthly food & beverage supplies" },
      { vendor: "CleanTex Linen Services", category: "Linen", amount: 4200, flags: ["over-contract"], description: "Monthly linen service - 5% above contracted rate of $4,000" },
      { vendor: "Otis Elevator", category: "Maintenance", amount: 2800, flags: [], description: "Quarterly elevator maintenance" },
      { vendor: "Herman Miller", category: "Furniture", amount: 18500, flags: ["capital-approval"], description: "Lobby furniture replacement - requires capital approval" },
      { vendor: "Oncor Electric", category: "Utilities", amount: 12300, flags: ["unusual-amount"], description: "Monthly electric - 15% above 12-month average" },
      { vendor: "Cintas Uniforms", category: "Uniforms", amount: 3150, flags: [], description: "Quarterly uniform refresh - front desk and housekeeping" },
    ],
    "hilton-houston": [
      { vendor: "US Foods", category: "F&B Supplies", amount: 7200, flags: [], description: "Monthly food & beverage supplies" },
      { vendor: "Aramark Uniform Services", category: "Linen", amount: 3800, flags: [], description: "Monthly linen and uniform service" },
      { vendor: "Johnson Controls", category: "HVAC", amount: 5600, flags: ["unusual-amount"], description: "Emergency chiller repair - unbudgeted expense" },
      { vendor: "CenterPoint Energy", category: "Utilities", amount: 9800, flags: [], description: "Monthly gas and electric" },
      { vendor: "Ecolab", category: "Chemicals", amount: 2400, flags: [], description: "Pool and kitchen chemical supplies" },
    ],
    "hyatt-denver": [
      { vendor: "Shamrock Foods", category: "F&B Supplies", amount: 11200, flags: [], description: "Monthly food & beverage supplies" },
      { vendor: "Mission Linen Supply", category: "Linen", amount: 5500, flags: [], description: "Monthly linen service" },
      { vendor: "ThyssenKrupp Elevator", category: "Maintenance", amount: 3400, flags: [], description: "Quarterly elevator maintenance - 6 units" },
      { vendor: "Xcel Energy", category: "Utilities", amount: 15800, flags: ["unusual-amount"], description: "Monthly electric - winter heating spike" },
      { vendor: "ProGuard Fire Safety", category: "Safety", amount: 4200, flags: [], description: "Annual fire suppression inspection and certification" },
      { vendor: "Serta Simmons", category: "FF&E", amount: 32000, flags: ["capital-approval"], description: "Mattress replacement program - floors 8-12" },
    ],
  };

  for (const [slug, invoices] of Object.entries(invoicesByProp)) {
    const propertyId = propIds[slug];
    for (const inv of invoices) {
      await ctx.db.insert("invoices", {
        propertyId,
        vendor: inv.vendor,
        category: inv.category,
        amount: inv.amount,
        dueDate: "2025-02-15",
        status: "pending",
        flags: inv.flags,
        description: inv.description,
      });
    }
  }
}

// ─── Daily Rates ────────────────────────────────────────────────────────────

async function seedDailyRates(
  ctx: any,
  propIds: Record<string, Id<"properties">>,
) {
  const today = new Date("2025-01-16");
  const roomTypes: Record<string, { type: string; baseBar: number }[]> = {
    "marriott-dallas": [
      { type: "King", baseBar: 189 },
      { type: "Double Queen", baseBar: 179 },
      { type: "Suite", baseBar: 289 },
      { type: "ADA King", baseBar: 189 },
    ],
    "hilton-houston": [
      { type: "King", baseBar: 175 },
      { type: "Double Queen", baseBar: 165 },
      { type: "Suite", baseBar: 265 },
      { type: "ADA King", baseBar: 175 },
    ],
    "hyatt-denver": [
      { type: "King", baseBar: 209 },
      { type: "Double Queen", baseBar: 199 },
      { type: "Suite", baseBar: 319 },
      { type: "ADA King", baseBar: 209 },
    ],
  };

  for (const [slug, types] of Object.entries(roomTypes)) {
    const propertyId = propIds[slug];
    for (let d = 0; d < 14; d++) {
      const date = addDays(today, d);
      const dateStr = fmtDate(date);
      const dow = date.getDay(); // 0=Sun
      const isWeekend = dow === 5 || dow === 6; // Fri or Sat
      const isSoldOutDay = d === 7; // one "hot" day

      for (const rt of types) {
        // Weekends get $20-$30 premium; suites get more
        const weekendPremium = isWeekend
          ? rt.type === "Suite"
            ? 60
            : 30
          : 0;
        const bar = rt.baseBar + weekendPremium;

        let restrictions: string | undefined;
        if (isWeekend) restrictions = "2-night minimum";
        if (isSoldOutDay) restrictions = "closed to arrival";

        await ctx.db.insert("dailyRates", {
          propertyId,
          date: dateStr,
          roomType: rt.type,
          bar,
          ...(restrictions ? { restrictions } : {}),
        });
      }
    }
  }
}

// ─── Forecasts ──────────────────────────────────────────────────────────────

async function seedForecasts(
  ctx: any,
  propIds: Record<string, Id<"properties">>,
) {
  const startDate = new Date("2025-01-16");

  // Market events mapped by date string for each showcase property market
  const eventsByDate: Record<string, Record<string, string[]>> = {
    "marriott-dallas": {
      "2025-02-20": ["North Texas Business Expo"],
      "2025-02-21": ["North Texas Business Expo"],
      "2025-02-22": ["North Texas Business Expo"],
      "2025-03-15": ["Dallas Marathon", "Acme Corp Annual Meeting"],
      "2025-03-16": ["Dallas Marathon"],
      "2025-04-01": ["Texas Rangers Home Opener"],
      "2025-04-05": ["Southwest Medical Conference"],
      "2025-04-06": ["Southwest Medical Conference"],
      "2025-04-07": ["Southwest Medical Conference"],
      "2025-04-08": ["Southwest Medical Conference"],
    },
    "hilton-houston": {
      "2025-02-25": ["Houston Livestock Show"],
      "2025-02-26": ["Houston Livestock Show"],
      "2025-02-27": ["Houston Livestock Show"],
      "2025-02-28": ["Houston Livestock Show"],
      "2025-03-01": ["Houston Livestock Show"],
      "2025-03-25": ["Houston Energy Summit"],
      "2025-03-26": ["Houston Energy Summit"],
      "2025-03-27": ["Houston Energy Summit"],
      "2025-03-28": ["Houston Energy Summit"],
    },
    "hyatt-denver": {
      "2025-01-18": ["National Western Stock Show"],
      "2025-01-19": ["National Western Stock Show"],
      "2025-01-20": ["National Western Stock Show"],
      "2025-01-21": ["National Western Stock Show"],
      "2025-02-15": ["Denver Restaurant Week"],
      "2025-02-16": ["Denver Restaurant Week"],
      "2025-03-08": ["Denver St. Patrick's Day Parade"],
      "2025-04-10": ["Tech Conference 2025"],
      "2025-04-11": ["Tech Conference 2025"],
      "2025-04-12": ["Tech Conference 2025"],
      "2025-04-13": ["Tech Conference 2025"],
    },
  };

  for (const slug of SHOWCASE_SLUGS) {
    const propertyId = propIds[slug];
    const totalRooms = ROOM_COUNTS[slug];
    const baseOcc = BASE_OCC[slug];
    const events = eventsByDate[slug] || {};

    for (let d = 0; d < 90; d++) {
      const date = addDays(startDate, d);
      const dateStr = fmtDate(date);
      const dow = date.getDay();
      const dowLabel = dayOfWeek(date);

      // Weekday boost for urban properties
      const isWeekday = dow >= 1 && dow <= 4;
      const dowFactor = isWeekday ? 1.05 : 0.88;

      // Decay factor: OTB declines as dates get further out
      const decayFactor = Math.max(0.3, 1 - d * 0.007);

      // Event boost
      const dayEvents = events[dateStr] || [];
      const eventBoost = dayEvents.length > 0 ? 0.08 : 0;

      // Seasonal pattern: slight bump in spring
      const month = date.getMonth();
      const seasonFactor =
        month >= 2 && month <= 4 ? 1.04 : month >= 10 ? 0.92 : 1.0;

      // OTB rooms
      const otbRaw =
        totalRooms * baseOcc * dowFactor * decayFactor * seasonFactor +
        totalRooms * eventBoost;
      const otbRooms = Math.min(
        totalRooms,
        Math.max(0, Math.round(otbRaw + seededRange(slug + dateStr, -8, 8))),
      );

      // Forecast = OTB + expected pickup
      const pickupPct = Math.max(0, (1 - decayFactor) * 0.6);
      const forecast = Math.min(
        totalRooms,
        Math.round(otbRooms + totalRooms * pickupPct * baseOcc * 0.3),
      );

      // Budget: relatively flat with seasonal adjustment
      const budget = Math.round(
        totalRooms * baseOcc * seasonFactor * dowFactor +
          seededRange(slug + "budget" + dateStr, -5, 5),
      );

      // Prior year: slightly lower
      const priorYear = Math.round(
        totalRooms *
          (baseOcc - 0.03) *
          dowFactor *
          seasonFactor *
          seededRange(slug + "py" + dateStr, 0.92, 1.08),
      );

      await ctx.db.insert("forecasts", {
        propertyId,
        date: dateStr,
        dayOfWeek: dowLabel,
        otbRooms,
        forecast,
        budget: Math.min(totalRooms, Math.max(0, budget)),
        priorYear: Math.min(totalRooms, Math.max(0, priorYear)),
        ...(dayEvents.length > 0 ? { marketEvents: dayEvents } : {}),
      });
    }
  }
}

// ─── Market Events ──────────────────────────────────────────────────────────

async function seedMarketEvents(ctx: any) {
  const events = [
    // Dallas
    { market: "Dallas", name: "State Fair of Texas", startDate: "2025-09-26", endDate: "2025-10-19", demandImpact: "high", eventType: "Festival" },
    { market: "Dallas", name: "Cotton Bowl Classic", startDate: "2025-01-01", endDate: "2025-01-02", demandImpact: "high", eventType: "Sports" },
    { market: "Dallas", name: "Dallas Auto Show", startDate: "2025-01-10", endDate: "2025-01-14", demandImpact: "medium", eventType: "Trade Show" },
    { market: "Dallas", name: "North Texas Business Expo", startDate: "2025-02-20", endDate: "2025-02-22", demandImpact: "medium", eventType: "Convention" },
    { market: "Dallas", name: "Dallas Marathon", startDate: "2025-03-15", endDate: "2025-03-16", demandImpact: "low", eventType: "Sports" },
    { market: "Dallas", name: "Southwest Medical Conference", startDate: "2025-04-05", endDate: "2025-04-08", demandImpact: "medium", eventType: "Convention" },
    { market: "Dallas", name: "Dallas Comic Con", startDate: "2025-05-02", endDate: "2025-05-04", demandImpact: "medium", eventType: "Convention" },
    { market: "Dallas", name: "Texas Rangers Home Opener", startDate: "2025-04-01", endDate: "2025-04-01", demandImpact: "low", eventType: "Sports" },
    // Houston
    { market: "Houston", name: "Houston Livestock Show and Rodeo", startDate: "2025-02-25", endDate: "2025-03-16", demandImpact: "high", eventType: "Festival" },
    { market: "Houston", name: "Offshore Technology Conference", startDate: "2025-05-05", endDate: "2025-05-08", demandImpact: "high", eventType: "Trade Show" },
    { market: "Houston", name: "Houston Marathon", startDate: "2025-01-19", endDate: "2025-01-19", demandImpact: "medium", eventType: "Sports" },
    { market: "Houston", name: "Houston Auto Show", startDate: "2025-01-22", endDate: "2025-01-26", demandImpact: "medium", eventType: "Trade Show" },
    { market: "Houston", name: "Houston Art Car Parade", startDate: "2025-04-12", endDate: "2025-04-12", demandImpact: "low", eventType: "Festival" },
    { market: "Houston", name: "Texas Medical Center Symposium", startDate: "2025-03-10", endDate: "2025-03-12", demandImpact: "medium", eventType: "Convention" },
    { market: "Houston", name: "Houston Energy Summit", startDate: "2025-03-25", endDate: "2025-03-28", demandImpact: "medium", eventType: "Convention" },
    { market: "Houston", name: "Astros Home Opener", startDate: "2025-03-27", endDate: "2025-03-27", demandImpact: "low", eventType: "Sports" },
    // Denver
    { market: "Denver", name: "National Western Stock Show", startDate: "2025-01-11", endDate: "2025-01-26", demandImpact: "high", eventType: "Festival" },
    { market: "Denver", name: "Great American Beer Festival", startDate: "2025-10-02", endDate: "2025-10-04", demandImpact: "high", eventType: "Festival" },
    { market: "Denver", name: "Denver Restaurant Week", startDate: "2025-02-14", endDate: "2025-02-23", demandImpact: "low", eventType: "Festival" },
    { market: "Denver", name: "Denver St. Patrick's Day Parade", startDate: "2025-03-08", endDate: "2025-03-08", demandImpact: "low", eventType: "Festival" },
    { market: "Denver", name: "Rocky Mountain Healthcare Conference", startDate: "2025-04-15", endDate: "2025-04-18", demandImpact: "medium", eventType: "Convention" },
    { market: "Denver", name: "Denver Comic Con", startDate: "2025-06-27", endDate: "2025-06-29", demandImpact: "medium", eventType: "Convention" },
    { market: "Denver", name: "Colorado Rockies Home Opener", startDate: "2025-04-04", endDate: "2025-04-04", demandImpact: "low", eventType: "Sports" },
    { market: "Denver", name: "Denver Startup Week", startDate: "2025-09-15", endDate: "2025-09-19", demandImpact: "medium", eventType: "Convention" },
  ];

  for (const evt of events) {
    await ctx.db.insert("marketEvents", evt);
  }
}

// ─── Night Audits ───────────────────────────────────────────────────────────

async function seedNightAudits(
  ctx: any,
  propIds: Record<string, Id<"properties">>,
) {
  const lastNight = "2025-01-15";
  const audits = [
    {
      slug: "marriott-dallas",
      roomRevenue: 48750,
      fbRevenue: 12400,
      otherRevenue: 3850,
      totalRevenue: 65000,
      comps: 1250,
      adjustments: 340,
      refunds: 189,
      occupiedRooms: 278,
      availableRooms: 340,
    },
    {
      slug: "hilton-houston",
      roomRevenue: 37200,
      fbRevenue: 9100,
      otherRevenue: 3700,
      totalRevenue: 50000,
      comps: 890,
      adjustments: 215,
      refunds: 0,
      occupiedRooms: 218,
      availableRooms: 280,
    },
    {
      slug: "hyatt-denver",
      roomRevenue: 62500,
      fbRevenue: 16200,
      otherRevenue: 6300,
      totalRevenue: 85000,
      comps: 1800,
      adjustments: 560,
      refunds: 425,
      occupiedRooms: 368,
      availableRooms: 450,
    },
  ];

  for (const a of audits) {
    await ctx.db.insert("nightAudits", {
      propertyId: propIds[a.slug],
      date: lastNight,
      roomRevenue: a.roomRevenue,
      fbRevenue: a.fbRevenue,
      otherRevenue: a.otherRevenue,
      totalRevenue: a.totalRevenue,
      comps: a.comps,
      adjustments: a.adjustments,
      refunds: a.refunds,
      occupiedRooms: a.occupiedRooms,
      availableRooms: a.availableRooms,
    });
  }
}

// ─── Guest Feedback ─────────────────────────────────────────────────────────

async function seedGuestFeedback(
  ctx: any,
  propIds: Record<string, Id<"properties">>,
) {
  const feedbackByProp: Record<
    string,
    {
      source: string;
      rating: number;
      text: string;
      responseStatus: string;
      date: string;
      guestName?: string;
    }[]
  > = {
    "marriott-dallas": [
      { source: "TripAdvisor", rating: 5, text: "Absolutely stunning hotel! The staff went above and beyond for our anniversary celebration. The room was spotless and the view of downtown Dallas was breathtaking. Will definitely return!", responseStatus: "responded", date: "2025-01-14", guestName: "JohnT_2025" },
      { source: "Google", rating: 4, text: "Great location and comfortable rooms. Only minor complaint is the valet parking was a bit slow during the evening rush. Otherwise a fantastic stay.", responseStatus: "responded", date: "2025-01-13", guestName: "Sarah M." },
      { source: "Marriott Bonvoy Survey", rating: 3, text: "Room was nice but the noise from the construction next door was unbearable. Couldn't sleep past 7am either day. Front desk offered earplugs but that's not really a solution.", responseStatus: "pending", date: "2025-01-12", guestName: "R. Patel" },
      { source: "TripAdvisor", rating: 2, text: "Billing nightmare. Was charged for minibar items I never touched and it took 3 calls to resolve. The front desk manager was dismissive. Very disappointing for a Marriott property.", responseStatus: "escalated", date: "2025-01-10", guestName: "TravelPro_Mike" },
      { source: "Google", rating: 4, text: "Clean rooms, friendly staff, excellent restaurant on-site. The breakfast buffet is worth it. Solid business hotel.", responseStatus: "responded", date: "2025-01-09" },
      { source: "Marriott Bonvoy Survey", rating: 5, text: "Everything was perfect. The Bonvoy Platinum recognition was on point - room upgrade, late checkout, lounge access all seamless. This is how loyalty should work.", responseStatus: "responded", date: "2025-01-08", guestName: "Elite_Traveler" },
    ],
    "hilton-houston": [
      { source: "TripAdvisor", rating: 5, text: "Perfect Galleria location! Walked to shopping and restaurants every day. The pool area is gorgeous and rooms are modern and well-appointed.", responseStatus: "responded", date: "2025-01-14", guestName: "HoustonLocal" },
      { source: "Hilton Honors Survey", rating: 4, text: "Solid business hotel. Good Wi-Fi, comfortable workspace in the room. The lobby bar makes a great old fashioned. Minor issue with the elevator wait times during peak hours.", responseStatus: "pending", date: "2025-01-13", guestName: "BizTravel_Amy" },
      { source: "Google", rating: 3, text: "Average experience. The room was clean but dated. Bathroom could use a refresh. Location saves it though - can't beat being next to the Galleria.", responseStatus: "pending", date: "2025-01-11", guestName: "David K." },
      { source: "TripAdvisor", rating: 2, text: "Checked in to find the AC not working in our room. Maintenance took 2 hours to come. In Houston. In a room that felt like a sauna. Got moved eventually but ruined our first night.", responseStatus: "escalated", date: "2025-01-09", guestName: "FrustratedGuest22" },
      { source: "Hilton Honors Survey", rating: 4, text: "Great property for families. Kids loved the pool. The restaurant is pricey but good. Staff was very accommodating with our late arrival.", responseStatus: "responded", date: "2025-01-07", guestName: "FamilyOfFour" },
    ],
    "hyatt-denver": [
      { source: "TripAdvisor", rating: 5, text: "World class hotel! The mountain views from the upper floors are spectacular. Service is impeccable - every staff member greeted us by name after the first day. The spa is a must.", responseStatus: "responded", date: "2025-01-15", guestName: "LuxuryLover" },
      { source: "Google", rating: 5, text: "Best hotel in downtown Denver. Period. The restaurant is phenomenal, rooms are spacious, and the location on the 16th Street Mall is unbeatable. Already booked my next trip.", responseStatus: "responded", date: "2025-01-14", guestName: "DenverDave" },
      { source: "World of Hyatt Survey", rating: 4, text: "Excellent property overall. The Globalist benefits were great. Only suggestion would be to improve the gym equipment - a few machines were out of order during my stay.", responseStatus: "pending", date: "2025-01-12", guestName: "FitnessTraveler" },
      { source: "TripAdvisor", rating: 3, text: "Good hotel but overpriced for what you get. $18 for a coffee and muffin at the cafe is robbery. Room was comfortable though and the bed was amazing.", responseStatus: "pending", date: "2025-01-11", guestName: "BudgetMinded" },
      { source: "Google", rating: 2, text: "Major issue with our reservation. Booked a suite for our anniversary and was told at check-in it wasn't available. Offered a standard room at the suite price. Manager eventually fixed it but the stress ruined the evening.", responseStatus: "escalated", date: "2025-01-08", guestName: "Anniversary_Ruined" },
      { source: "World of Hyatt Survey", rating: 4, text: "Wonderful conference hotel. The meeting rooms are well-equipped and the catering team is excellent. Just wish the Wi-Fi was faster in the ballroom area.", responseStatus: "responded", date: "2025-01-06", guestName: "EventPlanner_Pro" },
      { source: "Google", rating: 5, text: "Stayed here during the Stock Show and it was perfect. Close to everything, the concierge gave great restaurant recommendations, and the room was super quiet despite being downtown.", responseStatus: "responded", date: "2025-01-20", guestName: "StockShowFan" },
      { source: "TripAdvisor", rating: 4, text: "Very nice hotel. Rooms are large and well maintained. The valet team is efficient and friendly. Would have given 5 stars but the check-in line was quite long.", responseStatus: "pending", date: "2025-01-05", guestName: "WeekendGetaway" },
    ],
  };

  for (const [slug, feedbackList] of Object.entries(feedbackByProp)) {
    const propertyId = propIds[slug];
    for (const fb of feedbackList) {
      await ctx.db.insert("guestFeedback", {
        propertyId,
        source: fb.source,
        rating: fb.rating,
        text: fb.text,
        responseStatus: fb.responseStatus,
        date: fb.date,
        ...(fb.guestName ? { guestName: fb.guestName } : {}),
      });
    }
  }
}

// ─── Vendor Contracts ───────────────────────────────────────────────────────

async function seedVendorContracts(
  ctx: any,
  propIds: Record<string, Id<"properties">>,
) {
  const contractsByProp: Record<
    string,
    { vendorName: string; category: string; contractedRate: number; paymentTerms: string }[]
  > = {
    "marriott-dallas": [
      { vendorName: "Sysco Food Services", category: "F&B Supplies", contractedRate: 8450, paymentTerms: "Net 30" },
      { vendorName: "CleanTex Linen Services", category: "Linen", contractedRate: 4000, paymentTerms: "Net 15" },
      { vendorName: "Otis Elevator", category: "Maintenance", contractedRate: 2800, paymentTerms: "Net 45" },
      { vendorName: "Herman Miller", category: "Furniture", contractedRate: 18500, paymentTerms: "50% deposit, balance Net 30" },
      { vendorName: "Oncor Electric", category: "Utilities", contractedRate: 10700, paymentTerms: "Net 21" },
      { vendorName: "Cintas Uniforms", category: "Uniforms", contractedRate: 3150, paymentTerms: "Net 30" },
    ],
    "hilton-houston": [
      { vendorName: "US Foods", category: "F&B Supplies", contractedRate: 7200, paymentTerms: "Net 30" },
      { vendorName: "Aramark Uniform Services", category: "Linen", contractedRate: 3800, paymentTerms: "Net 15" },
      { vendorName: "Johnson Controls", category: "HVAC", contractedRate: 3200, paymentTerms: "Net 30" },
      { vendorName: "CenterPoint Energy", category: "Utilities", contractedRate: 9800, paymentTerms: "Net 21" },
      { vendorName: "Ecolab", category: "Chemicals", contractedRate: 2400, paymentTerms: "Net 30" },
    ],
    "hyatt-denver": [
      { vendorName: "Shamrock Foods", category: "F&B Supplies", contractedRate: 11200, paymentTerms: "Net 30" },
      { vendorName: "Mission Linen Supply", category: "Linen", contractedRate: 5500, paymentTerms: "Net 15" },
      { vendorName: "ThyssenKrupp Elevator", category: "Maintenance", contractedRate: 3400, paymentTerms: "Net 45" },
      { vendorName: "Xcel Energy", category: "Utilities", contractedRate: 12500, paymentTerms: "Net 21" },
      { vendorName: "ProGuard Fire Safety", category: "Safety", contractedRate: 4200, paymentTerms: "Net 30" },
      { vendorName: "Serta Simmons", category: "FF&E", contractedRate: 32000, paymentTerms: "50% deposit, balance Net 60" },
    ],
  };

  for (const [slug, contracts] of Object.entries(contractsByProp)) {
    const propertyId = propIds[slug];
    for (const c of contracts) {
      await ctx.db.insert("vendorContracts", {
        propertyId,
        vendorName: c.vendorName,
        category: c.category,
        contractedRate: c.contractedRate,
        paymentTerms: c.paymentTerms,
      });
    }
  }
}

// ─── Portfolio KPIs ─────────────────────────────────────────────────────────

async function seedPortfolioKpis(
  ctx: any,
  propIds: Record<string, Id<"properties">>,
) {
  const months = ["2024-11", "2024-12", "2025-01"];

  // Seasonal multipliers for occupancy per month
  const seasonalOcc: Record<string, number> = {
    "2024-11": 0.95,
    "2024-12": 0.85, // Holiday dip
    "2025-01": 0.92,
  };

  for (const slug of ALL_SLUGS) {
    const propertyId = propIds[slug];
    const rooms = ROOM_COUNTS[slug];
    const adr = BASE_ADR[slug];
    const occ = BASE_OCC[slug];
    const regionId = REGION_MAP[slug];

    for (const month of months) {
      const sFactor = seasonalOcc[month];
      const jitter = seededRange(slug + month, -0.03, 0.03);
      const mOcc = round2(Math.min(0.98, Math.max(0.5, occ * sFactor + jitter)));
      const mAdr = round2(adr * seededRange(slug + month + "adr", 0.95, 1.05));
      const mRevpar = round2(mAdr * mOcc);
      // ~30 days revenue
      const mRevenue = round2(mRevpar * rooms * 30);
      const laborPct = round2(seededRange(slug + month + "labor", 28, 38));
      const gopMargin = round2(seededRange(slug + month + "gop", 32, 48));
      const utilityCost = round2(
        rooms * seededRange(slug + month + "util", 8, 18) * 30,
      );

      await ctx.db.insert("portfolioKpis", {
        regionId,
        propertyId,
        month,
        occupancy: mOcc,
        adr: mAdr,
        revpar: mRevpar,
        revenue: mRevenue,
        laborPct,
        gopMargin,
        utilityCost,
      });
    }
  }
}

// ─── Expense Comparisons ────────────────────────────────────────────────────

async function seedExpenseComparisons(
  ctx: any,
  propIds: Record<string, Id<"properties">>,
) {
  const categories = [
    "Utilities",
    "Labor",
    "Maintenance",
    "Supplies",
    "Technology",
  ];

  // Base expense multipliers per category (per-room monthly cost)
  const baseCostPerRoom: Record<string, number> = {
    Utilities: 45,
    Labor: 280,
    Maintenance: 35,
    Supplies: 22,
    Technology: 18,
  };

  for (const slug of ALL_SLUGS) {
    const propertyId = propIds[slug];
    const rooms = ROOM_COUNTS[slug];

    for (const cat of categories) {
      const base = baseCostPerRoom[cat] * rooms;
      const currentAmount = round2(
        base * seededRange(slug + cat + "cur", 0.9, 1.15),
      );
      const priorYearAmount = round2(
        base * seededRange(slug + cat + "py", 0.85, 1.05),
      );
      const budgetAmount = round2(
        base * seededRange(slug + cat + "bud", 0.92, 1.08),
      );

      await ctx.db.insert("expenseComparisons", {
        propertyId,
        category: cat,
        currentAmount,
        priorYearAmount,
        budgetAmount,
      });
    }
  }
}

// ─── Demand Calendar ────────────────────────────────────────────────────────

async function seedDemandCalendar(
  ctx: any,
  propIds: Record<string, Id<"properties">>,
) {
  const startDate = new Date("2025-01-16");

  // Market events for demand calendar by slug and date
  const calendarEvents: Record<string, Record<string, string[]>> = {
    "marriott-dallas": {
      "2025-02-05": ["Southwest Regional Sales Kickoff"],
      "2025-02-06": ["Southwest Regional Sales Kickoff"],
      "2025-02-20": ["North Texas Business Expo"],
      "2025-02-21": ["North Texas Business Expo"],
      "2025-02-22": ["North Texas Business Expo"],
      "2025-03-15": ["Dallas Marathon", "Acme Corp Annual Meeting"],
      "2025-03-16": ["Dallas Marathon", "Acme Corp Annual Meeting"],
      "2025-03-17": ["Acme Corp Annual Meeting"],
      "2025-04-01": ["Texas Rangers Home Opener"],
      "2025-04-05": ["Southwest Medical Conference"],
      "2025-04-06": ["Southwest Medical Conference"],
      "2025-04-07": ["Southwest Medical Conference"],
      "2025-04-08": ["Southwest Medical Conference"],
    },
    "hilton-houston": {
      "2025-02-22": ["Johnson-Martinez Wedding"],
      "2025-02-23": ["Johnson-Martinez Wedding"],
      "2025-02-25": ["Houston Livestock Show"],
      "2025-02-26": ["Houston Livestock Show"],
      "2025-02-27": ["Houston Livestock Show"],
      "2025-02-28": ["Houston Livestock Show"],
      "2025-03-01": ["Houston Livestock Show"],
      "2025-03-25": ["Houston Energy Summit"],
      "2025-03-26": ["Houston Energy Summit"],
      "2025-03-27": ["Houston Energy Summit", "Astros Home Opener"],
      "2025-03-28": ["Houston Energy Summit"],
    },
    "hyatt-denver": {
      "2025-01-18": ["National Western Stock Show"],
      "2025-01-19": ["National Western Stock Show"],
      "2025-01-20": ["National Western Stock Show"],
      "2025-01-21": ["National Western Stock Show"],
      "2025-01-22": ["National Western Stock Show"],
      "2025-01-23": ["National Western Stock Show"],
      "2025-01-24": ["National Western Stock Show"],
      "2025-01-25": ["National Western Stock Show"],
      "2025-01-26": ["National Western Stock Show"],
      "2025-04-04": ["Colorado Rockies Home Opener"],
      "2025-04-10": ["Tech Conference 2025"],
      "2025-04-11": ["Tech Conference 2025"],
      "2025-04-12": ["Tech Conference 2025"],
      "2025-04-13": ["Tech Conference 2025"],
    },
  };

  for (const slug of SHOWCASE_SLUGS) {
    const propertyId = propIds[slug];
    const baseOcc = BASE_OCC[slug];
    const events = calendarEvents[slug] || {};

    for (let d = 0; d < 90; d++) {
      const date = addDays(startDate, d);
      const dateStr = fmtDate(date);
      const dow = date.getDay();

      // Weekday/weekend pattern
      const isWeekday = dow >= 1 && dow <= 4;
      const dowFactor = isWeekday ? 1.05 : 0.88;

      // Event boost
      const dayEvents = events[dateStr] || [];
      const eventBoost = dayEvents.length > 0 ? 0.1 * dayEvents.length : 0;

      // Seasonal
      const month = date.getMonth();
      const seasonFactor =
        month >= 2 && month <= 4 ? 1.04 : month >= 10 ? 0.92 : 1.0;

      const rawOcc =
        baseOcc * dowFactor * seasonFactor * 100 +
        eventBoost * 100 +
        seededRange(slug + "dc" + dateStr, -5, 5);
      const expectedOccupancy = Math.min(
        100,
        Math.max(0, Math.round(rawOcc)),
      );

      await ctx.db.insert("demandCalendar", {
        propertyId,
        date: dateStr,
        expectedOccupancy,
        ...(dayEvents.length > 0 ? { events: dayEvents } : {}),
      });
    }
  }
}

// ─── Main seed mutation ─────────────────────────────────────────────────────

export const seedFinancial = internalMutation({
  args: {},
  handler: async (ctx) => {
    // Guard: skip if already seeded
    const existingGroup = await ctx.db.query("groups").first();
    if (existingGroup) {
      console.log("Already seeded — skipping financial seed.");
      return;
    }

    // Build property slug -> id map
    const allProps = await ctx.db.query("properties").collect();
    if (allProps.length === 0) {
      throw new Error(
        "No properties found. Run the core seed first (seed.ts).",
      );
    }
    const propIds: Record<string, Id<"properties">> = {};
    for (const p of allProps) {
      propIds[p.slug] = p._id;
    }

    console.log("Seeding groups...");
    await seedGroups(ctx, propIds);

    console.log("Seeding invoices...");
    await seedInvoices(ctx, propIds);

    console.log("Seeding daily rates...");
    await seedDailyRates(ctx, propIds);

    console.log("Seeding forecasts (90 days × 3 properties)...");
    await seedForecasts(ctx, propIds);

    console.log("Seeding market events...");
    await seedMarketEvents(ctx);

    console.log("Seeding night audits...");
    await seedNightAudits(ctx, propIds);

    console.log("Seeding guest feedback...");
    await seedGuestFeedback(ctx, propIds);

    console.log("Seeding vendor contracts...");
    await seedVendorContracts(ctx, propIds);

    console.log("Seeding portfolio KPIs (3 months × 15 properties)...");
    await seedPortfolioKpis(ctx, propIds);

    console.log("Seeding expense comparisons (15 properties × 5 categories)...");
    await seedExpenseComparisons(ctx, propIds);

    console.log("Seeding demand calendar (90 days × 3 properties)...");
    await seedDemandCalendar(ctx, propIds);

    console.log(
      "Financial seed complete: groups, invoices, daily rates, forecasts, market events, night audits, guest feedback, vendor contracts, portfolio KPIs, expense comparisons, demand calendar.",
    );
  },
});
