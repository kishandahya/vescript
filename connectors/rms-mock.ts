/**
 * Revenue Management System (RMS) Mock Connector
 *
 * Simulates a Revenue Management System (like IDeaS G3 or Duetto) pushing
 * rate recommendations, comp set pricing, and demand forecasts into Convex.
 *
 * Data targets:
 *   - dailyRates (recommended BAR by room type, date)
 *   - compSets (competitor hotel pricing and positioning)
 *   - forecasts (90-day forward occupancy forecast)
 *   - demandCalendar (daily occupancy expectations with event overlays)
 *   - marketEvents (demand-driving events by market)
 *
 * Usage:
 *   CONVEX_URL=https://your-deployment.convex.cloud bun run connectors/rms-mock.ts
 */

import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api.js";
import {
  generateRate,
  generateOccupancy,
  formatDate,
  addDays,
  dayOfWeek,
  seededRandom,
  seededRange,
  round2,
  SHOWCASE_PROPERTIES,
  ROOM_TYPES,
  COMP_SET_HOTELS,
  MARKET_EVENTS,
} from "./shared/data-generators.js";

// ─── Client Setup ────────────────────────────────────────────────────────────

function getConvexUrl(): string {
  const url =
    process.env.CONVEX_URL ??
    process.env.VITE_CONVEX_URL;
  if (!url) {
    throw new Error(
      "Missing CONVEX_URL environment variable. Set it in .env.local or pass directly.",
    );
  }
  return url;
}

const client = new ConvexHttpClient(getConvexUrl());

// ─── Property ID Resolution ─────────────────────────────────────────────────

type PropertyId = string;

interface ResolvedProperty {
  id: PropertyId;
  slug: string;
  name: string;
  market: string;
  totalRooms: number;
  baseAdr: number;
  baseOcc: number;
}

async function resolveProperties(): Promise<ResolvedProperty[]> {
  const resolved: ResolvedProperty[] = [];
  for (const prop of SHOWCASE_PROPERTIES) {
    const dbProp = await client.query(api.properties.getById, {
      slug: prop.slug,
    });
    if (!dbProp) {
      console.warn(`⚠ Property not found in DB: ${prop.slug}, skipping`);
      continue;
    }
    resolved.push({
      id: dbProp._id as string,
      slug: prop.slug,
      name: prop.name,
      market: prop.market,
      totalRooms: prop.totalRooms,
      baseAdr: prop.baseAdr,
      baseOcc: prop.baseOcc,
    });
  }
  return resolved;
}

// ─── Event Lookup Helper ─────────────────────────────────────────────────────

/**
 * Build a map of date → event names for a market's events.
 * Expands multi-day events into per-day entries.
 */
function buildEventDateMap(
  market: string,
): Map<string, string[]> {
  const map = new Map<string, string[]>();
  const events = MARKET_EVENTS[market] ?? [];

  for (const evt of events) {
    const start = new Date(evt.startDate + "T00:00:00");
    const end = new Date(evt.endDate + "T00:00:00");
    const days = Math.floor(
      (end.getTime() - start.getTime()) / 86400000,
    ) + 1;

    for (let d = 0; d < days; d++) {
      const dateStr = formatDate(addDays(start, d));
      const existing = map.get(dateStr) ?? [];
      existing.push(evt.name);
      map.set(dateStr, existing);
    }
  }

  return map;
}

// ─── 1. Daily Rate Recommendations ──────────────────────────────────────────

async function generateDailyRates(
  properties: ResolvedProperty[],
): Promise<number> {
  let totalCreated = 0;
  const today = new Date();

  for (const prop of properties) {
    // Generate 14 days of rate recommendations × 4 room types
    for (let d = 0; d < 14; d++) {
      const date = addDays(today, d);
      const dateStr = formatDate(date);
      const dow = date.getDay();
      const isWeekend = dow === 5 || dow === 6;

      for (const roomType of ROOM_TYPES) {
        const seed = `${prop.slug}-rate-${dateStr}-${roomType}`;
        const jitter = seededRandom(seed);

        // RMS recommended rate (optimized)
        const recommendedRate = generateRate(prop.baseAdr, roomType, date, jitter);

        // Apply restrictions on high-demand dates
        let restrictions: string | undefined;
        if (isWeekend && d <= 7) {
          restrictions = "2-night minimum";
        }
        // If it's a very high demand day (rare), close to arrival
        if (seededRandom(seed + "-closed") > 0.92 && d <= 3) {
          restrictions = "closed to arrival";
        }

        await client.mutation(api.connectorMutations.upsertDailyRate, {
          propertyId: prop.id as any,
          date: dateStr,
          roomType,
          bar: recommendedRate,
          restrictions,
        });
        totalCreated++;
      }
    }
  }

  return totalCreated;
}

// ─── 2. Comp Set Pricing ─────────────────────────────────────────────────────

async function generateCompSetPricing(
  properties: ResolvedProperty[],
): Promise<number> {
  let totalCreated = 0;
  const today = new Date();

  for (const prop of properties) {
    const competitors = COMP_SET_HOTELS[prop.market] ?? [];
    const subjectRevpar = round2(prop.baseAdr * prop.baseOcc);

    for (const comp of competitors) {
      const seed = `${prop.slug}-comp-${comp.name}-${formatDate(today)}`;

      // Add daily variance to competitor rates (simulating market movement)
      const adrVariance = seededRange(seed + "-adr", 0.95, 1.08);
      const occVariance = seededRange(seed + "-occ", 0.96, 1.04);

      const compAdr = round2(comp.baseAdr * adrVariance);
      const compOcc = round2(
        Math.min(0.98, Math.max(0.5, comp.baseOcc * occVariance)),
      );
      const compRevpar = round2(compAdr * compOcc);

      // Index = subject RevPAR / competitor RevPAR × 100
      const indexScore = round2((subjectRevpar / compRevpar) * 100);

      await client.mutation(api.connectorMutations.upsertCompSet, {
        propertyId: prop.id as any,
        competitorName: comp.name,
        adr: compAdr,
        occupancy: compOcc,
        revpar: compRevpar,
        indexScore,
      });
      totalCreated++;
    }
  }

  return totalCreated;
}

// ─── 3. Demand Forecasts (90-day) ────────────────────────────────────────────

async function generateForecasts(
  properties: ResolvedProperty[],
): Promise<{ forecastCount: number; demandCount: number; eventCount: number }> {
  let forecastCount = 0;
  let demandCount = 0;
  let eventCount = 0;
  const today = new Date();

  for (const prop of properties) {
    const eventMap = buildEventDateMap(prop.market);

    for (let d = 0; d < 90; d++) {
      const date = addDays(today, d);
      const dateStr = formatDate(date);
      const dow = date.getDay();
      const dowLabel = dayOfWeek(date);
      const seed = `${prop.slug}-fc-${dateStr}`;

      // Events on this date
      const dayEvents = eventMap.get(dateStr) ?? [];
      const eventBoost = dayEvents.length > 0 ? 0.08 * dayEvents.length : 0;

      // Weekday/weekend factor
      const isWeekday = dow >= 1 && dow <= 4;
      const dowFactor = isWeekday ? 1.05 : 0.88;

      // Decay factor: OTB (on-the-books) declines as dates get further out
      const decayFactor = Math.max(0.3, 1 - d * 0.007);

      // Seasonal pattern
      const month = date.getMonth();
      const seasonFactor =
        month >= 2 && month <= 4 ? 1.04 : month >= 10 ? 0.92 : 1.0;

      // OTB rooms
      const otbRaw =
        prop.totalRooms *
          prop.baseOcc *
          dowFactor *
          decayFactor *
          seasonFactor +
        prop.totalRooms * eventBoost;
      const otbRooms = Math.min(
        prop.totalRooms,
        Math.max(
          0,
          Math.round(otbRaw + seededRange(seed + "-otb", -8, 8)),
        ),
      );

      // Forecast = OTB + expected pickup
      const pickupPct = Math.max(0, (1 - decayFactor) * 0.6);
      const forecast = Math.min(
        prop.totalRooms,
        Math.round(
          otbRooms + prop.totalRooms * pickupPct * prop.baseOcc * 0.3,
        ),
      );

      // Budget: relatively stable
      const budget = Math.min(
        prop.totalRooms,
        Math.max(
          0,
          Math.round(
            prop.totalRooms * prop.baseOcc * seasonFactor * dowFactor +
              seededRange(seed + "-bud", -5, 5),
          ),
        ),
      );

      // Prior year: slightly lower
      const priorYear = Math.min(
        prop.totalRooms,
        Math.max(
          0,
          Math.round(
            prop.totalRooms *
              (prop.baseOcc - 0.03) *
              dowFactor *
              seasonFactor *
              seededRange(seed + "-py", 0.92, 1.08),
          ),
        ),
      );

      // Forecast record
      await client.mutation(api.connectorMutations.upsertForecast, {
        propertyId: prop.id as any,
        date: dateStr,
        dayOfWeek: dowLabel,
        otbRooms,
        forecast,
        budget,
        priorYear,
        marketEvents: dayEvents.length > 0 ? dayEvents : undefined,
      });
      forecastCount++;

      // Demand calendar record
      const rawOcc =
        prop.baseOcc * dowFactor * seasonFactor * 100 +
        eventBoost * 100 +
        seededRange(seed + "-dc", -5, 5);
      const expectedOccupancy = Math.min(
        100,
        Math.max(0, Math.round(rawOcc)),
      );

      await client.mutation(api.connectorMutations.upsertDemandCalendar, {
        propertyId: prop.id as any,
        date: dateStr,
        expectedOccupancy,
        events: dayEvents.length > 0 ? dayEvents : undefined,
      });
      demandCount++;
    }
  }

  // Market events (one-time upserts for all markets)
  const marketsProcessed = new Set<string>();
  for (const prop of properties) {
    if (marketsProcessed.has(prop.market)) continue;
    marketsProcessed.add(prop.market);

    const events = MARKET_EVENTS[prop.market] ?? [];
    for (const evt of events) {
      await client.mutation(api.connectorMutations.upsertMarketEvent, {
        market: prop.market,
        name: evt.name,
        startDate: evt.startDate,
        endDate: evt.endDate,
        demandImpact: evt.demandImpact,
        eventType: evt.eventType,
      });
      eventCount++;
    }
  }

  return { forecastCount, demandCount, eventCount };
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  console.log("📊 Revenue Management System (RMS) Mock Connector");
  console.log("━".repeat(50));

  console.log("\n📋 Resolving properties...");
  const properties = await resolveProperties();
  if (properties.length === 0) {
    console.error("❌ No showcase properties found. Run seed scripts first.");
    process.exit(1);
  }
  console.log(
    `   Found ${properties.length} properties: ${properties.map((p) => p.name).join(", ")}`,
  );

  console.log("\n💰 Generating daily rate recommendations (14 days × 4 room types)...");
  const rateCount = await generateDailyRates(properties);
  console.log(`   ✅ ${rateCount} rate records created/updated.`);

  console.log("\n🏢 Generating comp set pricing...");
  const compCount = await generateCompSetPricing(properties);
  console.log(`   ✅ ${compCount} comp set records created/updated.`);

  console.log("\n📈 Generating 90-day demand forecasts...");
  const { forecastCount, demandCount, eventCount } =
    await generateForecasts(properties);
  console.log(
    `   ✅ ${forecastCount} forecast records, ${demandCount} demand calendar records, ${eventCount} market events.`,
  );

  const totalRecords = rateCount + compCount + forecastCount + demandCount + eventCount;
  console.log("\n" + "━".repeat(50));
  console.log(
    `✅ RMS sync complete: ${totalRecords} total records. ` +
      `${rateCount} rates, ${compCount} comp sets, ` +
      `${forecastCount} forecasts, ${demandCount} demand cal, ${eventCount} events.`,
  );
}

main().catch((err) => {
  console.error("❌ RMS mock failed:", err);
  process.exit(1);
});
