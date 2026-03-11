import { createMemo, For } from "solid-js";
import {
  Calendar,
  TrendingUp,
  AlertTriangle,
  Zap,
} from "lucide-solid";
import { ForecastChart } from "../components/forecast-chart";
import { BookingPace } from "../components/booking-pace";
import { DemandCalendar } from "../components/demand-calendar";
import type { HotelStore } from "../state/hotel-store";
import {
  useProperty,
  useForecasts,
  useMarketEvents,
} from "../data/hotel-data-service";

// ---------------------------------------------------------------------------
// Forecasting tab – key indicators, charts, demand calendar, market events
// ---------------------------------------------------------------------------

// Key indicator cards data (fallback)
const KEY_INDICATORS = [
  {
    label: "Compression Date",
    value: "Feb 14",
    icon: Zap,
    color: "text-red-11",
    bgColor: "bg-red-3",
    warning: true,
  },
  {
    label: "Need Date",
    value: "Jan 28",
    icon: AlertTriangle,
    color: "text-yellow-11",
    bgColor: "bg-yellow-3",
    warning: true,
  },
  {
    label: "30-Day Forecast Occ",
    value: "76.2%",
    icon: TrendingUp,
    color: "text-blue-11",
    bgColor: "bg-blue-3",
    warning: false,
  },
  {
    label: "30-Day Forecast ADR",
    value: "$187",
    icon: Calendar,
    color: "text-green-11",
    bgColor: "bg-green-3",
    warning: false,
  },
];

// Key insights (kept hardcoded – insights require AI analysis)
const KEY_INSIGHTS = [
  { text: "Booking pace 17.8% ahead of LY", type: "positive" as const },
  { text: "Dallas Auto Show (Jan 10-14) driving compression", type: "alert" as const },
  { text: "Group block: Acme Corp (200 rooms, Mar 15-18) — 58% of available inventory", type: "info" as const },
  { text: "ADR opportunity: $12 above comp set average", type: "positive" as const },
];

const INSIGHT_STYLES = {
  positive: "bg-green-3 text-green-11",
  alert: "bg-red-3 text-red-11",
  info: "bg-blue-3 text-blue-11",
};

// Upcoming market events (fallback)
const UPCOMING_EVENTS = [
  { name: "Dallas Auto Show", dates: "Jan 10-14", impact: "high" as const, estDemand: "+120 rooms/night" },
  { name: "North Texas Business Expo", dates: "Feb 20-22", impact: "medium" as const, estDemand: "+60 rooms/night" },
  { name: "Dallas Marathon", dates: "Mar 15-16", impact: "low" as const, estDemand: "+25 rooms/night" },
  { name: "Southwest Medical Conference", dates: "Apr 5-8", impact: "medium" as const, estDemand: "+80 rooms/night" },
];

const IMPACT_STYLES = {
  high: { dot: "bg-red-9", badge: "bg-red-3 text-red-11" },
  medium: { dot: "bg-yellow-9", badge: "bg-yellow-3 text-yellow-11" },
  low: { dot: "bg-blue-9", badge: "bg-blue-3 text-blue-11" },
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDateRange(start: string, end: string): string {
  const s = new Date(start);
  const e = new Date(end);
  const sMonth = s.toLocaleDateString("en-US", { month: "short" });
  const eMonth = e.toLocaleDateString("en-US", { month: "short" });
  if (sMonth === eMonth) {
    return `${sMonth} ${s.getDate()}-${e.getDate()}`;
  }
  return `${sMonth} ${s.getDate()} - ${eMonth} ${e.getDate()}`;
}

function mapImpact(demandImpact: string): "high" | "medium" | "low" {
  const lower = demandImpact.toLowerCase();
  if (lower === "high") return "high";
  if (lower === "medium") return "medium";
  return "low";
}

export function HotelForecasting(props: { store: HotelStore }) {
  // ── Resolve property from store slug ──────────────────────────────
  const liveProperty = useProperty(() => props.store.state.selectedPropertySlug);
  const propertyId = createMemo(() => {
    const p = liveProperty();
    return p ? (p._id as string) : null;
  });
  const propertyMarket = createMemo(() => {
    const p = liveProperty();
    return p ? (p.market as string) : null;
  });

  // ── Convex live data ──────────────────────────────────────────────
  const liveForecasts = useForecasts(propertyId);
  const liveMarketEvents = useMarketEvents(propertyMarket);

  // ── Derive key indicators from forecast data ──────────────────────
  const keyIndicators = createMemo(() => {
    const forecasts = liveForecasts();
    if (!forecasts || forecasts.length === 0) return KEY_INDICATORS;

    // Sort by date ascending
    const sorted = [...forecasts].sort((a, b) => a.date.localeCompare(b.date));

    // Compression date: first date where forecast >= 90% occupancy
    const compressionDay = sorted.find((f) => f.forecast >= 90);
    const compressionValue = compressionDay
      ? new Date(compressionDay.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })
      : KEY_INDICATORS[0].value;

    // Need date: first date where otbRooms < 50% of budget
    const needDay = sorted.find((f) => f.otbRooms < f.budget * 0.5);
    const needValue = needDay
      ? new Date(needDay.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })
      : KEY_INDICATORS[1].value;

    // 30-day forecast occupancy (average of first 30 days' forecast values)
    const first30 = sorted.slice(0, 30);
    const avg30Occ = first30.length
      ? +(first30.reduce((s, f) => s + f.forecast, 0) / first30.length).toFixed(1)
      : 76.2;

    // 30-day forecast ADR — not in forecast schema, keep hardcoded fallback
    const adrValue = KEY_INDICATORS[3].value;

    return [
      { ...KEY_INDICATORS[0], value: compressionValue, warning: !!compressionDay },
      { ...KEY_INDICATORS[1], value: needValue, warning: !!needDay },
      { ...KEY_INDICATORS[2], value: `${avg30Occ}%` },
      { ...KEY_INDICATORS[3], value: adrValue },
    ];
  });

  // ── Map market events from Convex ─────────────────────────────────
  const upcomingEvents = createMemo(() => {
    const raw = liveMarketEvents();
    if (!raw || raw.length === 0) return UPCOMING_EVENTS;
    return raw.map((evt: any) => ({
      name: evt.name as string,
      dates: formatDateRange(evt.startDate, evt.endDate),
      impact: mapImpact(evt.demandImpact),
      estDemand: evt.demandImpact === "high"
        ? "+120 rooms/night"
        : evt.demandImpact === "medium"
          ? "+60 rooms/night"
          : "+25 rooms/night",
    }));
  });

  return (
    <div class="space-y-6">
      {/* ── Key Indicators ───────────────────────────────────────── */}
      <section>
        <h2 class="mb-3 text-sm font-semibold uppercase tracking-wide text-[var(--dls-text-secondary)]">
          Key Indicators
        </h2>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
          <For each={keyIndicators()}>
            {(kpi) => (
              <div class="rounded-[var(--dls-radius)] border border-[var(--dls-border)] bg-[var(--dls-surface)] p-4 text-center">
                <div class={`mx-auto mb-2 flex size-8 items-center justify-center rounded-full ${kpi.bgColor}`}>
                  <kpi.icon class={`size-4 ${kpi.color}`} />
                </div>
                <div class={`text-xl font-bold ${kpi.warning ? kpi.color : "text-[var(--dls-text-primary)]"}`}>
                  {kpi.value}
                </div>
                <div class="text-xs text-[var(--dls-text-secondary)] mt-0.5">{kpi.label}</div>
              </div>
            )}
          </For>
        </div>
      </section>

      {/* ── 90-Day Forecast Chart ────────────────────────────────── */}
      <section>
        <h2 class="mb-3 text-sm font-semibold uppercase tracking-wide text-[var(--dls-text-secondary)]">
          Occupancy Forecast
        </h2>
        <ForecastChart />
      </section>

      {/* ── Two-column: Booking Pace + Insights ──────────────────── */}
      <section class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left: Booking Pace */}
        <div>
          <h2 class="mb-3 text-sm font-semibold uppercase tracking-wide text-[var(--dls-text-secondary)]">
            Booking Pace
          </h2>
          <BookingPace />
        </div>

        {/* Right: Key Insights */}
        <div>
          <h2 class="mb-3 text-sm font-semibold uppercase tracking-wide text-[var(--dls-text-secondary)]">
            Key Insights
          </h2>
          <div class="rounded-[var(--dls-radius)] border border-[var(--dls-border)] bg-[var(--dls-surface)] divide-y divide-[var(--dls-border)]">
            <For each={KEY_INSIGHTS}>
              {(insight) => (
                <div class="flex items-start gap-3 px-4 py-3">
                  <span class={`mt-0.5 inline-block size-2 shrink-0 rounded-full ${
                    insight.type === "positive" ? "bg-green-9" :
                    insight.type === "alert" ? "bg-red-9" : "bg-blue-9"
                  }`} />
                  <span class="text-sm text-[var(--dls-text-primary)]">{insight.text}</span>
                </div>
              )}
            </For>
          </div>
        </div>
      </section>

      {/* ── Demand Calendar ──────────────────────────────────────── */}
      <section>
        <h2 class="mb-3 text-sm font-semibold uppercase tracking-wide text-[var(--dls-text-secondary)]">
          Demand Calendar
        </h2>
        <DemandCalendar initialMonth={0} initialYear={2025} />
      </section>

      {/* ── Market Events Timeline ───────────────────────────────── */}
      <section>
        <h2 class="mb-3 text-sm font-semibold uppercase tracking-wide text-[var(--dls-text-secondary)]">
          <span class="inline-flex items-center gap-1.5">
            <Calendar class="size-4" />
            Upcoming Market Events
          </span>
        </h2>
        <div class="rounded-[var(--dls-radius)] border border-[var(--dls-border)] bg-[var(--dls-surface)] divide-y divide-[var(--dls-border)]">
          <For each={upcomingEvents()}>
            {(event) => (
              <div class="flex items-center gap-3 px-4 py-3">
                <span class={`inline-block size-2.5 shrink-0 rounded-full ${IMPACT_STYLES[event.impact as keyof typeof IMPACT_STYLES].dot}`} />
                <div class="flex-1 min-w-0">
                  <div class="text-sm font-medium text-[var(--dls-text-primary)]">{event.name}</div>
                  <div class="text-xs text-[var(--dls-text-secondary)]">{event.dates}</div>
                </div>
                <span class={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${IMPACT_STYLES[event.impact as keyof typeof IMPACT_STYLES].badge}`}>
                  {event.impact}
                </span>
                <span class="shrink-0 text-xs font-medium text-[var(--dls-text-secondary)]">
                  {event.estDemand}
                </span>
              </div>
            )}
          </For>
        </div>
      </section>
    </div>
  );
}
