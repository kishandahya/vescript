# Hotel Co-Pilot

OpenWork adapted for multi-property hotel management, modeled after Remington Hospitality's portfolio (15 properties, 3 regions, 3,898 rooms).

## What's Included

### Convex Backend (`convex/`)
- **Schema**: 20 tables (properties, rooms, reservations, rates, forecasts, invoices, groups, housekeeping, etc.)
- **8 query files** + **5 mutation files** covering all data access patterns
- **3 seed scripts** with realistic demo data for 15 properties

### SolidJS Frontend (`hotel-frontend/`)
- Dashboard shell with persona switcher (6 roles) and property selector (15 properties)
- **Overview tab**: KPI cards (Occupancy, ADR, RevPAR, Revenue), alerts, activity summary
- **Operations tab**: Floor-by-floor room grid (340 rooms), arrivals/departures, housekeeping
- **Revenue tab**: SVG line charts (actual vs budget), stacked bar breakdown, heatmap calendar
- **Portfolio tab**: Multi-property grid with sorting/filtering for district managers
- **Invoicing tab**: Invoice table, detail modal, anomaly badges, approval workflow
- **Forecasting tab**: 90-day forecast, booking pace, demand calendar, compression indicators
- All charts are pure SVG (zero external chart dependencies)

### OpenCode AI Integration (`.opencode/`)
- **10 skills**: Revenue manager, GM briefing, district manager, group booking, invoicing, forecasting, front office, housekeeping, collaborative, portfolio analysis
- **10 commands**: Morning briefing, rate review, portfolio flash, forecast, displacement analysis, invoice review, group analysis, demand calendar, property comparison, housekeeping optimize

### Documentation
- `HOTEL_COPILOT_DEMO.md`: 600-line demo walkthrough with 5 persona scenarios and 25-minute live demo script

## Integration with OpenWork

These files are designed to be placed into the [OpenWork](https://github.com/different-ai/openwork) repository:

| This repo | OpenWork destination |
|-----------|---------------------|
| `hotel-frontend/` | `packages/app/src/app/hotel/` |
| `convex/` | `convex/` |
| `.opencode/` | `.opencode/` |
| `HOTEL_COPILOT_DEMO.md` | `HOTEL_COPILOT_DEMO.md` |

### Route Integration
Add `"hotel"` to the `View` type in `packages/app/src/app/types.ts` and wire `HotelDashboard` into `app.tsx` (see `hotel-frontend/types-modified.ts` for the modified type).

## Quick Start (within OpenWork)

```bash
cd /path/to/openwork

# Start the UI
cd packages/app && pnpm dev
# Navigate to /hotel

# Optional: Start Convex for live data
npx convex dev
npx convex run seed:seed
npx convex run seedRooms:seedRooms
npx convex run seedFinancial:seedFinancial
```

## Personas

| Persona | Primary Tabs | Key Features |
|---------|-------------|--------------|
| General Manager | Overview, Operations | Morning briefing, room grid, alerts |
| Revenue Manager | Revenue, Forecasting | Rate analysis, comp set benchmarking |
| District Manager | Portfolio | Multi-property grid, sorting, benchmarking |
| Controller | Invoicing | Anomaly detection, approval workflow |
| Director of Sales | Forecasting | Demand calendar, group pipeline, booking pace |
| Front Office Manager | Operations | Room grid, arrivals/departures, housekeeping |

## Build Verification
- TypeScript: 0 errors in hotel module files
- Vite build: succeeds (2,108 modules transformed)
- All 6 tab pages wired into dashboard shell

## Stats
- **72 files** total
- **~7,100 lines** of TypeScript/TSX/Markdown
- **20 Convex tables** with realistic seed data
- **18 SolidJS components** + 6 page views + dashboard shell
