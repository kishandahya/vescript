import { For } from "solid-js";
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
            value={DEMO_KPIS.occupancy.value}
            unit="%"
            target={DEMO_KPIS.occupancy.target}
            delta={DEMO_KPIS.occupancy.delta}
            trend={DEMO_KPIS.occupancy.trend}
          />
          <KpiCard
            label="ADR"
            value={DEMO_KPIS.adr.value}
            prefix="$"
            target={DEMO_KPIS.adr.target}
            delta={DEMO_KPIS.adr.delta}
            trend={DEMO_KPIS.adr.trend}
          />
          <KpiCard
            label="RevPAR"
            value={DEMO_KPIS.revpar.value}
            prefix="$"
            target={DEMO_KPIS.revpar.target}
            delta={DEMO_KPIS.revpar.delta}
            trend={DEMO_KPIS.revpar.trend}
          />
          <KpiCard
            label="Revenue"
            value={DEMO_KPIS.revenue.value.toLocaleString()}
            prefix="$"
            target={DEMO_KPIS.revenue.target}
            delta={DEMO_KPIS.revenue.delta}
            trend={DEMO_KPIS.revenue.trend}
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
                <div class="text-2xl font-bold text-[var(--dls-text-primary)]">{DEMO_ARRIVALS.total}</div>
                <div class="text-xs text-[var(--dls-text-secondary)]">Total</div>
              </div>
              <div>
                <div class="flex items-center justify-center gap-1 text-2xl font-bold text-[var(--dls-text-primary)]">
                  <Crown class="size-4 text-yellow-9" />
                  {DEMO_ARRIVALS.vip}
                </div>
                <div class="text-xs text-[var(--dls-text-secondary)]">VIP</div>
              </div>
              <div>
                <div class="flex items-center justify-center gap-1 text-2xl font-bold text-[var(--dls-text-primary)]">
                  <Clock class="size-4 text-blue-9" />
                  {DEMO_ARRIVALS.early}
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
                <div class="text-2xl font-bold text-[var(--dls-text-primary)]">{DEMO_DEPARTURES.total}</div>
                <div class="text-xs text-[var(--dls-text-secondary)]">Total</div>
              </div>
              <div>
                <div class="flex items-center justify-center gap-1 text-2xl font-bold text-[var(--dls-text-primary)]">
                  <Clock class="size-4 text-yellow-9" />
                  {DEMO_DEPARTURES.lateCheckouts}
                </div>
                <div class="text-xs text-[var(--dls-text-secondary)]">Late C/O</div>
              </div>
              <div>
                <div class="flex items-center justify-center gap-1 text-2xl font-bold text-[var(--dls-text-primary)]">
                  <DollarSign class="size-4 text-red-9" />
                  {DEMO_DEPARTURES.outstandingBalance}
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
          <For each={DEMO_ALERTS}>
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
          <For each={DEMO_QUICK_STATS}>
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
