import { For, createMemo } from "solid-js";
import {
  LogIn,
  LogOut,
  Star,
  Sparkles,
  Clock,
  AlertTriangle,
} from "lucide-solid";
import { RoomGrid } from "../components/room-grid";
import type { HotelStore } from "../state/hotel-store";
import {
  useProperty,
  useArrivals,
  useDepartures,
  useHousekeepingProgress,
} from "../data/hotel-data-service";
import type { Reservation } from "../data/hotel-types";

// ---------------------------------------------------------------------------
// Demo data – hardcoded arrivals, departures, housekeeping summary (fallbacks)
// ---------------------------------------------------------------------------

const DEMO_ARRIVALS = [
  { guest: "James Wilson", room: "1205", eta: "14:00", vip: true, group: null as string | null },
  { guest: "Maria Garcia", room: "805", eta: "15:00", vip: false, group: "Acme Corp" as string | null },
  { guest: "Robert Johnson", room: "1402", eta: "16:00", vip: false, group: null as string | null },
  { guest: "Sarah Chen", room: "610", eta: "14:30", vip: true, group: null as string | null },
  { guest: "David Kim", room: "903", eta: "17:00", vip: false, group: "Acme Corp" as string | null },
  { guest: "Emily Brown", room: "1501", eta: "15:30", vip: false, group: null as string | null },
  { guest: "Michael Davis", room: "712", eta: "18:00", vip: false, group: null as string | null },
  { guest: "Lisa Anderson", room: "1108", eta: "14:00", vip: true, group: null as string | null },
  { guest: "Thomas Martinez", room: "416", eta: "16:30", vip: false, group: "TechConf" as string | null },
  { guest: "Jennifer Lee", room: "1004", eta: "19:00", vip: false, group: null as string | null },
];

const DEMO_DEPARTURES = [
  { guest: "Christopher White", room: "1203", checkout: "11:00", balance: 0 },
  { guest: "Amanda Harris", room: "814", checkout: "12:00", balance: 45.5 },
  { guest: "Daniel Clark", room: "605", checkout: "11:00", balance: 0 },
  { guest: "Jessica Lewis", room: "1310", checkout: "13:00", balance: 0 },
  { guest: "Matthew Robinson", room: "907", checkout: "11:00", balance: 128.75 },
  { guest: "Ashley Walker", room: "502", checkout: "12:00", balance: 0 },
  { guest: "Andrew Hall", room: "1106", checkout: "11:00", balance: 0 },
  { guest: "Nicole King", room: "718", checkout: "14:00", balance: 22.0 },
];

const DEMO_HOUSEKEEPING = {
  clean: 168,
  dirty: 98,
  inProgress: 42,
  inspected: 12,
  rush: 5,
  total: 325,
};

// ---------------------------------------------------------------------------
// HotelOperations page
// ---------------------------------------------------------------------------

export function HotelOperations(props: { store: HotelStore }) {
  // Resolve property ID from the store's selected slug
  const propertySlug = () => props.store.state.selectedPropertySlug;
  const property = useProperty(propertySlug);
  const propertyId = () => property()?._id ?? null;

  // Wire Convex live queries
  const rawArrivals = useArrivals(propertyId);
  const rawDepartures = useDepartures(propertyId);
  const rawHkProgress = useHousekeepingProgress(propertyId);

  // Map Convex Reservation → arrivals view model, fallback to DEMO_ARRIVALS
  const arrivals = createMemo(() => {
    const data = rawArrivals();
    if (!data || data.length === 0) return DEMO_ARRIVALS;
    return data.map((r: Reservation) => ({
      guest: r.guestName,
      room: r.roomNumber,
      eta: r.eta ?? "",
      vip: !!r.vipTier,
      group: r.groupName ?? null,
    }));
  });

  // Map Convex Reservation → departures view model, fallback to DEMO_DEPARTURES
  const departures = createMemo(() => {
    const data = rawDepartures();
    if (!data || data.length === 0) return DEMO_DEPARTURES;
    return data.map((r: Reservation) => ({
      guest: r.guestName,
      room: r.roomNumber,
      checkout: r.checkoutTime ?? "",
      balance: r.balance ?? 0,
    }));
  });

  // Map Convex housekeeping progress → summary, fallback to DEMO_HOUSEKEEPING
  const housekeeping = createMemo(() => {
    const data = rawHkProgress();
    if (!data) return DEMO_HOUSEKEEPING;
    return {
      clean: data.clean,
      dirty: data.dirty,
      inProgress: data.inProgress,
      inspected: 0, // progress query returns clean (which includes inspected), compute separately if needed
      rush: data.rush,
      total: data.total,
    };
  });

  const hkCompletionPct = () => {
    const hk = housekeeping();
    return hk.total > 0
      ? Math.round(((hk.clean + hk.inspected) / hk.total) * 100)
      : 0;
  };

  return (
    <div class="flex flex-col lg:flex-row gap-4">
      {/* ── Room Grid (main area) ──────────────────────────────── */}
      <section class="flex-1 min-w-0 lg:w-[60%]">
        <h2 class="mb-3 text-sm font-semibold uppercase tracking-wide text-[var(--dls-text-secondary)]">
          Room Status
        </h2>
        <RoomGrid store={props.store} />
      </section>

      {/* ── Right sidebar ──────────────────────────────────────── */}
      <aside class="lg:w-[40%] space-y-4">
        {/* Arrivals Today */}
        <div class="rounded-[var(--dls-radius)] border border-[var(--dls-border)] bg-[var(--dls-surface)]">
          <div class="flex items-center gap-2 border-b border-[var(--dls-border)] px-4 py-2.5">
            <LogIn class="size-4 text-green-11" />
            <span class="text-sm font-semibold text-[var(--dls-text-primary)]">
              Arrivals Today
            </span>
            <span class="ml-auto rounded-full bg-green-3 px-2 py-0.5 text-xs font-medium text-green-11">
              {arrivals().length}
            </span>
          </div>
          <div class="divide-y divide-[var(--dls-border)]">
            <For each={arrivals()}>
              {(a) => (
                <div class="flex items-center gap-2 px-4 py-2 text-xs">
                  <span class="flex-1 truncate font-medium text-[var(--dls-text-primary)]">
                    {a.guest}
                    {a.vip && <Star class="ml-1 inline size-3 text-yellow-9 fill-yellow-9" />}
                  </span>
                  <span class="shrink-0 text-[var(--dls-text-secondary)]">#{a.room}</span>
                  <span class="shrink-0 flex items-center gap-0.5 text-[var(--dls-text-secondary)]">
                    <Clock class="size-3" />
                    {a.eta}
                  </span>
                  {a.group && (
                    <span class="shrink-0 rounded bg-blue-3 px-1.5 py-0.5 text-[10px] font-medium text-blue-11">
                      {a.group}
                    </span>
                  )}
                </div>
              )}
            </For>
          </div>
        </div>

        {/* Departures Today */}
        <div class="rounded-[var(--dls-radius)] border border-[var(--dls-border)] bg-[var(--dls-surface)]">
          <div class="flex items-center gap-2 border-b border-[var(--dls-border)] px-4 py-2.5">
            <LogOut class="size-4 text-red-11" />
            <span class="text-sm font-semibold text-[var(--dls-text-primary)]">
              Departures Today
            </span>
            <span class="ml-auto rounded-full bg-red-3 px-2 py-0.5 text-xs font-medium text-red-11">
              {departures().length}
            </span>
          </div>
          <div class="divide-y divide-[var(--dls-border)]">
            <For each={departures()}>
              {(d) => (
                <div class="flex items-center gap-2 px-4 py-2 text-xs">
                  <span class="flex-1 truncate font-medium text-[var(--dls-text-primary)]">
                    {d.guest}
                  </span>
                  <span class="shrink-0 text-[var(--dls-text-secondary)]">#{d.room}</span>
                  <span class="shrink-0 flex items-center gap-0.5 text-[var(--dls-text-secondary)]">
                    <Clock class="size-3" />
                    {d.checkout}
                  </span>
                  {d.balance > 0 && (
                    <span class="shrink-0 rounded bg-red-3 px-1.5 py-0.5 text-[10px] font-medium text-red-11">
                      ${d.balance.toFixed(2)}
                    </span>
                  )}
                </div>
              )}
            </For>
          </div>
        </div>

        {/* Housekeeping Summary */}
        <div class="rounded-[var(--dls-radius)] border border-[var(--dls-border)] bg-[var(--dls-surface)]">
          <div class="flex items-center gap-2 border-b border-[var(--dls-border)] px-4 py-2.5">
            <Sparkles class="size-4 text-blue-11" />
            <span class="text-sm font-semibold text-[var(--dls-text-primary)]">
              Housekeeping
            </span>
            <span class="ml-auto text-xs text-[var(--dls-text-secondary)]">
              {hkCompletionPct()}% complete
            </span>
          </div>
          <div class="px-4 py-3 space-y-3">
            {/* Progress bar */}
            <div class="h-2 w-full rounded-full bg-slate-3 overflow-hidden">
              <div
                class="h-full rounded-full bg-green-9 transition-all"
                style={{ width: `${hkCompletionPct()}%` }}
              />
            </div>

            {/* Stat rows */}
            <div class="grid grid-cols-2 gap-2 text-xs">
              <div class="flex items-center justify-between rounded bg-green-3 px-2.5 py-1.5">
                <span class="text-green-11 font-medium">Clean</span>
                <span class="font-bold text-green-12">{housekeeping().clean}</span>
              </div>
              <div class="flex items-center justify-between rounded bg-yellow-3 px-2.5 py-1.5">
                <span class="text-yellow-11 font-medium">Dirty</span>
                <span class="font-bold text-yellow-12">{housekeeping().dirty}</span>
              </div>
              <div class="flex items-center justify-between rounded bg-blue-3 px-2.5 py-1.5">
                <span class="text-blue-11 font-medium">In Progress</span>
                <span class="font-bold text-blue-12">{housekeeping().inProgress}</span>
              </div>
              <div class="flex items-center justify-between rounded bg-slate-3 px-2.5 py-1.5">
                <span class="text-slate-11 font-medium">Inspected</span>
                <span class="font-bold text-slate-12">{housekeeping().inspected}</span>
              </div>
            </div>

            {/* Rush requests */}
            {housekeeping().rush > 0 && (
              <div class="flex items-center gap-2 rounded bg-red-3 px-2.5 py-1.5 text-xs">
                <AlertTriangle class="size-3.5 text-red-11" />
                <span class="font-medium text-red-11">
                  {housekeeping().rush} rush request{housekeeping().rush !== 1 ? "s" : ""}
                </span>
              </div>
            )}
          </div>
        </div>
      </aside>
    </div>
  );
}
