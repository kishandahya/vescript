import { Building2, Moon, Sun } from "lucide-solid";
import type { HotelStore } from "../state/hotel-store";
import { PersonaSelector } from "./persona-selector";
import { PropertySelector } from "./property-selector";

export function HotelHeader(props: { store: HotelStore }) {
  return (
    <header
      class="flex items-center justify-between px-4 py-3 border-b"
      style={{
        "background-color": "var(--dls-sidebar)",
        "border-color": "var(--dls-border)",
      }}
    >
      <div class="flex items-center gap-2">
        <Building2 size={20} style={{ color: "var(--dls-accent)" }} />
        <span
          class="font-semibold text-sm"
          style={{ color: "var(--dls-text-primary)" }}
        >
          Hotel Co-Pilot
        </span>
      </div>
      <PersonaSelector store={props.store} />
      <PropertySelector store={props.store} />
      <button
        class="flex items-center justify-center rounded p-1.5 hover:bg-[var(--dls-active)] transition-colors"
        style={{ color: "var(--dls-text-secondary)" }}
        title={props.store.state.darkMode ? "Switch to light mode" : "Switch to dark mode"}
        aria-label={props.store.state.darkMode ? "Switch to light mode" : "Switch to dark mode"}
        onClick={() => props.store.toggleDarkMode()}
      >
        {props.store.state.darkMode ? <Sun size={18} /> : <Moon size={18} />}
      </button>
    </header>
  );
}
