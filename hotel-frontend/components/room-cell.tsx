import { Show } from "solid-js";
import { Star } from "lucide-solid";

// ---------------------------------------------------------------------------
// RoomCell – small tile representing a single room in the grid
// ---------------------------------------------------------------------------

export interface RoomCellProps {
  number: string;
  status: string;
  guestName?: string;
  isVip?: boolean;
  hasSpecialRequests?: boolean;
  lateCheckout?: boolean;
  onClick?: () => void;
}

const STATUS_COLORS: Record<string, string> = {
  occupied: "bg-green-3 border-green-7 text-green-12",
  "vacant-clean": "bg-blue-3 border-blue-7 text-blue-12",
  "vacant-dirty": "bg-yellow-3 border-yellow-7 text-yellow-12",
  ooo: "bg-red-3 border-red-7 text-red-12",
  "due-out": "bg-orange-3 border-orange-7 text-orange-12",
  "due-in": "bg-cyan-3 border-cyan-7 text-cyan-12",
  inspected: "bg-slate-3 border-slate-7 text-slate-12",
};

const STATUS_LABELS: Record<string, string> = {
  occupied: "Occupied",
  "vacant-clean": "Vacant Clean",
  "vacant-dirty": "Vacant Dirty",
  ooo: "Out of Order",
  "due-out": "Due Out",
  "due-in": "Due In",
  inspected: "Inspected",
};

/** Extract last name from "First Last" style guest name. */
function lastName(name?: string): string {
  if (!name) return "";
  const parts = name.trim().split(" ");
  return parts[parts.length - 1];
}

export function RoomCell(props: RoomCellProps) {
  const colorClass = () => STATUS_COLORS[props.status] ?? "bg-slate-3 border-slate-7 text-slate-12";
  const tooltip = () => {
    const parts = [props.number, STATUS_LABELS[props.status] ?? props.status];
    if (props.guestName) parts.push(props.guestName);
    if (props.lateCheckout) parts.push("Late C/O");
    return parts.join(" · ");
  };

  return (
    <button
      class={`relative flex flex-col items-center justify-center rounded border w-[60px] h-[48px] text-center transition-shadow hover:shadow-md ${colorClass()}`}
      title={tooltip()}
      onClick={props.onClick}
    >
      {/* VIP star */}
      <Show when={props.isVip}>
        <Star class="absolute top-0.5 right-0.5 size-2.5 text-yellow-9 fill-yellow-9" />
      </Show>

      {/* Special requests dot */}
      <Show when={props.hasSpecialRequests}>
        <span class="absolute top-0.5 left-0.5 size-1.5 rounded-full bg-red-9" />
      </Show>

      {/* Room number */}
      <span class="text-[10px] font-bold leading-tight">{props.number}</span>

      {/* Guest last name (truncated) */}
      <Show when={props.status === "occupied" && props.guestName}>
        <span class="max-w-[52px] truncate text-[8px] leading-tight opacity-80">
          {lastName(props.guestName)}
        </span>
      </Show>
    </button>
  );
}
