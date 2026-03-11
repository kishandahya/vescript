# Hotel Co-Pilot

A multi-property hotel management dashboard modeled after Remington Hospitality's portfolio (15 properties, 3 regions, 3,898 rooms). Built with SolidJS, Convex, and Tailwind CSS v4.

## Quick Start

```bash
npm install
npm run dev
# Open http://localhost:5173 — works immediately with demo data

# Optional: Connect to Convex for live data
npx convex dev          # Creates .env.local with VITE_CONVEX_URL
npm run convex:seed     # Seeds all demo data (properties, rooms, financials)
npm run dev             # Now uses live Convex data
```

## What's Included

### Convex Backend (`convex/`)
- **Schema**: 20 tables (properties, rooms, reservations, rates, forecasts, invoices, groups, housekeeping, etc.)
- **8 query files** + **5 mutation files** covering all data access patterns
- **3 seed scripts** with realistic demo data for 15 properties

### SolidJS Frontend (`hotel-frontend/`)
- Dashboard shell with persona switcher (6 roles) and property selector (15 properties)
- **7 tab pages**: Overview, Operations, Revenue, Portfolio, Invoicing, Forecasting, Groups
- All charts are pure SVG — zero external chart dependencies
- Dark mode toggle in the header

### OpenCode AI Integration (`.opencode/`)
- **10 skills**: Revenue manager, GM briefing, district manager, group booking, invoicing, forecasting, front office, housekeeping, collaborative, portfolio analysis
- **10 commands**: Morning briefing, rate review, portfolio flash, forecast, displacement analysis, invoice review, group analysis, demand calendar, property comparison, housekeeping optimize

### Documentation
- `HOTEL_COPILOT_DEMO.md` — 600-line demo walkthrough with 5 persona scenarios and 25-minute live demo script

## Personas

| Persona | Primary Tabs | Key Features |
|---------|-------------|--------------|
| General Manager | Overview, Operations | Morning briefing, room grid, alerts |
| Revenue Manager | Revenue, Forecasting | Rate analysis, comp set benchmarking |
| District Manager | Portfolio | Multi-property grid, sorting, benchmarking |
| Controller | Invoicing | Anomaly detection, approval workflow |
| Director of Sales | Forecasting, Groups | Demand calendar, group pipeline, booking pace |
| Front Office Manager | Operations | Room grid, arrivals/departures, housekeeping |

## Tech Stack

- **SolidJS** — reactive UI framework
- **Convex** — backend-as-a-service (schema, queries, mutations, seed scripts)
- **Tailwind CSS v4** — utility-first styling via `@tailwindcss/vite` plugin
- **Vite** — dev server and bundler
- **TypeScript** — strict mode, end-to-end type safety
- **lucide-solid** — icon library

## Project Structure

```
├── index.html                  # Vite entry HTML
├── src/index.tsx               # App bootstrap (Convex provider + fallback)
├── vite.config.ts              # Vite + SolidJS + Tailwind v4
├── tsconfig.json               # TypeScript config
├── package.json                # Dependencies and scripts
├── .env.local.example          # Environment variable template
│
├── convex/                     # Convex backend
│   ├── schema.ts               # 20-table schema
│   ├── seed.ts                 # Core seed data
│   ├── seedRooms.ts            # Room seed data
│   ├── seedFinancial.ts        # Financial seed data
│   ├── *Queries.ts             # Query functions
│   └── *Mutations.ts           # Mutation functions
│
├── hotel-frontend/             # SolidJS frontend
│   ├── hotel-dashboard.tsx     # Main dashboard shell
│   ├── index.css               # Tailwind v4 entry + custom styles
│   ├── state/hotel-store.ts    # Global reactive store
│   ├── data/                   # Data layer
│   │   ├── convex-client.ts    # Convex client + provider
│   │   ├── hotel-data-service.ts # Demo data fallback
│   │   └── hotel-types.ts      # Shared TypeScript types
│   ├── components/             # Reusable UI components
│   └── pages/                  # Tab pages (7 views)
│
├── .opencode/                  # AI skills and commands
│   ├── skills/                 # 10 AI skill definitions
│   └── commands/               # 10 AI command definitions
│
└── HOTEL_COPILOT_DEMO.md       # Demo walkthrough
```

## Dark Mode

Toggle dark mode using the sun/moon button in the header. The theme is persisted in the reactive store and applies Tailwind's `dark` class to the dashboard root.
