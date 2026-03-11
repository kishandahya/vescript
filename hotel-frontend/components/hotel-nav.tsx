import { For } from "solid-js";
import type { HotelStore } from "../state/hotel-store";
import type { HotelTab } from "../data/hotel-types";

/** Human-readable labels for each hotel tab. */
const TAB_LABELS: Record<HotelTab, string> = {
  overview: "Overview",
  portfolio: "Portfolio",
  revenue: "Revenue",
  forecast: "Forecast",
  operations: "Operations",
  groups: "Groups",
  invoices: "Invoices",
};

export function HotelNav(props: { store: HotelStore }) {
  return (
    <nav
      class="flex items-center gap-1 px-4 py-1 border-b overflow-x-auto"
      style={{
        "background-color": "var(--dls-sidebar)",
        "border-color": "var(--dls-border)",
      }}
    >
      <For each={props.store.availableTabs()}>
        {(tab) => {
          const isActive = () => props.store.state.activeTab === tab;
          return (
            <button
              class="px-3 py-1.5 text-xs font-medium rounded transition-colors"
              style={{
                "background-color": isActive()
                  ? "var(--dls-active)"
                  : "transparent",
                color: isActive()
                  ? "var(--dls-accent)"
                  : "var(--dls-text-secondary)",
              }}
              onClick={() => props.store.setTab(tab)}
            >
              {TAB_LABELS[tab]}
            </button>
          );
        }}
      </For>
    </nav>
  );
}
