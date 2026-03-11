import { RevenueChart } from "../components/revenue-chart";
import { RevenueBreakdown } from "../components/revenue-breakdown";
import { HeatmapCalendar } from "../components/heatmap-calendar";
import type { HotelStore } from "../state/hotel-store";

// ---------------------------------------------------------------------------
// HotelRevenue – Revenue tab page combining charts and summary stats
// ---------------------------------------------------------------------------

const SUMMARY_STATS = [
  { label: "Total Revenue", value: "$1.42M", sub: "MTD", delta: "+8.6%", positive: true },
  { label: "Room Revenue %", value: "72%", sub: "of total", delta: "+1.2%", positive: true },
  { label: "F&B Revenue %", value: "18%", sub: "of total", delta: "-0.5%", positive: false },
  { label: "YoY Growth", value: "+6.4%", sub: "vs. 2024", delta: "+2.1pp", positive: true },
];

export function HotelRevenue(props: { store: HotelStore }) {
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
        <RevenueChart data={[]} />
      </section>

      {/* ── Middle: Breakdown + Summary Stats (2-col grid) ────── */}
      <section class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left: Stacked bar breakdown */}
        <RevenueBreakdown data={[]} />

        {/* Right: Summary stat cards */}
        <div class="rounded-[var(--dls-radius)] border border-[var(--dls-border)] bg-[var(--dls-surface)] p-4">
          <h3 class="mb-3 text-sm font-semibold text-[var(--dls-text-primary)]">
            Revenue Summary
          </h3>
          <div class="grid grid-cols-2 gap-3">
            {SUMMARY_STATS.map((stat) => (
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
        <HeatmapCalendar month={0} year={2025} data={[]} />
      </section>
    </div>
  );
}

export default HotelRevenue;
