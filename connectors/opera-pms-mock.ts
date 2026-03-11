/**
 * Opera PMS Mock Connector
 *
 * Simulates an Oracle Opera Property Management System data feed pushing
 * reservation, room status, and night audit data into Convex.
 *
 * Data targets:
 *   - reservations (new bookings, modifications, cancellations)
 *   - rooms, housekeepingRooms (room status updates)
 *   - nightAudits, dailySummaries (nightly audit summaries)
 *
 * Usage:
 *   CONVEX_URL=https://your-deployment.convex.cloud bun run connectors/opera-pms-mock.ts
 */

import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api.js";
import {
  generateGuestName,
  generateConfirmationNumber,
  generateRate,
  generateOccupancy,
  formatDate,
  addDays,
  seededRandom,
  seededPick,
  seededRange,
  round2,
  SHOWCASE_PROPERTIES,
  ROOM_TYPES,
  BOOKING_SOURCES,
  VIP_TIERS,
  SPECIAL_REQUESTS,
  ROOM_STATUSES,
  HK_STATUSES,
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
  floorsStart: number;
  floorsEnd: number;
  roomsPerFloor: number;
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
      floorsStart: prop.floorsStart,
      floorsEnd: prop.floorsEnd,
      roomsPerFloor: prop.roomsPerFloor,
    });
  }
  return resolved;
}

// ─── 1. Reservation Generator ────────────────────────────────────────────────

async function generateReservations(
  properties: ResolvedProperty[],
): Promise<number> {
  let totalCreated = 0;
  const today = new Date();

  for (const prop of properties) {
    // Generate 15 arrivals per property
    const numArrivals = 15;
    for (let i = 0; i < numArrivals; i++) {
      const seed = `${prop.slug}-arr-${formatDate(today)}-${i}`;
      const guestName = generateGuestName(
        Math.floor(seededRandom(seed) * 2500),
      );
      const roomType = seededPick(seed + "-rt", [...ROOM_TYPES]);
      const rate = generateRate(prop.baseAdr, roomType, today, seededRandom(seed + "-jitter"));
      const vipTier = seededPick(seed + "-vip", [...VIP_TIERS]);
      const source = seededPick(seed + "-src", [...BOOKING_SOURCES]);

      // Assign a room number deterministically
      const floor =
        prop.floorsStart +
        Math.floor(
          seededRandom(seed + "-floor") * (prop.floorsEnd - prop.floorsStart + 1),
        );
      const pos = 1 + Math.floor(seededRandom(seed + "-pos") * prop.roomsPerFloor);
      const roomNumber = `${floor * 100 + pos}`;

      const etas = ["14:00", "15:00", "16:00", "17:00", "18:00", "20:00", "21:00"];
      const eta = seededPick(seed + "-eta", etas);

      let specialRequests: string | undefined;
      if (seededRandom(seed + "-sr") > 0.75) {
        specialRequests = seededPick(seed + "-srval", [...SPECIAL_REQUESTS]);
      }

      let groupName: string | undefined;
      if (source === "Group Block") {
        const groups = [
          "TechConf 2025",
          "National Sales Meeting",
          "ACME Corp Retreat",
          "IEEE Symposium",
          "Southwest Medical Conference",
        ];
        groupName = seededPick(seed + "-grp", groups);
      }

      await client.mutation(api.connectorMutations.upsertReservation, {
        propertyId: prop.id as any,
        guestName,
        roomNumber,
        reservationType: "arrival",
        vipTier: vipTier ?? undefined,
        groupName,
        specialRequests,
        eta,
        balance: round2(rate * (1 + Math.floor(seededRandom(seed + "-nights") * 3))),
      });
      totalCreated++;
    }

    // Generate 10 departures per property
    const numDepartures = 10;
    for (let i = 0; i < numDepartures; i++) {
      const seed = `${prop.slug}-dep-${formatDate(today)}-${i}`;
      const guestName = generateGuestName(
        Math.floor(seededRandom(seed) * 2500) + 500,
      );

      const floor =
        prop.floorsStart +
        Math.floor(
          seededRandom(seed + "-floor") * (prop.floorsEnd - prop.floorsStart + 1),
        );
      const pos = 1 + Math.floor(seededRandom(seed + "-pos") * prop.roomsPerFloor);
      const roomNumber = `${floor * 100 + pos}`;

      const checkoutTimes = ["11:00", "12:00", "12:00"];
      const checkoutTime = seededPick(seed + "-ct", checkoutTimes);
      const balances = [0, 0, 0, 0, 25.50, 45.00, 78.50, 120.00, 0, 0];
      const balance = seededPick(seed + "-bal", balances);

      const loyaltyTiers: (string | undefined)[] = [
        undefined, undefined, undefined, "Gold", "Platinum", "Diamond",
      ];
      const loyaltyTier = seededPick(seed + "-lt", loyaltyTiers);

      await client.mutation(api.connectorMutations.upsertReservation, {
        propertyId: prop.id as any,
        guestName,
        roomNumber,
        reservationType: "departure",
        checkoutTime,
        balance,
        loyaltyTier: loyaltyTier ?? undefined,
      });
      totalCreated++;
    }

    // Generate 5 cancellations / no-shows
    const numCancellations = 5;
    for (let i = 0; i < numCancellations; i++) {
      const seed = `${prop.slug}-cancel-${formatDate(today)}-${i}`;
      const guestName = generateGuestName(
        Math.floor(seededRandom(seed) * 2500) + 1000,
      );
      const floor =
        prop.floorsStart +
        Math.floor(
          seededRandom(seed + "-floor") * (prop.floorsEnd - prop.floorsStart + 1),
        );
      const pos = 1 + Math.floor(seededRandom(seed + "-pos") * prop.roomsPerFloor);
      const roomNumber = `${floor * 100 + pos}`;

      // Alternate between cancellations logged as arrivals with no-show note
      const type = i < 3 ? "arrival" : "departure";

      await client.mutation(api.connectorMutations.upsertReservation, {
        propertyId: prop.id as any,
        guestName,
        roomNumber,
        reservationType: type,
        specialRequests: i < 3 ? "CANCELLED" : "NO-SHOW",
      });
      totalCreated++;
    }
  }

  return totalCreated;
}

// ─── 2. Room Status Updates ──────────────────────────────────────────────────

async function generateRoomStatusUpdates(
  properties: ResolvedProperty[],
): Promise<number> {
  let totalUpdated = 0;
  const today = new Date();

  for (const prop of properties) {
    // Update a sample of rooms (20 per property) with realistic statuses
    const numUpdates = 20;
    for (let i = 0; i < numUpdates; i++) {
      const seed = `${prop.slug}-room-${formatDate(today)}-${i}`;
      const floor =
        prop.floorsStart +
        Math.floor(
          seededRandom(seed + "-floor") * (prop.floorsEnd - prop.floorsStart + 1),
        );
      const pos = 1 + Math.floor(seededRandom(seed + "-pos") * prop.roomsPerFloor);
      const roomNumber = `${floor * 100 + pos}`;

      // Determine room type based on floor/pos (matching seedRooms logic)
      const maxFloor = prop.floorsEnd;
      let rType = "King";
      if (pos === 1) rType = "ADA King";
      else if (floor >= maxFloor - 1 && pos <= 4) rType = "Suite";
      else if (pos % 4 === 0 || pos % 4 === 3) rType = "Double Queen";

      const status = seededPick(seed + "-status", [...ROOM_STATUSES]);

      let guestName: string | undefined;
      let isVip: boolean | undefined;
      let lateCheckout: boolean | undefined;
      let specialRequests: string | undefined;

      if (status === "occupied") {
        guestName = generateGuestName(
          Math.floor(seededRandom(seed + "-guest") * 2500) + 2000,
        );
        if (seededRandom(seed + "-vip") > 0.9) isVip = true;
        if (seededRandom(seed + "-lc") > 0.88) lateCheckout = true;
        if (seededRandom(seed + "-sr") > 0.82) {
          specialRequests = seededPick(seed + "-srval", [...SPECIAL_REQUESTS]);
        }
      }

      // Upsert room
      await client.mutation(api.connectorMutations.upsertRoom, {
        propertyId: prop.id as any,
        number: roomNumber,
        floor,
        roomType: rType,
        status,
        guestName,
        isVip,
        lateCheckout,
        specialRequests,
      });

      // Upsert housekeeping room
      let hkStatus: string;
      switch (status) {
        case "occupied":
          hkStatus = (floor + pos) % 5 < 3 ? "clean" : "dirty";
          break;
        case "dirty":
          hkStatus = "dirty";
          break;
        case "inspected":
          hkStatus = "inspected";
          break;
        case "clean":
          hkStatus = "clean";
          break;
        case "out-of-order":
          hkStatus = "ooo";
          break;
        default:
          hkStatus = seededPick(seed + "-hk", [...HK_STATUSES]);
      }

      await client.mutation(api.connectorMutations.upsertHousekeepingRoom, {
        propertyId: prop.id as any,
        roomNumber,
        floor,
        hkStatus,
      });

      totalUpdated++;
    }
  }

  return totalUpdated;
}

// ─── 3. Night Audit Summary ──────────────────────────────────────────────────

async function generateNightAuditSummaries(
  properties: ResolvedProperty[],
): Promise<number> {
  let totalCreated = 0;
  const today = new Date();
  const lastNight = addDays(today, -1);
  const lastNightStr = formatDate(lastNight);

  for (const prop of properties) {
    const seed = `${prop.slug}-audit-${lastNightStr}`;
    const occupancy = generateOccupancy(
      prop.baseOcc,
      lastNight,
      0,
      seededRandom(seed + "-occ"),
    );
    const occupiedRooms = Math.round(prop.totalRooms * occupancy);
    const adr = generateRate(
      prop.baseAdr,
      "King",
      lastNight,
      seededRandom(seed + "-adr"),
    );

    const roomRevenue = round2(occupiedRooms * adr);
    // F&B typically 20-30% of room revenue for full-service
    const fbRevenue = round2(roomRevenue * seededRange(seed + "-fb", 0.18, 0.28));
    // Other revenue (parking, spa, retail) ~5-10%
    const otherRevenue = round2(roomRevenue * seededRange(seed + "-other", 0.05, 0.10));
    const totalRevenue = round2(roomRevenue + fbRevenue + otherRevenue);

    const comps = round2(adr * Math.floor(seededRandom(seed + "-comps") * 5));
    const adjustments = round2(seededRange(seed + "-adj", 100, 800));
    const refunds = round2(seededRange(seed + "-ref", 0, 500));

    // Night audit
    await client.mutation(api.connectorMutations.upsertNightAudit, {
      propertyId: prop.id as any,
      date: lastNightStr,
      roomRevenue,
      fbRevenue,
      otherRevenue,
      totalRevenue,
      comps,
      adjustments,
      refunds,
      occupiedRooms,
      availableRooms: prop.totalRooms,
    });
    totalCreated++;

    // Daily summary
    const revpar = round2(adr * occupancy);
    const revenue = round2(revpar * prop.totalRooms);
    const dayOfMonth = lastNight.getDate();

    // Budget figures: slightly different from actuals
    const budgetOcc = round2(occupancy * seededRange(seed + "-bocc", 0.94, 1.02));
    const budgetAdr = round2(adr * seededRange(seed + "-badr", 0.96, 1.04));
    const budgetRevpar = round2(budgetAdr * budgetOcc);
    const budgetRevenue = round2(budgetRevpar * prop.totalRooms);

    const mtdRevenue = round2(revenue * dayOfMonth);
    const mtdBudget = round2(budgetRevenue * dayOfMonth);

    const startOfYear = new Date(lastNight.getFullYear(), 0, 1);
    const daysInYear = Math.floor(
      (lastNight.getTime() - startOfYear.getTime()) / 86400000,
    );
    const ytdVariance = seededRange(seed + "-ytd", 0.95, 1.05);
    const ytdRevenue = round2(revenue * daysInYear * ytdVariance);
    const ytdBudget = round2(budgetRevenue * daysInYear * ytdVariance);

    await client.mutation(api.connectorMutations.upsertDailySummary, {
      propertyId: prop.id as any,
      date: lastNightStr,
      occupancy,
      adr,
      revpar,
      revenue,
      budgetOccupancy: budgetOcc,
      budgetAdr: budgetAdr,
      budgetRevpar: budgetRevpar,
      budgetRevenue: budgetRevenue,
      mtdRevenue,
      mtdBudget,
      ytdRevenue,
      ytdBudget,
    });
    totalCreated++;
  }

  return totalCreated;
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  console.log("🏨 Opera PMS Mock Connector");
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

  console.log("\n📝 Generating reservations...");
  const reservationCount = await generateReservations(properties);
  console.log(`   ✅ ${reservationCount} reservations created/updated.`);

  console.log("\n🚪 Generating room status updates...");
  const roomCount = await generateRoomStatusUpdates(properties);
  console.log(`   ✅ ${roomCount} room statuses updated.`);

  console.log("\n🌙 Generating night audit summaries...");
  const auditCount = await generateNightAuditSummaries(properties);
  console.log(`   ✅ ${auditCount} audit/summary records created/updated.`);

  console.log("\n" + "━".repeat(50));
  console.log(
    `✅ Opera PMS sync complete: ${reservationCount} reservations, ${roomCount} rooms, ${auditCount} audits.`,
  );
}

main().catch((err) => {
  console.error("❌ Opera PMS mock failed:", err);
  process.exit(1);
});
