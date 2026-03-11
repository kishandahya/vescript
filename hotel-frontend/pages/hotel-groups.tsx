import { createSignal, createMemo, For, Show } from "solid-js";
import { Users, DollarSign, TrendingUp, Filter, Search, ChevronRight } from "lucide-solid";
import type { HotelStore } from "../state/hotel-store";
import type { GroupStage } from "../data/hotel-types";
import { GroupPipeline, StageBadge, type DemoGroup } from "../components/group-pipeline";
import { GroupDetailModal } from "../components/group-detail";

// ---------------------------------------------------------------------------
// Helper: date offset from today
// ---------------------------------------------------------------------------

function futureDate(daysFromNow: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  return d.toISOString().slice(0, 10);
}

// ---------------------------------------------------------------------------
// Demo group data (8 groups matching seedFinancial.ts distributions)
// ---------------------------------------------------------------------------

const DEMO_GROUPS: DemoGroup[] = [
  {
    id: "grp-1",
    name: "Acme Corp Q2 Leadership Summit",
    contact: "Jennifer Martinez",
    stage: "lead",
    startDate: futureDate(72),
    endDate: futureDate(75),
    roomNights: 180,
    rate: 189,
    revenueEstimate: 34020,
    blockSize: 60,
    pickedUp: 0,
    deadline: futureDate(30),
    notes: "Initial inquiry via sales team. Decision-maker is VP of Operations.",
    groupType: "corporate",
  },
  {
    id: "grp-2",
    name: "Texas Medical Association Annual Gala",
    contact: "Dr. Robert Chen",
    stage: "lead",
    startDate: futureDate(85),
    endDate: futureDate(88),
    roomNights: 240,
    rate: 199,
    revenueEstimate: 47760,
    blockSize: 80,
    pickedUp: 0,
    deadline: futureDate(45),
    notes: "Received RFP. Competing with 2 other hotels in the market.",
    groupType: "association",
  },
  {
    id: "grp-3",
    name: "Southwest Regional Sales Kickoff",
    contact: "Mike Thompson",
    stage: "prospect",
    startDate: futureDate(55),
    endDate: futureDate(58),
    roomNights: 150,
    rate: 179,
    revenueEstimate: 26850,
    blockSize: 50,
    pickedUp: 0,
    deadline: futureDate(20),
    cutoffDate: futureDate(35),
    notes: "Site visit completed. Positive feedback on event spaces. Awaiting budget approval.",
    groupType: "corporate",
  },
  {
    id: "grp-4",
    name: "Anderson-Williams Wedding",
    contact: "Sarah Anderson",
    stage: "tentative",
    startDate: futureDate(42),
    endDate: futureDate(44),
    roomNights: 210,
    rate: 169,
    revenueEstimate: 35490,
    blockSize: 70,
    pickedUp: 12,
    deadline: futureDate(14),
    cutoffDate: futureDate(28),
    notes: "Wedding block with F&B package. Bride requesting room upgrade for family suite.",
    groupType: "wedding",
  },
  {
    id: "grp-5",
    name: "National Insurance Brokers Conference",
    contact: "Patricia Hughes",
    stage: "tentative",
    startDate: futureDate(48),
    endDate: futureDate(52),
    roomNights: 600,
    rate: 209,
    revenueEstimate: 125400,
    blockSize: 150,
    pickedUp: 0,
    deadline: futureDate(18),
    cutoffDate: futureDate(34),
    notes: "Large conference requiring ballroom and 4 breakout rooms. Contract under legal review.",
    groupType: "association",
  },
  {
    id: "grp-6",
    name: "Dallas Youth Soccer Invitational",
    contact: "Coach David Rivera",
    stage: "definite",
    startDate: futureDate(21),
    endDate: futureDate(24),
    roomNights: 900,
    rate: 149,
    revenueEstimate: 134100,
    blockSize: 300,
    pickedUp: 187,
    cutoffDate: futureDate(7),
    notes: "12 teams confirmed. Room list due by cutoff. Complimentary coach rooms per 20 paid.",
    groupType: "sports",
  },
  {
    id: "grp-7",
    name: "TechForward Innovation Summit",
    contact: "Lisa Park",
    stage: "definite",
    startDate: futureDate(14),
    endDate: futureDate(17),
    roomNights: 480,
    rate: 219,
    revenueEstimate: 105120,
    blockSize: 160,
    pickedUp: 134,
    cutoffDate: futureDate(5),
    notes: "Signed contract. AV setup finalized. VIP welcome amenities for speakers.",
    groupType: "corporate",
  },
  {
    id: "grp-8",
    name: "Regional Firefighters Charity Ball",
    contact: "Chief James O'Connor",
    stage: "actualized",
    startDate: futureDate(-3),
    endDate: futureDate(-1),
    roomNights: 300,
    rate: 159,
    revenueEstimate: 47700,
    blockSize: 100,
    pickedUp: 94,
    notes: "Event completed. Post-event billing in progress. Group praised F&B and service.",
    groupType: "association",
  },
];

// ---------------------------------------------------------------------------
// Pipeline stages in order
// ---------------------------------------------------------------------------

const PIPELINE_STAGES: GroupStage[] = ["lead", "prospect", "tentative", "definite", "actualized"];

const STAGE_VIEW_OPTIONS = ["pipeline", "table"] as const;
type ViewMode = (typeof STAGE_VIEW_OPTIONS)[number];

const FILTER_STAGES = ["all", ...PIPELINE_STAGES] as const;
type FilterStage = (typeof FILTER_STAGES)[number];

// ---------------------------------------------------------------------------
// HotelGroups – main groups tab page
// ---------------------------------------------------------------------------

export function HotelGroups(props: { store: HotelStore }) {
  const [selectedGroup, setSelectedGroup] = createSignal<DemoGroup | null>(null);
  const [groups, setGroups] = createSignal(DEMO_GROUPS);
  const [viewMode, setViewMode] = createSignal<ViewMode>("pipeline");
  const [filterStage, setFilterStage] = createSignal<FilterStage>("all");
  const [search, setSearch] = createSignal("");

  // ── Derived metrics ──────────────────────────────────────────────────
  const groupsByStage = createMemo(() => {
    const map: Record<string, DemoGroup[]> = {};
    for (const stage of PIPELINE_STAGES) map[stage] = [];
    for (const g of groups()) {
      const s = g.stage as string;
      if (map[s]) map[s].push(g);
    }
    return map;
  });

  const stageSummaries = createMemo(() =>
    PIPELINE_STAGES.map((stage) => {
      const stageGroups = groupsByStage()[stage] || [];
      return {
        stage,
        count: stageGroups.length,
        revenue: stageGroups.reduce((sum, g) => sum + g.revenueEstimate, 0),
      };
    }),
  );

  const totalRevenue = createMemo(() => groups().reduce((sum, g) => sum + g.revenueEstimate, 0));
  const totalRoomNights = createMemo(() => groups().reduce((sum, g) => sum + g.roomNights, 0));

  // ── Filtered list for table view ──────────────────────────────────────
  const filteredGroups = createMemo(() => {
    let list = groups();
    const f = filterStage();
    if (f !== "all") list = list.filter((g) => g.stage === f);
    const q = search().toLowerCase();
    if (q) {
      list = list.filter(
        (g) =>
          g.name.toLowerCase().includes(q) ||
          g.contact.toLowerCase().includes(q) ||
          g.groupType.toLowerCase().includes(q),
      );
    }
    return list;
  });

  // ── Actions ───────────────────────────────────────────────────────────
  const handleAdvanceStage = (groupId: string, newStage: GroupStage) => {
    setGroups((prev) =>
      prev.map((g) => (g.id === groupId ? { ...g, stage: newStage } : g)),
    );
    setSelectedGroup(null);
  };

  const handleUpdatePickup = (groupId: string, pickedUp: number) => {
    setGroups((prev) =>
      prev.map((g) => (g.id === groupId ? { ...g, pickedUp } : g)),
    );
    // Update selected group in-place
    const sel = selectedGroup();
    if (sel && sel.id === groupId) {
      setSelectedGroup({ ...sel, pickedUp });
    }
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  // ── Stage colors for summary cards ────────────────────────────────────
  const stageCardIcon = (stage: string) => {
    const map: Record<string, string> = {
      lead: "text-gray-11",
      prospect: "text-blue-11",
      tentative: "text-amber-11",
      definite: "text-green-11",
      actualized: "text-emerald-11",
    };
    return map[stage] ?? "text-gray-11";
  };

  return (
    <div class="space-y-6">
      {/* ── Summary banner ───────────────────────────────────────────── */}
      <section>
        <div class="mb-3 flex items-center justify-between">
          <h2 class="text-sm font-semibold uppercase tracking-wide text-[var(--dls-text-secondary)]">
            Group Pipeline
          </h2>
          <div class="flex items-center gap-3 text-sm text-[var(--dls-text-secondary)]">
            <span>
              <span class="font-semibold text-[var(--dls-text-primary)]">{groups().length}</span> groups
            </span>
            <span>·</span>
            <span>
              <span class="font-semibold text-[var(--dls-text-primary)]">{totalRoomNights().toLocaleString()}</span> room nights
            </span>
            <span>·</span>
            <span>
              <span class="font-semibold text-[var(--dls-text-primary)]">${totalRevenue().toLocaleString()}</span> pipeline value
            </span>
          </div>
        </div>

        {/* Stage summary cards */}
        <div class="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <For each={stageSummaries()}>
            {(summary) => (
              <div
                class="rounded-[var(--dls-radius)] border border-[var(--dls-border)] bg-[var(--dls-surface)] p-3 cursor-pointer transition-colors hover:bg-[var(--dls-sidebar)]"
                onClick={() => {
                  setFilterStage(summary.stage as FilterStage);
                  setViewMode("table");
                }}
              >
                <div class={`flex items-center gap-1.5 text-xs font-semibold capitalize ${stageCardIcon(summary.stage)}`}>
                  <Users class="size-3.5" />
                  {summary.stage}
                </div>
                <div class="mt-1 text-lg font-bold text-[var(--dls-text-primary)]">
                  {summary.count}
                </div>
                <div class="text-xs text-[var(--dls-text-secondary)]">
                  ${summary.revenue.toLocaleString()}
                </div>
              </div>
            )}
          </For>
        </div>
      </section>

      {/* ── View toggle + filters ────────────────────────────────────── */}
      <section class="flex flex-wrap items-center gap-3">
        <div class="flex rounded-[var(--dls-radius)] border border-[var(--dls-border)] overflow-hidden">
          <For each={STAGE_VIEW_OPTIONS as unknown as ViewMode[]}>
            {(mode) => (
              <button
                class={`px-3 py-1.5 text-sm font-medium capitalize transition-colors ${
                  viewMode() === mode
                    ? "bg-[var(--dls-accent)] text-white"
                    : "bg-[var(--dls-surface)] text-[var(--dls-text-secondary)] hover:bg-[var(--dls-sidebar)]"
                }`}
                onClick={() => setViewMode(mode)}
              >
                {mode}
              </button>
            )}
          </For>
        </div>

        <Show when={viewMode() === "table"}>
          <div class="flex items-center gap-2 ml-auto">
            <Filter class="size-4 text-[var(--dls-text-secondary)]" />
            <select
              class="rounded-[var(--dls-radius)] border border-[var(--dls-border)] bg-[var(--dls-surface)] px-2 py-1.5 text-sm text-[var(--dls-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--dls-accent)]"
              value={filterStage()}
              onChange={(e) => setFilterStage(e.currentTarget.value as FilterStage)}
            >
              <For each={FILTER_STAGES as unknown as FilterStage[]}>
                {(opt) => (
                  <option value={opt}>
                    {opt === "all" ? "All Stages" : opt.charAt(0).toUpperCase() + opt.slice(1)}
                  </option>
                )}
              </For>
            </select>
          </div>
        </Show>
      </section>

      {/* ── Pipeline view ────────────────────────────────────────────── */}
      <Show when={viewMode() === "pipeline"}>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          <For each={PIPELINE_STAGES}>
            {(stage) => (
              <GroupPipeline
                stage={stage}
                groups={groupsByStage()[stage] || []}
                onSelect={(g) => setSelectedGroup(g)}
              />
            )}
          </For>
        </div>
      </Show>

      {/* ── Table view ───────────────────────────────────────────────── */}
      <Show when={viewMode() === "table"}>
        <div class="space-y-3">
          {/* Search bar */}
          <div class="relative">
            <Search class="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[var(--dls-text-secondary)]" />
            <input
              type="text"
              placeholder="Search group name, contact, or type…"
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
                  <th class="px-3 py-2">Group</th>
                  <th class="px-3 py-2">Contact</th>
                  <th class="px-3 py-2">Dates</th>
                  <th class="px-3 py-2 text-right">RN</th>
                  <th class="px-3 py-2 text-right">Rate</th>
                  <th class="px-3 py-2 text-right">Revenue</th>
                  <th class="px-3 py-2">Stage</th>
                  <th class="px-3 py-2">Pickup</th>
                  <th class="px-3 py-2 w-8">
                    <span class="sr-only">Open</span>
                  </th>
                </tr>
              </thead>
              <tbody class="divide-y divide-[var(--dls-border)]">
                <For each={filteredGroups()}>
                  {(group) => {
                    const pickupPct = () =>
                      group.blockSize > 0 ? Math.round((group.pickedUp / group.blockSize) * 100) : 0;
                    return (
                      <tr
                        class="bg-[var(--dls-surface)] transition-colors hover:bg-[var(--dls-sidebar)] cursor-pointer"
                        onClick={() => setSelectedGroup(group)}
                      >
                        <td class="px-3 py-2">
                          <div class="font-medium text-[var(--dls-text-primary)]">{group.name}</div>
                          <div class="text-xs text-[var(--dls-text-secondary)]">{group.groupType}</div>
                        </td>
                        <td class="px-3 py-2 text-[var(--dls-text-secondary)]">{group.contact}</td>
                        <td class="px-3 py-2 text-[var(--dls-text-secondary)] whitespace-nowrap">
                          {formatDate(group.startDate)} – {formatDate(group.endDate)}
                        </td>
                        <td class="px-3 py-2 text-right font-medium text-[var(--dls-text-primary)]">
                          {group.roomNights}
                        </td>
                        <td class="px-3 py-2 text-right text-[var(--dls-text-secondary)]">
                          ${group.rate}
                        </td>
                        <td class="px-3 py-2 text-right font-medium text-[var(--dls-text-primary)]">
                          ${group.revenueEstimate.toLocaleString()}
                        </td>
                        <td class="px-3 py-2">
                          <StageBadge stage={group.stage} />
                        </td>
                        <td class="px-3 py-2">
                          <Show when={group.blockSize > 0} fallback={<span class="text-xs text-[var(--dls-text-secondary)]">—</span>}>
                            <div class="flex items-center gap-1.5">
                              <div class="h-1.5 w-16 rounded-full bg-[var(--dls-border)]">
                                <div
                                  class={`h-1.5 rounded-full transition-all ${
                                    pickupPct() >= 80 ? "bg-green-9" : pickupPct() >= 50 ? "bg-amber-9" : "bg-blue-9"
                                  }`}
                                  style={{ width: `${Math.min(pickupPct(), 100)}%` }}
                                />
                              </div>
                              <span class="text-[10px] text-[var(--dls-text-secondary)]">{pickupPct()}%</span>
                            </div>
                          </Show>
                        </td>
                        <td class="px-3 py-2">
                          <ChevronRight class="size-4 text-[var(--dls-text-secondary)]" />
                        </td>
                      </tr>
                    );
                  }}
                </For>
              </tbody>
            </table>
          </div>

          {/* Empty state */}
          <Show when={filteredGroups().length === 0}>
            <div class="py-8 text-center text-sm text-[var(--dls-text-secondary)]">
              No groups match your search.
            </div>
          </Show>
        </div>
      </Show>

      {/* ── Detail modal ─────────────────────────────────────────────── */}
      <GroupDetailModal
        group={selectedGroup()}
        onClose={() => setSelectedGroup(null)}
        onAdvanceStage={handleAdvanceStage}
        onUpdatePickup={handleUpdatePickup}
      />
    </div>
  );
}
