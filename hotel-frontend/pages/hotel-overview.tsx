import { For, createMemo } from "solid-js";
import {
  BedDouble,
  Users,
  Sparkles,
  ClipboardCheck,
  AlertCircle,
  LogIn,
  LogOut,
  Crown,
  Clock,
  DollarSign,
} from "lucide-solid";
import { KpiCard, KpiCardGrid } from "../components/kpi-card";
import type { HotelStore } from "../state/hotel-store";
import {
  useProperty,
  useDailySummaries,
  useArrivals,
  useDepartures,
  useRoomStats,
  useHousekeepingProgress,
  useGroupsByProperty,
} from "../data/hotel-data-service";

// ---------------------------------------------------------------------------
// Demo data – Marriott Dallas Downtown (340 rooms, ~78% occ)
// Will be replaced with Convex queries later.
// ---------------------------------------------------------------------------

const DEMO_KPIS = {
  occupancy: { value: 78.5, target: 74.0, delta: 6.1, trend: [72, 74, 76, 78, 77, 79, 78.5] },
  adr: { value: 189, target: 182, delta: 3.8, trend: [185, 187, 186, 190, 188, 191, 189] },
  revpar: { value: 148.37, target: 134.68, delta: 10.2, trend: [133, 138, 141, 148, 145, 151, 148] },
  revenue: { value: 52340, target: 48200, delta: 8.6, trend: [48000, 49500, 51000, 52000, 51500, 53000, 52340] },
};

const DEMO_ARRIVALS = { total: 47, vip: 4, early: 6 };
const DEMO_DEPARTURES = { total: 38, lateCheckouts: 5, outstandingBalance: 3 };

const DEMO_QUICK_STATS = [
  { label: "Rooms Available", value: 73, icon: BedDouble },
  { label: "Groups In-House", value: 3, icon: Users },
  { label: "HK Pending", value: 42, icon: ClipboardCheck },
  { label: "Guest Satisfaction", value: "4.3", icon: Sparkles },
];

type AlertSeverity = "red" | "yellow" | "blue";

interface AlertItem {
  id: string;
  severity: AlertSeverity;
  message: string;
  tab?: string;
}

const DEMO_ALERTS: AlertItem[] = [
  { id: "a1", severity: "red", message: "3 rooms OOO on floor 12", tab: "operations" },
  { id: "a2", severity: "yellow", message: "Invoice from CleanTex 5% over contract", tab: "invoices" },
  { id: "a3", severity: "blue", message: "Compression date in 12 days — review pricing", tab: "revenue" },
  { id: "a4", severity: "red", message: "2 guest complaints pending response", tab: "operations" },
  { id: "a5", severity: "yellow", message: "Group IBM cutoff in 3 days — 68% pickup", tab: "groups" },
];

const SEVERITY_DOT: Record<AlertSeverity, string> = {
  red: "bg-red-9",
  yellow: "bg-yellow-9",
  blue: "bg-blue-9",
};

// ---------------------------------------------------------------------------
// HotelOverview
// ---------------------------------------------------------------------------

export function HotelOverview(props: { store: HotelStore }) {
  // ── Resolve property slug → Convex property _id ──────────────────────
  const property = useProperty(() => props.store.state.selectedPropertySlug);
  const propertyId = createMemo(() => property()?._id ?? null);

  // ── Live data hooks (return undefined until Convex responds) ─────────
  const liveSummaries = useDailySummaries(propertyId);
  const liveArrivals = useArrivals(propertyId);
  const liveDepartures = useDepartures(propertyId);
  const liveRoomStats = useRoomStats(propertyId);
  const liveHkProgress = useHousekeepingProgress(propertyId);
  const liveGroups = useGroupsByProperty(propertyId);

  // ── KPIs: map latest daily summary → UI shape, fallback to demo ──────
  const kpis = createMemo(() => {
    const rows = liveSummaries();
    if (!rows || rows.length === 0) return DEMO_KPIS;

    // Sort by date descending, take last 7 for trend and latest for current
    const sorted = [...rows].sort((a, b) => a.date.localeCompare(b.date));
    const latest = sorted[sorted.length - 1];
    const trendRows = sorted.slice(-7);

    const pctDelta = (actual: number, budget: number) =>
      budget !== 0 ? Math.round(((actual - budget) / budget) * 1000) / 10 : 0;

    return {
      occupancy: {
        value: latest.occupancy,
        target: latest.budgetOccupancy,
        delta: pctDelta(latest.occupancy, latest.budgetOccupancy),
        trend: trendRows.map((r) => r.occupancy),
      },
      adr: {
        value: latest.adr,
        target: latest.budgetAdr,
        delta: pctDelta(latest.adr, latest.budgetAdr),
        trend: trendRows.map((r) => r.adr),
      },
      revpar: {
        value: latest.revpar,
        target: latest.budgetRevpar,
        delta: pctDelta(latest.revpar, latest.budgetRevpar),
        trend: trendRows.map((r) => r.revpar),
      },
      revenue: {
        value: latest.revenue,
        target: latest.budgetRevenue,
        delta: pctDelta(latest.revenue, latest.budgetRevenue),
        trend: trendRows.map((r) => r.revenue),
      },
    };
  });

  // ── Arrivals: count total, VIPs, early arrivals ──────────────────────
  const arrivals = createMemo(() => {
    const rows = liveArrivals();
    if (!rows) return DEMO_ARRIVALS;
    return {
      total: rows.length,
      vip: rows.filter((r) => !!r.vipTier).length,
      early: rows.filter((r) => !!r.eta && r.eta < "12:00").length,
    };
  });

  // ── Departures: count total, late checkouts, outstanding balances ────
  const departures = createMemo(() => {
    const rows = liveDepartures();
    if (!rows) return DEMO_DEPARTURES;
    return {
      total: rows.length,
      lateCheckouts: rows.filter((r) => !!r.checkoutTime && r.checkoutTime > "11:00").length,
      outstandingBalance: rows.filter((r) => (r.balance ?? 0) > 0).length,
    };
  });

  // ── Quick Stats: derive from room stats + HK progress + groups ───────
  const quickStats = createMemo(() => {
    const stats = liveRoomStats();
    const hk = liveHkProgress();
    const groups = liveGroups();

    // If none of the live sources are available, use demo data
    if (!stats && !hk && !groups) return DEMO_QUICK_STATS;

    const roomsAvailable = stats
      ? (stats["vacant-clean"] ?? 0) + (stats["inspected"] ?? 0)
      : DEMO_QUICK_STATS[0].value;

    const groupsInHouse = groups
      ? groups.filter((g) => g.stage === "definite" || g.stage === "actualized").length
      : DEMO_QUICK_STATS[1].value;

    const hkPending = hk
      ? hk.dirty + hk.inProgress
      : DEMO_QUICK_STATS[2].value;

    // Guest satisfaction has no Convex source yet – keep demo value
    const satisfaction = DEMO_QUICK_STATS[3].value;

    return [
      { label: "Rooms Available", value: roomsAvailable, icon: BedDouble },
      { label: "Groups In-House", value: groupsInHouse, icon: Users },
      { label: "HK Pending", value: hkPending, icon: ClipboardCheck },
      { label: "Guest Satisfaction", value: satisfaction, icon: Sparkles },
    ];
  });

  // Alerts – no Convex table, keep hardcoded
  const alerts = () => DEMO_ALERTS;

  return (
    <div class="space-y-6">
      {/* ── KPI Cards ────────────────────────────────────────────── */}
      <section>
        <h2 class="mb-3 text-sm font-semibold uppercase tracking-wide text-[var(--dls-text-secondary)]">
          Key Performance
        </h2>
        <KpiCardGrid>
          <KpiCard
            label="Occupancy"
            value={kpis().occupancy.value}
            unit="%"
            target={kpis().occupancy.target}
            delta={kpis().occupancy.delta}
            trend={kpis().occupancy.trend}
          />
          <KpiCard
            label="ADR"
            value={kpis().adr.value}
            prefix="$"
            target={kpis().adr.target}
            delta={kpis().adr.delta}
            trend={kpis().adr.trend}
          />
          <KpiCard
            label="RevPAR"
            value={kpis().revpar.value}
            prefix="$"
            target={kpis().revpar.target}
            delta={kpis().revpar.delta}
            trend={kpis().revpar.trend}
          />
          <KpiCard
            label="Revenue"
            value={kpis().revenue.value.toLocaleString()}
            prefix="$"
            target={kpis().revenue.target}
            delta={kpis().revenue.delta}
            trend={kpis().revenue.trend}
          />
        </KpiCardGrid>
      </section>

      {/* ── Today's Activity ─────────────────────────────────────── */}
      <section>
        <h2 class="mb-3 text-sm font-semibold uppercase tracking-wide text-[var(--dls-text-secondary)]">
          Today's Activity
        </h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Arrivals */}
          <div class="rounded-[var(--dls-radius)] border border-[var(--dls-border)] bg-[var(--dls-surface)] p-4">
            <div class="flex items-center gap-2 text-sm font-semibold text-[var(--dls-text-primary)]">
              <LogIn class="size-4 text-green-11" />
              Arrivals
            </div>
            <div class="mt-3 grid grid-cols-3 gap-2 text-center">
              <div>
                <div class="text-2xl font-bold text-[var(--dls-text-primary)]">{arrivals().total}</div>
                <div class="text-xs text-[var(--dls-text-secondary)]">Total</div>
              </div>
              <div>
                <div class="flex items-center justify-center gap-1 text-2xl font-bold text-[var(--dls-text-primary)]">
                  <Crown class="size-4 text-yellow-9" />
                  {arrivals().vip}
                </div>
                <div class="text-xs text-[var(--dls-text-secondary)]">VIP</div>
              </div>
              <div>
                <div class="flex items-center justify-center gap-1 text-2xl font-bold text-[var(--dls-text-primary)]">
                  <Clock class="size-4 text-blue-9" />
                  {arrivals().early}
                </div>
                <div class="text-xs text-[var(--dls-text-secondary)]">Early</div>
              </div>
            </div>
          </div>

          {/* Departures */}
          <div class="rounded-[var(--dls-radius)] border border-[var(--dls-border)] bg-[var(--dls-surface)] p-4">
            <div class="flex items-center gap-2 text-sm font-semibold text-[var(--dls-text-primary)]">
              <LogOut class="size-4 text-red-11" />
              Departures
            </div>
            <div class="mt-3 grid grid-cols-3 gap-2 text-center">
              <div>
                <div class="text-2xl font-bold text-[var(--dls-text-primary)]">{departures().total}</div>
                <div class="text-xs text-[var(--dls-text-secondary)]">Total</div>
              </div>
              <div>
                <div class="flex items-center justify-center gap-1 text-2xl font-bold text-[var(--dls-text-primary)]">
                  <Clock class="size-4 text-yellow-9" />
                  {departures().lateCheckouts}
                </div>
                <div class="text-xs text-[var(--dls-text-secondary)]">Late C/O</div>
              </div>
              <div>
                <div class="flex items-center justify-center gap-1 text-2xl font-bold text-[var(--dls-text-primary)]">
                  <DollarSign class="size-4 text-red-9" />
                  {departures().outstandingBalance}
                </div>
                <div class="text-xs text-[var(--dls-text-secondary)]">Open Balance</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Alerts & Attention Items ─────────────────────────────── */}
      <section>
        <h2 class="mb-3 text-sm font-semibold uppercase tracking-wide text-[var(--dls-text-secondary)]">
          <span class="inline-flex items-center gap-1.5">
            <AlertCircle class="size-4" />
            Alerts &amp; Attention Items
          </span>
        </h2>
        <div class="rounded-[var(--dls-radius)] border border-[var(--dls-border)] bg-[var(--dls-surface)] divide-y divide-[var(--dls-border)]">
          <For each={alerts()}>
            {(alert) => (
              <button
                class="flex w-full items-center gap-3 px-4 py-3 text-left text-sm transition-colors hover:bg-[var(--dls-sidebar)]"
                onClick={() => alert.tab && props.store.setTab(alert.tab as any)}
              >
                <span class={`inline-block size-2 shrink-0 rounded-full ${SEVERITY_DOT[alert.severity]}`} />
                <span class="text-[var(--dls-text-primary)]">{alert.message}</span>
              </button>
            )}
          </For>
        </div>
      </section>

      {/* ── Quick Stats ──────────────────────────────────────────── */}
      <section>
        <h2 class="mb-3 text-sm font-semibold uppercase tracking-wide text-[var(--dls-text-secondary)]">
          Quick Stats
        </h2>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
          <For each={quickStats()}>
            {(stat) => (
              <div class="rounded-[var(--dls-radius)] border border-[var(--dls-border)] bg-[var(--dls-surface)] p-4 text-center">
                <stat.icon class="mx-auto mb-1 size-5 text-[var(--dls-accent)]" />
                <div class="text-xl font-bold text-[var(--dls-text-primary)]">{stat.value}</div>
                <div class="text-xs text-[var(--dls-text-secondary)]">{stat.label}</div>
              </div>
            )}
          </For>
        </div>
      </section>
    </div>
  );
}
