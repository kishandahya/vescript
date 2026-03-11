import { createSignal, createMemo, For, Show } from "solid-js";

// ---------------------------------------------------------------------------
// 90-day occupancy forecast SVG line chart
// ---------------------------------------------------------------------------

interface ForecastChartProps {
  height?: number; // default 280
}

// Generate 90 days of forecast data
const DEMO_FORECAST = Array.from({ length: 90 }, (_, i) => {
  const date = new Date(2025, 0, 16 + i); // Jan 16 - Apr 15
  const dow = date.getDay();
  const isWeekend = dow === 0 || dow === 6;
  const baseOcc = isWeekend ? 65 : 78;
  // Near-term dates have higher confidence, far-out dates lower
  const confidence = Math.max(0.5, 1 - i / 120);
  const midForecast = baseOcc + Math.sin(i * 0.1) * 8 + (i < 30 ? 5 : 0);
  const lowForecast = midForecast - (1 - confidence) * 15;
  return {
    date: date.toISOString().slice(0, 10),
    dateLabel: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    otb: i < 30 ? midForecast + Math.random() * 5 - 2 : null, // OTB only for near-term
    forecast: Math.round(midForecast * 10) / 10,
    low: Math.round(lowForecast * 10) / 10,
    budget: baseOcc + 2,
    priorYear: baseOcc - 3 + Math.sin(i * 0.08) * 6,
  };
});

const MARGIN = { top: 36, right: 16, bottom: 32, left: 42 };
const Y_MIN = 50;
const Y_MAX = 100;

export function ForecastChart(props: ForecastChartProps) {
  const chartHeight = () => props.height ?? 280;
  const [hoverIdx, setHoverIdx] = createSignal<number | null>(null);
  let svgRef: SVGSVGElement | undefined;

  const innerW = () => 800 - MARGIN.left - MARGIN.right;
  const innerH = () => chartHeight() - MARGIN.top - MARGIN.bottom;

  const xScale = (i: number) => MARGIN.left + (i / (DEMO_FORECAST.length - 1)) * innerW();
  const yScale = (v: number) => {
    const clamped = Math.max(Y_MIN, Math.min(Y_MAX, v));
    return MARGIN.top + innerH() - ((clamped - Y_MIN) / (Y_MAX - Y_MIN)) * innerH();
  };

  // Path builders
  const forecastLine = createMemo(() =>
    DEMO_FORECAST.map((d, i) => `${i === 0 ? "M" : "L"}${xScale(i)},${yScale(d.forecast)}`).join(" "),
  );

  const budgetLine = createMemo(() =>
    DEMO_FORECAST.map((d, i) => `${i === 0 ? "M" : "L"}${xScale(i)},${yScale(d.budget)}`).join(" "),
  );

  const priorYearLine = createMemo(() =>
    DEMO_FORECAST.map((d, i) => `${i === 0 ? "M" : "L"}${xScale(i)},${yScale(d.priorYear)}`).join(" "),
  );

  // Confidence band polygon (forecast top → low bottom reversed)
  const confidenceBand = createMemo(() => {
    const upper = DEMO_FORECAST.map((d, i) => `${xScale(i)},${yScale(d.forecast)}`);
    const lower = [...DEMO_FORECAST].reverse().map((d, i) => `${xScale(DEMO_FORECAST.length - 1 - i)},${yScale(d.low)}`);
    return `${upper.join(" ")} ${lower.join(" ")}`;
  });

  // OTB points
  const otbPoints = createMemo(() =>
    DEMO_FORECAST.filter((d) => d.otb !== null).map((d, _, arr) => {
      const idx = DEMO_FORECAST.indexOf(d);
      return { x: xScale(idx), y: yScale(d.otb!), val: d.otb! };
    }),
  );

  // X-axis labels (every 15th day)
  const xLabels = createMemo(() =>
    DEMO_FORECAST.filter((_, i) => i % 15 === 0).map((d, _, __) => {
      const idx = DEMO_FORECAST.indexOf(d);
      return { x: xScale(idx), label: d.dateLabel };
    }),
  );

  // Y-axis ticks
  const yTicks = [50, 60, 70, 80, 90, 100];

  const handleMouseMove = (e: MouseEvent) => {
    if (!svgRef) return;
    const rect = svgRef.getBoundingClientRect();
    const scaleX = 800 / rect.width;
    const mouseX = (e.clientX - rect.left) * scaleX;
    const idx = Math.round(((mouseX - MARGIN.left) / innerW()) * (DEMO_FORECAST.length - 1));
    if (idx >= 0 && idx < DEMO_FORECAST.length) {
      setHoverIdx(idx);
    } else {
      setHoverIdx(null);
    }
  };

  const hovered = createMemo(() => {
    const i = hoverIdx();
    return i !== null ? DEMO_FORECAST[i] : null;
  });

  return (
    <div class="rounded-[var(--dls-radius)] border border-[var(--dls-border)] bg-[var(--dls-surface)] p-4">
      <div class="flex items-center justify-between mb-2">
        <h3 class="text-sm font-semibold text-[var(--dls-text-primary)]">90-Day Occupancy Forecast</h3>
        {/* Legend */}
        <div class="flex items-center gap-4 text-[10px] text-[var(--dls-text-secondary)]">
          <span class="flex items-center gap-1"><span class="inline-block w-4 h-0.5 bg-blue-9 rounded" /> Forecast</span>
          <span class="flex items-center gap-1"><span class="inline-block w-4 h-0.5 bg-slate-8 rounded" style="border-top: 1px dashed" /> Budget</span>
          <span class="flex items-center gap-1"><span class="inline-block w-4 h-0.5 bg-green-9 rounded opacity-60" /> Prior Year</span>
          <span class="flex items-center gap-1"><span class="inline-block size-2 rounded-full bg-blue-11" /> OTB</span>
          <span class="flex items-center gap-1"><span class="inline-block w-4 h-2 bg-blue-4 rounded opacity-50" /> Confidence</span>
        </div>
      </div>

      <svg
        ref={svgRef}
        viewBox={`0 0 800 ${chartHeight()}`}
        class="w-full"
        style={{ height: `${chartHeight()}px`, "max-height": `${chartHeight()}px` }}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHoverIdx(null)}
      >
        {/* Grid lines */}
        <For each={yTicks}>
          {(tick) => (
            <line
              x1={MARGIN.left}
              x2={800 - MARGIN.right}
              y1={yScale(tick)}
              y2={yScale(tick)}
              stroke="var(--dls-border)"
              stroke-width="0.5"
            />
          )}
        </For>

        {/* Confidence band */}
        <polygon points={confidenceBand()} fill="var(--blue-4, #bfdbfe)" opacity="0.35" />

        {/* Budget line (dashed gray) */}
        <path d={budgetLine()} fill="none" stroke="var(--slate-8, #94a3b8)" stroke-width="1.5" stroke-dasharray="6 3" />

        {/* Prior year line (dotted green) */}
        <path d={priorYearLine()} fill="none" stroke="var(--green-9, #22c55e)" stroke-width="1.2" stroke-dasharray="2 3" opacity="0.6" />

        {/* Forecast line (solid blue) */}
        <path d={forecastLine()} fill="none" stroke="var(--blue-9, #3b82f6)" stroke-width="2" />

        {/* OTB dots */}
        <For each={otbPoints()}>
          {(pt) => <circle cx={pt.x} cy={pt.y} r="2.5" fill="var(--blue-11, #1e40af)" />}
        </For>

        {/* Y-axis labels */}
        <For each={yTicks}>
          {(tick) => (
            <text
              x={MARGIN.left - 6}
              y={yScale(tick) + 3}
              text-anchor="end"
              class="text-[10px]"
              fill="var(--dls-text-secondary)"
            >
              {tick}%
            </text>
          )}
        </For>

        {/* X-axis labels */}
        <For each={xLabels()}>
          {(label) => (
            <text
              x={label.x}
              y={chartHeight() - 8}
              text-anchor="middle"
              class="text-[10px]"
              fill="var(--dls-text-secondary)"
            >
              {label.label}
            </text>
          )}
        </For>

        {/* Hover crosshair + tooltip */}
        <Show when={hoverIdx() !== null}>
          <line
            x1={xScale(hoverIdx()!)}
            x2={xScale(hoverIdx()!)}
            y1={MARGIN.top}
            y2={chartHeight() - MARGIN.bottom}
            stroke="var(--dls-text-secondary)"
            stroke-width="0.5"
            stroke-dasharray="3 2"
          />
          <circle cx={xScale(hoverIdx()!)} cy={yScale(hovered()!.forecast)} r="4" fill="var(--blue-9, #3b82f6)" />

          {/* Tooltip background */}
          <rect
            x={Math.min(xScale(hoverIdx()!) + 8, 640)}
            y={MARGIN.top + 4}
            width="150"
            height="82"
            rx="4"
            fill="var(--dls-surface)"
            stroke="var(--dls-border)"
            stroke-width="1"
            opacity="0.95"
          />
          <text
            x={Math.min(xScale(hoverIdx()!) + 16, 648)}
            y={MARGIN.top + 20}
            class="text-[10px] font-bold"
            fill="var(--dls-text-primary)"
          >
            {hovered()!.dateLabel}
          </text>
          <text x={Math.min(xScale(hoverIdx()!) + 16, 648)} y={MARGIN.top + 34} class="text-[10px]" fill="var(--blue-9, #3b82f6)">
            Forecast: {hovered()!.forecast.toFixed(1)}%
          </text>
          <text x={Math.min(xScale(hoverIdx()!) + 16, 648)} y={MARGIN.top + 48} class="text-[10px]" fill="var(--slate-8, #94a3b8)">
            Budget: {hovered()!.budget}%
          </text>
          <text x={Math.min(xScale(hoverIdx()!) + 16, 648)} y={MARGIN.top + 62} class="text-[10px]" fill="var(--green-9, #22c55e)">
            Prior Year: {hovered()!.priorYear.toFixed(1)}%
          </text>
          <Show when={hovered()!.otb !== null}>
            <text x={Math.min(xScale(hoverIdx()!) + 16, 648)} y={MARGIN.top + 76} class="text-[10px]" fill="var(--blue-11, #1e40af)">
              OTB: {hovered()!.otb!.toFixed(1)}%
            </text>
          </Show>
        </Show>
      </svg>
    </div>
  );
}
