import { For } from "solid-js";
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

// ---------------------------------------------------------------------------
// Forecasting tab – key indicators, charts, demand calendar, market events
// ---------------------------------------------------------------------------

// Key indicator cards data
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

// Key insights
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

// Upcoming market events
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

export function HotelForecasting(props: { store: HotelStore }) {
  return (
    <div class="space-y-6">
      {/* ── Key Indicators ───────────────────────────────────────── */}
      <section>
        <h2 class="mb-3 text-sm font-semibold uppercase tracking-wide text-[var(--dls-text-secondary)]">
          Key Indicators
        </h2>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
          <For each={KEY_INDICATORS}>
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
          <For each={UPCOMING_EVENTS}>
            {(event) => (
              <div class="flex items-center gap-3 px-4 py-3">
                <span class={`inline-block size-2.5 shrink-0 rounded-full ${IMPACT_STYLES[event.impact].dot}`} />
                <div class="flex-1 min-w-0">
                  <div class="text-sm font-medium text-[var(--dls-text-primary)]">{event.name}</div>
                  <div class="text-xs text-[var(--dls-text-secondary)]">{event.dates}</div>
                </div>
                <span class={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${IMPACT_STYLES[event.impact].badge}`}>
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
