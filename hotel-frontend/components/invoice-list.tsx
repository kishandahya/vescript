import { createSignal, createMemo, For, Show } from "solid-js";
import { Search, ChevronRight } from "lucide-solid";
import { AnomalyBadge } from "./anomaly-badge";
import type { InvoiceFlag, InvoiceStatus } from "../data/hotel-types";

// ---------------------------------------------------------------------------
// DemoInvoice type – used for the hardcoded invoice data
// ---------------------------------------------------------------------------

export interface DemoInvoice {
  id: string;
  vendor: string;
  invoiceNum: string;
  date: string;
  amount: number;
  category: string;
  status: string;
  flags: string[];
  description: string;
  contractRate: number | null;
  budgetCategory: string;
  budgetPct: number;
}

// ---------------------------------------------------------------------------
// Status pill colours
// ---------------------------------------------------------------------------

const STATUS_STYLE: Record<string, { bg: string; text: string }> = {
  approved: { bg: "bg-green-3", text: "text-green-11" },
  pending: { bg: "bg-yellow-3", text: "text-yellow-11" },
  rejected: { bg: "bg-red-3", text: "text-red-11" },
  routed: { bg: "bg-blue-3", text: "text-blue-11" },
  flagged: { bg: "bg-orange-3", text: "text-orange-11" },
};

function StatusPill(props: { status: string }) {
  const style = () => STATUS_STYLE[props.status] ?? { bg: "bg-gray-3", text: "text-gray-11" };
  return (
    <span class={`inline-block rounded-full px-2 py-0.5 text-xs font-medium capitalize ${style().bg} ${style().text}`}>
      {props.status}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Sortable column types
// ---------------------------------------------------------------------------

type SortField = "vendor" | "date" | "amount" | "status";
type SortDir = "asc" | "desc";

// ---------------------------------------------------------------------------
// InvoiceList
// ---------------------------------------------------------------------------

interface InvoiceListProps {
  invoices: DemoInvoice[];
  onSelect: (invoice: DemoInvoice) => void;
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
}

export function InvoiceList(props: InvoiceListProps) {
  const [search, setSearch] = createSignal("");
  const [sortField, setSortField] = createSignal<SortField>("date");
  const [sortDir, setSortDir] = createSignal<SortDir>("desc");

  const toggleSort = (field: SortField) => {
    if (sortField() === field) {
      setSortDir(sortDir() === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  };

  const sortIndicator = (field: SortField) =>
    sortField() === field ? (sortDir() === "asc" ? " ↑" : " ↓") : "";

  const filtered = createMemo(() => {
    const q = search().toLowerCase();
    let list = props.invoices;
    if (q) {
      list = list.filter(
        (inv) =>
          inv.vendor.toLowerCase().includes(q) ||
          inv.invoiceNum.toLowerCase().includes(q),
      );
    }
    const field = sortField();
    const dir = sortDir();
    return [...list].sort((a, b) => {
      let cmp = 0;
      if (field === "amount") cmp = a.amount - b.amount;
      else if (field === "date") cmp = a.date.localeCompare(b.date);
      else if (field === "vendor") cmp = a.vendor.localeCompare(b.vendor);
      else if (field === "status") cmp = a.status.localeCompare(b.status);
      return dir === "desc" ? -cmp : cmp;
    });
  });

  const rowBg = (inv: DemoInvoice) => {
    if (inv.flags.some((f) => f === "over-contract" || f === "duplicate")) return "bg-red-2";
    if (inv.flags.length > 0) return "bg-yellow-2";
    return "bg-[var(--dls-surface)]";
  };

  return (
    <div class="space-y-3">
      {/* Search bar */}
      <div class="relative">
        <Search class="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[var(--dls-text-secondary)]" />
        <input
          type="text"
          placeholder="Search vendor or invoice #…"
          class="w-full rounded-[var(--dls-radius)] border border-[var(--dls-border)] bg-[var(--dls-surface)] py-2 pl-9 pr-3 text-sm text-[var(--dls-text-primary)] placeholder:text-[var(--dls-text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--dls-accent)]"
          value={search()}
          onInput={(e) => setSearch(e.currentTarget.value)}
        />
      </div>

      {/* Table */}
      <div class="overflow-x-auto rounded-[var(--dls-radius)] border border-[var(--dls-border)]">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-[var(--dls-border)] bg-[var(--dls-sidebar)] text-left text-xs font-semibold uppercase tracking-wide text-[var(--dls-text-secondary)]">
              <th class="px-3 py-2 w-8">
                <span class="sr-only">Select</span>
              </th>
              <th class="px-3 py-2 cursor-pointer select-none" onClick={() => toggleSort("vendor")}>
                Vendor{sortIndicator("vendor")}
              </th>
              <th class="px-3 py-2">Invoice #</th>
              <th class="px-3 py-2 cursor-pointer select-none" onClick={() => toggleSort("date")}>
                Date{sortIndicator("date")}
              </th>
              <th class="px-3 py-2 cursor-pointer select-none text-right" onClick={() => toggleSort("amount")}>
                Amount{sortIndicator("amount")}
              </th>
              <th class="px-3 py-2">Category</th>
              <th class="px-3 py-2 cursor-pointer select-none" onClick={() => toggleSort("status")}>
                Status{sortIndicator("status")}
              </th>
              <th class="px-3 py-2">Flags</th>
              <th class="px-3 py-2 w-8">
                <span class="sr-only">Open</span>
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-[var(--dls-border)]">
            <For each={filtered()}>
              {(inv) => (
                <tr
                  class={`${rowBg(inv)} transition-colors hover:bg-[var(--dls-sidebar)] cursor-pointer`}
                  onClick={() => props.onSelect(inv)}
                >
                  <td class="px-3 py-2">
                    <input
                      type="checkbox"
                      checked={props.selectedIds.has(inv.id)}
                      onClick={(e) => {
                        e.stopPropagation();
                        props.onToggleSelect(inv.id);
                      }}
                      class="size-4 rounded border-[var(--dls-border)]"
                    />
                  </td>
                  <td class="px-3 py-2 font-medium text-[var(--dls-text-primary)]">{inv.vendor}</td>
                  <td class="px-3 py-2 text-[var(--dls-text-secondary)]">{inv.invoiceNum}</td>
                  <td class="px-3 py-2 text-[var(--dls-text-secondary)]">{inv.date}</td>
                  <td class="px-3 py-2 text-right font-medium text-[var(--dls-text-primary)]">
                    ${inv.amount.toLocaleString()}
                  </td>
                  <td class="px-3 py-2 text-[var(--dls-text-secondary)]">{inv.category}</td>
                  <td class="px-3 py-2">
                    <StatusPill status={inv.status} />
                  </td>
                  <td class="px-3 py-2">
                    <div class="flex flex-wrap gap-1">
                      <For each={inv.flags}>{(flag) => <AnomalyBadge type={flag} />}</For>
                    </div>
                  </td>
                  <td class="px-3 py-2">
                    <ChevronRight class="size-4 text-[var(--dls-text-secondary)]" />
                  </td>
                </tr>
              )}
            </For>
          </tbody>
        </table>
      </div>

      {/* Empty state */}
      <Show when={filtered().length === 0}>
        <div class="py-8 text-center text-sm text-[var(--dls-text-secondary)]">
          No invoices match your search.
        </div>
      </Show>
    </div>
  );
}
