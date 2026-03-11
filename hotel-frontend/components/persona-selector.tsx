import { For } from "solid-js";
import type { HotelStore } from "../state/hotel-store";
import { PERSONA_CONFIGS, type HotelPersona } from "../data/hotel-types";

const PERSONA_OPTIONS = Object.values(PERSONA_CONFIGS);

export function PersonaSelector(props: { store: HotelStore }) {
  return (
    <select
      class="text-xs rounded px-2 py-1 border outline-none"
      style={{
        "background-color": "var(--dls-surface)",
        "border-color": "var(--dls-border)",
        color: "var(--dls-text-primary)",
      }}
      value={props.store.state.persona}
      onChange={(e) =>
        props.store.setPersona(e.currentTarget.value as HotelPersona)
      }
    >
      <For each={PERSONA_OPTIONS}>
        {(cfg) => <option value={cfg.id}>{cfg.label}</option>}
      </For>
    </select>
  );
}
