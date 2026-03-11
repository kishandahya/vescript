import { Show } from "solid-js";
import { TrendingUp, TrendingDown } from "lucide-solid";
import { Sparkline } from "./sparkline";

// ---------------------------------------------------------------------------
// PropertyCard – card showing a single property's key metrics
// ---------------------------------------------------------------------------

export interface PropertyCardProps {
  name: string;
  brand: string;
  market: string;
  totalRooms: number;
  occupancy: number;
  adr: number;
  revpar: number;
  revenue: number;
  occDelta: number;
  adrDelta: number;
  revparDelta: number;
  trend: number[];
  onClick?: () => void;
}

/** Compact revenue string, e.g. "$52K" or "$1.2M". */
function compactRevenue(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${Math.round(value / 1_000)}K`;
  return `$${value}`;
}

/** Border color class based on delta values. */
function borderColor(occ: number, adr: number, revpar: number): string {
  const allPositive = occ > 0 && adr > 0 && revpar > 0;
  const anyNegative = occ < 0 || adr < 0 || revpar < 0;
  if (allPositive) return "border-green-7";
  if (anyNegative && !allPositive) {
    const allNeg = occ < 0 && adr < 0 && revpar < 0;
    return allNeg ? "border-red-7" : "border-yellow-7";
  }
  return "border-yellow-7";
}

/** Delta badge – inline colored chip showing +/- delta. */
function DeltaBadge(props: { delta: number }) {
  const colorClass = () =>
    props.delta > 0 ? "text-green-11 bg-green-3" : props.delta < 0 ? "text-red-11 bg-red-3" : "text-yellow-11 bg-yellow-3";
  return (
    <span class={`inline-flex items-center gap-0.5 rounded px-1 py-0.5 text-[10px] font-semibold ${colorClass()}`}>
      {props.delta > 0 ? <TrendingUp class="size-2.5" /> : <TrendingDown class="size-2.5" />}
      {props.delta > 0 ? "+" : ""}
      {props.delta.toFixed(1)}%
    </span>
  );
}

export function PropertyCard(props: PropertyCardProps) {
  return (
    <div
      class={[
        "rounded-[var(--dls-radius)] border bg-[var(--dls-surface)] p-4",
        "transition-shadow duration-150 hover:shadow-md",
        borderColor(props.occDelta, props.adrDelta, props.revparDelta),
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
      {/* Header */}
      <div class="mb-3">
        <div class="text-sm font-bold text-[var(--dls-text-primary)] leading-tight">{props.name}</div>
        <div class="text-xs text-[var(--dls-text-secondary)]">
          {props.brand} · {props.market} · {props.totalRooms} rooms
        </div>
      </div>

      {/* 2×2 metric grid */}
      <div class="grid grid-cols-2 gap-2">
        <div class="rounded bg-[var(--dls-sidebar)] p-2">
          <div class="text-[10px] uppercase tracking-wide text-[var(--dls-text-secondary)]">Occ%</div>
          <div class="flex items-baseline gap-1">
            <span class="text-base font-bold text-[var(--dls-text-primary)]">{props.occupancy}%</span>
            <DeltaBadge delta={props.occDelta} />
          </div>
        </div>
        <div class="rounded bg-[var(--dls-sidebar)] p-2">
          <div class="text-[10px] uppercase tracking-wide text-[var(--dls-text-secondary)]">ADR</div>
          <div class="flex items-baseline gap-1">
            <span class="text-base font-bold text-[var(--dls-text-primary)]">${props.adr}</span>
            <DeltaBadge delta={props.adrDelta} />
          </div>
        </div>
        <div class="rounded bg-[var(--dls-sidebar)] p-2">
          <div class="text-[10px] uppercase tracking-wide text-[var(--dls-text-secondary)]">RevPAR</div>
          <div class="flex items-baseline gap-1">
            <span class="text-base font-bold text-[var(--dls-text-primary)]">${props.revpar}</span>
            <DeltaBadge delta={props.revparDelta} />
          </div>
        </div>
        <div class="rounded bg-[var(--dls-sidebar)] p-2">
          <div class="text-[10px] uppercase tracking-wide text-[var(--dls-text-secondary)]">Revenue</div>
          <div class="text-base font-bold text-[var(--dls-text-primary)]">{compactRevenue(props.revenue)}</div>
        </div>
      </div>

      {/* Sparkline */}
      <Show when={props.trend && props.trend.length >= 2}>
        <div class="mt-3">
          <Sparkline data={props.trend} width={200} height={28} />
        </div>
      </Show>
    </div>
  );
}

export default PropertyCard;
