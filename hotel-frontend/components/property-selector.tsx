import { For } from "solid-js";
import type { HotelStore } from "../state/hotel-store";

/** Hard-coded property list matching the seed data. Will be replaced by a Convex query later. */
const PROPERTIES: { slug: string; name: string }[] = [
  // Texas / South Central
  { slug: "marriott-dallas", name: "Marriott Dallas Downtown" },
  { slug: "hilton-houston", name: "Hilton Houston Galleria" },
  { slug: "courtyard-austin", name: "Courtyard Austin Airport" },
  { slug: "hampton-san-antonio", name: "Hampton Inn San Antonio Riverwalk" },
  { slug: "fairfield-dallas", name: "Fairfield Inn Dallas Plano" },
  { slug: "ac-fort-worth", name: "AC Hotel Fort Worth" },
  { slug: "hie-houston", name: "Holiday Inn Express Houston Energy Corridor" },
  // Southeast
  { slug: "ihg-nashville", name: "IHG Hotel & Suites Nashville" },
  { slug: "residence-atlanta", name: "Residence Inn Atlanta Midtown" },
  { slug: "sheraton-new-orleans", name: "Sheraton New Orleans" },
  { slug: "doubletree-charlotte", name: "DoubleTree Charlotte Airport" },
  { slug: "hgi-orlando", name: "Hilton Garden Inn Orlando" },
  // Mountain / West
  { slug: "hyatt-denver", name: "Hyatt Regency Denver" },
  { slug: "embassy-phoenix", name: "Embassy Suites Phoenix Biltmore" },
  { slug: "westin-austin", name: "The Westin Austin Downtown" },
];

export function PropertySelector(props: { store: HotelStore }) {
  return (
    <select
      class="text-xs rounded px-2 py-1 border outline-none max-w-[220px] truncate"
      style={{
        "background-color": "var(--dls-surface)",
        "border-color": "var(--dls-border)",
        color: "var(--dls-text-primary)",
      }}
      value={props.store.state.selectedPropertySlug ?? ""}
      onChange={(e) => {
        const val = e.currentTarget.value;
        props.store.setProperty(val || null);
      }}
    >
      <option value="">All Properties</option>
      <For each={PROPERTIES}>
        {(p) => <option value={p.slug}>{p.name}</option>}
      </For>
    </select>
  );
}
