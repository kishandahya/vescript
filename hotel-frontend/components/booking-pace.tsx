import { createSignal, createMemo, For, Show } from "solid-js";

// ---------------------------------------------------------------------------
// Booking pace comparison chart – this year vs last year
// ---------------------------------------------------------------------------

interface BookingPaceProps {
  height?: number; // default 200
}

const DEMO_PACE = [
  { week: "W1", thisYear: 45, lastYear: 38, cumThis: 45, cumLast: 38 },
  { week: "W2", thisYear: 52, lastYear: 42, cumThis: 97, cumLast: 80 },
  { week: "W3", thisYear: 48, lastYear: 45, cumThis: 145, cumLast: 125 },
  { week: "W4", thisYear: 55, lastYear: 40, cumThis: 200, cumLast: 165 },
  { week: "W5", thisYear: 60, lastYear: 48, cumThis: 260, cumLast: 213 },
  { week: "W6", thisYear: 42, lastYear: 50, cumThis: 302, cumLast: 263 },
  { week: "W7", thisYear: 58, lastYear: 44, cumThis: 360, cumLast: 307 },
  { week: "W8", thisYear: 65, lastYear: 52, cumThis: 425, cumLast: 359 },
  { week: "W9", thisYear: 50, lastYear: 46, cumThis: 475, cumLast: 405 },
  { week: "W10", thisYear: 55, lastYear: 49, cumThis: 530, cumLast: 454 },
  { week: "W11", thisYear: 62, lastYear: 51, cumThis: 592, cumLast: 505 },
  { week: "W12", thisYear: 58, lastYear: 47, cumThis: 650, cumLast: 552 },
];

const MARGIN = { top: 28, right: 48, bottom: 32, left: 44 };
const SVG_W = 600;

// Weekly max / cumulative max for Y scales
const WEEKLY_MAX = Math.max(...DEMO_PACE.map((d) => Math.max(d.thisYear, d.lastYear)));
const CUM_MAX = Math.max(...DEMO_PACE.map((d) => Math.max(d.cumThis, d.cumLast)));

// Overall pace variance
const paceVariance = () => {
  const last = DEMO_PACE[DEMO_PACE.length - 1];
  return (((last.cumThis - last.cumLast) / last.cumLast) * 100).toFixed(1);
};

export function BookingPace(props: BookingPaceProps) {
  const chartHeight = () => props.height ?? 200;
  const [hoverIdx, setHoverIdx] = createSignal<number | null>(null);
  let svgRef: SVGSVGElement | undefined;

  const innerW = () => SVG_W - MARGIN.left - MARGIN.right;
  const innerH = () => chartHeight() - MARGIN.top - MARGIN.bottom;

  const barGroupWidth = () => innerW() / DEMO_PACE.length;
  const barWidth = () => Math.max(6, barGroupWidth() * 0.3);

  // Scales
  const yWeekly = (v: number) =>
    MARGIN.top + innerH() - (v / (WEEKLY_MAX * 1.15)) * innerH();
  const yCum = (v: number) =>
    MARGIN.top + innerH() - (v / (CUM_MAX * 1.1)) * innerH();
  const xBar = (i: number) => MARGIN.left + i * barGroupWidth() + barGroupWidth() / 2;

  // Cumulative line paths
  const cumThisLine = createMemo(() =>
    DEMO_PACE.map((d, i) => `${i === 0 ? "M" : "L"}${xBar(i)},${yCum(d.cumThis)}`).join(" "),
  );
  const cumLastLine = createMemo(() =>
    DEMO_PACE.map((d, i) => `${i === 0 ? "M" : "L"}${xBar(i)},${yCum(d.cumLast)}`).join(" "),
  );

  const handleMouseMove = (e: MouseEvent) => {
    if (!svgRef) return;
    const rect = svgRef.getBoundingClientRect();
    const scaleX = SVG_W / rect.width;
    const mouseX = (e.clientX - rect.left) * scaleX - MARGIN.left;
    const idx = Math.floor(mouseX / barGroupWidth());
    if (idx >= 0 && idx < DEMO_PACE.length) {
      setHoverIdx(idx);
    } else {
      setHoverIdx(null);
    }
  };

  const hovered = createMemo(() => {
    const i = hoverIdx();
    return i !== null ? DEMO_PACE[i] : null;
  });

  return (
    <div class="rounded-[var(--dls-radius)] border border-[var(--dls-border)] bg-[var(--dls-surface)] p-4">
      <div class="flex items-center justify-between mb-2">
        <h3 class="text-sm font-semibold text-[var(--dls-text-primary)]">Booking Pace</h3>
        <span class="text-xs font-medium text-green-11">
          Pace is {paceVariance()}% ahead of last year
        </span>
      </div>

      {/* Legend */}
      <div class="flex items-center gap-4 mb-2 text-[10px] text-[var(--dls-text-secondary)]">
        <span class="flex items-center gap-1"><span class="inline-block w-3 h-2.5 bg-blue-9 rounded-sm" /> This Year</span>
        <span class="flex items-center gap-1"><span class="inline-block w-3 h-2.5 bg-slate-6 rounded-sm" /> Last Year</span>
        <span class="flex items-center gap-1"><span class="inline-block w-4 h-0.5 bg-blue-9 rounded" /> Cumulative TY</span>
        <span class="flex items-center gap-1"><span class="inline-block w-4 h-0.5 bg-slate-7 rounded" style="border-top: 1px dashed" /> Cumulative LY</span>
      </div>

      <svg
        ref={svgRef}
        viewBox={`0 0 ${SVG_W} ${chartHeight()}`}
        class="w-full"
        style={{ height: `${chartHeight()}px`, "max-height": `${chartHeight()}px` }}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHoverIdx(null)}
      >
        {/* Bars */}
        <For each={DEMO_PACE}>
          {(d, i) => {
            const cx = () => xBar(i());
            return (
              <>
                {/* This year bar (blue) */}
                <rect
                  x={cx() - barWidth() - 1}
                  y={yWeekly(d.thisYear)}
                  width={barWidth()}
                  height={MARGIN.top + innerH() - yWeekly(d.thisYear)}
                  rx="2"
                  fill="var(--blue-9, #3b82f6)"
                  opacity={hoverIdx() === i() ? 1 : 0.85}
                />
                {/* Last year bar (gray) */}
                <rect
                  x={cx() + 1}
                  y={yWeekly(d.lastYear)}
                  width={barWidth()}
                  height={MARGIN.top + innerH() - yWeekly(d.lastYear)}
                  rx="2"
                  fill="var(--slate-6, #94a3b8)"
                  opacity={hoverIdx() === i() ? 1 : 0.65}
                />
              </>
            );
          }}
        </For>

        {/* Cumulative lines */}
        <path d={cumLastLine()} fill="none" stroke="var(--slate-7, #64748b)" stroke-width="1.5" stroke-dasharray="5 3" />
        <path d={cumThisLine()} fill="none" stroke="var(--blue-9, #3b82f6)" stroke-width="2" />

        {/* Cumulative dots */}
        <For each={DEMO_PACE}>
          {(d, i) => (
            <circle cx={xBar(i())} cy={yCum(d.cumThis)} r="2.5" fill="var(--blue-9, #3b82f6)" />
          )}
        </For>

        {/* X-axis labels */}
        <For each={DEMO_PACE}>
          {(d, i) => (
            <text
              x={xBar(i())}
              y={chartHeight() - 8}
              text-anchor="middle"
              class="text-[9px]"
              fill="var(--dls-text-secondary)"
            >
              {d.week}
            </text>
          )}
        </For>

        {/* Y-axis left – weekly */}
        <For each={[0, 20, 40, 60]}>
          {(tick) => (
            <>
              <line
                x1={MARGIN.left}
                x2={SVG_W - MARGIN.right}
                y1={yWeekly(tick)}
                y2={yWeekly(tick)}
                stroke="var(--dls-border)"
                stroke-width="0.5"
              />
              <text x={MARGIN.left - 6} y={yWeekly(tick) + 3} text-anchor="end" class="text-[9px]" fill="var(--dls-text-secondary)">
                {tick}
              </text>
            </>
          )}
        </For>

        {/* Y-axis right – cumulative */}
        <For each={[0, 200, 400, 600]}>
          {(tick) => (
            <text x={SVG_W - MARGIN.right + 6} y={yCum(tick) + 3} text-anchor="start" class="text-[9px]" fill="var(--dls-text-secondary)">
              {tick}
            </text>
          )}
        </For>

        {/* Hover tooltip */}
        <Show when={hovered() !== null}>
          <rect
            x={Math.min(xBar(hoverIdx()!) + 12, SVG_W - 160)}
            y={MARGIN.top}
            width="145"
            height="68"
            rx="4"
            fill="var(--dls-surface)"
            stroke="var(--dls-border)"
            stroke-width="1"
            opacity="0.95"
          />
          <text
            x={Math.min(xBar(hoverIdx()!) + 20, SVG_W - 152)}
            y={MARGIN.top + 15}
            class="text-[10px] font-bold"
            fill="var(--dls-text-primary)"
          >
            {hovered()!.week}
          </text>
          <text x={Math.min(xBar(hoverIdx()!) + 20, SVG_W - 152)} y={MARGIN.top + 28} class="text-[9px]" fill="var(--blue-9, #3b82f6)">
            This Year: {hovered()!.thisYear} (cum: {hovered()!.cumThis})
          </text>
          <text x={Math.min(xBar(hoverIdx()!) + 20, SVG_W - 152)} y={MARGIN.top + 41} class="text-[9px]" fill="var(--slate-7, #64748b)">
            Last Year: {hovered()!.lastYear} (cum: {hovered()!.cumLast})
          </text>
          <text x={Math.min(xBar(hoverIdx()!) + 20, SVG_W - 152)} y={MARGIN.top + 56} class="text-[9px]" fill="var(--dls-text-secondary)">
            Variance: {(((hovered()!.thisYear - hovered()!.lastYear) / hovered()!.lastYear) * 100).toFixed(1)}%
          </text>
        </Show>
      </svg>
    </div>
  );
}
