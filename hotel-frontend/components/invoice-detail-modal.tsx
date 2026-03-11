import { Show, createSignal, For } from "solid-js";
import { X, CheckCircle, Flag, XCircle, AlertTriangle } from "lucide-solid";
import { AnomalyBadge } from "./anomaly-badge";
import type { DemoInvoice } from "./invoice-list";

// ---------------------------------------------------------------------------
// InvoiceDetailModal – full detail overlay with approval actions
// ---------------------------------------------------------------------------

interface InvoiceDetailModalProps {
  invoice: DemoInvoice | null;
  onClose: () => void;
  onAction: (action: "approve" | "flag" | "reject" | "route") => void;
}

export function InvoiceDetailModal(props: InvoiceDetailModalProps) {
  const [comment, setComment] = createSignal("");

  const contractDelta = () => {
    const inv = props.invoice;
    if (!inv || inv.contractRate == null) return null;
    const diff = inv.amount - inv.contractRate;
    const pct = ((diff / inv.contractRate) * 100).toFixed(0);
    return { diff, pct };
  };

  return (
    <Show when={props.invoice}>
      {(inv) => (
        <div
          class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) props.onClose();
          }}
        >
          <div class="relative mx-4 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-[var(--dls-radius)] border border-[var(--dls-border)] bg-[var(--dls-surface)] shadow-xl">
            {/* Header */}
            <div class="flex items-start justify-between border-b border-[var(--dls-border)] p-4">
              <div>
                <h2 class="text-lg font-bold text-[var(--dls-text-primary)]">{inv().vendor}</h2>
                <p class="text-sm text-[var(--dls-text-secondary)]">{inv().invoiceNum}</p>
              </div>
              <button
                class="rounded p-1 transition-colors hover:bg-[var(--dls-sidebar)]"
                onClick={props.onClose}
                aria-label="Close"
              >
                <X class="size-5 text-[var(--dls-text-secondary)]" />
              </button>
            </div>

            {/* Body */}
            <div class="space-y-4 p-4">
              {/* Invoice details */}
              <section class="space-y-1 text-sm">
                <h3 class="font-semibold text-[var(--dls-text-primary)]">Invoice Details</h3>
                <div class="grid grid-cols-2 gap-2 text-[var(--dls-text-secondary)]">
                  <div>Vendor: <span class="text-[var(--dls-text-primary)]">{inv().vendor}</span></div>
                  <div>Category: <span class="text-[var(--dls-text-primary)]">{inv().category}</span></div>
                  <div>Date: <span class="text-[var(--dls-text-primary)]">{inv().date}</span></div>
                  <div>Amount: <span class="font-semibold text-[var(--dls-text-primary)]">${inv().amount.toLocaleString()}</span></div>
                </div>
                <p class="pt-1 text-[var(--dls-text-secondary)]">{inv().description}</p>
              </section>

              {/* Contract check */}
              <Show when={inv().contractRate != null}>
                <section class="rounded-[var(--dls-radius)] border border-[var(--dls-border)] p-3 text-sm">
                  <h3 class="flex items-center gap-1.5 font-semibold text-[var(--dls-text-primary)]">
                    <AlertTriangle class="size-4 text-yellow-11" />
                    Contract Check
                  </h3>
                  <p class={`mt-1 ${contractDelta() && contractDelta()!.diff > 0 ? "text-red-11" : "text-green-11"}`}>
                    Contracted rate: ${inv().contractRate!.toLocaleString()}/mo. This invoice: ${inv().amount.toLocaleString()}
                    <Show when={contractDelta()}>
                      {" "}({contractDelta()!.pct}% {contractDelta()!.diff > 0 ? "over" : "under"})
                    </Show>
                  </p>
                </section>
              </Show>

              {/* Budget check */}
              <section class="rounded-[var(--dls-radius)] border border-[var(--dls-border)] p-3 text-sm">
                <h3 class="font-semibold text-[var(--dls-text-primary)]">Budget Check</h3>
                <p class="mt-1 text-[var(--dls-text-secondary)]">
                  This invoice is <span class={`font-semibold ${inv().budgetPct > 15 ? "text-yellow-11" : "text-[var(--dls-text-primary)]"}`}>{inv().budgetPct}%</span> of {inv().budgetCategory} budget for Jan
                </p>
              </section>

              {/* Anomaly explanations */}
              <Show when={inv().flags.length > 0}>
                <section class="space-y-2 text-sm">
                  <h3 class="font-semibold text-[var(--dls-text-primary)]">Anomalies</h3>
                  <div class="flex flex-wrap gap-1.5">
                    <For each={inv().flags}>{(flag) => <AnomalyBadge type={flag} />}</For>
                  </div>
                </section>
              </Show>

              {/* Audit trail */}
              <section class="text-sm text-[var(--dls-text-secondary)]">
                <h3 class="font-semibold text-[var(--dls-text-primary)]">Audit Trail</h3>
                <p class="mt-1">Submitted: {inv().date} | Reviewed: {inv().status === "pending" ? "Pending" : inv().status}</p>
              </section>

              {/* Comment */}
              <div>
                <label class="block text-sm font-medium text-[var(--dls-text-primary)]" for="approval-notes">
                  Approval Notes
                </label>
                <textarea
                  id="approval-notes"
                  class="mt-1 w-full rounded-[var(--dls-radius)] border border-[var(--dls-border)] bg-[var(--dls-surface)] p-2 text-sm text-[var(--dls-text-primary)] placeholder:text-[var(--dls-text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--dls-accent)]"
                  rows={3}
                  placeholder="Add comments…"
                  value={comment()}
                  onInput={(e) => setComment(e.currentTarget.value)}
                />
              </div>
            </div>

            {/* Footer actions */}
            <div class="flex flex-wrap gap-2 border-t border-[var(--dls-border)] p-4">
              <button
                class="inline-flex items-center gap-1.5 rounded-[var(--dls-radius)] bg-green-9 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-green-10"
                onClick={() => props.onAction("approve")}
              >
                <CheckCircle class="size-4" />
                Approve
              </button>
              <button
                class="inline-flex items-center gap-1.5 rounded-[var(--dls-radius)] bg-yellow-9 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-yellow-10"
                onClick={() => props.onAction("flag")}
              >
                <Flag class="size-4" />
                Flag for Review
              </button>
              <button
                class="inline-flex items-center gap-1.5 rounded-[var(--dls-radius)] bg-blue-9 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-blue-10"
                onClick={() => props.onAction("route")}
              >
                Route to Regional
              </button>
              <button
                class="inline-flex items-center gap-1.5 rounded-[var(--dls-radius)] bg-red-9 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-red-10"
                onClick={() => props.onAction("reject")}
              >
                <XCircle class="size-4" />
                Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </Show>
  );
}
