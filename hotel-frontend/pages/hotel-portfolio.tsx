import { createSignal, createMemo, For } from "solid-js";
import { Building2, ArrowUpDown, Filter } from "lucide-solid";
import { KpiCard, KpiCardGrid } from "../components/kpi-card";
import { PropertyCard } from "../components/property-card";
import type { HotelStore } from "../state/hotel-store";
import { useProperties, useRegions, useAllLatestSummaries } from "../data/hotel-data-service";

// ---------------------------------------------------------------------------
// Demo data – 15 properties across 3 regions (fallback)
// ---------------------------------------------------------------------------

interface DemoProperty {
  name: string;
  brand: string;
  market: string;
  totalRooms: number;
  occupancy: number;
  adr: number;
  revpar: number;
  revenue: number;
  occDelta: number;
  adrDelta: number;
  revparDelta: number;
  trend: number[];
  region: string;
}

const DEMO_PROPERTIES: DemoProperty[] = [
  { name: "Marriott Dallas Downtown", brand: "Marriott", market: "Dallas", totalRooms: 340, occupancy: 78.5, adr: 189, revpar: 148, revenue: 52340, occDelta: 6.1, adrDelta: 3.8, revparDelta: 10.2, trend: [72, 74, 76, 78, 77, 79, 78.5], region: "texas-south-central" },
  { name: "Hilton Houston Galleria", brand: "Hilton", market: "Houston", totalRooms: 280, occupancy: 75.2, adr: 175, revpar: 131.6, revenue: 38500, occDelta: 2.1, adrDelta: -1.2, revparDelta: 0.8, trend: [73, 74, 75, 74, 76, 75, 75.2], region: "texas-south-central" },
  { name: "Courtyard Austin Airport", brand: "Marriott (Select)", market: "Austin", totalRooms: 154, occupancy: 82.1, adr: 129, revpar: 105.9, revenue: 16800, occDelta: 4.5, adrDelta: 2.1, revparDelta: 6.8, trend: [78, 80, 81, 82, 83, 82, 82.1], region: "texas-south-central" },
  { name: "Hampton Inn San Antonio", brand: "Hilton (Select)", market: "San Antonio", totalRooms: 169, occupancy: 71.3, adr: 118, revpar: 84.1, revenue: 14600, occDelta: -5.2, adrDelta: -3.1, revparDelta: -8.1, trend: [74, 73, 72, 71, 70, 71, 71.3], region: "texas-south-central" },
  { name: "Fairfield Inn Dallas Plano", brand: "Marriott (Economy)", market: "Dallas", totalRooms: 110, occupancy: 73.8, adr: 99, revpar: 73.1, revenue: 8200, occDelta: -4.8, adrDelta: -2.5, revparDelta: -7.1, trend: [76, 75, 74, 74, 73, 74, 73.8], region: "texas-south-central" },
  { name: "AC Hotel Fort Worth", brand: "Marriott (Lifestyle)", market: "Fort Worth", totalRooms: 252, occupancy: 76.4, adr: 168, revpar: 128.4, revenue: 33200, occDelta: 1.2, adrDelta: 0.8, revparDelta: 2.0, trend: [74, 75, 76, 77, 76, 76, 76.4], region: "texas-south-central" },
  { name: "Holiday Inn Express Houston EC", brand: "IHG (Select)", market: "Houston", totalRooms: 124, occupancy: 79.5, adr: 112, revpar: 89.0, revenue: 11200, occDelta: 3.2, adrDelta: 1.5, revparDelta: 4.8, trend: [77, 78, 79, 80, 79, 80, 79.5], region: "texas-south-central" },
  { name: "IHG Hotel Nashville", brand: "IHG", market: "Nashville", totalRooms: 304, occupancy: 80.1, adr: 195, revpar: 156.2, revenue: 48800, occDelta: 5.5, adrDelta: 4.2, revparDelta: 10.0, trend: [76, 78, 79, 80, 81, 80, 80.1], region: "southeast" },
  { name: "Residence Inn Atlanta", brand: "Marriott (Extended)", market: "Atlanta", totalRooms: 132, occupancy: 85.2, adr: 135, revpar: 115.0, revenue: 15600, occDelta: 2.8, adrDelta: 1.0, revparDelta: 3.9, trend: [83, 84, 85, 85, 86, 85, 85.2], region: "southeast" },
  { name: "Sheraton New Orleans", brand: "Marriott", market: "New Orleans", totalRooms: 1100, occupancy: 70.2, adr: 165, revpar: 115.8, revenue: 131000, occDelta: -1.5, adrDelta: 0.5, revparDelta: -1.0, trend: [68, 69, 70, 71, 70, 70, 70.2], region: "southeast" },
  { name: "DoubleTree Charlotte", brand: "Hilton", market: "Charlotte", totalRooms: 187, occupancy: 74.8, adr: 155, revpar: 115.9, revenue: 22300, occDelta: 1.8, adrDelta: -0.5, revparDelta: 1.2, trend: [73, 74, 75, 74, 75, 75, 74.8], region: "southeast" },
  { name: "Hilton Garden Inn Orlando", brand: "Hilton", market: "Orlando", totalRooms: 198, occupancy: 83.5, adr: 142, revpar: 118.6, revenue: 24100, occDelta: 4.0, adrDelta: 2.5, revparDelta: 6.7, trend: [80, 81, 82, 83, 84, 83, 83.5], region: "southeast" },
  { name: "Hyatt Regency Denver", brand: "Hyatt", market: "Denver", totalRooms: 450, occupancy: 80.3, adr: 205, revpar: 164.6, revenue: 76200, occDelta: 7.2, adrDelta: 5.1, revparDelta: 12.8, trend: [75, 77, 78, 80, 81, 80, 80.3], region: "mountain-west" },
  { name: "Embassy Suites Phoenix", brand: "Hilton", market: "Phoenix", totalRooms: 232, occupancy: 77.1, adr: 178, revpar: 137.2, revenue: 32800, occDelta: 2.5, adrDelta: 1.8, revparDelta: 4.4, trend: [75, 76, 77, 77, 78, 77, 77.1], region: "mountain-west" },
  { name: "Westin Austin Downtown", brand: "Marriott (Premium)", market: "Austin", totalRooms: 366, occupancy: 79.8, adr: 215, revpar: 171.6, revenue: 64600, occDelta: 3.8, adrDelta: 2.2, revparDelta: 6.1, trend: [77, 78, 79, 80, 80, 80, 79.8], region: "mountain-west" },
];

const DEMO_REGIONS = [
  { value: "all", label: "All Regions" },
  { value: "texas-south-central", label: "Texas / South Central" },
  { value: "southeast", label: "Southeast" },
  { value: "mountain-west", label: "Mountain / West" },
] as const;

type SortOption =
  | "name"
  | "revpar-high"
  | "revpar-low"
  | "occupancy"
  | "variance-worst";

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "name", label: "Sort by Name" },
  { value: "revpar-high", label: "Sort by RevPAR (high)" },
  { value: "revpar-low", label: "Sort by RevPAR (low)" },
  { value: "occupancy", label: "Sort by Occupancy" },
  { value: "variance-worst", label: "Sort by Variance (worst first)" },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function avg(arr: number[]): number {
  return arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
}

function sortProperties(list: DemoProperty[], sort: SortOption): DemoProperty[] {
  const sorted = [...list];
  switch (sort) {
    case "name":
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
    case "revpar-high":
      return sorted.sort((a, b) => b.revpar - a.revpar);
    case "revpar-low":
      return sorted.sort((a, b) => a.revpar - b.revpar);
    case "occupancy":
      return sorted.sort((a, b) => b.occupancy - a.occupancy);
    case "variance-worst":
      return sorted.sort((a, b) => a.revparDelta - b.revparDelta);
    default:
      return sorted;
  }
}

// ---------------------------------------------------------------------------
// HotelPortfolio
// ---------------------------------------------------------------------------

export function HotelPortfolio(props: { store: HotelStore }) {
  const [region, setRegion] = createSignal<string>("all");
  const [sort, setSort] = createSignal<SortOption>("name");
  const [viewMode, setViewMode] = createSignal<"grid" | "list">("grid");

  // ── Convex live data ────────────────────────────────────────────────
  const liveProperties = useProperties();
  const liveSummaries = useAllLatestSummaries();
  const liveRegions = useRegions();

  // Build region dropdown from Convex or fallback
  const regions = createMemo(() => {
    const lr = liveRegions();
    if (lr && lr.length > 0) {
      return [
        { value: "all", label: "All Regions" },
        ...lr.map((r: any) => ({ value: r.slug as string, label: r.name as string })),
      ];
    }
    return DEMO_REGIONS as unknown as { value: string; label: string }[];
  });

  // Join properties with their latest summaries into DemoProperty shape
  const allProperties = createMemo((): DemoProperty[] => {
    const props = liveProperties();
    const summaries = liveSummaries();
    if (!props || props.length === 0) return DEMO_PROPERTIES;

    // Build lookup by propertyId from summary data
    const summaryBySlug = new Map<string, any>();
    if (summaries) {
      for (const s of summaries) {
        summaryBySlug.set(s.propertySlug, s);
      }
    }

    return props.map((p: any): DemoProperty => {
      const s = summaryBySlug.get(p.slug);
      const occ = s?.occupancy ?? 0;
      const adr = s?.adr ?? 0;
      const revpar = s?.revpar ?? 0;
      const revenue = s?.revenue ?? 0;
      const budgetOcc = s?.budgetOccupancy ?? occ;
      const budgetAdr = s?.budgetAdr ?? adr;
      const budgetRevpar = s?.budgetRevpar ?? revpar;
      return {
        name: p.name,
        brand: p.brand,
        market: p.market,
        totalRooms: p.totalRooms,
        occupancy: occ,
        adr,
        revpar,
        revenue,
        occDelta: budgetOcc ? +((occ - budgetOcc) / budgetOcc * 100).toFixed(1) : 0,
        adrDelta: budgetAdr ? +((adr - budgetAdr) / budgetAdr * 100).toFixed(1) : 0,
        revparDelta: budgetRevpar ? +((revpar - budgetRevpar) / budgetRevpar * 100).toFixed(1) : 0,
        trend: [occ], // single-point trend from latest summary
        region: p.regionId ?? "",
      };
    });
  });

  // Filtered list
  const filtered = createMemo(() => {
    const r = region();
    const all = allProperties();
    if (r === "all") return all;
    return all.filter((p) => p.region === r);
  });

  // Sorted list
  const properties = createMemo(() => sortProperties(filtered(), sort()));

  // Portfolio aggregates (from filtered set)
  const portfolioOcc = createMemo(() => +avg(filtered().map((p) => p.occupancy)).toFixed(1));
  const portfolioAdr = createMemo(() => +avg(filtered().map((p) => p.adr)).toFixed(0));
  const portfolioRevpar = createMemo(() => +avg(filtered().map((p) => p.revpar)).toFixed(1));
  const portfolioRevenue = createMemo(() => filtered().reduce((s, p) => s + p.revenue, 0));
  const portfolioOccDelta = createMemo(() => +avg(filtered().map((p) => p.occDelta)).toFixed(1));
  const portfolioAdrDelta = createMemo(() => +avg(filtered().map((p) => p.adrDelta)).toFixed(1));
  const portfolioRevparDelta = createMemo(() => +avg(filtered().map((p) => p.revparDelta)).toFixed(1));
  const portfolioRevDelta = createMemo(() => {
    const deltas = filtered().map((p) => p.revparDelta);
    return +(deltas.reduce((s, d) => s + d, 0) / (deltas.length || 1)).toFixed(1);
  });

  // Aggregate trend (average across properties per day index)
  const portfolioTrend = createMemo(() => {
    const f = filtered();
    if (!f.length) return [];
    const len = f[0].trend.length;
    return Array.from({ length: len }, (_, i) =>
      +avg(f.map((p) => p.trend[i] ?? 0)).toFixed(1),
    );
  });

  // Total property count (for "Showing X of Y" label)
  const totalPropertyCount = createMemo(() => allProperties().length);

  const selectClass =
    "rounded-[var(--dls-radius)] border border-[var(--dls-border)] bg-[var(--dls-surface)] px-3 py-1.5 text-sm text-[var(--dls-text-primary)] outline-none focus:ring-1 focus:ring-[var(--dls-accent)]";

  return (
    <div class="space-y-6">
      {/* ── Portfolio KPI Summary ──────────────────────────────── */}
      <section>
        <h2 class="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-[var(--dls-text-secondary)]">
          <Building2 class="size-4" />
          Portfolio Performance
        </h2>
        <KpiCardGrid>
          <KpiCard
            label="Portfolio Occ%"
            value={portfolioOcc()}
            unit="%"
            delta={portfolioOccDelta()}
            trend={portfolioTrend()}
          />
          <KpiCard
            label="Avg ADR"
            value={portfolioAdr()}
            prefix="$"
            delta={portfolioAdrDelta()}
          />
          <KpiCard
            label="Avg RevPAR"
            value={portfolioRevpar()}
            prefix="$"
            delta={portfolioRevparDelta()}
          />
          <KpiCard
            label="Total Revenue"
            value={portfolioRevenue().toLocaleString()}
            prefix="$"
            delta={portfolioRevDelta()}
          />
        </KpiCardGrid>
      </section>

      {/* ── Controls Bar ──────────────────────────────────────── */}
      <section class="flex flex-wrap items-center gap-3">
        {/* Region filter */}
        <div class="flex items-center gap-1.5">
          <Filter class="size-4 text-[var(--dls-text-secondary)]" />
          <select
            class={selectClass}
            value={region()}
            onChange={(e) => setRegion(e.currentTarget.value)}
          >
            <For each={regions()}>{(r) => <option value={r.value}>{r.label}</option>}</For>
          </select>
        </div>

        {/* Sort */}
        <div class="flex items-center gap-1.5">
          <ArrowUpDown class="size-4 text-[var(--dls-text-secondary)]" />
          <select
            class={selectClass}
            value={sort()}
            onChange={(e) => setSort(e.currentTarget.value as SortOption)}
          >
            <For each={SORT_OPTIONS}>{(s) => <option value={s.value}>{s.label}</option>}</For>
          </select>
        </div>

        {/* View toggle */}
        <div class="ml-auto flex items-center gap-1 rounded-[var(--dls-radius)] border border-[var(--dls-border)] p-0.5">
          <button
            class={`rounded px-2.5 py-1 text-xs font-medium transition-colors ${
              viewMode() === "grid"
                ? "bg-[var(--dls-accent)] text-white"
                : "text-[var(--dls-text-secondary)] hover:text-[var(--dls-text-primary)]"
            }`}
            onClick={() => setViewMode("grid")}
          >
            Grid
          </button>
          <button
            class={`rounded px-2.5 py-1 text-xs font-medium transition-colors ${
              viewMode() === "list"
                ? "bg-[var(--dls-accent)] text-white"
                : "text-[var(--dls-text-secondary)] hover:text-[var(--dls-text-primary)]"
            }`}
            onClick={() => setViewMode("list")}
          >
            List
          </button>
        </div>
      </section>

      {/* ── Property Grid ─────────────────────────────────────── */}
      <section>
        <div class="mb-2 text-xs text-[var(--dls-text-secondary)]">
          Showing {properties().length} of {totalPropertyCount()} properties
        </div>
        <div
          class={
            viewMode() === "grid"
              ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
              : "flex flex-col gap-3"
          }
        >
          <For each={properties()}>
            {(p) => (
              <PropertyCard
                name={p.name}
                brand={p.brand}
                market={p.market}
                totalRooms={p.totalRooms}
                occupancy={p.occupancy}
                adr={p.adr}
                revpar={p.revpar}
                revenue={p.revenue}
                occDelta={p.occDelta}
                adrDelta={p.adrDelta}
                revparDelta={p.revparDelta}
                trend={p.trend}
                onClick={() => {
                  /* navigate to property dashboard in the future */
                }}
              />
            )}
          </For>
        </div>
      </section>
    </div>
  );
}

export default HotelPortfolio;
