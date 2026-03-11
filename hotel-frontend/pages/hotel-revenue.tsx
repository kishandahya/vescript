import { createMemo } from "solid-js";
import { RevenueChart } from "../components/revenue-chart";
import { RevenueBreakdown } from "../components/revenue-breakdown";
import { HeatmapCalendar } from "../components/heatmap-calendar";
import type { HotelStore } from "../state/hotel-store";
import {
  useProperty,
  useDailySummaries,
} from "../data/hotel-data-service";

// ---------------------------------------------------------------------------
// HotelRevenue – Revenue tab page combining charts and summary stats
// ---------------------------------------------------------------------------

// Hardcoded fallbacks – used when Convex data is unavailable
const FALLBACK_SUMMARY_STATS = [
  { label: "Total Revenue", value: "$1.42M", sub: "MTD", delta: "+8.6%", positive: true },
  { label: "Room Revenue %", value: "72%", sub: "of total", delta: "+1.2%", positive: true },
  { label: "F&B Revenue %", value: "18%", sub: "of total", delta: "-0.5%", positive: false },
  { label: "YoY Growth", value: "+6.4%", sub: "vs. 2024", delta: "+2.1pp", positive: true },
];

/** Format a number as a compact currency string (e.g. $1.42M, $52.3K). */
function fmtCurrency(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
  return `$${n.toFixed(0)}`;
}

/** Format a delta percentage with sign. */
function fmtDelta(pct: number): string {
  const sign = pct >= 0 ? "+" : "";
  return `${sign}${pct.toFixed(1)}%`;
}

export function HotelRevenue(props: { store: HotelStore }) {
  // Resolve property ID from the store's selected slug
  const propertySlug = () => props.store.state.selectedPropertySlug;
  const property = useProperty(propertySlug);
  const propertyId = () => property()?._id ?? null;

  // Wire Convex live queries
  const rawSummaries = useDailySummaries(propertyId);

  // ---------------------------------------------------------------------------
  // Derive summary stats from daily summaries (MTD aggregates with budget deltas)
  // ---------------------------------------------------------------------------
  const summaryStats = createMemo(() => {
    const data = rawSummaries();
    if (!data || data.length === 0) return FALLBACK_SUMMARY_STATS;

    // Use the latest record for MTD values
    const latest = data[data.length - 1];
    const mtdRevenue = latest.mtdRevenue;
    const mtdBudget = latest.mtdBudget;
    const revenueDelta = mtdBudget !== 0 ? ((mtdRevenue - mtdBudget) / mtdBudget) * 100 : 0;

    // Average occupancy across the period vs budget
    const avgOcc = data.reduce((s: number, d: any) => s + d.occupancy, 0) / data.length;
    const avgBudgetOcc = data.reduce((s: number, d: any) => s + d.budgetOccupancy, 0) / data.length;
    const occDelta = avgOcc - avgBudgetOcc;

    // Average ADR vs budget
    const avgAdr = data.reduce((s: number, d: any) => s + d.adr, 0) / data.length;
    const avgBudgetAdr = data.reduce((s: number, d: any) => s + d.budgetAdr, 0) / data.length;
    const adrDelta = avgBudgetAdr !== 0 ? ((avgAdr - avgBudgetAdr) / avgBudgetAdr) * 100 : 0;

    // Average RevPAR vs budget
    const avgRevpar = data.reduce((s: number, d: any) => s + d.revpar, 0) / data.length;
    const avgBudgetRevpar = data.reduce((s: number, d: any) => s + d.budgetRevpar, 0) / data.length;
    const revparDelta = avgBudgetRevpar !== 0 ? ((avgRevpar - avgBudgetRevpar) / avgBudgetRevpar) * 100 : 0;

    return [
      {
        label: "Total Revenue",
        value: fmtCurrency(mtdRevenue),
        sub: "MTD",
        delta: fmtDelta(revenueDelta),
        positive: revenueDelta >= 0,
      },
      {
        label: "Occupancy",
        value: `${avgOcc.toFixed(1)}%`,
        sub: "avg",
        delta: fmtDelta(occDelta),
        positive: occDelta >= 0,
      },
      {
        label: "ADR",
        value: `$${avgAdr.toFixed(0)}`,
        sub: "avg",
        delta: fmtDelta(adrDelta),
        positive: adrDelta >= 0,
      },
      {
        label: "RevPAR",
        value: `$${avgRevpar.toFixed(0)}`,
        sub: "avg",
        delta: fmtDelta(revparDelta),
        positive: revparDelta >= 0,
      },
    ];
  });

  // ---------------------------------------------------------------------------
  // Map daily summaries → RevenueChart data (date, actual, budget)
  // ---------------------------------------------------------------------------
  const revenueChartData = createMemo(() => {
    const data = rawSummaries();
    if (!data || data.length === 0) return [];
    return data.map((d: any) => ({
      date: d.date,
      actual: d.revenue,
      budget: d.budgetRevenue,
    }));
  });

  // ---------------------------------------------------------------------------
  // RevenueBreakdown – keep empty; night audit data would be needed for
  // room/F&B/ancillary split. Chart has internal demo fallback.
  // ---------------------------------------------------------------------------
  const breakdownData = createMemo(() => [] as { date: string; room: number; fnb: number; ancillary: number; other: number }[]);

  // ---------------------------------------------------------------------------
  // Map daily summaries → HeatmapCalendar data (day-of-month, occupancy)
  // ---------------------------------------------------------------------------
  const heatmapData = createMemo(() => {
    const data = rawSummaries();
    if (!data || data.length === 0) return [];
    return data.map((d: any) => {
      const dayNum = new Date(d.date).getDate();
      return { day: dayNum, occupancy: Math.round(d.occupancy) };
    });
  });

  return (
    <div class="space-y-6">
      {/* ── Section Header ─────────────────────────────────────── */}
      <section>
        <h2 class="mb-3 text-sm font-semibold uppercase tracking-wide text-[var(--dls-text-secondary)]">
          Revenue Performance
        </h2>
      </section>

      {/* ── Top: Revenue vs Budget line chart (full width) ────── */}
      <section>
        <RevenueChart data={revenueChartData()} />
      </section>

      {/* ── Middle: Breakdown + Summary Stats (2-col grid) ────── */}
      <section class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left: Stacked bar breakdown */}
        <RevenueBreakdown data={breakdownData()} />

        {/* Right: Summary stat cards */}
        <div class="rounded-[var(--dls-radius)] border border-[var(--dls-border)] bg-[var(--dls-surface)] p-4">
          <h3 class="mb-3 text-sm font-semibold text-[var(--dls-text-primary)]">
            Revenue Summary
          </h3>
          <div class="grid grid-cols-2 gap-3">
            {summaryStats().map((stat) => (
              <div class="rounded-[var(--dls-radius)] border border-[var(--dls-border)] bg-[var(--dls-sidebar)] p-3">
                <div class="text-xs text-[var(--dls-text-secondary)]">{stat.label}</div>
                <div class="mt-1 text-xl font-bold text-[var(--dls-text-primary)]">{stat.value}</div>
                <div class="mt-0.5 flex items-center gap-1.5 text-xs">
                  <span class="text-[var(--dls-text-secondary)]">{stat.sub}</span>
                  <span class={stat.positive ? "text-green-11 font-medium" : "text-red-11 font-medium"}>
                    {stat.delta}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Bottom: Occupancy Heatmap Calendar ─────────────────── */}
      <section>
        <HeatmapCalendar month={0} year={2025} data={heatmapData()} />
      </section>
    </div>
  );
}

export default HotelRevenue;
