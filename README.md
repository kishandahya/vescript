# Hotel Copilot — AI Co-Worker for Hotel Management

An agentic co-worker built on [OpenWork](https://github.com/different-ai/openwork) for hotel management companies. Hotel Copilot connects into your hotel systems (PMS, RMS, accounting) and gives every persona — from GMs to SVPs — an AI assistant that knows their data.

Modeled after a real portfolio: 15 properties, 3 regions, ~3,900 rooms.

## What's Included

### AI Skills (4 priority + 6 additional)

| Skill | Description |
|-------|-------------|
| **hotel-gm-briefing** | Morning briefing — GM's daily operational summary (night audit, arrivals, guest experience, action items) |
| **hotel-revenue-manager** | Rate review, pricing strategy, comp set analysis, displacement analysis |
| **hotel-portfolio-analysis** | Cross-property expense benchmarking, utility/labor cost comparison, outlier detection |
| **hotel-district-manager** | Portfolio flash, property scorecard, regional oversight, coaching recommendations |
| hotel-forecasting | 90-day demand forecasting |
| hotel-front-office | Front desk operations |
| hotel-group-booking | Group block management |
| hotel-housekeeping | Housekeeping optimization |
| hotel-invoice-review | Invoice anomaly detection |
| hotel-collaborative | Cross-skill coordination |

### Agent Personas (4)

| Persona | Role | Scope | Example Prompt |
|---------|------|-------|----------------|
| `hotel-gm` | General Manager | Single property | "Give me my morning briefing" |
| `hotel-revenue-mgr` | Revenue Manager | Single property | "How are my rates vs the comp set?" |
| `hotel-district-mgr` | District Manager | Region (5-10 hotels) | "Which property needs attention?" |
| `hotel-svp` | SVP Operations | Full portfolio (15 hotels) | "Portfolio revenue flash" |

Each persona has a pre-configured identity in `config/personas.json` with name, role, property/region scope, and associated agent definition.

### Commands (5 priority + 6 additional)

| Command | Persona | Description |
|---------|---------|-------------|
| `/morning-briefing` | GM | Generate the day's executive digest |
| `/rate-review` | Revenue Mgr | Comp set analysis + rate recommendations |
| `/portfolio-flash` | District Mgr | Multi-property scorecard with red/yellow/green |
| `/property-comparison` | District Mgr / SVP | Side-by-side property benchmarking |
| `/show-reports` | Any | List recent scheduled reports |
| `/forecast-90day` | Revenue Mgr | 90-day demand forecast |
| `/displacement-analysis` | Revenue Mgr | Group vs. transient revenue tradeoff |
| `/invoice-review` | Controller | Invoice anomaly scan |
| `/group-analysis` | Dir. of Sales | Group booking pipeline |
| `/demand-calendar` | Revenue Mgr | Date-level demand heatmap |
| `/housekeeping-optimize` | Front Office | Room assignment optimization |

### Data Layer

- **Convex** real-time database with **21 tables**: `properties`, `regions`, `portfolio`, `rooms`, `reservations`, `dailySummaries`, `compSets`, `dailyRates`, `forecasts`, `groups`, `invoices`, `marketEvents`, `housekeepingRooms`, `attendants`, `nightAudits`, `guestFeedback`, `vendorContracts`, `portfolioKpis`, `expenseComparisons`, `demandCalendar`, and more
- **Hotel Data MCP Server** (`mcp/hotel-data-server.ts`) — bridges Convex to AI with 6 tools:
  - `get_property_summary` — Daily KPIs (occupancy, ADR, RevPAR, revenue vs. budget)
  - `get_portfolio_overview` — Cross-property rollup with regional aggregates
  - `get_rate_position` — Rate positioning vs. competitive set
  - `get_arrivals_departures` — Today's guest movement (check-ins, check-outs, VIPs)
  - `get_night_audit` — Last night's revenue reconciliation
  - `search_properties` — Find properties by name, region, brand, or market
- **Mock Connectors** — Opera PMS + Revenue Management System simulators that generate realistic data and push it into Convex

### Scheduled Reports (Automations)

| Automation | Schedule | Description |
|------------|----------|-------------|
| Opera PMS Sync | Every 15 min | Pulls reservation, room, and night audit data |
| RMS Sync | Daily 6:00 AM | Pulls rate recommendations, comp set, forecasts |
| Morning Briefing | Daily 7:00 AM | Generates GM morning briefing using `hotel-gm` agent |
| Revenue Flash | Daily 8:00 AM | Portfolio-wide revenue summary using `hotel-svp` agent |

### SolidJS Frontend

- Dashboard shell with persona switcher (6 roles) and property selector (15 properties)
- 7 tab pages: Overview, Operations, Revenue, Portfolio, Invoicing, Forecasting, Groups
- All charts are pure SVG — zero external chart dependencies
- Dark mode toggle

## Quick Start

### Prerequisites

- Node.js 18+
- A [Convex](https://convex.dev) deployment (free tier works)
- [OpenCode](https://opencode.ai) CLI (for AI agent interaction)

### 1. Install Dependencies

```bash
npm install
cd mcp && npm install && cd ..
```

### 2. Set Up Convex

```bash
npx convex dev          # Creates .env.local with VITE_CONVEX_URL
```

### 3. Seed Demo Data

```bash
npm run convex:seed     # Seeds properties, rooms, and financial data
```

### 4. Run Mock Connectors (populate live data)

```bash
# Run both connectors to populate reservations, rates, comp sets, etc.
CONVEX_URL=$(grep VITE_CONVEX_URL .env.local | cut -d= -f2) npx tsx connectors/run-all.ts
```

### 5. Start the Frontend

```bash
npm run dev
# Open http://localhost:5173
```

### 6. Use AI Agents (via OpenCode)

The MCP server is configured in `opencode.json` — OpenCode will automatically spawn it:

```bash
opencode
# Then try: /morning-briefing
# Or switch persona and try: /portfolio-flash
```

## Architecture

```
├── opencode.json                         # MCP server configuration
├── config/personas.json                  # Persona definitions (4 roles)
│
├── .opencode/
│   ├── agents/                           # Agent definitions (4)
│   │   ├── hotel-gm.md
│   │   ├── hotel-revenue-mgr.md
│   │   ├── hotel-district-mgr.md
│   │   └── hotel-svp.md
│   ├── skills/                           # AI skill definitions (10)
│   │   ├── hotel-gm-briefing/SKILL.md
│   │   ├── hotel-revenue-manager/SKILL.md
│   │   ├── hotel-portfolio-analysis/SKILL.md
│   │   ├── hotel-district-manager/SKILL.md
│   │   └── ... (6 more)
│   ├── commands/                         # Slash commands (11)
│   │   ├── morning-briefing.md
│   │   ├── rate-review.md
│   │   ├── portfolio-flash.md
│   │   ├── property-comparison.md
│   │   ├── show-reports.md
│   │   └── ... (6 more)
│   └── openwork/agentlab/
│       └── automations.json              # Scheduled automation definitions
│
├── mcp/
│   ├── hotel-data-server.ts              # MCP server (6 tools, stdio transport)
│   ├── convex-client.ts                  # Convex HTTP client wrapper
│   └── package.json
│
├── connectors/
│   ├── opera-pms-mock.ts                 # Opera PMS simulator
│   ├── rms-mock.ts                       # Revenue Management System simulator
│   ├── run-all.ts                        # Orchestrator (runs both)
│   └── shared/data-generators.ts         # Shared data generation utilities
│
├── convex/                               # Convex backend (21 tables)
│   ├── schema.ts                         # Full schema definition
│   ├── seed.ts + seedRooms.ts + seedFinancial.ts
│   └── *Queries.ts + *Mutations.ts       # Data access functions
│
└── hotel-frontend/                       # SolidJS dashboard
    ├── hotel-dashboard.tsx
    ├── pages/                            # 7 tab views
    ├── components/                       # UI components
    └── data/                             # Data layer + types
```

## How It Works

1. **Data flows in** via mock connectors (Opera PMS every 15 min, RMS daily) that push realistic hotel data into Convex
2. **MCP server** exposes 6 read-only tools that query Convex, with role-based scoping (GM sees one hotel, SVP sees everything)
3. **Agent personas** define the AI's behavior, tone, and default tools for each hotel role
4. **Skills** provide structured workflows (morning briefing template, rate review process, portfolio analysis framework)
5. **Commands** give users quick entry points (`/morning-briefing`, `/rate-review`, `/portfolio-flash`)
6. **Automations** run reports on schedule — morning briefing at 7am, revenue flash at 8am

## Demo Scenarios

See [DEMO.md](./DEMO.md) for detailed walkthrough scenarios covering:
- GM Morning Briefing (Sarah Chen → Marriott Dallas Downtown)
- Revenue Manager Rate Review (Sarah Chen → comp set analysis)
- District Manager Portfolio Check (Mike Torres → Texas Region)
- SVP Operations Overview (Linda Park → full portfolio)

## Tech Stack

- **SolidJS** — reactive UI framework
- **Convex** — real-time backend (schema, queries, mutations, seed scripts)
- **MCP (Model Context Protocol)** — bridges hotel data to AI agents
- **OpenCode / OpenWork** — AI agent platform (skills, commands, automations)
- **Tailwind CSS v4** — utility-first styling
- **TypeScript** — end-to-end type safety
- **Vite** — dev server and bundler
