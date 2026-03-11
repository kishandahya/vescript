import { internalMutation } from "./_generated/server";
import { Id } from "./_generated/dataModel";

// ─── helpers ────────────────────────────────────────────────────────────────

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/** Deterministic pseudo-random based on a seed string (simple hash). */
function seededRandom(seed: string): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (Math.imul(31, h) + seed.charCodeAt(i)) | 0;
  }
  // map to 0-1
  return ((h >>> 0) % 10000) / 10000;
}

/** Return a deterministic value within [min, max] based on seed. */
function seededRange(seed: string, min: number, max: number): number {
  return round2(min + seededRandom(seed) * (max - min));
}

// ─── Portfolio ──────────────────────────────────────────────────────────────

async function seedPortfolio(ctx: any) {
  await ctx.db.insert("portfolio", {
    name: "Remington Hospitality",
    totalProperties: 15,
    totalRooms: 3898,
    disclaimer:
      "Sample data for demonstration purposes only. Not affiliated with Remington Hospitality.",
  });
}

// ─── Regions ────────────────────────────────────────────────────────────────

async function seedRegions(
  ctx: any,
): Promise<Record<string, Id<"regions">>> {
  const regions: Record<string, Id<"regions">> = {};
  const data = [
    { name: "Texas / South Central", slug: "texas-south-central" },
    { name: "Southeast", slug: "southeast" },
    { name: "Mountain / West", slug: "mountain-west" },
  ];
  for (const r of data) {
    regions[r.slug] = await ctx.db.insert("regions", r);
  }
  return regions;
}

// ─── Property definitions ───────────────────────────────────────────────────

interface PropertyDef {
  name: string;
  slug: string;
  brand: string;
  market: string;
  totalRooms: number;
  propertyType: string;
  regionSlug: string;
  address: string;
  /** Base ADR for daily summary generation */
  baseAdr: number;
  /** Base occupancy (0-1) */
  baseOcc: number;
  /** Budget variance multiplier: >1 = outperform, <1 = underperform */
  budgetFactor: number;
}

const PROPERTY_DEFS: PropertyDef[] = [
  // ── Texas / South Central ──
  {
    name: "Marriott Dallas Downtown",
    slug: "marriott-dallas",
    brand: "Marriott",
    market: "Dallas",
    totalRooms: 340,
    propertyType: "Full-Service",
    regionSlug: "texas-south-central",
    address: "650 N Pearl St, Dallas, TX 75201",
    baseAdr: 215,
    baseOcc: 0.78,
    budgetFactor: 1.06, // outperform +6%
  },
  {
    name: "Hilton Houston Galleria",
    slug: "hilton-houston",
    brand: "Hilton",
    market: "Houston",
    totalRooms: 280,
    propertyType: "Full-Service",
    regionSlug: "texas-south-central",
    address: "2400 Westheimer Rd, Houston, TX 77098",
    baseAdr: 195,
    baseOcc: 0.75,
    budgetFactor: 1.0,
  },
  {
    name: "Courtyard Austin Airport",
    slug: "courtyard-austin",
    brand: "Marriott (Select)",
    market: "Austin",
    totalRooms: 154,
    propertyType: "Select-Service",
    regionSlug: "texas-south-central",
    address: "7809 E Ben White Blvd, Austin, TX 78741",
    baseAdr: 132,
    baseOcc: 0.82,
    budgetFactor: 1.0,
  },
  {
    name: "Hampton Inn San Antonio Riverwalk",
    slug: "hampton-san-antonio",
    brand: "Hilton (Select)",
    market: "San Antonio",
    totalRooms: 169,
    propertyType: "Select-Service",
    regionSlug: "texas-south-central",
    address: "414 Bowie St, San Antonio, TX 78205",
    baseAdr: 125,
    baseOcc: 0.79,
    budgetFactor: 0.94, // underperform -6%
  },
  {
    name: "Fairfield Inn Dallas Plano",
    slug: "fairfield-dallas",
    brand: "Marriott (Economy)",
    market: "Dallas",
    totalRooms: 110,
    propertyType: "Select-Service",
    regionSlug: "texas-south-central",
    address: "4020 W Plano Pkwy, Plano, TX 75093",
    baseAdr: 112,
    baseOcc: 0.76,
    budgetFactor: 0.93, // underperform -7%
  },
  {
    name: "AC Hotel Fort Worth",
    slug: "ac-fort-worth",
    brand: "Marriott (Lifestyle)",
    market: "Fort Worth",
    totalRooms: 252,
    propertyType: "Lifestyle",
    regionSlug: "texas-south-central",
    address: "200 Main St, Fort Worth, TX 76102",
    baseAdr: 205,
    baseOcc: 0.74,
    budgetFactor: 1.0,
  },
  {
    name: "Holiday Inn Express Houston Energy Corridor",
    slug: "hie-houston",
    brand: "IHG (Select)",
    market: "Houston",
    totalRooms: 124,
    propertyType: "Select-Service",
    regionSlug: "texas-south-central",
    address: "1430 Hwy 6 N, Houston, TX 77084",
    baseAdr: 118,
    baseOcc: 0.80,
    budgetFactor: 1.0,
  },
  // ── Southeast ──
  {
    name: "IHG Hotel & Suites Nashville",
    slug: "ihg-nashville",
    brand: "IHG",
    market: "Nashville",
    totalRooms: 304,
    propertyType: "Full-Service",
    regionSlug: "southeast",
    address: "240 Rep John Lewis Way S, Nashville, TN 37203",
    baseAdr: 225,
    baseOcc: 0.80,
    budgetFactor: 1.0,
  },
  {
    name: "Residence Inn Atlanta Midtown",
    slug: "residence-atlanta",
    brand: "Marriott (Extended)",
    market: "Atlanta",
    totalRooms: 132,
    propertyType: "Extended-Stay",
    regionSlug: "southeast",
    address: "1365 Peachtree St NE, Atlanta, GA 30309",
    baseAdr: 135,
    baseOcc: 0.85,
    budgetFactor: 1.0,
  },
  {
    name: "Sheraton New Orleans",
    slug: "sheraton-new-orleans",
    brand: "Marriott",
    market: "New Orleans",
    totalRooms: 1100,
    propertyType: "Convention",
    regionSlug: "southeast",
    address: "500 Canal St, New Orleans, LA 70130",
    baseAdr: 165,
    baseOcc: 0.70,
    budgetFactor: 1.0,
  },
  {
    name: "DoubleTree Charlotte Airport",
    slug: "doubletree-charlotte",
    brand: "Hilton",
    market: "Charlotte",
    totalRooms: 187,
    propertyType: "Full-Service",
    regionSlug: "southeast",
    address: "2600 Yorkmont Rd, Charlotte, NC 28208",
    baseAdr: 175,
    baseOcc: 0.73,
    budgetFactor: 1.0,
  },
  {
    name: "Hilton Garden Inn Orlando",
    slug: "hgi-orlando",
    brand: "Hilton",
    market: "Orlando",
    totalRooms: 198,
    propertyType: "Select-Service",
    regionSlug: "southeast",
    address: "8984 International Dr, Orlando, FL 32819",
    baseAdr: 140,
    baseOcc: 0.86,
    budgetFactor: 1.0,
  },
  // ── Mountain / West ──
  {
    name: "Hyatt Regency Denver",
    slug: "hyatt-denver",
    brand: "Hyatt",
    market: "Denver",
    totalRooms: 450,
    propertyType: "Full-Service",
    regionSlug: "mountain-west",
    address: "650 15th St, Denver, CO 80202",
    baseAdr: 230,
    baseOcc: 0.77,
    budgetFactor: 1.07, // outperform +7%
  },
  {
    name: "Embassy Suites Phoenix Biltmore",
    slug: "embassy-phoenix",
    brand: "Hilton",
    market: "Phoenix",
    totalRooms: 232,
    propertyType: "All-Suite",
    regionSlug: "mountain-west",
    address: "2630 E Camelback Rd, Phoenix, AZ 85016",
    baseAdr: 185,
    baseOcc: 0.76,
    budgetFactor: 1.0,
  },
  {
    name: "The Westin Austin Downtown",
    slug: "westin-austin",
    brand: "Marriott (Premium)",
    market: "Austin",
    totalRooms: 366,
    propertyType: "Full-Service",
    regionSlug: "mountain-west",
    address: "310 E 5th St, Austin, TX 78701",
    baseAdr: 220,
    baseOcc: 0.79,
    budgetFactor: 1.0,
  },
];

// ─── Properties ─────────────────────────────────────────────────────────────

async function seedProperties(
  ctx: any,
  _regions: Record<string, Id<"regions">>,
): Promise<Record<string, Id<"properties">>> {
  const props: Record<string, Id<"properties">> = {};
  for (const p of PROPERTY_DEFS) {
    props[p.slug] = await ctx.db.insert("properties", {
      name: p.name,
      slug: p.slug,
      brand: p.brand,
      market: p.market,
      totalRooms: p.totalRooms,
      propertyType: p.propertyType,
      regionId: p.regionSlug,
      address: p.address,
      compSetIds: [],
    });
  }
  return props;
}

// ─── Daily Summaries ────────────────────────────────────────────────────────

async function seedDailySummaries(
  ctx: any,
  props: Record<string, Id<"properties">>,
) {
  // Generate today's date as the reference "current" date
  const today = new Date();
  const dateStr = today.toISOString().slice(0, 10); // YYYY-MM-DD
  const dayOfMonth = today.getDate();
  const monthIndex = today.getMonth(); // 0-based

  // Approximate days elapsed in the year so far (including current month)
  const startOfYear = new Date(today.getFullYear(), 0, 1);
  const daysInYear = Math.floor(
    (today.getTime() - startOfYear.getTime()) / 86400000,
  );

  for (const def of PROPERTY_DEFS) {
    const propId = props[def.slug];

    // Slight deterministic variance per property
    const adrJitter = seededRange(def.slug + "-adr", -0.03, 0.03);
    const occJitter = seededRange(def.slug + "-occ", -0.02, 0.02);

    const actualOcc = round2(
      Math.min(0.98, Math.max(0.55, def.baseOcc + occJitter)),
    );
    const actualAdr = round2(def.baseAdr * (1 + adrJitter));
    const actualRevpar = round2(actualAdr * actualOcc);
    const actualRevenue = round2(actualRevpar * def.totalRooms);

    // Budget: inverse of budgetFactor applied to actuals
    // If property outperforms (budgetFactor > 1), budget should be lower than actual
    // budgetFactor represents actual / budget ratio
    const budgetOcc = round2(actualOcc / def.budgetFactor);
    const budgetAdr = round2(actualAdr / def.budgetFactor);
    const budgetRevpar = round2(budgetAdr * budgetOcc);
    const budgetRevenue = round2(budgetRevpar * def.totalRooms);

    // MTD = dailyRevenue * dayOfMonth (simplified)
    const mtdRevenue = round2(actualRevenue * dayOfMonth);
    const mtdBudget = round2(budgetRevenue * dayOfMonth);

    // YTD = dailyRevenue * daysInYear (simplified)
    // Apply slight variance so it isn't exactly proportional
    const ytdVariance = seededRange(def.slug + "-ytd", 0.95, 1.05);
    const ytdRevenue = round2(actualRevenue * daysInYear * ytdVariance);
    const ytdBudget = round2(budgetRevenue * daysInYear * ytdVariance);

    await ctx.db.insert("dailySummaries", {
      propertyId: propId,
      date: dateStr,
      occupancy: actualOcc,
      adr: actualAdr,
      revpar: actualRevpar,
      revenue: actualRevenue,
      budgetOccupancy: budgetOcc,
      budgetAdr: budgetAdr,
      budgetRevpar: budgetRevpar,
      budgetRevenue: budgetRevenue,
      mtdRevenue,
      mtdBudget,
      ytdRevenue,
      ytdBudget,
    });
  }
}

// ─── Comp Sets ──────────────────────────────────────────────────────────────

interface CompetitorDef {
  competitorName: string;
  adr: number;
  occupancy: number;
}

/** Generate comp set entries for 3 showcase properties. */
async function seedCompSets(
  ctx: any,
  props: Record<string, Id<"properties">>,
) {
  const compSetData: Record<string, CompetitorDef[]> = {
    // Marriott Dallas Downtown
    "marriott-dallas": [
      { competitorName: "Hyatt Regency Dallas", adr: 208, occupancy: 0.76 },
      { competitorName: "Sheraton Dallas Hotel", adr: 189, occupancy: 0.72 },
      {
        competitorName: "The Adolphus, Autograph Collection",
        adr: 245,
        occupancy: 0.71,
      },
      { competitorName: "Omni Dallas Hotel", adr: 232, occupancy: 0.74 },
      { competitorName: "Hilton Dallas Lincoln Centre", adr: 178, occupancy: 0.69 },
    ],
    // Hyatt Regency Denver
    "hyatt-denver": [
      { competitorName: "Marriott Denver City Center", adr: 222, occupancy: 0.74 },
      { competitorName: "Sheraton Denver Downtown", adr: 198, occupancy: 0.71 },
      { competitorName: "The Westin Denver Downtown", adr: 238, occupancy: 0.75 },
      { competitorName: "Grand Hyatt Denver", adr: 242, occupancy: 0.73 },
    ],
    // Hampton Inn San Antonio Riverwalk
    "hampton-san-antonio": [
      {
        competitorName: "Drury Inn & Suites San Antonio Riverwalk",
        adr: 139,
        occupancy: 0.83,
      },
      {
        competitorName: "Holiday Inn San Antonio Riverwalk",
        adr: 128,
        occupancy: 0.80,
      },
      {
        competitorName: "Fairfield Inn San Antonio Downtown",
        adr: 119,
        occupancy: 0.78,
      },
      {
        competitorName: "La Quinta Inn San Antonio Riverwalk",
        adr: 105,
        occupancy: 0.81,
      },
      {
        competitorName: "Best Western Plus Palo Alto",
        adr: 98,
        occupancy: 0.75,
      },
    ],
  };

  for (const [slug, competitors] of Object.entries(compSetData)) {
    const propertyId = props[slug];
    const def = PROPERTY_DEFS.find((d) => d.slug === slug)!;
    const subjectRevpar = round2(def.baseAdr * def.baseOcc);

    for (const comp of competitors) {
      const compRevpar = round2(comp.adr * comp.occupancy);
      // Index = subject RevPAR / competitor RevPAR * 100
      const indexScore = round2((subjectRevpar / compRevpar) * 100);

      await ctx.db.insert("compSets", {
        propertyId,
        competitorName: comp.competitorName,
        adr: comp.adr,
        occupancy: comp.occupancy,
        revpar: compRevpar,
        indexScore,
      });
    }
  }
}

// ─── Exported helper: look up property IDs by slug ──────────────────────────

/**
 * Utility for other seed files.
 * Query all properties and return a slug -> id mapping.
 *
 * Usage from another seed file:
 * ```ts
 * import { getPropertyMap } from "./seed";
 * const props = await getPropertyMap(ctx);
 * ```
 */
export async function getPropertyMap(
  ctx: any,
): Promise<Record<string, Id<"properties">>> {
  const all = await ctx.db.query("properties").collect();
  const map: Record<string, Id<"properties">> = {};
  for (const p of all) {
    map[p.slug] = p._id;
  }
  return map;
}

// ─── Main seed mutation ─────────────────────────────────────────────────────

export const seed = internalMutation({
  args: {},
  handler: async (ctx) => {
    // Guard: skip if already seeded
    const existing = await ctx.db.query("properties").first();
    if (existing) {
      console.log("Already seeded — skipping core seed.");
      return;
    }

    await seedPortfolio(ctx);
    const regions = await seedRegions(ctx);
    const props = await seedProperties(ctx, regions);
    await seedDailySummaries(ctx, props);
    await seedCompSets(ctx, props);

    console.log(
      "Core seed complete (portfolio, regions, 15 properties, daily summaries, comp sets).",
    );
    console.log(
      "Run seedRooms, seedOperational, seedFinancial separately for additional data.",
    );
  },
});
