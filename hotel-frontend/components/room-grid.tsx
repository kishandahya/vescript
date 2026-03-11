import { createSignal, createMemo, For, Show } from "solid-js";
import { Search } from "lucide-solid";
import { RoomCell } from "./room-cell";
import type { HotelStore } from "../state/hotel-store";
import type { RoomStatus } from "../data/hotel-types";

// ---------------------------------------------------------------------------
// Demo data generator – 340 rooms, floors 2–18, ~20 rooms per floor
// ---------------------------------------------------------------------------

interface DemoRoom {
  number: string;
  floor: number;
  status: RoomStatus;
  guestName?: string;
  isVip?: boolean;
  hasSpecialRequests?: boolean;
  lateCheckout?: boolean;
}

/** Seeded PRNG for deterministic demo data. */
function seededRand(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

const GUEST_NAMES = [
  "James Wilson", "Maria Garcia", "Robert Johnson", "Sarah Chen", "David Kim",
  "Emily Brown", "Michael Davis", "Lisa Anderson", "Thomas Martinez", "Jennifer Lee",
  "Christopher White", "Amanda Harris", "Daniel Clark", "Jessica Lewis", "Matthew Robinson",
  "Ashley Walker", "Andrew Hall", "Stephanie Allen", "Joshua Young", "Nicole King",
];

function generateRooms(): DemoRoom[] {
  const rand = seededRand(42);
  const rooms: DemoRoom[] = [];
  const statusWeights: [RoomStatus, number][] = [
    ["occupied", 0.78], ["vacant-clean", 0.09], ["vacant-dirty", 0.07],
    ["due-out", 0.02], ["due-in", 0.02], ["ooo", 0.01], ["inspected", 0.01],
  ];

  for (let floor = 2; floor <= 18; floor++) {
    const count = floor <= 3 ? 16 : 20;
    for (let i = 1; i <= count; i++) {
      const roomNum = `${floor}${String(i).padStart(2, "0")}`;
      const r = rand();
      let cumulative = 0;
      let status: RoomStatus = "occupied";
      for (const [s, w] of statusWeights) {
        cumulative += w;
        if (r <= cumulative) { status = s; break; }
      }
      const room: DemoRoom = { number: roomNum, floor, status };
      if (status === "occupied" || status === "due-out") {
        room.guestName = GUEST_NAMES[Math.floor(rand() * GUEST_NAMES.length)];
        room.isVip = rand() < 0.08;
        room.hasSpecialRequests = rand() < 0.15;
        room.lateCheckout = status === "due-out" ? rand() < 0.3 : false;
      }
      rooms.push(room);
    }
  }
  return rooms;
}

const ALL_ROOMS = generateRooms();

// ---------------------------------------------------------------------------
// Status chip config
// ---------------------------------------------------------------------------

const STATUS_CONFIG: { key: RoomStatus; label: string; dot: string }[] = [
  { key: "occupied", label: "Occupied", dot: "bg-green-9" },
  { key: "vacant-clean", label: "Available", dot: "bg-blue-9" },
  { key: "vacant-dirty", label: "Dirty", dot: "bg-yellow-9" },
  { key: "due-out", label: "Due Out", dot: "bg-orange-9" },
  { key: "due-in", label: "Due In", dot: "bg-cyan-9" },
  { key: "ooo", label: "OOO", dot: "bg-red-9" },
  { key: "inspected", label: "Inspected", dot: "bg-slate-9" },
];

// ---------------------------------------------------------------------------
// RoomGrid component
// ---------------------------------------------------------------------------

export function RoomGrid(props: { store: HotelStore }) {
  const [search, setSearch] = createSignal("");
  const [collapsedFloors, setCollapsedFloors] = createSignal<Set<number>>(new Set());

  const filteredRooms = createMemo(() => {
    const q = search().toLowerCase().trim();
    if (!q) return ALL_ROOMS;
    return ALL_ROOMS.filter(
      (r) => r.number.includes(q) || (r.guestName?.toLowerCase().includes(q) ?? false),
    );
  });

  const statusCounts = createMemo(() => {
    const counts: Record<string, number> = {};
    for (const cfg of STATUS_CONFIG) counts[cfg.key] = 0;
    for (const r of ALL_ROOMS) {
      if (counts[r.status] !== undefined) counts[r.status]++;
    }
    return counts;
  });

  const floors = createMemo(() => {
    const map = new Map<number, DemoRoom[]>();
    for (const r of filteredRooms()) {
      const list = map.get(r.floor) ?? [];
      list.push(r);
      map.set(r.floor, list);
    }
    return Array.from(map.entries()).sort(([a], [b]) => a - b);
  });

  const toggleFloor = (f: number) => {
    setCollapsedFloors((prev) => {
      const next = new Set(prev);
      next.has(f) ? next.delete(f) : next.add(f);
      return next;
    });
  };

  return (
    <div class="space-y-3">
      {/* ── Status summary bar ─────────────────────────────────── */}
      <div class="flex flex-wrap gap-2">
        <For each={STATUS_CONFIG}>
          {(cfg) => (
            <span class="inline-flex items-center gap-1.5 rounded-full border border-[var(--dls-border)] bg-[var(--dls-surface)] px-2.5 py-1 text-xs font-medium text-[var(--dls-text-primary)]">
              <span class={`inline-block size-2 rounded-full ${cfg.dot}`} />
              {statusCounts()[cfg.key]} {cfg.label}
            </span>
          )}
        </For>
      </div>

      {/* ── Search / filter ────────────────────────────────────── */}
      <div class="relative">
        <Search class="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-[var(--dls-text-secondary)]" />
        <input
          type="text"
          placeholder="Search room # or guest name…"
          class="w-full rounded-[var(--dls-radius)] border border-[var(--dls-border)] bg-[var(--dls-surface)] py-1.5 pl-8 pr-3 text-xs text-[var(--dls-text-primary)] placeholder:text-[var(--dls-text-secondary)] focus:outline-none focus:ring-1 focus:ring-[var(--dls-accent)]"
          value={search()}
          onInput={(e) => setSearch(e.currentTarget.value)}
        />
      </div>

      {/* ── Floor sections ─────────────────────────────────────── */}
      <For each={floors()}>
        {([floor, rooms]) => {
          const isCollapsed = () => collapsedFloors().has(floor);
          return (
            <div class="rounded-[var(--dls-radius)] border border-[var(--dls-border)] bg-[var(--dls-surface)]">
              <button
                class="flex w-full items-center justify-between px-3 py-2 text-left text-xs font-semibold text-[var(--dls-text-primary)] hover:bg-[var(--dls-sidebar)] transition-colors"
                onClick={() => toggleFloor(floor)}
              >
                <span>Floor {floor}</span>
                <span class="text-[var(--dls-text-secondary)]">
                  {rooms.length} rooms {isCollapsed() ? "▸" : "▾"}
                </span>
              </button>
              <Show when={!isCollapsed()}>
                <div class="flex flex-wrap gap-1.5 px-3 pb-3">
                  <For each={rooms}>
                    {(room) => (
                      <RoomCell
                        number={room.number}
                        status={room.status}
                        guestName={room.guestName}
                        isVip={room.isVip}
                        hasSpecialRequests={room.hasSpecialRequests}
                        lateCheckout={room.lateCheckout}
                      />
                    )}
                  </For>
                </div>
              </Show>
            </div>
          );
        }}
      </For>

      {/* ── Legend ──────────────────────────────────────────────── */}
      <div class="flex flex-wrap items-center gap-3 pt-1 text-[10px] text-[var(--dls-text-secondary)]">
        <For each={STATUS_CONFIG}>
          {(cfg) => (
            <span class="inline-flex items-center gap-1">
              <span class={`inline-block size-2 rounded-sm ${cfg.dot}`} />
              {cfg.label}
            </span>
          )}
        </For>
      </div>
    </div>
  );
}
