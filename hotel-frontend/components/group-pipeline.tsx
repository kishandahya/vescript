import { For, Show } from "solid-js";
import { ChevronRight } from "lucide-solid";
import type { GroupStage } from "../data/hotel-types";

// ---------------------------------------------------------------------------
// DemoGroup type – used for the hardcoded group data
// ---------------------------------------------------------------------------

export interface DemoGroup {
  id: string;
  name: string;
  contact: string;
  stage: GroupStage;
  startDate: string;
  endDate: string;
  roomNights: number;
  rate: number;
  revenueEstimate: number;
  blockSize: number;
  pickedUp: number;
  deadline?: string;
  cutoffDate?: string;
  notes?: string;
  groupType: string;
}

// ---------------------------------------------------------------------------
// Stage colour map
// ---------------------------------------------------------------------------

const STAGE_COLORS: Record<string, { bg: string; text: string; bar: string; headerBg: string }> = {
  lead:       { bg: "bg-gray-3",    text: "text-gray-11",    bar: "bg-gray-9",    headerBg: "bg-gray-4" },
  prospect:   { bg: "bg-blue-3",    text: "text-blue-11",    bar: "bg-blue-9",    headerBg: "bg-blue-4" },
  tentative:  { bg: "bg-amber-3",   text: "text-amber-11",   bar: "bg-amber-9",   headerBg: "bg-amber-4" },
  definite:   { bg: "bg-green-3",   text: "text-green-11",   bar: "bg-green-9",   headerBg: "bg-green-4" },
  actualized: { bg: "bg-emerald-3", text: "text-emerald-11", bar: "bg-emerald-9", headerBg: "bg-emerald-4" },
  lost:       { bg: "bg-red-3",     text: "text-red-11",     bar: "bg-red-9",     headerBg: "bg-red-4" },
};

export function StageBadge(props: { stage: string }) {
  const style = () => STAGE_COLORS[props.stage] ?? { bg: "bg-gray-3", text: "text-gray-11" };
  return (
    <span class={`inline-block rounded-full px-2 py-0.5 text-xs font-medium capitalize ${style().bg} ${style().text}`}>
      {props.stage}
    </span>
  );
}

// ---------------------------------------------------------------------------
// GroupPipeline – shows groups in a particular stage
// ---------------------------------------------------------------------------

interface GroupPipelineProps {
  stage: GroupStage;
  groups: DemoGroup[];
  onSelect: (group: DemoGroup) => void;
}

export function GroupPipeline(props: GroupPipelineProps) {
  const colors = () => STAGE_COLORS[props.stage] ?? STAGE_COLORS.lead;
  const totalRevenue = () => props.groups.reduce((sum, g) => sum + g.revenueEstimate, 0);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <div class="space-y-2">
      {/* Stage header */}
      <div class={`flex items-center justify-between rounded-[var(--dls-radius)] ${colors().headerBg} px-3 py-2`}>
        <div class="flex items-center gap-2">
          <h3 class={`text-sm font-semibold capitalize ${colors().text}`}>
            {props.stage}
          </h3>
          <span class={`inline-flex items-center justify-center rounded-full ${colors().bg} ${colors().text} px-2 py-0.5 text-xs font-bold`}>
            {props.groups.length}
          </span>
        </div>
        <span class={`text-xs font-medium ${colors().text}`}>
          ${totalRevenue().toLocaleString()}
        </span>
      </div>

      {/* Group cards */}
      <Show when={props.groups.length > 0} fallback={
        <div class="py-3 text-center text-xs text-[var(--dls-text-secondary)]">
          No groups in this stage
        </div>
      }>
        <div class="space-y-1.5">
          <For each={props.groups}>
            {(group) => {
              const pickupPct = () =>
                group.blockSize > 0 ? Math.round((group.pickedUp / group.blockSize) * 100) : 0;
              const showPickup = () => group.stage === "definite" || group.stage === "actualized";

              return (
                <div
                  class="flex items-center gap-3 rounded-[var(--dls-radius)] border border-[var(--dls-border)] bg-[var(--dls-surface)] px-3 py-2.5 transition-colors hover:bg-[var(--dls-sidebar)] cursor-pointer"
                  onClick={() => props.onSelect(group)}
                >
                  <div class="min-w-0 flex-1">
                    <div class="flex items-center gap-2">
                      <span class="text-sm font-medium text-[var(--dls-text-primary)] truncate">
                        {group.name}
                      </span>
                      <span class={`inline-block rounded-full px-1.5 py-0.5 text-[10px] font-medium ${colors().bg} ${colors().text}`}>
                        {group.groupType}
                      </span>
                    </div>
                    <div class="mt-0.5 flex items-center gap-2 text-xs text-[var(--dls-text-secondary)]">
                      <span>{group.contact}</span>
                      <span>·</span>
                      <span>{formatDate(group.startDate)} – {formatDate(group.endDate)}</span>
                    </div>
                    <div class="mt-1 flex items-center gap-3 text-xs text-[var(--dls-text-secondary)]">
                      <span>{group.roomNights} RN</span>
                      <span>${group.rate}/night</span>
                      <span class="font-medium text-[var(--dls-text-primary)]">
                        ${group.revenueEstimate.toLocaleString()}
                      </span>
                    </div>

                    {/* Pickup progress bar for definite/actualized */}
                    <Show when={showPickup()}>
                      <div class="mt-1.5 flex items-center gap-2">
                        <div class="h-1.5 flex-1 rounded-full bg-[var(--dls-border)]">
                          <div
                            class={`h-1.5 rounded-full ${colors().bar} transition-all`}
                            style={{ width: `${Math.min(pickupPct(), 100)}%` }}
                          />
                        </div>
                        <span class="text-[10px] font-medium text-[var(--dls-text-secondary)]">
                          {group.pickedUp}/{group.blockSize} ({pickupPct()}%)
                        </span>
                      </div>
                    </Show>
                  </div>

                  <ChevronRight class="size-4 shrink-0 text-[var(--dls-text-secondary)]" />
                </div>
              );
            }}
          </For>
        </div>
      </Show>
    </div>
  );
}
