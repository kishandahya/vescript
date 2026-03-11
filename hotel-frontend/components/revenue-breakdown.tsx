import { createMemo, createSignal, For, Show } from "solid-js";

// ---------------------------------------------------------------------------
// RevenueBreakdown – SVG stacked bar chart: revenue by source
// ---------------------------------------------------------------------------

interface RevenueBreakdownProps {
  data: { date: string; room: number; fnb: number; ancillary: number; other: number }[];
  height?: number;
}

const DEMO_BREAKDOWN = [
  { date: "Mon", room: 42000, fnb: 8500, ancillary: 3200, other: 1800 },
  { date: "Tue", room: 44000, fnb: 9200, ancillary: 2800, other: 2100 },
  { date: "Wed", room: 46000, fnb: 8800, ancillary: 3500, other: 1600 },
  { date: "Thu", room: 48000, fnb: 9500, ancillary: 3100, other: 2400 },
  { date: "Fri", room: 52000, fnb: 11200, ancillary: 4200, other: 3100 },
  { date: "Sat", room: 38000, fnb: 12500, ancillary: 5100, other: 3800 },
  { date: "Sun", room: 35000, fnb: 10800, ancillary: 4600, other: 2900 },
];

const SEGMENTS = [
  { key: "room" as const, label: "Room", color: "var(--blue-9, #2563eb)" },
  { key: "fnb" as const, label: "F&B", color: "var(--orange-9, #ea580c)" },
  { key: "ancillary" as const, label: "Ancillary", color: "var(--green-9, #16a34a)" },
  { key: "other" as const, label: "Other", color: "var(--slate-9, #64748b)" },
] as const;

const PAD = { top: 24, right: 16, bottom: 28, left: 52 };
const SVG_WIDTH = 480;

function formatDollar(v: number): string {
  return v >= 1000 ? `$${Math.round(v / 1000)}K` : `$${v}`;
}

export function RevenueBreakdown(props: RevenueBreakdownProps) {
  const height = () => props.height ?? 260;
  const data = () => (props.data.length ? props.data : DEMO_BREAKDOWN);

  const [hoverBar, setHoverBar] = createSignal<number | null>(null);
  const [hoverSeg, setHoverSeg] = createSignal<string | null>(null);

  const chartW = () => SVG_WIDTH - PAD.left - PAD.right;
  const chartH = () => height() - PAD.top - PAD.bottom;

  const totals = createMemo(() =>
    data().map((d) => d.room + d.fnb + d.ancillary + d.other),
  );

  const maxTotal = createMemo(() => Math.max(...totals()));

  const yDomain = createMemo(() => {
    const mx = maxTotal();
    const ceil = Math.ceil(mx / 10000) * 10000;
    return { min: 0, max: ceil || 80000 };
  });

  const scaleY = (v: number) => {
    const { max } = yDomain();
    return PAD.top + chartH() - (v / max) * chartH();
  };

  const barWidth = createMemo(() => {
    const n = data().length;
    const gap = 0.35;
    return (chartW() / n) * (1 - gap);
  });

  const barX = (i: number) => {
    const n = data().length;
    const slotW = chartW() / n;
    return PAD.left + slotW * i + (slotW - barWidth()) / 2;
  };

  const yTicks = createMemo(() => {
    const { max } = yDomain();
    const step = max / 4;
    return Array.from({ length: 5 }, (_, i) => i * step);
  });

  return (
    <div class="rounded-[var(--dls-radius)] border border-[var(--dls-border)] bg-[var(--dls-surface)] p-4">
      {/* Header */}
      <h3 class="mb-2 text-sm font-semibold text-[var(--dls-text-primary)]">
        Revenue by Source
      </h3>

      {/* Legend */}
      <div class="mb-2 flex flex-wrap gap-3 text-xs text-[var(--dls-text-secondary)]">
        <For each={SEGMENTS}>
          {(seg) => (
            <span class="flex items-center gap-1">
              <span class="inline-block size-2.5 rounded-sm" style={{ background: seg.color }} />
              {seg.label}
            </span>
          )}
        </For>
      </div>

      {/* SVG */}
      <svg
        viewBox={`0 0 ${SVG_WIDTH} ${height()}`}
        class="w-full"
        style={{ height: `${height()}px` }}
        onMouseLeave={() => { setHoverBar(null); setHoverSeg(null); }}
      >
        {/* Y-axis grid & labels */}
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

        {/* Stacked bars */}
        <For each={data()}>
          {(d, i) => {
            let cumY = 0;
            return (
              <>
                <For each={SEGMENTS}>
                  {(seg) => {
                    const val = d[seg.key];
                    const yBottom = scaleY(cumY);
                    const yTop = scaleY(cumY + val);
                    const segHeight = yBottom - yTop;
                    cumY += val;
                    const isHovered = hoverBar() === i() && hoverSeg() === seg.key;
                    return (
                      <rect
                        x={barX(i())}
                        y={yTop}
                        width={barWidth()}
                        height={Math.max(segHeight, 0)}
                        fill={seg.color}
                        opacity={hoverBar() === null || isHovered ? 1 : 0.5}
                        rx={1}
                        onMouseEnter={() => { setHoverBar(i()); setHoverSeg(seg.key); }}
                      />
                    );
                  }}
                </For>

                {/* Total label above bar */}
                <text
                  x={barX(i()) + barWidth() / 2}
                  y={scaleY(totals()[i()]) - 5}
                  text-anchor="middle"
                  font-size="8"
                  font-weight="600"
                  fill="var(--dls-text-primary)"
                >
                  {formatDollar(totals()[i()])}
                </text>

                {/* X-axis label */}
                <text
                  x={barX(i()) + barWidth() / 2}
                  y={height() - 8}
                  text-anchor="middle"
                  font-size="9"
                  fill="var(--dls-text-secondary)"
                >
                  {d.date}
                </text>
              </>
            );
          }}
        </For>

        {/* Hover tooltip */}
        <Show when={hoverBar() !== null && hoverSeg() !== null}>
          {(() => {
            const idx = hoverBar()!;
            const segKey = hoverSeg()!;
            const d = data()[idx];
            if (!d) return null;
            const seg = SEGMENTS.find((s) => s.key === segKey);
            const val = d[segKey as keyof typeof d] as number;
            const x = barX(idx) + barWidth() / 2;
            const tooltipX = x + (idx > data().length / 2 ? -72 : 8);
            return (
              <g>
                <rect x={tooltipX} y={PAD.top} width={64} height={28} rx={4} fill="var(--dls-surface)" stroke="var(--dls-border)" stroke-width="0.5" opacity="0.95" />
                <text x={tooltipX + 5} y={PAD.top + 12} font-size="8" font-weight="600" fill={seg?.color}>{seg?.label}</text>
                <text x={tooltipX + 5} y={PAD.top + 22} font-size="8" fill="var(--dls-text-primary)">{formatDollar(val)}</text>
              </g>
            );
          })()}
        </Show>
      </svg>
    </div>
  );
}

export default RevenueBreakdown;
