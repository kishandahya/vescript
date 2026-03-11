import { createSignal, createMemo, For, Show } from "solid-js";
import { ChevronLeft, ChevronRight } from "lucide-solid";

// ---------------------------------------------------------------------------
// Interactive demand calendar – occupancy by day with market events
// ---------------------------------------------------------------------------

interface DemandCalendarProps {
  initialMonth?: number; // 0-11, default 0 (January)
  initialYear?: number;
}

interface DayData {
  day: number;
  occ: number;
  adr: number;
  events: string[];
}

// Hardcoded January 2025 demand data
const DEMO_DEMAND_JAN: DayData[] = [
  { day: 1, occ: 62, adr: 165, events: ["New Year's Day"] },
  { day: 2, occ: 58, adr: 155, events: [] },
  { day: 3, occ: 72, adr: 175, events: [] },
  { day: 4, occ: 68, adr: 170, events: [] },
  { day: 5, occ: 60, adr: 158, events: [] },
  { day: 6, occ: 75, adr: 178, events: [] },
  { day: 7, occ: 77, adr: 180, events: [] },
  { day: 8, occ: 74, adr: 176, events: [] },
  { day: 9, occ: 76, adr: 179, events: [] },
  { day: 10, occ: 88, adr: 195, events: ["Dallas Auto Show (Day 1)"] },
  { day: 11, occ: 91, adr: 205, events: ["Dallas Auto Show (Day 2)"] },
  { day: 12, occ: 89, adr: 198, events: ["Dallas Auto Show (Day 3)"] },
  { day: 13, occ: 85, adr: 190, events: ["Dallas Auto Show (Day 4)"] },
  { day: 14, occ: 78, adr: 182, events: ["Dallas Auto Show (Final)"] },
  { day: 15, occ: 73, adr: 174, events: [] },
  { day: 16, occ: 79, adr: 183, events: [] },
  { day: 17, occ: 76, adr: 178, events: [] },
  { day: 18, occ: 65, adr: 162, events: [] },
  { day: 19, occ: 61, adr: 157, events: [] },
  { day: 20, occ: 80, adr: 185, events: ["MLK Day"] },
  { day: 21, occ: 78, adr: 181, events: [] },
  { day: 22, occ: 76, adr: 177, events: [] },
  { day: 23, occ: 74, adr: 175, events: [] },
  { day: 24, occ: 82, adr: 188, events: [] },
  { day: 25, occ: 69, adr: 168, events: [] },
  { day: 26, occ: 63, adr: 160, events: [] },
  { day: 27, occ: 77, adr: 180, events: [] },
  { day: 28, occ: 75, adr: 176, events: [] },
  { day: 29, occ: 73, adr: 174, events: [] },
  { day: 30, occ: 71, adr: 172, events: [] },
  { day: 31, occ: 79, adr: 183, events: [] },
];

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function occColor(occ: number): string {
  if (occ >= 95) return "bg-green-9 text-white";
  if (occ >= 85) return "bg-green-7 text-white";
  if (occ >= 75) return "bg-green-5 text-green-12";
  if (occ >= 65) return "bg-green-3 text-green-12";
  if (occ >= 50) return "bg-yellow-3 text-yellow-12";
  return "bg-red-3 text-red-12";
}

function eventDotColor(eventName: string): string {
  if (eventName.includes("Auto Show")) return "bg-red-9";
  if (eventName.includes("MLK") || eventName.includes("New Year")) return "bg-blue-9";
  return "bg-yellow-9";
}

export function DemandCalendar(props: DemandCalendarProps) {
  const [month, setMonth] = createSignal(props.initialMonth ?? 0);
  const [year, setYear] = createSignal(props.initialYear ?? 2025);
  const [selectedDay, setSelectedDay] = createSignal<number | null>(null);

  const monthLabel = createMemo(() => {
    const date = new Date(year(), month(), 1);
    return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  });

  // First day of month (0=Sun)
  const firstDow = createMemo(() => new Date(year(), month(), 1).getDay());
  const daysInMonth = createMemo(() => new Date(year(), month() + 1, 0).getDate());

  // Day data map for quick lookup
  const dayMap = createMemo(() => {
    const map = new Map<number, DayData>();
    // Only have January 2025 data, use it if matching, else generate
    if (month() === 0 && year() === 2025) {
      DEMO_DEMAND_JAN.forEach((d) => map.set(d.day, d));
    } else {
      for (let d = 1; d <= daysInMonth(); d++) {
        const dow = new Date(year(), month(), d).getDay();
        const isWeekend = dow === 0 || dow === 6;
        const occ = isWeekend ? 58 + Math.round(Math.random() * 15) : 70 + Math.round(Math.random() * 15);
        map.set(d, { day: d, occ, adr: 155 + Math.round(occ * 0.4), events: [] });
      }
    }
    return map;
  });

  // Build calendar grid (6 rows × 7 cols)
  const calendarCells = createMemo(() => {
    const cells: (number | null)[] = [];
    // Leading empty cells
    for (let i = 0; i < firstDow(); i++) cells.push(null);
    // Day cells
    for (let d = 1; d <= daysInMonth(); d++) cells.push(d);
    // Trailing empty cells
    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
  });

  const prevMonth = () => {
    if (month() === 0) { setMonth(11); setYear((y) => y - 1); }
    else setMonth((m) => m - 1);
    setSelectedDay(null);
  };

  const nextMonth = () => {
    if (month() === 11) { setMonth(0); setYear((y) => y + 1); }
    else setMonth((m) => m + 1);
    setSelectedDay(null);
  };

  const selectedData = createMemo(() => {
    const d = selectedDay();
    return d !== null ? dayMap().get(d) ?? null : null;
  });

  const today = new Date();
  const isToday = (day: number) =>
    day === today.getDate() && month() === today.getMonth() && year() === today.getFullYear();

  return (
    <div class="rounded-[var(--dls-radius)] border border-[var(--dls-border)] bg-[var(--dls-surface)] p-4">
      {/* Month nav */}
      <div class="flex items-center justify-between mb-3">
        <button
          class="rounded p-1 hover:bg-[var(--dls-sidebar)] transition-colors"
          onClick={prevMonth}
          aria-label="Previous month"
        >
          <ChevronLeft class="size-4 text-[var(--dls-text-secondary)]" />
        </button>
        <h3 class="text-sm font-semibold text-[var(--dls-text-primary)]">{monthLabel()}</h3>
        <button
          class="rounded p-1 hover:bg-[var(--dls-sidebar)] transition-colors"
          onClick={nextMonth}
          aria-label="Next month"
        >
          <ChevronRight class="size-4 text-[var(--dls-text-secondary)]" />
        </button>
      </div>

      {/* Weekday headers */}
      <div class="grid grid-cols-7 gap-1 mb-1">
        <For each={WEEKDAYS}>
          {(wd) => (
            <div class="text-center text-[10px] font-medium text-[var(--dls-text-secondary)] py-1">
              {wd}
            </div>
          )}
        </For>
      </div>

      {/* Calendar grid */}
      <div class="grid grid-cols-7 gap-1">
        <For each={calendarCells()}>
          {(cell) => {
            if (cell === null) return <div class="h-14" />;
            const data = () => dayMap().get(cell);
            return (
              <button
                class={`relative h-14 rounded-md flex flex-col items-center justify-center transition-all cursor-pointer border ${
                  selectedDay() === cell
                    ? "border-blue-9 ring-1 ring-blue-9"
                    : "border-transparent hover:border-[var(--dls-border)]"
                } ${data() ? occColor(data()!.occ) : "bg-slate-2"}`}
                onClick={() => setSelectedDay(selectedDay() === cell ? null : cell)}
              >
                <span class={`text-xs leading-none ${isToday(cell) ? "font-bold" : "font-medium"}`}>
                  {cell}
                </span>
                <Show when={data()}>
                  <span class="text-[9px] mt-0.5 leading-none opacity-80">
                    {data()!.occ}%
                  </span>
                </Show>
                {/* Event dots */}
                <Show when={data()?.events?.length}>
                  <div class="flex gap-0.5 mt-0.5">
                    <For each={data()!.events}>
                      {(ev) => <span class={`inline-block size-1.5 rounded-full ${eventDotColor(ev)}`} />}
                    </For>
                  </div>
                </Show>
              </button>
            );
          }}
        </For>
      </div>

      {/* Detail popover */}
      <Show when={selectedData()}>
        <div class="mt-3 rounded-[var(--dls-radius)] border border-[var(--dls-border)] bg-[var(--dls-sidebar)] p-3">
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm font-semibold text-[var(--dls-text-primary)]">
              {monthLabel().split(" ")[0]} {selectedData()!.day}
            </span>
            <button
              class="text-xs text-[var(--dls-text-secondary)] hover:text-[var(--dls-text-primary)]"
              onClick={() => setSelectedDay(null)}
            >
              ✕
            </button>
          </div>
          <div class="grid grid-cols-3 gap-3 text-center">
            <div>
              <div class="text-lg font-bold text-[var(--dls-text-primary)]">{selectedData()!.occ}%</div>
              <div class="text-[10px] text-[var(--dls-text-secondary)]">Occupancy</div>
            </div>
            <div>
              <div class="text-lg font-bold text-[var(--dls-text-primary)]">${selectedData()!.adr}</div>
              <div class="text-[10px] text-[var(--dls-text-secondary)]">ADR Forecast</div>
            </div>
            <div>
              <div class="text-lg font-bold text-[var(--dls-text-primary)]">
                ${Math.round((selectedData()!.occ / 100) * selectedData()!.adr)}
              </div>
              <div class="text-[10px] text-[var(--dls-text-secondary)]">RevPAR</div>
            </div>
          </div>
          <Show when={selectedData()!.events.length > 0}>
            <div class="mt-2 pt-2 border-t border-[var(--dls-border)]">
              <div class="text-[10px] font-medium text-[var(--dls-text-secondary)] mb-1">Events</div>
              <For each={selectedData()!.events}>
                {(ev) => (
                  <div class="flex items-center gap-1.5 text-xs text-[var(--dls-text-primary)]">
                    <span class={`inline-block size-2 rounded-full ${eventDotColor(ev)}`} />
                    {ev}
                  </div>
                )}
              </For>
            </div>
          </Show>
        </div>
      </Show>
    </div>
  );
}
