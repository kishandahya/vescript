import { internalMutation } from "./_generated/server";
import { Id } from "./_generated/dataModel";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const GUEST_NAMES = [
  "James Wilson", "Maria Garcia", "Robert Johnson", "Sarah Chen", "Michael Brown",
  "Jennifer Davis", "David Martinez", "Lisa Anderson", "Thomas Taylor", "Emily White",
  "Christopher Lee", "Amanda Harris", "Daniel Clark", "Jessica Lewis", "Matthew Robinson",
  "Ashley Walker", "Andrew Hall", "Stephanie Allen", "Joshua Young", "Nicole King",
  "Ryan Wright", "Megan Scott", "Brandon Green", "Rachel Adams", "Justin Baker",
  "Lauren Nelson", "Kevin Hill", "Samantha Moore", "Tyler Campbell", "Kayla Mitchell",
];

const SPECIAL_REQUESTS = [
  "Extra pillows", "Late checkout requested", "Connecting room with adjacent",
  "Hypoallergenic bedding", "Crib needed", "Anniversary package",
  "Extra towels", "Feather-free room", "Rollaway bed", "Mini-fridge stocked",
  "High floor preferred", "Quiet room requested",
];

const GROUP_NAMES = [
  "TechConf 2025", "National Sales Meeting", "ACME Corp Retreat",
  "Wedding - Martinez/Chen", "IEEE Symposium", "Southwest Medical Conference",
];

const ATTENDANT_NAMES_DALLAS = [
  "Rosa Hernandez", "Maria Lopez", "Ana Martinez", "Carmen Rodriguez",
  "Patricia Gonzalez", "Gloria Sanchez", "Teresa Rivera", "Lucia Torres",
  "Elena Flores", "Isabel Ramirez", "Yolanda Cruz", "Beatriz Morales",
];

const ATTENDANT_NAMES_HOUSTON = [
  "Guadalupe Diaz", "Alicia Reyes", "Veronica Ruiz", "Claudia Mendez",
  "Sofia Herrera", "Daniela Vargas", "Adriana Castillo", "Lorena Jimenez",
  "Monica Rojas", "Gabriela Ortiz", "Silvia Gutierrez", "Martha Delgado",
  "Fernanda Aguilar",
];

const ATTENDANT_NAMES_DENVER = [
  "Linda Nguyen", "Susan Park", "Karen Tanaka", "Nancy Kim",
  "Betty Yamamoto", "Dorothy Chen", "Sandra Pham", "Margaret Wu",
  "Carol Huang", "Ruth Choi", "Sharon Tran", "Deborah Nakamura",
  "Helen Sakamoto", "Irene Matsuda", "Virginia Sato",
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function getPropertyId(ctx: any, slug: string): Promise<Id<"properties"> | null> {
  const prop = await ctx.db
    .query("properties")
    .filter((q: any) => q.eq(q.field("slug"), slug))
    .first();
  return prop?._id ?? null;
}

function guest(idx: number): string {
  return GUEST_NAMES[idx % GUEST_NAMES.length];
}

/** Deterministic room type based on floor and position */
function roomType(floor: number, pos: number, maxFloor: number): string {
  // ADA rooms: position 1 on every floor
  if (pos === 1) return "ADA King";
  // Top two floors: more suites
  if (floor >= maxFloor - 1) {
    if (pos <= 4) return "Suite";
    if (pos <= 8) return "King";
    return pos % 3 === 0 ? "Double Queen" : "King";
  }
  // Upper-mid floors: some suites
  if (floor >= maxFloor - 5) {
    if (pos === 2) return "Suite";
    if (pos % 4 === 0) return "Double Queen";
    return "King";
  }
  // Lower floors: mostly king + DQ
  if (pos % 4 === 0 || pos % 4 === 3) return "Double Queen";
  return "King";
}

/**
 * Deterministic room status assignment.
 * Uses a simple hash of (floor * 100 + pos) to distribute statuses
 * according to the target occupancy distribution.
 */
function roomStatus(
  floor: number,
  pos: number,
  occupiedPct: number,
  vacCleanPct: number,
  vacDirtyPct: number,
  dueOutPct: number,
  dueInPct: number,
  oooPct: number,
): string {
  // Simple deterministic value 0-999
  const h = ((floor * 137 + pos * 31) % 1000);
  const occ = occupiedPct * 10;
  const vc = occ + vacCleanPct * 10;
  const vd = vc + vacDirtyPct * 10;
  const dout = vd + dueOutPct * 10;
  const din = dout + dueInPct * 10;
  const ooo = din + oooPct * 10;

  if (h < occ) return "occupied";
  if (h < vc) return "vacant-clean";
  if (h < vd) return "vacant-dirty";
  if (h < dout) return "due-out";
  if (h < din) return "due-in";
  if (h < ooo) return "ooo";
  return "inspected";
}

/** Map room status to housekeeping status */
function hkStatusFromRoom(status: string, floor: number, pos: number): string {
  switch (status) {
    case "occupied":
      // ~60% stayover already done (clean), ~40% pending (dirty)
      return (floor + pos) % 5 < 3 ? "clean" : "dirty";
    case "vacant-dirty":
    case "due-out":
      return "dirty";
    case "inspected":
      return "inspected";
    case "vacant-clean":
      return "clean";
    case "due-in":
      return "clean";
    case "ooo":
      return "ooo";
    default:
      return "dirty";
  }
}

// ---------------------------------------------------------------------------
// Property config
// ---------------------------------------------------------------------------

interface PropertyConfig {
  slug: string;
  totalRooms: number;
  floorsStart: number;
  floorsEnd: number;
  roomsPerFloor: number;
  occupiedPct: number;  // as whole number e.g. 78
  vacCleanPct: number;
  vacDirtyPct: number;
  dueOutPct: number;
  dueInPct: number;
  oooPct: number;
  inspectedPct: number;
  numArrivals: number;
  numDepartures: number;
  attendantNames: string[];
}

const PROPERTIES: PropertyConfig[] = [
  {
    slug: "marriott-dallas",
    totalRooms: 340,
    floorsStart: 2,
    floorsEnd: 18,
    roomsPerFloor: 20,
    occupiedPct: 78,
    vacCleanPct: 9,
    vacDirtyPct: 7,
    dueOutPct: 2.4,
    dueInPct: 2,
    oooPct: 0.9,
    inspectedPct: 0.7,
    numArrivals: 50,
    numDepartures: 40,
    attendantNames: ATTENDANT_NAMES_DALLAS,
  },
  {
    slug: "hilton-houston",
    totalRooms: 280,
    floorsStart: 2,
    floorsEnd: 15,
    roomsPerFloor: 20,
    occupiedPct: 75,
    vacCleanPct: 10,
    vacDirtyPct: 8,
    dueOutPct: 2.5,
    dueInPct: 2,
    oooPct: 1,
    inspectedPct: 1.5,
    numArrivals: 45,
    numDepartures: 35,
    attendantNames: ATTENDANT_NAMES_HOUSTON,
  },
  {
    slug: "hyatt-denver",
    totalRooms: 450,
    floorsStart: 2,
    floorsEnd: 22,
    roomsPerFloor: 22,
    occupiedPct: 80,
    vacCleanPct: 8,
    vacDirtyPct: 6,
    dueOutPct: 2.2,
    dueInPct: 1.5,
    oooPct: 0.7,
    inspectedPct: 1.6,
    numArrivals: 60,
    numDepartures: 50,
    attendantNames: ATTENDANT_NAMES_DENVER,
  },
];

// ---------------------------------------------------------------------------
// Seed mutation
// ---------------------------------------------------------------------------

export const seedRooms = internalMutation({
  args: {},
  handler: async (ctx) => {
    for (const config of PROPERTIES) {
      const propertyId = await getPropertyId(ctx, config.slug);
      if (!propertyId) {
        console.warn(`Property not found: ${config.slug}, skipping`);
        continue;
      }

      // ------------------------------------------------------------------
      // 1. Attendants
      // ------------------------------------------------------------------
      const attendantIds: string[] = [];
      for (let i = 0; i < config.attendantNames.length; i++) {
        const id = await ctx.db.insert("attendants", {
          propertyId,
          name: config.attendantNames[i],
          shift: "7:00-15:30",
          sectionCapacity: 14 + (i % 3), // 14, 15, 16 rotating
        });
        attendantIds.push(id);
      }

      // ------------------------------------------------------------------
      // 2. Rooms + Housekeeping rooms
      // ------------------------------------------------------------------
      let guestIdx = 0;
      const occupiedRoomNumbers: string[] = [];
      const vacantRoomNumbers: string[] = [];
      let sectionCounter = 1;
      let roomsInSection = 0;
      let currentAttendantIdx = 0;

      for (
        let floor = config.floorsStart;
        floor <= config.floorsEnd;
        floor++
      ) {
        for (let pos = 1; pos <= config.roomsPerFloor; pos++) {
          const roomNum = `${floor * 100 + pos}`;
          const maxFloor = config.floorsEnd;
          const rType = roomType(floor, pos, maxFloor);
          const status = roomStatus(
            floor,
            pos,
            config.occupiedPct,
            config.vacCleanPct,
            config.vacDirtyPct,
            config.dueOutPct,
            config.dueInPct,
            config.oooPct,
          );

          // Build room record
          const roomRecord: any = {
            propertyId,
            number: roomNum,
            floor,
            roomType: rType,
            status,
          };

          if (status === "occupied" || status === "due-out") {
            const gName = guest(guestIdx);
            roomRecord.guestName = gName;
            guestIdx++;

            // VIP: ~5% of occupied
            if (guestIdx % 20 === 0) {
              roomRecord.isVip = true;
            }
            // Late checkout: ~8%
            if (guestIdx % 13 === 0) {
              roomRecord.lateCheckout = true;
            }
            // Connecting: ~3%
            if (guestIdx % 33 === 0) {
              roomRecord.isConnecting = true;
            }
            // Special requests: ~12% of occupied
            if (guestIdx % 8 === 0) {
              roomRecord.specialRequests =
                SPECIAL_REQUESTS[guestIdx % SPECIAL_REQUESTS.length];
            }

            occupiedRoomNumbers.push(roomNum);
          } else {
            vacantRoomNumbers.push(roomNum);
          }

          await ctx.db.insert("rooms", roomRecord);

          // Housekeeping room
          const hkStatus = hkStatusFromRoom(status, floor, pos);
          const hkRecord: any = {
            propertyId,
            roomNumber: roomNum,
            floor,
            hkStatus,
          };

          // Assign attendant + section to dirty/clean rooms (not ooo/inspected)
          if (hkStatus === "dirty" || hkStatus === "clean") {
            hkRecord.attendantId = attendantIds[currentAttendantIdx] as string;
            hkRecord.section = sectionCounter;
            roomsInSection++;
            // Move to next section every ~15 rooms
            if (roomsInSection >= 15) {
              roomsInSection = 0;
              sectionCounter++;
              currentAttendantIdx =
                (currentAttendantIdx + 1) % attendantIds.length;
            }
          }

          await ctx.db.insert("housekeepingRooms", hkRecord);
        }
      }

      // ------------------------------------------------------------------
      // 3. Reservations – Arrivals
      // ------------------------------------------------------------------
      const etas = ["14:00", "15:00", "16:00", "18:00", "21:00"];
      const vipTiers = [null, null, null, null, null, null, "Gold", "Platinum", "Diamond"];

      for (let i = 0; i < config.numArrivals; i++) {
        const arrivalRoom =
          vacantRoomNumbers[i % vacantRoomNumbers.length] ?? `${config.floorsStart * 100 + 1}`;
        const gName = guest(i + 100); // offset to avoid duplicating room guest names

        const rec: any = {
          propertyId,
          guestName: gName,
          roomNumber: arrivalRoom,
          reservationType: "arrival",
          eta: etas[i % etas.length],
        };

        const tier = vipTiers[i % vipTiers.length];
        if (tier) rec.vipTier = tier;

        // Group linkage for ~15% of arrivals
        if (i % 7 === 0) {
          rec.groupName = GROUP_NAMES[i % GROUP_NAMES.length];
        }
        // Special requests for ~20%
        if (i % 5 === 0) {
          rec.specialRequests =
            SPECIAL_REQUESTS[(i + 3) % SPECIAL_REQUESTS.length];
        }

        await ctx.db.insert("reservations", rec);
      }

      // ------------------------------------------------------------------
      // 4. Reservations – Departures
      // ------------------------------------------------------------------
      const checkoutTimes = ["11:00", "12:00"];
      const loyaltyTiers = [null, null, null, "Gold", "Platinum", "Diamond"];
      const balances = [0, 0, 0, 0, 0, 25, 45, 78.5, 120, 150];

      for (let i = 0; i < config.numDepartures; i++) {
        const depRoom =
          occupiedRoomNumbers[i % occupiedRoomNumbers.length] ?? `${config.floorsStart * 100 + 1}`;
        const gName = guest(i + 200); // further offset

        const rec: any = {
          propertyId,
          guestName: gName,
          roomNumber: depRoom,
          reservationType: "departure",
          checkoutTime: checkoutTimes[i % checkoutTimes.length],
          balance: balances[i % balances.length],
        };

        const tier = loyaltyTiers[i % loyaltyTiers.length];
        if (tier) rec.loyaltyTier = tier;

        await ctx.db.insert("reservations", rec);
      }

      console.log(
        `Seeded ${config.slug}: ${occupiedRoomNumbers.length + vacantRoomNumbers.length} rooms, ` +
          `${config.numArrivals} arrivals, ${config.numDepartures} departures, ` +
          `${config.attendantNames.length} attendants`,
      );
    }
  },
});
