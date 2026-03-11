import { createMemo, createSignal, For, Show } from "solid-js";

// ---------------------------------------------------------------------------
// RevenueChart – SVG line chart: actual revenue vs. budget over time
// ---------------------------------------------------------------------------

interface RevenueChartProps {
  title?: string;
  data: { date: string; actual: number; budget: number }[];
  height?: number;
}

const DEMO_REVENUE_DATA = Array.from({ length: 30 }, (_, i) => {
  const date = new Date(2025, 0, i + 1);
  const dayOfWeek = date.getDay();
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
  const base = isWeekend ? 42000 : 55000;
  const variance = Math.sin(i * 0.3) * 5000;
  return {
    date: date.toISOString().slice(5, 10),
    actual: Math.round(base + variance + (i > 15 ? 3000 : 0)),
    budget: Math.round(base * 0.95),
  };
});

const PAD = { top: 32, right: 24, bottom: 32, left: 56 };
const SVG_WIDTH = 640;

function formatDollar(v: number): string {
  return v >= 1000 ? `$${Math.round(v / 1000)}K` : `$${v}`;
}

export function RevenueChart(props: RevenueChartProps) {
  const height = () => props.height ?? 240;
  const data = () => (props.data.length ? props.data : DEMO_REVENUE_DATA);

  const [range, setRange] = createSignal<7 | 30>(30);
  const [hoverIdx, setHoverIdx] = createSignal<number | null>(null);

  const slicedData = createMemo(() => {
    const d = data();
    return range() === 7 ? d.slice(-7) : d;
  });

  const chartW = () => SVG_WIDTH - PAD.left - PAD.right;
  const chartH = () => height() - PAD.top - PAD.bottom;

  const yDomain = createMemo(() => {
    const d = slicedData();
    const allVals = d.flatMap((p) => [p.actual, p.budget]);
    const min = Math.min(...allVals);
    const max = Math.max(...allVals);
    const pad = (max - min) * 0.1 || 1000;
    return { min: Math.floor((min - pad) / 5000) * 5000, max: Math.ceil((max + pad) / 5000) * 5000 };
  });

  const scaleX = (i: number) => PAD.left + (i / Math.max(slicedData().length - 1, 1)) * chartW();
  const scaleY = (v: number) => {
    const { min, max } = yDomain();
    return PAD.top + chartH() - ((v - min) / (max - min)) * chartH();
  };

  const actualPath = createMemo(() => {
    const d = slicedData();
    if (!d.length) return "";
    return d.map((p, i) => `${i === 0 ? "M" : "L"}${scaleX(i).toFixed(1)},${scaleY(p.actual).toFixed(1)}`).join(" ");
  });

  const budgetPath = createMemo(() => {
    const d = slicedData();
    if (!d.length) return "";
    return d.map((p, i) => `${i === 0 ? "M" : "L"}${scaleX(i).toFixed(1)},${scaleY(p.budget).toFixed(1)}`).join(" ");
  });

  const areaPath = createMemo(() => {
    const d = slicedData();
    if (!d.length) return "";
    const bottom = PAD.top + chartH();
    const line = d.map((p, i) => `${i === 0 ? "M" : "L"}${scaleX(i).toFixed(1)},${scaleY(p.actual).toFixed(1)}`).join(" ");
    return `${line} L${scaleX(d.length - 1).toFixed(1)},${bottom} L${scaleX(0).toFixed(1)},${bottom} Z`;
  });

  const yTicks = createMemo(() => {
    const { min, max } = yDomain();
    const step = (max - min) / 4;
    return Array.from({ length: 5 }, (_, i) => min + i * step);
  });

  const xLabels = createMemo(() => {
    const d = slicedData();
    const step = range() === 7 ? 1 : 5;
    return d.map((p, i) => (i % step === 0 ? { i, label: p.date } : null)).filter(Boolean) as { i: number; label: string }[];
  });

  const handleMouseMove = (e: MouseEvent) => {
    const svg = (e.currentTarget as SVGSVGElement).getBoundingClientRect();
    const relX = ((e.clientX - svg.left) / svg.width) * SVG_WIDTH;
    const d = slicedData();
    if (!d.length) return;
    let closest = 0;
    let closestDist = Infinity;
    for (let i = 0; i < d.length; i++) {
      const dist = Math.abs(scaleX(i) - relX);
      if (dist < closestDist) {
        closestDist = dist;
        closest = i;
      }
    }
    setHoverIdx(closest);
  };

  return (
    <div class="rounded-[var(--dls-radius)] border border-[var(--dls-border)] bg-[var(--dls-surface)] p-4">
      {/* Header */}
      <div class="mb-2 flex items-center justify-between">
        <h3 class="text-sm font-semibold text-[var(--dls-text-primary)]">
          {props.title ?? "Revenue vs. Budget"}
        </h3>
        <div class="flex gap-1">
          <button
            class={`rounded px-2 py-0.5 text-xs font-medium transition-colors ${range() === 7 ? "bg-blue-9 text-white" : "bg-[var(--dls-sidebar)] text-[var(--dls-text-secondary)]"}`}
            onClick={() => setRange(7)}
          >
            7D
          </button>
          <button
            class={`rounded px-2 py-0.5 text-xs font-medium transition-colors ${range() === 30 ? "bg-blue-9 text-white" : "bg-[var(--dls-sidebar)] text-[var(--dls-text-secondary)]"}`}
            onClick={() => setRange(30)}
          >
            30D
          </button>
        </div>
      </div>

      {/* Legend */}
      <div class="mb-1 flex gap-4 text-xs text-[var(--dls-text-secondary)]">
        <span class="flex items-center gap-1">
          <span class="inline-block h-0.5 w-4 bg-blue-9 rounded" />
          Actual
        </span>
        <span class="flex items-center gap-1">
          <span class="inline-block h-0.5 w-4 rounded" style="background: repeating-linear-gradient(90deg, var(--dls-text-secondary) 0 3px, transparent 3px 6px)" />
          Budget
        </span>
      </div>

      {/* SVG */}
      <svg
        viewBox={`0 0 ${SVG_WIDTH} ${height()}`}
        class="w-full"
        style={{ height: `${height()}px` }}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHoverIdx(null)}
      >
        {/* Y-axis lines & labels */}
        <For each={yTicks()}>
          {(tick) => (
            <>
              <line
                x1={PAD.left}
                y1={scaleY(tick)}
                x2={SVG_WIDTH - PAD.right}
                y2={scaleY(tick)}
                stroke="var(--dls-border)"
                stroke-width="0.5"
              />
              <text
                x={PAD.left - 6}
                y={scaleY(tick) + 3}
                text-anchor="end"
                font-size="9"
                fill="var(--dls-text-secondary)"
              >
                {formatDollar(tick)}
              </text>
            </>
          )}
        </For>

        {/* X-axis labels */}
        <For each={xLabels()}>
          {(lbl) => (
            <text
              x={scaleX(lbl.i)}
              y={height() - 6}
              text-anchor="middle"
              font-size="9"
              fill="var(--dls-text-secondary)"
            >
              {lbl.label}
            </text>
          )}
        </For>

        {/* Area fill */}
        <path d={areaPath()} fill="var(--blue-5, #3b82f6)" opacity="0.15" />

        {/* Actual line */}
        <path d={actualPath()} fill="none" stroke="var(--blue-9, #2563eb)" stroke-width="2" stroke-linejoin="round" />

        {/* Budget line (dashed) */}
        <path d={budgetPath()} fill="none" stroke="var(--dls-text-secondary)" stroke-width="1.5" stroke-dasharray="4 3" stroke-linejoin="round" />

        {/* Hover crosshair & tooltip */}
        <Show when={hoverIdx() !== null}>
          {(() => {
            const idx = hoverIdx()!;
            const d = slicedData()[idx];
            if (!d) return null;
            const x = scaleX(idx);
            const variance = d.actual - d.budget;
            const tooltipX = x + (idx > slicedData().length / 2 ? -90 : 10);
            return (
              <>
                <line x1={x} y1={PAD.top} x2={x} y2={PAD.top + chartH()} stroke="var(--dls-text-secondary)" stroke-width="0.5" stroke-dasharray="2 2" />
                <circle cx={x} cy={scaleY(d.actual)} r={3.5} fill="var(--blue-9, #2563eb)" />
                <circle cx={x} cy={scaleY(d.budget)} r={2.5} fill="var(--dls-text-secondary)" />
                <rect x={tooltipX} y={PAD.top + 4} width={80} height={52} rx={4} fill="var(--dls-surface)" stroke="var(--dls-border)" stroke-width="0.5" opacity="0.95" />
                <text x={tooltipX + 6} y={PAD.top + 16} font-size="8" font-weight="600" fill="var(--dls-text-primary)">{d.date}</text>
                <text x={tooltipX + 6} y={PAD.top + 28} font-size="8" fill="var(--blue-9, #2563eb)">Actual: {formatDollar(d.actual)}</text>
                <text x={tooltipX + 6} y={PAD.top + 39} font-size="8" fill="var(--dls-text-secondary)">Budget: {formatDollar(d.budget)}</text>
                <text x={tooltipX + 6} y={PAD.top + 50} font-size="8" fill={variance >= 0 ? "var(--green-9, #16a34a)" : "var(--red-9, #dc2626)"}>
                  Var: {variance >= 0 ? "+" : ""}{formatDollar(variance)}
                </text>
              </>
            );
          })()}
        </Show>
      </svg>
    </div>
  );
}

export default RevenueChart;
