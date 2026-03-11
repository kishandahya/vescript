import { createSignal, createMemo, For } from "solid-js";
import { FileText, AlertTriangle, Flag, Filter } from "lucide-solid";
import type { HotelStore } from "../state/hotel-store";
import { InvoiceList, type DemoInvoice } from "../components/invoice-list";
import { InvoiceDetailModal } from "../components/invoice-detail-modal";
import {
  useProperty,
  useInvoicesByProperty,
  useApproveInvoice,
  useFlagInvoice,
  useRouteInvoiceToRegional,
  useRejectInvoice,
} from "../data/hotel-data-service";

// ---------------------------------------------------------------------------
// Demo invoice data (17 invoices matching seedFinancial.ts) – fallback
// ---------------------------------------------------------------------------

const DEMO_INVOICES: DemoInvoice[] = [
  { id: "inv-1", vendor: "Sysco Food Services", invoiceNum: "SYS-2025-0142", date: "2025-01-10", amount: 8450, category: "F&B Supplies", status: "pending", flags: [], description: "Monthly food & beverage supplies", contractRate: 8200, budgetCategory: "F&B", budgetPct: 15 },
  { id: "inv-2", vendor: "CleanTex Linen Services", invoiceNum: "CTX-2025-0089", date: "2025-01-12", amount: 4200, category: "Linen", status: "pending", flags: ["over-contract"], description: "Monthly linen service - 5% above contracted rate of $4,000", contractRate: 4000, budgetCategory: "Supplies", budgetPct: 8 },
  { id: "inv-3", vendor: "Otis Elevator", invoiceNum: "OTS-Q1-2025", date: "2025-01-08", amount: 2800, category: "Maintenance", status: "pending", flags: [], description: "Quarterly elevator maintenance", contractRate: 2800, budgetCategory: "Maintenance", budgetPct: 5 },
  { id: "inv-4", vendor: "Herman Miller", invoiceNum: "HM-2025-0034", date: "2025-01-14", amount: 18500, category: "Furniture", status: "pending", flags: ["capital-approval"], description: "Lobby furniture replacement - requires capital approval", contractRate: null, budgetCategory: "CapEx", budgetPct: 42 },
  { id: "inv-5", vendor: "Oncor Electric", invoiceNum: "ONC-2025-01", date: "2025-01-15", amount: 12300, category: "Utilities", status: "pending", flags: ["unusual-amount"], description: "Monthly electric - 15% above 12-month average", contractRate: null, budgetCategory: "Utilities", budgetPct: 18 },
  { id: "inv-6", vendor: "Cintas Uniforms", invoiceNum: "CIN-2025-0156", date: "2025-01-11", amount: 1850, category: "Uniforms", status: "approved", flags: [], description: "Monthly uniform service", contractRate: 1850, budgetCategory: "Supplies", budgetPct: 3 },
  { id: "inv-7", vendor: "US Foods", invoiceNum: "USF-2025-0098", date: "2025-01-09", amount: 6800, category: "F&B Supplies", status: "pending", flags: [], description: "Bi-weekly food delivery", contractRate: 7000, budgetCategory: "F&B", budgetPct: 12 },
  { id: "inv-8", vendor: "Hilton Brand Standards", invoiceNum: "HBS-Q1-2025", date: "2025-01-05", amount: 3500, category: "Brand Fee", status: "approved", flags: [], description: "Quarterly brand standards compliance fee", contractRate: 3500, budgetCategory: "Fees", budgetPct: 6 },
  { id: "inv-9", vendor: "Johnson Controls HVAC", invoiceNum: "JC-2025-0045", date: "2025-01-13", amount: 4100, category: "Maintenance", status: "pending", flags: ["unusual-amount"], description: "Emergency HVAC repair - 40% above typical service call", contractRate: 2500, budgetCategory: "Maintenance", budgetPct: 7 },
  { id: "inv-10", vendor: "CenterPoint Energy", invoiceNum: "CPE-2025-01", date: "2025-01-15", amount: 9800, category: "Utilities", status: "pending", flags: [], description: "Monthly natural gas", contractRate: null, budgetCategory: "Utilities", budgetPct: 14 },
  { id: "inv-11", vendor: "Allied Universal Security", invoiceNum: "AUS-2025-0023", date: "2025-01-07", amount: 5200, category: "Security", status: "approved", flags: [], description: "Monthly security services", contractRate: 5200, budgetCategory: "Security", budgetPct: 9 },
  { id: "inv-12", vendor: "Sysco Food Services", invoiceNum: "SYS-2025-0198", date: "2025-01-10", amount: 12400, category: "F&B Supplies", status: "pending", flags: [], description: "Monthly food & beverage - convention property", contractRate: 12000, budgetCategory: "F&B", budgetPct: 16 },
  { id: "inv-13", vendor: "Xcel Energy", invoiceNum: "XCL-2025-01", date: "2025-01-15", amount: 18200, category: "Utilities", status: "pending", flags: ["unusual-amount"], description: "Monthly electric - 20% above average (cold snap)", contractRate: null, budgetCategory: "Utilities", budgetPct: 22 },
  { id: "inv-14", vendor: "Denver Water", invoiceNum: "DW-2025-01", date: "2025-01-14", amount: 4500, category: "Utilities", status: "pending", flags: [], description: "Monthly water/sewer", contractRate: null, budgetCategory: "Utilities", budgetPct: 5 },
  { id: "inv-15", vendor: "Hyatt Brand Services", invoiceNum: "HYT-Q1-2025", date: "2025-01-05", amount: 8900, category: "Brand Fee", status: "approved", flags: [], description: "Quarterly brand services fee", contractRate: 8900, budgetCategory: "Fees", budgetPct: 11 },
  { id: "inv-16", vendor: "ABM Facility Services", invoiceNum: "ABM-2025-0067", date: "2025-01-12", amount: 6200, category: "Facilities", status: "pending", flags: [], description: "Monthly facilities management", contractRate: 6200, budgetCategory: "Maintenance", budgetPct: 8 },
  { id: "inv-17", vendor: "Comcast Business", invoiceNum: "CMC-2025-01", date: "2025-01-15", amount: 3200, category: "Technology", status: "pending", flags: ["missing-po"], description: "Monthly internet/cable - no PO on file", contractRate: 3200, budgetCategory: "Technology", budgetPct: 4 },
];

// ---------------------------------------------------------------------------
// Filter options
// ---------------------------------------------------------------------------

const FILTER_OPTIONS = ["all", "pending", "approved", "flagged", "rejected"] as const;
type FilterOption = (typeof FILTER_OPTIONS)[number];

// ---------------------------------------------------------------------------
// HotelInvoicing – main invoicing tab page
// ---------------------------------------------------------------------------

export function HotelInvoicing(props: { store: HotelStore }) {
  const [selectedInvoice, setSelectedInvoice] = createSignal<DemoInvoice | null>(null);
  const [selectedIds, setSelectedIds] = createSignal<Set<string>>(new Set());
  const [filterStatus, setFilterStatus] = createSignal<FilterOption>("all");

  // ── Resolve property from store slug ──────────────────────────────
  const liveProperty = useProperty(() => props.store.state.selectedPropertySlug);
  const propertyId = createMemo(() => {
    const p = liveProperty();
    return p ? (p._id as string) : null;
  });

  // ── Convex live invoices ──────────────────────────────────────────
  const liveInvoices = useInvoicesByProperty(propertyId);

  // Map Convex Invoice rows → DemoInvoice shape the UI expects
  const invoices = createMemo((): DemoInvoice[] => {
    const raw = liveInvoices();
    if (!raw || raw.length === 0) return DEMO_INVOICES;
    return raw.map((inv: any): DemoInvoice => ({
      id: inv._id as string,
      vendor: inv.vendor,
      invoiceNum: inv.contractReference ?? inv._id,
      date: inv.dueDate,
      amount: inv.amount,
      category: inv.category,
      status: inv.status,
      flags: inv.flags ?? [],
      description: inv.description,
      contractRate: null,
      budgetCategory: inv.category,
      budgetPct: 0,
    }));
  });

  // ── Convex mutations ──────────────────────────────────────────────
  const approveInvoice = useApproveInvoice();
  const flagInvoice = useFlagInvoice();
  const routeInvoice = useRouteInvoiceToRegional();
  const rejectInvoice = useRejectInvoice();

  // ── Derived metrics ──────────────────────────────────────────────
  const pendingInvoices = createMemo(() => invoices().filter((i) => i.status === "pending"));
  const totalPending = createMemo(() => pendingInvoices().reduce((s, i) => s + i.amount, 0));
  const highPriority = createMemo(() => invoices().filter((i) => i.flags.includes("capital-approval")));
  const highPriorityTotal = createMemo(() => highPriority().reduce((s, i) => s + i.amount, 0));
  const anomalyInvoices = createMemo(() => invoices().filter((i) => i.flags.length > 0));
  const anomalyTotal = createMemo(() => anomalyInvoices().reduce((s, i) => s + i.amount, 0));

  // ── Filtered list ────────────────────────────────────────────────
  const filteredInvoices = createMemo(() => {
    const f = filterStatus();
    if (f === "all") return invoices();
    if (f === "flagged") return invoices().filter((i) => i.flags.length > 0);
    return invoices().filter((i) => i.status === f);
  });

  // ── Toggle selection ─────────────────────────────────────────────
  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // ── Helper: check if live data is active (ids are Convex _id strings) ─
  const isLive = createMemo(() => {
    const raw = liveInvoices();
    return raw && raw.length > 0;
  });

  // ── Batch + single actions ───────────────────────────────────────
  const applyAction = async (ids: string[], action: "approve" | "flag" | "reject" | "route") => {
    if (isLive()) {
      // Use Convex mutations – reactive subscription auto-refreshes the list
      const mutationMap = { approve: approveInvoice, flag: flagInvoice, reject: rejectInvoice, route: routeInvoice };
      const mutation = mutationMap[action];
      for (const id of ids) {
        try {
          await mutation({ invoiceId: id as any });
        } catch {
          // ignore individual failures
        }
      }
    }
    // Convex reactivity will update invoices() automatically
    setSelectedIds(new Set<string>());
  };

  const handleSingleAction = (action: "approve" | "flag" | "reject" | "route") => {
    const inv = selectedInvoice();
    if (!inv) return;
    applyAction([inv.id], action);
    setSelectedInvoice(null);
  };

  const handleBatchAction = (action: "approve" | "flag" | "route") => {
    const ids = [...selectedIds()];
    if (ids.length === 0) return;
    applyAction(ids, action);
  };

  return (
    <div class="space-y-6">
      {/* ── Summary cards ──────────────────────────────────────────── */}
      <section>
        <h2 class="mb-3 text-sm font-semibold uppercase tracking-wide text-[var(--dls-text-secondary)]">
          Invoice Summary
        </h2>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Total Pending */}
          <div class="rounded-[var(--dls-radius)] border border-[var(--dls-border)] bg-[var(--dls-surface)] p-4">
            <div class="flex items-center gap-2 text-sm font-semibold text-[var(--dls-text-primary)]">
              <FileText class="size-4 text-yellow-11" />
              Total Pending
            </div>
            <div class="mt-2 text-2xl font-bold text-[var(--dls-text-primary)]">
              ${totalPending().toLocaleString()}
            </div>
            <div class="text-xs text-[var(--dls-text-secondary)]">
              {pendingInvoices().length} invoices
            </div>
          </div>

          {/* High Priority */}
          <div class="rounded-[var(--dls-radius)] border border-[var(--dls-border)] bg-[var(--dls-surface)] p-4">
            <div class="flex items-center gap-2 text-sm font-semibold text-[var(--dls-text-primary)]">
              <Flag class="size-4 text-blue-11" />
              High Priority
            </div>
            <div class="mt-2 text-2xl font-bold text-[var(--dls-text-primary)]">
              ${highPriorityTotal().toLocaleString()}
            </div>
            <div class="text-xs text-[var(--dls-text-secondary)]">
              {highPriority().length} capital approval items
            </div>
          </div>

          {/* Anomalies */}
          <div class="rounded-[var(--dls-radius)] border border-[var(--dls-border)] bg-[var(--dls-surface)] p-4">
            <div class="flex items-center gap-2 text-sm font-semibold text-[var(--dls-text-primary)]">
              <AlertTriangle class="size-4 text-red-11" />
              Anomalies
            </div>
            <div class="mt-2 text-2xl font-bold text-[var(--dls-text-primary)]">
              ${anomalyTotal().toLocaleString()}
            </div>
            <div class="text-xs text-[var(--dls-text-secondary)]">
              {anomalyInvoices().length} flagged items
            </div>
          </div>
        </div>
      </section>

      {/* ── Action bar ─────────────────────────────────────────────── */}
      <section class="flex flex-wrap items-center gap-3">
        <button
          class="inline-flex items-center gap-1.5 rounded-[var(--dls-radius)] bg-green-9 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-green-10 disabled:opacity-40"
          disabled={selectedIds().size === 0}
          onClick={() => handleBatchAction("approve")}
        >
          Approve Selected
        </button>
        <button
          class="inline-flex items-center gap-1.5 rounded-[var(--dls-radius)] bg-yellow-9 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-yellow-10 disabled:opacity-40"
          disabled={selectedIds().size === 0}
          onClick={() => handleBatchAction("flag")}
        >
          Flag Selected
        </button>
        <button
          class="inline-flex items-center gap-1.5 rounded-[var(--dls-radius)] bg-blue-9 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-blue-10 disabled:opacity-40"
          disabled={selectedIds().size === 0}
          onClick={() => handleBatchAction("route")}
        >
          Route to Regional
        </button>

        <div class="ml-auto flex items-center gap-2">
          <Filter class="size-4 text-[var(--dls-text-secondary)]" />
          <select
            class="rounded-[var(--dls-radius)] border border-[var(--dls-border)] bg-[var(--dls-surface)] px-2 py-1.5 text-sm text-[var(--dls-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--dls-accent)]"
            value={filterStatus()}
            onChange={(e) => setFilterStatus(e.currentTarget.value as FilterOption)}
          >
            <For each={FILTER_OPTIONS as unknown as FilterOption[]}>
              {(opt) => (
                <option value={opt} class="capitalize">
                  {opt === "all" ? "All Statuses" : opt.charAt(0).toUpperCase() + opt.slice(1)}
                </option>
              )}
            </For>
          </select>
        </div>
      </section>

      {/* ── Invoice table ──────────────────────────────────────────── */}
      <InvoiceList
        invoices={filteredInvoices()}
        onSelect={(inv) => setSelectedInvoice(inv)}
        selectedIds={selectedIds()}
        onToggleSelect={toggleSelect}
      />

      {/* ── Detail modal ───────────────────────────────────────────── */}
      <InvoiceDetailModal
        invoice={selectedInvoice()}
        onClose={() => setSelectedInvoice(null)}
        onAction={handleSingleAction}
      />
    </div>
  );
}
