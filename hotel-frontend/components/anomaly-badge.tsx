import { Switch, Match } from "solid-js";
import { AlertTriangle, Flag, FileText, Copy, DollarSign } from "lucide-solid";

// ---------------------------------------------------------------------------
// AnomalyBadge – small pill badge for invoice anomaly flags
// ---------------------------------------------------------------------------

interface AnomalyBadgeProps {
  type: string; // "over-contract" | "unusual-amount" | "missing-po" | "duplicate" | "capital-approval"
}

const BADGE_CONFIG: Record<string, { label: string; bg: string; text: string }> = {
  "over-contract": { label: "Over Contract", bg: "bg-red-3", text: "text-red-11" },
  "unusual-amount": { label: "Unusual Amount", bg: "bg-yellow-3", text: "text-yellow-11" },
  "missing-po": { label: "Missing PO", bg: "bg-orange-3", text: "text-orange-11" },
  duplicate: { label: "Duplicate", bg: "bg-red-3", text: "text-red-11" },
  "capital-approval": { label: "Capital Approval", bg: "bg-blue-3", text: "text-blue-11" },
};

export function AnomalyBadge(props: AnomalyBadgeProps) {
  const config = () => BADGE_CONFIG[props.type] ?? { label: props.type, bg: "bg-gray-3", text: "text-gray-11" };

  return (
    <span
      class={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${config().bg} ${config().text}`}
    >
      <Switch fallback={<Flag class="size-3" />}>
        <Match when={props.type === "over-contract"}>
          <AlertTriangle class="size-3" />
        </Match>
        <Match when={props.type === "unusual-amount"}>
          <DollarSign class="size-3" />
        </Match>
        <Match when={props.type === "missing-po"}>
          <FileText class="size-3" />
        </Match>
        <Match when={props.type === "duplicate"}>
          <Copy class="size-3" />
        </Match>
        <Match when={props.type === "capital-approval"}>
          <Flag class="size-3" />
        </Match>
      </Switch>
      {config().label}
    </span>
  );
}
