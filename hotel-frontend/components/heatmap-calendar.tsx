import { createMemo, createSignal, For, Show } from "solid-js";

// ---------------------------------------------------------------------------
// HeatmapCalendar – Month calendar grid colored by occupancy level
// ---------------------------------------------------------------------------

interface HeatmapCalendarProps {
  month: number; // 0-11
  year: number;
  data: { day: number; occupancy: number; events?: string[] }[];
}

const DEMO_JANUARY_2025: HeatmapCalendarProps["data"] = Array.from({ length: 31 }, (_, i) => {
  const day = i + 1;
  const d = new Date(2025, 0, day);
  const dow = d.getDay();
  const isWeekend = dow === 0 || dow === 6;
  const base = isWeekend ? 82 : 72;
  const occ = Math.round(base + Math.sin(day * 0.4) * 8 + (day > 15 ? 4 : 0));
  const events: string[] = [];
  if (day === 6) events.push("Tech Conference");
  if (day === 7) events.push("Tech Conference");
  if (day === 18) events.push("Auto Show");
  if (day === 19) events.push("Auto Show");
  if (day === 25) events.push("MLK Weekend Travel");
  return { day, occupancy: Math.min(occ, 96), events };
});

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function occColor(occ: number): string {
  if (occ >= 95) return "bg-green-9";
  if (occ >= 85) return "bg-green-7";
  if (occ >= 75) return "bg-green-5";
  if (occ >= 65) return "bg-green-3";
  if (occ >= 50) return "bg-yellow-3";
  return "bg-red-3";
}

function occTextColor(occ: number): string {
  return occ >= 85 ? "text-white" : "text-[var(--dls-text-primary)]";
}

export function HeatmapCalendar(props: HeatmapCalendarProps) {
  const [month, setMonth] = createSignal(props.month);
  const [year, setYear] = createSignal(props.year);
  const [hoverDay, setHoverDay] = createSignal<number | null>(null);

  const data = () => props.data.length ? props.data : DEMO_JANUARY_2025;

  const dataMap = createMemo(() => {
    const map = new Map<number, { day: number; occupancy: number; events?: string[] }>();
    for (const d of data()) {
      map.set(d.day, d);
    }
    return map;
  });

  const firstDayOfWeek = createMemo(() => new Date(year(), month(), 1).getDay());
  const daysInMonth = createMemo(() => new Date(year(), month() + 1, 0).getDate());

  const calendarCells = createMemo(() => {
    const cells: (number | null)[] = [];
    // Leading empty cells
    for (let i = 0; i < firstDayOfWeek(); i++) cells.push(null);
    // Day cells
    for (let d = 1; d <= daysInMonth(); d++) cells.push(d);
    // Trailing empty cells to fill last row
    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
  });

  const prevMonth = () => {
    if (month() === 0) { setMonth(11); setYear(year() - 1); }
    else setMonth(month() - 1);
  };

  const nextMonth = () => {
    if (month() === 11) { setMonth(0); setYear(year() + 1); }
    else setMonth(month() + 1);
  };

  return (
    <div class="rounded-[var(--dls-radius)] border border-[var(--dls-border)] bg-[var(--dls-surface)] p-4">
      {/* Month header with navigation */}
      <div class="mb-3 flex items-center justify-between">
        <button
          class="rounded p-1 text-[var(--dls-text-secondary)] hover:bg-[var(--dls-sidebar)] transition-colors"
          onClick={prevMonth}
          aria-label="Previous month"
        >
          <svg class="size-4" viewBox="0 0 16 16" fill="none"><path d="M10 4l-4 4 4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" /></svg>
        </button>
        <h3 class="text-sm font-semibold text-[var(--dls-text-primary)]">
          {MONTH_NAMES[month()]} {year()} — Occupancy Heatmap
        </h3>
        <button
          class="rounded p-1 text-[var(--dls-text-secondary)] hover:bg-[var(--dls-sidebar)] transition-colors"
          onClick={nextMonth}
          aria-label="Next month"
        >
          <svg class="size-4" viewBox="0 0 16 16" fill="none"><path d="M6 4l4 4-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" /></svg>
        </button>
      </div>

      {/* Color scale legend */}
      <div class="mb-3 flex items-center gap-2 text-xs text-[var(--dls-text-secondary)]">
        <span>Low</span>
        <span class="inline-block h-3 w-4 rounded-sm bg-red-3" />
        <span class="inline-block h-3 w-4 rounded-sm bg-yellow-3" />
        <span class="inline-block h-3 w-4 rounded-sm bg-green-3" />
        <span class="inline-block h-3 w-4 rounded-sm bg-green-5" />
        <span class="inline-block h-3 w-4 rounded-sm bg-green-7" />
        <span class="inline-block h-3 w-4 rounded-sm bg-green-9" />
        <span>High</span>
      </div>

      {/* Weekday headers */}
      <div class="grid grid-cols-7 gap-1 mb-1">
        <For each={WEEKDAYS}>
          {(day) => (
            <div class="text-center text-xs font-medium text-[var(--dls-text-secondary)] py-1">
              {day}
            </div>
          )}
        </For>
      </div>

      {/* Calendar grid */}
      <div class="relative grid grid-cols-7 gap-1">
        <For each={calendarCells()}>
          {(day) => {
            if (day === null) {
              return <div class="aspect-square" />;
            }
            const entry = () => dataMap().get(day);
            const occ = () => entry()?.occupancy ?? 0;
            const hasEvents = () => (entry()?.events?.length ?? 0) > 0;
            const isHovered = () => hoverDay() === day;

            return (
              <div
                class={`relative aspect-square rounded-sm flex flex-col items-center justify-center cursor-default transition-all ${occColor(occ())} ${occTextColor(occ())} ${isHovered() ? "ring-2 ring-blue-9 z-10" : ""}`}
                onMouseEnter={() => setHoverDay(day)}
                onMouseLeave={() => setHoverDay(null)}
              >
                <span class="text-xs font-semibold leading-none">{day}</span>
                <span class="text-[9px] leading-none mt-0.5 opacity-80">{occ()}%</span>
                <Show when={hasEvents()}>
                  <span class="absolute bottom-0.5 right-0.5 size-1.5 rounded-full bg-orange-9" />
                </Show>

                {/* Tooltip */}
                <Show when={isHovered() && entry()}>
                  <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 z-20 rounded bg-[var(--dls-surface)] border border-[var(--dls-border)] shadow-md px-2 py-1.5 min-w-[110px] text-left pointer-events-none">
                    <div class="text-[10px] font-semibold text-[var(--dls-text-primary)]">
                      {MONTH_NAMES[month()]} {day}
                    </div>
                    <div class="text-[10px] text-[var(--dls-text-secondary)]">
                      Occupancy: {occ()}%
                    </div>
                    <div class="text-[10px] text-[var(--dls-text-secondary)]">
                      ADR: ${Math.round(140 + occ() * 0.6)}
                    </div>
                    <Show when={hasEvents()}>
                      <div class="mt-0.5 text-[9px] text-orange-11 font-medium">
                        <For each={entry()!.events!}>
                          {(evt) => <div>📅 {evt}</div>}
                        </For>
                      </div>
                    </Show>
                  </div>
                </Show>
              </div>
            );
          }}
        </For>
      </div>
    </div>
  );
}

export default HeatmapCalendar;
