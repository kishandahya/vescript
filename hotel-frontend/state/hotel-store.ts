// ---------------------------------------------------------------------------
// Hotel UI state store – manages persona, active tab, property selection etc.
// ---------------------------------------------------------------------------
import { createStore } from "solid-js/store";
import { createMemo } from "solid-js";
import {
  type HotelPersona,
  type HotelTab,
  PERSONA_CONFIGS,
} from "../data/hotel-types";

interface HotelState {
  selectedPropertySlug: string | null;
  selectedRegionSlug: string | null;
  persona: HotelPersona;
  activeTab: HotelTab;
  portfolioView: boolean;
}

export function createHotelStore() {
  const [state, setState] = createStore<HotelState>({
    selectedPropertySlug: "marriott-dallas",
    selectedRegionSlug: null,
    persona: "gm",
    activeTab: "overview",
    portfolioView: false,
  });

  /** Resolved config for the active persona. */
  const personaConfig = createMemo(() => PERSONA_CONFIGS[state.persona]);

  /** Tabs available to the active persona. */
  const availableTabs = createMemo(() => personaConfig().tabs);

  // ------- Actions -------

  const setPersona = (p: HotelPersona) => {
    const config = PERSONA_CONFIGS[p];
    setState({ persona: p, activeTab: config.defaultTab });
  };

  const setTab = (tab: HotelTab) => setState("activeTab", tab);

  const setProperty = (slug: string | null) =>
    setState("selectedPropertySlug", slug);

  const setRegion = (slug: string | null) =>
    setState("selectedRegionSlug", slug);

  const togglePortfolioView = () =>
    setState("portfolioView", !state.portfolioView);

  return {
    state,
    personaConfig,
    availableTabs,
    setPersona,
    setTab,
    setProperty,
    setRegion,
    togglePortfolioView,
  };
}

export type HotelStore = ReturnType<typeof createHotelStore>;
