import { Show, createSignal, For } from "solid-js";
import { X, ChevronRight, Users, Calendar, DollarSign, Hash } from "lucide-solid";
import { StageBadge, type DemoGroup } from "./group-pipeline";
import type { GroupStage } from "../data/hotel-types";

// ---------------------------------------------------------------------------
// Stage progression order
// ---------------------------------------------------------------------------

const STAGE_ORDER: GroupStage[] = ["lead", "prospect", "tentative", "definite", "actualized"];

const STAGE_LABELS: Record<string, string> = {
  lead: "Lead",
  prospect: "Prospect",
  tentative: "Tentative",
  definite: "Definite",
  actualized: "Actualized",
  lost: "Lost",
};

// ---------------------------------------------------------------------------
// GroupDetailModal – full detail overlay for a group opportunity
// ---------------------------------------------------------------------------

interface GroupDetailModalProps {
  group: DemoGroup | null;
  onClose: () => void;
  onAdvanceStage: (groupId: string, newStage: GroupStage) => void;
  onUpdatePickup: (groupId: string, pickedUp: number) => void;
}

export function GroupDetailModal(props: GroupDetailModalProps) {
  const [pickupInput, setPickupInput] = createSignal(0);
  const [stageSelect, setStageSelect] = createSignal<GroupStage>("lead");

  // Sync local state when group changes
  const group = () => {
    const g = props.group;
    if (g) {
      setPickupInput(g.pickedUp);
      setStageSelect(g.stage);
    }
    return g;
  };

  const pickupPct = () => {
    const g = group();
    if (!g || g.blockSize === 0) return 0;
    return Math.round((g.pickedUp / g.blockSize) * 100);
  };

  const nextStage = (): GroupStage | null => {
    const g = group();
    if (!g) return null;
    const idx = STAGE_ORDER.indexOf(g.stage as GroupStage);
    if (idx < 0 || idx >= STAGE_ORDER.length - 1) return null;
    return STAGE_ORDER[idx + 1];
  };

  const formatDate = (dateStr: string | undefined) => {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  const daysUntil = (dateStr: string | undefined) => {
    if (!dateStr) return null;
    const diff = Math.ceil((new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  return (
    <Show when={group()}>
      {(g) => (
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
                <div class="flex items-center gap-2">
                  <h2 class="text-lg font-bold text-[var(--dls-text-primary)]">{g().name}</h2>
                  <StageBadge stage={g().stage} />
                </div>
                <p class="mt-0.5 text-sm text-[var(--dls-text-secondary)]">
                  {g().contact} · {g().groupType}
                </p>
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
              {/* Key metrics grid */}
              <section>
                <h3 class="mb-2 text-sm font-semibold text-[var(--dls-text-primary)]">Key Metrics</h3>
                <div class="grid grid-cols-2 gap-3">
                  <div class="rounded-[var(--dls-radius)] border border-[var(--dls-border)] p-3">
                    <div class="flex items-center gap-1.5 text-xs text-[var(--dls-text-secondary)]">
                      <Hash class="size-3.5" />
                      Room Nights
                    </div>
                    <div class="mt-1 text-xl font-bold text-[var(--dls-text-primary)]">
                      {g().roomNights}
                    </div>
                  </div>
                  <div class="rounded-[var(--dls-radius)] border border-[var(--dls-border)] p-3">
                    <div class="flex items-center gap-1.5 text-xs text-[var(--dls-text-secondary)]">
                      <DollarSign class="size-3.5" />
                      Rate
                    </div>
                    <div class="mt-1 text-xl font-bold text-[var(--dls-text-primary)]">
                      ${g().rate}
                    </div>
                  </div>
                  <div class="rounded-[var(--dls-radius)] border border-[var(--dls-border)] p-3">
                    <div class="flex items-center gap-1.5 text-xs text-[var(--dls-text-secondary)]">
                      <DollarSign class="size-3.5" />
                      Revenue Estimate
                    </div>
                    <div class="mt-1 text-xl font-bold text-[var(--dls-text-primary)]">
                      ${g().revenueEstimate.toLocaleString()}
                    </div>
                  </div>
                  <div class="rounded-[var(--dls-radius)] border border-[var(--dls-border)] p-3">
                    <div class="flex items-center gap-1.5 text-xs text-[var(--dls-text-secondary)]">
                      <Users class="size-3.5" />
                      Block Size
                    </div>
                    <div class="mt-1 text-xl font-bold text-[var(--dls-text-primary)]">
                      {g().blockSize} rooms
                    </div>
                  </div>
                </div>
              </section>

              {/* Pickup tracking */}
              <section class="rounded-[var(--dls-radius)] border border-[var(--dls-border)] p-3">
                <h3 class="text-sm font-semibold text-[var(--dls-text-primary)]">Pickup Tracking</h3>
                <div class="mt-2 flex items-center gap-3">
                  <div class="h-2.5 flex-1 rounded-full bg-[var(--dls-border)]">
                    <div
                      class={`h-2.5 rounded-full transition-all ${
                        pickupPct() >= 80 ? "bg-green-9" : pickupPct() >= 50 ? "bg-amber-9" : "bg-blue-9"
                      }`}
                      style={{ width: `${Math.min(pickupPct(), 100)}%` }}
                    />
                  </div>
                  <span class="text-sm font-semibold text-[var(--dls-text-primary)]">
                    {pickupPct()}%
                  </span>
                </div>
                <p class="mt-1 text-xs text-[var(--dls-text-secondary)]">
                  {g().pickedUp} of {g().blockSize} rooms picked up
                </p>
              </section>

              {/* Date info */}
              <section class="space-y-1 text-sm">
                <h3 class="font-semibold text-[var(--dls-text-primary)]">Dates</h3>
                <div class="grid grid-cols-2 gap-2 text-[var(--dls-text-secondary)]">
                  <div class="flex items-center gap-1.5">
                    <Calendar class="size-3.5" />
                    Arrival: <span class="text-[var(--dls-text-primary)]">{formatDate(g().startDate)}</span>
                  </div>
                  <div class="flex items-center gap-1.5">
                    <Calendar class="size-3.5" />
                    Departure: <span class="text-[var(--dls-text-primary)]">{formatDate(g().endDate)}</span>
                  </div>
                  <Show when={g().deadline}>
                    <div>
                      Decision deadline:{" "}
                      <span class={`font-medium ${daysUntil(g().deadline)! <= 7 ? "text-red-11" : "text-[var(--dls-text-primary)]"}`}>
                        {formatDate(g().deadline)}
                      </span>
                      <Show when={daysUntil(g().deadline) !== null}>
                        <span class="text-xs"> ({daysUntil(g().deadline)} days)</span>
                      </Show>
                    </div>
                  </Show>
                  <Show when={g().cutoffDate}>
                    <div>
                      Cutoff:{" "}
                      <span class={`font-medium ${daysUntil(g().cutoffDate)! <= 14 ? "text-amber-11" : "text-[var(--dls-text-primary)]"}`}>
                        {formatDate(g().cutoffDate)}
                      </span>
                      <Show when={daysUntil(g().cutoffDate) !== null}>
                        <span class="text-xs"> ({daysUntil(g().cutoffDate)} days)</span>
                      </Show>
                    </div>
                  </Show>
                </div>
              </section>

              {/* Notes */}
              <Show when={g().notes}>
                <section class="text-sm">
                  <h3 class="font-semibold text-[var(--dls-text-primary)]">Notes</h3>
                  <p class="mt-1 text-[var(--dls-text-secondary)]">{g().notes}</p>
                </section>
              </Show>

              {/* Stage change */}
              <section class="rounded-[var(--dls-radius)] border border-[var(--dls-border)] p-3">
                <h3 class="mb-2 text-sm font-semibold text-[var(--dls-text-primary)]">Change Stage</h3>
                <div class="flex items-center gap-2">
                  <select
                    class="flex-1 rounded-[var(--dls-radius)] border border-[var(--dls-border)] bg-[var(--dls-surface)] px-2 py-1.5 text-sm text-[var(--dls-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--dls-accent)]"
                    value={stageSelect()}
                    onChange={(e) => setStageSelect(e.currentTarget.value as GroupStage)}
                  >
                    <For each={STAGE_ORDER}>
                      {(s) => (
                        <option value={s}>{STAGE_LABELS[s]}</option>
                      )}
                    </For>
                  </select>
                  <button
                    class="inline-flex items-center gap-1 rounded-[var(--dls-radius)] bg-blue-9 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-blue-10 disabled:opacity-40"
                    disabled={stageSelect() === g().stage}
                    onClick={() => props.onAdvanceStage(g().id, stageSelect())}
                  >
                    Update
                  </button>
                </div>
              </section>

              {/* Update pickup */}
              <section class="rounded-[var(--dls-radius)] border border-[var(--dls-border)] p-3">
                <h3 class="mb-2 text-sm font-semibold text-[var(--dls-text-primary)]">Update Pickup Count</h3>
                <div class="flex items-center gap-2">
                  <input
                    type="number"
                    min={0}
                    max={g().blockSize}
                    class="w-24 rounded-[var(--dls-radius)] border border-[var(--dls-border)] bg-[var(--dls-surface)] px-2 py-1.5 text-sm text-[var(--dls-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--dls-accent)]"
                    value={pickupInput()}
                    onInput={(e) => setPickupInput(parseInt(e.currentTarget.value) || 0)}
                  />
                  <span class="text-xs text-[var(--dls-text-secondary)]">/ {g().blockSize} rooms</span>
                  <button
                    class="inline-flex items-center gap-1 rounded-[var(--dls-radius)] bg-green-9 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-green-10 disabled:opacity-40"
                    disabled={pickupInput() === g().pickedUp}
                    onClick={() => props.onUpdatePickup(g().id, pickupInput())}
                  >
                    Save
                  </button>
                </div>
              </section>
            </div>

            {/* Footer actions */}
            <div class="flex flex-wrap gap-2 border-t border-[var(--dls-border)] p-4">
              <Show when={nextStage()}>
                {(ns) => (
                  <button
                    class="inline-flex items-center gap-1.5 rounded-[var(--dls-radius)] bg-green-9 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-green-10"
                    onClick={() => props.onAdvanceStage(g().id, ns())}
                  >
                    <ChevronRight class="size-4" />
                    Advance to {STAGE_LABELS[ns()]}
                  </button>
                )}
              </Show>
              <button
                class="inline-flex items-center gap-1.5 rounded-[var(--dls-radius)] border border-[var(--dls-border)] bg-[var(--dls-surface)] px-3 py-1.5 text-sm font-medium text-[var(--dls-text-primary)] transition-colors hover:bg-[var(--dls-sidebar)]"
                onClick={props.onClose}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </Show>
  );
}
