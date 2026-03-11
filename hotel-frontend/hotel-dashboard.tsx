import { Switch, Match } from "solid-js";
import { createHotelStore } from "./state/hotel-store";
import { HotelHeader } from "./components/hotel-header";
import { HotelNav } from "./components/hotel-nav";
import { HotelOverview } from "./pages/hotel-overview";
import { HotelOperations } from "./pages/hotel-operations";
import { HotelPortfolio } from "./pages/hotel-portfolio";
import { HotelRevenue } from "./pages/hotel-revenue";
import { HotelInvoicing } from "./pages/hotel-invoicing";
import { HotelForecasting } from "./pages/hotel-forecasting";
import { HotelGroups } from "./pages/hotel-groups";

export default function HotelDashboard() {
  const store = createHotelStore();

  return (
    <div
      class="flex flex-col h-full"
      style={{
        "background-color": "var(--dls-surface)",
        color: "var(--dls-text-primary)",
      }}
    >
      <HotelHeader store={store} />
      <HotelNav store={store} />
      <main class="flex-1 overflow-y-auto p-4">
        <Switch fallback={<div>Select a tab</div>}>
          <Match when={store.state.activeTab === "overview"}>
            <HotelOverview store={store} />
          </Match>
          <Match when={store.state.activeTab === "operations"}>
            <HotelOperations store={store} />
          </Match>
          <Match when={store.state.activeTab === "revenue"}>
            <HotelRevenue store={store} />
          </Match>
          <Match when={store.state.activeTab === "portfolio"}>
            <HotelPortfolio store={store} />
          </Match>
          <Match when={store.state.activeTab === "invoices"}>
            <HotelInvoicing store={store} />
          </Match>
          <Match when={store.state.activeTab === "forecast"}>
            <HotelForecasting store={store} />
          </Match>
          <Match when={store.state.activeTab === "groups"}>
            <HotelGroups store={store} />
          </Match>
        </Switch>
      </main>
    </div>
  );
}
