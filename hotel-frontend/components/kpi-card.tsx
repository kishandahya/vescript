import { Show } from "solid-js";
import { TrendingUp, TrendingDown } from "lucide-solid";
import { Sparkline } from "./sparkline";

// ---------------------------------------------------------------------------
// KpiCard – reusable metric card for hotel KPIs
// ---------------------------------------------------------------------------

interface KpiCardProps {
  label: string;
  value: string | number;
  unit?: string;
  prefix?: string;
  target?: number;
  delta?: number;
  trend?: number[];
  onClick?: () => void;
}

/**
 * Determine the colour class for a delta value.
 * Positive → green, negative → red, near-zero (±0.5) → yellow.
 */
function deltaColorClass(delta: number): string {
  if (Math.abs(delta) < 0.5) return "text-yellow-11";
  return delta > 0 ? "text-green-11" : "text-red-11";
}

export function KpiCard(props: KpiCardProps) {
  const formattedValue = () => {
    const raw = typeof props.value === "number" ? props.value.toLocaleString() : props.value;
    const prefix = props.prefix ?? "";
    const unit = props.unit ?? "";
    return `${prefix}${raw}${unit}`;
  };

  const formattedTarget = () => {
    if (props.target == null) return "";
    const prefix = props.prefix ?? "";
    const unit = props.unit ?? "";
    return `${prefix}${props.target.toLocaleString()}${unit}`;
  };

  return (
    <div
      class={[
        "rounded-[var(--dls-radius)] border border-[var(--dls-border)]",
        "bg-[var(--dls-surface)] p-4",
        "transition-shadow duration-150",
        "hover:shadow-md",
        props.onClick ? "cursor-pointer" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      onClick={props.onClick}
      role={props.onClick ? "button" : undefined}
      tabIndex={props.onClick ? 0 : undefined}
      onKeyDown={(e: KeyboardEvent) => {
        if (props.onClick && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          props.onClick();
        }
      }}
    >
      {/* Header row: label + delta */}
      <div class="flex items-center justify-between gap-2">
        <span class="text-xs font-medium uppercase tracking-wide text-[var(--dls-text-secondary)]">
          {props.label}
        </span>

        <Show when={props.delta != null}>
          <span
            class={`inline-flex items-center gap-0.5 text-xs font-semibold ${deltaColorClass(props.delta!)}`}
          >
            {props.delta! > 0 ? (
              <TrendingUp class="size-3.5" />
            ) : (
              <TrendingDown class="size-3.5" />
            )}
            {props.delta! > 0 ? "+" : ""}
            {props.delta!.toFixed(1)}%
          </span>
        </Show>
      </div>

      {/* Value */}
      <div class="mt-1 text-2xl font-bold text-[var(--dls-text-primary)]">
        {formattedValue()}
      </div>

      {/* Target comparison */}
      <Show when={props.target != null}>
        <div class="mt-0.5 text-xs text-[var(--dls-text-secondary)]">
          vs.&nbsp;budget:&nbsp;{formattedTarget()}
        </div>
      </Show>

      {/* Sparkline */}
      <Show when={props.trend && props.trend.length >= 2}>
        <div class="mt-2">
          <Sparkline data={props.trend!} width={120} height={32} />
        </div>
      </Show>
    </div>
  );
}

// ---------------------------------------------------------------------------
// KpiCardGrid – responsive grid wrapper for a set of KPI cards
// ---------------------------------------------------------------------------

export function KpiCardGrid(props: { children: any }) {
  return (
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {props.children}
    </div>
  );
}

export default KpiCard;
