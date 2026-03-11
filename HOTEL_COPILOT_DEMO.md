# Hotel Co-Pilot — Demo Walkthrough

> **Audience:** Demo presenters, sales engineers, and anyone showing Hotel Co-Pilot to hotel industry prospects or investors.

---

## 1. Overview

**Hotel Co-Pilot** is OpenWork adapted for multi-property hotel management. It gives every role in a hotel management company — from GMs to district managers to controllers — a single AI-powered dashboard tailored to their daily workflow.

| What | Detail |
|------|--------|
| **Target profile** | Remington Hospitality-style portfolio |
| **Portfolio scale** | 15 properties, 3 regions, 3,898 total rooms |
| **Personas** | 11 role-based views (GM, Revenue Manager, District Manager, etc.) |
| **Tech stack** | SolidJS + Convex real-time database + OpenCode AI skills |
| **Key differentiator** | Same data, different context per role — powered by AI commands |

---

## 2. Quick Start

### Prerequisites

- Node.js 18+ and `pnpm` installed
- (Optional) A free [Convex](https://convex.dev) account for live data

### Start the Dashboard

```bash
cd /code/different-ai/openwork

# Install dependencies
pnpm install

# Start the UI (hotel dashboard accessible at /hotel route)
cd packages/app && pnpm dev
```

The dashboard loads with **demo data baked in** — no backend required for the basic walkthrough.

### Optional: Start Convex for Live Data

```bash
# In the project root — requires a Convex account
npx convex dev

# Seed the database (run each once):
npx convex run seed:seed              # Properties, regions, reservations, summaries
npx convex run seedRooms:seedRooms    # Room grids for 3 showcase properties
npx convex run seedFinancial:seedFinancial  # Invoices, vendor contracts, expenses
```

Once seeded, the dashboard automatically switches from demo data to live Convex subscriptions.

### Verify It Works

1. Open `http://localhost:3000/hotel` (or the port shown in terminal)
2. You should see the **Hotel Co-Pilot** header with persona selector and property picker
3. The Overview tab shows KPI cards, arrivals/departures, and alerts

---

## 3. Persona Demo Walkthroughs

Hotel Co-Pilot supports **11 personas** across three scope levels:

| Scope | Personas |
|-------|----------|
| **Property** | General Manager, Revenue Manager, Director of Sales, Front Office Manager, Executive Housekeeper |
| **Regional** | District Manager, Area Revenue Manager, Regional Director of Sales |
| **Corporate** | SVP Operations, VP Revenue Management, VP Sales & Marketing |

Below are **5 detailed demo scenarios** for the key personas.

---

### 3.1 Revenue Manager — Sarah Chen

**Persona:** `Revenue Manager` · **Scope:** Property · **Default Tab:** Revenue

#### Setup
1. Click the **persona selector** in the header
2. Select **"Revenue Manager"**
3. Dashboard switches to the **Revenue** tab automatically
4. Available tabs: Revenue, Forecast, Groups

#### Walkthrough

**Revenue Tab — Rate Performance Review**

| What to Show | What to Say |
|--------------|-------------|
| Revenue vs Budget chart (full-width line chart) | *"Sarah starts her morning reviewing actual revenue against budget. The 7-day and 30-day views show we're consistently beating plan."* |
| Revenue Summary cards | *"Total revenue is $1.42M month-to-date, up 8.6%. Room revenue is 72% of total — healthy mix."* |
| ADR metric: $189 (+3.8% vs budget) | *"ADR is running $7 above budget at $189. This is our rate optimization opportunity."* |
| Occupancy Heatmap Calendar | *"The heatmap immediately shows which days are compression nights vs. need dates. Red cells need pricing attention."* |
| Revenue Breakdown (stacked bar chart) | *"The breakdown shows room vs. F&B vs. other revenue streams over time."* |

**Forecast Tab — Forward-Looking Intelligence**

| What to Show | What to Say |
|--------------|-------------|
| Switch to **Forecast** tab | *"Sarah checks the 90-day forward view next."* |
| Booking Pace: 17.8% ahead of LY | *"Booking pace is almost 18% ahead of last year — but that doesn't mean we should relax on rate."* |
| Compression Date: Feb 14 | *"February 14 is flagged as a compression date. We need to close discounts and push BAR up."* |
| Need Date: Jan 28 | *"January 28 is a need date — we should open promotions and consider wholesaler allocation."* |
| Key Insights panel | *"The system surfaces actionable insights: pace ahead of LY, auto show driving demand, group block consuming 58% of inventory."* |

**AI Command: `/rate-review`**

> *"Now Sarah asks the AI for a rate recommendation. The `/rate-review` command analyzes current positioning, comp set data, and demand signals to recommend specific rate changes."*

#### Key Talking Points
- ✅ Real-time rate optimization with budget comparison
- ✅ Comp set benchmarking built into the workflow
- ✅ Compression/need date identification saves hours of manual analysis
- ✅ AI rate review replaces manual spreadsheet analysis

---

### 3.2 General Manager — Michael Torres

**Persona:** `General Manager` · **Scope:** Property · **Default Tab:** Overview

#### Setup
1. Select **"General Manager"** from the persona selector
2. Dashboard switches to the **Overview** tab
3. Available tabs: Overview, Operations, Invoices, Groups

#### Walkthrough

**Overview Tab — Morning Briefing**

| What to Show | What to Say |
|--------------|-------------|
| KPI Cards (4 across the top) | *"Michael's first glance: Occupancy 78.5% (6.1% above budget), ADR $189, RevPAR $148.37, Revenue $52,340. All green — great start to the day."* |
| Today's Activity: 47 arrivals (4 VIP, 6 early) | *"47 guests arriving today, 4 are VIPs that need personal attention, 6 requested early check-in."* |
| Today's Activity: 38 departures (5 late C/O, 3 open balance) | *"38 departures with 3 guests carrying outstanding balances — front desk needs to resolve before checkout."* |
| Alerts & Attention Items (5 items) | *"The alert feed is the GM's command center. Red: 3 rooms out of order on floor 12, 2 guest complaints pending. Yellow: invoice anomaly and group cutoff warning. Blue: compression pricing alert."* |
| Click "3 rooms OOO on floor 12" alert → navigates to Operations | *"Clicking any alert takes you directly to the relevant tab. Let's look at Operations."* |
| Quick Stats: 73 rooms available, 3 groups in-house, 42 HK pending, 4.3 satisfaction | *"At a glance: room availability, group exposure, housekeeping progress, and guest satisfaction."* |

**Operations Tab — Room Grid & Daily Operations**

| What to Show | What to Say |
|--------------|-------------|
| Room Grid (340 rooms by floor) | *"This is the operational heartbeat — every room in the hotel, color-coded by status. Occupied, vacant-clean, dirty, due-in, due-out, out-of-order."* |
| VIP guest James Wilson in room 1205 | *"Room 1205 — James Wilson, VIP arriving at 14:00. The star icon highlights VIP guests."* |
| Arrivals list (right sidebar) | *"The sidebar shows today's arrivals with ETAs, VIP flags, and group affiliations. Maria Garcia in 805 is part of the Acme Corp group."* |
| Housekeeping progress: 55% complete (168 clean + 12 inspected / 325) | *"Housekeeping is 55% complete. 98 dirty rooms, 42 in progress, 5 rush requests. Michael can see if we'll be ready for the 14:00 VIP arrivals."* |
| Departure list: 3 guests with open balances | *"Three departures have outstanding balances — Amanda Harris $45.50, Matthew Robinson $128.75, Nicole King $22.00."* |

**AI Command: `/morning-briefing`**

> *"Michael runs the morning briefing command. The AI aggregates night audit data, arrivals, departures, housekeeping status, and guest feedback into a single executive digest he can read in 2 minutes."*

#### Key Talking Points
- ✅ Single-screen morning briefing replaces 4-5 separate reports
- ✅ Real-time room grid eliminates walkie-talkie status updates
- ✅ Alert-driven navigation — the system tells you what needs attention
- ✅ AI morning briefing saves 30 minutes of manual report compilation

---

### 3.3 District Manager — Jennifer Park

**Persona:** `District Manager` · **Scope:** Regional · **Default Tab:** Portfolio

#### Setup
1. Select **"District Manager"** from the persona selector
2. Dashboard switches to the **Portfolio** tab
3. Available tabs: Portfolio, Revenue, Operations

#### Walkthrough

**Portfolio Tab — Multi-Property Oversight**

| What to Show | What to Say |
|--------------|-------------|
| Portfolio KPI summary (top) | *"Jennifer sees the portfolio at a glance: average occupancy, ADR, RevPAR, and total revenue across all 15 properties."* |
| Property grid (15 cards) | *"Every property in one view. Each card shows key metrics, trend sparklines, and variance indicators."* |
| Sort by "Variance (worst first)" | *"Jennifer sorts by worst RevPAR variance. Immediately, Hampton Inn San Antonio (-8.1%) and Fairfield Inn Dallas Plano (-7.1%) surface at the top."* |
| Filter to "Southeast" region | *"Filtering to Southeast — 5 properties. Nashville is the star at +10.0% RevPAR variance. New Orleans is soft at -1.0%."* |
| Filter to "Mountain / West" | *"Mountain/West: Denver's Hyatt Regency is leading the portfolio with +12.8% RevPAR variance. Convention business is strong."* |
| Click Hyatt Denver property card | *"Jennifer clicks into Hyatt Denver to drill down — the dashboard switches to that property's Overview."* |
| Toggle Grid / List view | *"The list view is great for quick scanning; the grid view shows more detail per property."* |

**Portfolio Metrics (All Regions)**

| Region | Properties | Top Performer | Concern |
|--------|-----------|---------------|---------|
| Texas / South Central | 7 | Courtyard Austin (+6.8%) | Hampton SA (-8.1%) |
| Southeast | 5 | IHG Nashville (+10.0%) | Sheraton NOLA (-1.0%) |
| Mountain / West | 3 | Hyatt Denver (+12.8%) | — all positive |

**AI Commands**

| Command | Use Case |
|---------|----------|
| `/portfolio-flash` | *"Generate a portfolio performance flash for the region — one-page summary Jennifer can share with the SVP."* |
| `/property-comparison` | *"Compare properties side-by-side on any metric. Great for identifying best practices from top performers."* |

#### Key Talking Points
- ✅ Portfolio-level oversight without logging into 15 different PMS systems
- ✅ Instant sorting and filtering surfaces problems before they become crises
- ✅ Drill-down from portfolio → property in one click
- ✅ AI portfolio flash replaces weekly Excel report compilation

---

### 3.4 Controller — David Martinez

**Persona:** Select **"General Manager"** (Controller uses the GM persona with Invoices tab)
**Focus Tab:** Invoices

#### Setup
1. Select **"General Manager"** persona
2. Click the **Invoices** tab
3. The Invoicing page shows summary cards, action bar, and invoice table

#### Walkthrough

**Invoicing Tab — AP Review & Anomaly Detection**

| What to Show | What to Say |
|--------------|-------------|
| Summary cards: $46,250 pending, $18,500 high priority, 5 anomalies | *"David's dashboard: 12 pending invoices totaling $46,250. One capital approval item at $18,500. Five invoices flagged for anomalies."* |
| Invoice table (17 invoices) | *"Every invoice in a sortable, filterable table. Status badges show pending, approved, flagged, or rejected."* |
| Anomaly: CleanTex Linen $4,200 (5% over contract) | *"CleanTex Linen is billing $4,200 against a $4,000 contract — 5% over. The system auto-flags this."* |
| Anomaly: Oncor Electric $12,300 (15% above average) | *"Oncor Electric is 15% above the 12-month average. Could be seasonal, could be an equipment issue."* |
| Anomaly: Johnson Controls HVAC $4,100 (40% above typical) | *"Emergency HVAC repair at 40% above a typical service call — auto-flagged for review."* |
| Click Herman Miller $18,500 → detail modal | *"The Herman Miller lobby furniture invoice requires capital approval. Opening the detail shows description, contract reference, and budget impact (42% of CapEx budget)."* |
| Batch select routine invoices → "Approve Selected" | *"David selects the routine invoices — Sysco, Otis, US Foods — and batch approves them in one click."* |
| Flag anomaly invoices → "Flag Selected" | *"The anomaly invoices get flagged for further review. Each flag generates an audit trail."* |
| Filter dropdown: "Flagged" | *"Filtering to flagged invoices shows only the items that need attention."* |

**Invoice Anomaly Flags**

| Vendor | Amount | Flag | Reason |
|--------|--------|------|--------|
| CleanTex Linen | $4,200 | `over-contract` | 5% above contracted rate of $4,000 |
| Oncor Electric | $12,300 | `unusual-amount` | 15% above 12-month average |
| Herman Miller | $18,500 | `capital-approval` | Requires capital expenditure approval |
| Johnson Controls | $4,100 | `unusual-amount` | 40% above typical service call |
| Comcast Business | $3,200 | `missing-po` | No purchase order on file |

**AI Command: `/invoice-review`**

> *"David runs the invoice review command. The AI cross-references each invoice against vendor contracts, historical spending, and budget allocations to surface anomalies and recommend actions."*

#### Key Talking Points
- ✅ Automated anomaly detection catches overspending before payment
- ✅ Batch approval workflow saves hours of manual AP processing
- ✅ Full audit trail for compliance and ownership accountability
- ✅ AI invoice review replaces manual contract-vs-invoice comparison

---

### 3.5 Director of Sales — Amanda Roberts

**Persona:** `Director of Sales` · **Scope:** Property · **Default Tab:** Groups

> **Note:** The Groups tab currently shows a placeholder. Use the **Forecast** tab (switch to Revenue Manager persona) to demo forecasting capabilities with sales-relevant data.

#### Setup
1. Select **"Revenue Manager"** persona to access Forecast tab
2. Navigate to the **Forecast** tab

#### Walkthrough

**Forecast Tab — Demand Visibility & Group Impact**

| What to Show | What to Say |
|--------------|-------------|
| 90-Day Forecast Chart | *"Amanda reviews the 90-day occupancy forecast. The chart overlays on-the-books, forecast, budget, and prior year."* |
| Booking Pace: 17.8% ahead of LY | *"Booking pace is strong — 17.8% ahead of last year. Amanda uses this to negotiate group rates from a position of strength."* |
| Compression Date: Feb 14 | *"February 14 is a compression night. Amanda knows not to discount for group business on this date."* |
| Need Date: Jan 28 | *"January 28 is a need date — she should be more aggressive pursuing group leads for this window."* |
| Demand Calendar | *"The demand calendar shows expected occupancy by day. Amanda can identify gaps where group business would fill valleys."* |
| Market Events: Dallas Auto Show (Jan 10-14, +120 rooms/night) | *"The Dallas Auto Show drives 120 incremental rooms per night Jan 10-14. Amanda plans her group displacement analysis around this."* |
| Key Insight: Acme Corp (200 rooms, Mar 15-18) — 58% of available | *"Acme Corp's 200-room block for March 15-18 would consume 58% of available inventory. She needs a displacement analysis before accepting."* |

**Group Pipeline Data (from seed data)**

| Group | Rooms | Dates | Stage | Rate | Revenue Est. |
|-------|-------|-------|-------|------|-------------|
| Acme Corp Annual Meeting | 200 | Mar 15-18 | Tentative | $165 | $99,000 |
| Texas Medical Association | 150 | Apr 5-8 | Prospect | $175 | $78,750 |
| Southwest Engineering | 80 | Feb 20-22 | Definite | $155 | $37,200 |
| Dallas Wedding Expo | 45 | Mar 1-2 | Lead | $185 | $16,650 |

**AI Commands**

| Command | Use Case |
|---------|----------|
| `/group-analysis` | *"Analyze the full group pipeline — pickup rates, cutoff dates, and revenue impact."* |
| `/displacement-analysis` | *"Run a displacement analysis for Acme Corp: would displacing 200 rooms of transient business at $189 ADR for a $165 group rate make economic sense?"* |
| `/demand-calendar` | *"Generate a demand calendar overlay showing market events, group blocks, and forecasted occupancy."* |

#### Key Talking Points
- ✅ Demand visibility eliminates blind spots in sales negotiations
- ✅ Compression/need date awareness prevents leaving money on the table
- ✅ Group displacement analysis quantifies the true cost of accepting group business
- ✅ Market event intelligence gives sales an information advantage

---

## 4. Collaborative Workflow Demo

### Scenario: Weekly Rate Setting Meeting

**Participants:** Revenue Manager + GM + Director of Sales

This demo shows how the **same underlying data** appears differently based on each persona's context.

#### Step 1 — Revenue Manager Sets the Stage
1. Select **Revenue Manager** persona
2. Show Revenue tab: ADR $189, 3.8% above budget
3. Switch to Forecast: compression date Feb 14, need date Jan 28
4. *"Sarah recommends raising BAR by $15 for Feb 14 and opening a 10% corporate discount for Jan 28."*

#### Step 2 — GM Reviews Operational Impact
1. Switch to **General Manager** persona
2. Overview tab: 78.5% occupancy, 42 HK rooms pending
3. Operations tab: room grid shows capacity
4. *"Michael confirms we have operational capacity for higher occupancy on the need dates."*

#### Step 3 — Sales Director Weighs Group Impact
1. Switch to **Revenue Manager** persona, Forecast tab
2. Show group insight: Acme Corp 200 rooms at $165
3. *"Amanda flags that accepting Acme Corp on Mar 15-18 at $165 would displace $189 transient ADR. Recommends counter-offering at $175."*

#### Step 4 — Persona Switcher Demo
Rapidly switch between personas to show how:
- **Tabs change** per role (GM sees Overview/Operations, Revenue Manager sees Revenue/Forecast)
- **Same KPI data** is presented in role-appropriate context
- **Each persona** lands on their most important tab by default

> **Key message:** *"One platform, one source of truth, personalized for every role. No more version conflicts between the revenue manager's spreadsheet and the GM's morning report."*

---

## 5. OpenCode Skills & Commands Reference

### AI Skills (10 skills)

| Skill | Description |
|-------|-------------|
| `hotel-gm-briefing` | Morning briefing, daily report, and hotel overview aggregating night audit, arrivals, departures, and guest feedback into an executive digest |
| `hotel-revenue-manager` | Rate review, pricing strategy, revenue analysis including ADR, RevPAR, comp set benchmarking, and displacement analysis |
| `hotel-district-manager` | Portfolio flash, property comparison, and regional performance analysis with KPI variance tracking and coaching recommendations |
| `hotel-forecasting` | Occupancy forecasting, demand analysis, booking pace tracking, and compression night identification |
| `hotel-group-booking` | Group RFPs, block management, displacement analysis, and group booking workflows |
| `hotel-invoice-review` | Invoice review, expense analysis, vendor management with anomaly detection and contract compliance checking |
| `hotel-front-office` | Room grid management, arrivals/departures tracking, room status coordination, VIP management |
| `hotel-housekeeping` | Section assignment optimization, cleaning schedule management, room attendant workload balancing |
| `hotel-collaborative` | Revenue meeting prep, strategy meeting agendas, cross-department coordination with pickup summaries and action tracking |
| `hotel-portfolio-analysis` | Portfolio expense analysis, utility cost benchmarking, labor cost comparison, and cross-property expense optimization |

### AI Commands (12 commands)

| Command | Description |
|---------|-------------|
| `/morning-briefing` | Generate a GM morning briefing for the current property |
| `/rate-review` | Review current rate position and recommend adjustments |
| `/portfolio-flash` | Generate portfolio performance flash for the region |
| `/property-comparison` | Compare properties across key metrics |
| `/invoice-review` | Review pending invoices and flag anomalies |
| `/forecast-90day` | Generate 90-day occupancy forecast |
| `/demand-calendar` | Generate demand calendar with market events |
| `/group-analysis` | Analyze group booking pipeline and block pickup |
| `/displacement-analysis` | Run displacement analysis for a group booking |
| `/housekeeping-optimize` | Optimize housekeeping section assignments |
| `/browser-setup` | Guide through Chrome browser automation setup |
| `/hello-stranger` | Test command — verify OpenCode is running |

---

## 6. Architecture Overview

### Tech Stack

```
┌─────────────────────────────────────────────────────┐
│                   Hotel Co-Pilot UI                  │
│              SolidJS + Tailwind CSS                  │
│    (Reactive signals, persona-driven tab routing)    │
├─────────────────────────────────────────────────────┤
│               OpenCode AI Layer                      │
│    10 Skills + 12 Commands for decision support      │
├─────────────────────────────────────────────────────┤
│              Convex Real-Time Database               │
│   20 tables, live subscriptions, seed scripts        │
└─────────────────────────────────────────────────────┘
```

### Convex Database Tables (20 tables)

| Category | Tables |
|----------|--------|
| **Core** | `properties`, `regions`, `portfolio` |
| **Rooms** | `rooms`, `housekeepingRooms`, `attendants` |
| **Guests** | `reservations`, `guestFeedback` |
| **Revenue** | `dailySummaries`, `compSets`, `dailyRates`, `nightAudits` |
| **Forecasting** | `forecasts`, `demandCalendar`, `marketEvents` |
| **Groups** | `groups` |
| **Financial** | `invoices`, `vendorContracts`, `expenseComparisons`, `portfolioKpis` |

### File Structure

```
packages/app/src/app/hotel/
├── hotel-dashboard.tsx            # Main dashboard shell (persona + tab routing)
├── state/
│   └── hotel-store.ts             # SolidJS store (persona, tab, property selection)
├── data/
│   ├── hotel-types.ts             # TypeScript types, persona configs (11 roles)
│   ├── hotel-data-service.ts      # Convex query/mutation hooks
│   └── convex-client.ts           # Convex connection wrapper
├── pages/
│   ├── hotel-overview.tsx         # GM morning briefing page
│   ├── hotel-operations.tsx       # Room grid + arrivals/departures
│   ├── hotel-revenue.tsx          # Revenue charts + heatmap
│   ├── hotel-portfolio.tsx        # Multi-property grid (15 properties)
│   ├── hotel-invoicing.tsx        # AP review with anomaly detection
│   └── hotel-forecasting.tsx      # 90-day forecast + demand calendar
└── components/
    ├── hotel-header.tsx           # Top bar with persona + property selectors
    ├── hotel-nav.tsx              # Tab navigation (persona-filtered)
    ├── persona-selector.tsx       # Persona dropdown
    ├── property-selector.tsx      # Property picker
    ├── kpi-card.tsx               # KPI card with sparkline + delta
    ├── property-card.tsx          # Portfolio property card
    ├── room-grid.tsx              # Floor-by-floor room grid
    ├── room-cell.tsx              # Individual room status cell
    ├── revenue-chart.tsx          # Revenue vs budget line chart
    ├── revenue-breakdown.tsx      # Stacked bar revenue breakdown
    ├── heatmap-calendar.tsx       # Occupancy heatmap calendar
    ├── forecast-chart.tsx         # 90-day forecast line chart
    ├── booking-pace.tsx           # Booking pace comparison
    ├── demand-calendar.tsx        # Demand calendar with events
    ├── sparkline.tsx              # Mini sparkline component
    ├── anomaly-badge.tsx          # Invoice anomaly flag badge
    ├── invoice-list.tsx           # Invoice table component
    └── invoice-detail-modal.tsx   # Invoice detail modal
```

### OpenCode Integration

Skills live in `.opencode/skills/hotel-*/SKILL.md` and commands in `.opencode/commands/*.md`. See Section 5 for the full reference.

---

## 7. Live Demo Script (25 minutes)

### Timing Guide

| Time | Segment | Persona | Tabs |
|------|---------|---------|------|
| 0:00–2:00 | **Intro & Context** | — | — |
| 2:00–7:00 | **GM Morning Briefing** | General Manager | Overview → Operations |
| 7:00–12:00 | **Revenue Manager** | Revenue Manager | Revenue → Forecast |
| 12:00–17:00 | **District Manager** | District Manager | Portfolio |
| 17:00–20:00 | **Controller** | GM (Invoices tab) | Invoices |
| 20:00–23:00 | **Sales Director** | Revenue Manager | Forecast |
| 23:00–25:00 | **Collaborative Workflow** | All | Persona switching |

### Detailed Script

#### 0:00–2:00 — Introduction

> *"Hotel management companies like Remington Hospitality manage 50-100+ hotels. Every morning, a GM opens 4-5 different systems to understand their hotel. A district manager aggregates spreadsheets from 15 properties. A controller manually cross-checks every invoice against vendor contracts.*
>
> *Hotel Co-Pilot eliminates all of that. One platform. One source of truth. Personalized for every role. And it gets smarter with AI."*

**Show:** The dashboard landing page. Point out the persona selector and property picker.

#### 2:00–7:00 — General Manager Morning Briefing

1. **Select "General Manager"** — lands on Overview
2. **Walk through KPI cards:** Occupancy 78.5%, ADR $189, RevPAR $148, Revenue $52K
3. **Highlight alerts:** 3 OOO rooms, invoice anomaly, compression pricing, complaints, group cutoff
4. **Click OOO alert** → navigates to Operations
5. **Show room grid:** 340 rooms by floor, color-coded
6. **Point out VIP arrivals:** James Wilson room 1205, 14:00 ETA
7. **Show housekeeping progress:** 55% complete, 5 rush requests
8. **Mention AI:** *"Michael would run `/morning-briefing` to get a 2-minute executive summary."*

#### 7:00–12:00 — Revenue Manager

1. **Switch to "Revenue Manager"** — lands on Revenue
2. **Show Revenue vs Budget chart:** consistent outperformance
3. **Show summary stats:** $1.42M MTD, +8.6%, room revenue 72%
4. **Switch to Forecast tab**
5. **Highlight key indicators:** Compression Feb 14, Need Jan 28
6. **Show booking pace:** 17.8% ahead of LY
7. **Show demand calendar and market events**
8. **Mention AI:** *"Sarah runs `/rate-review` for AI-powered pricing recommendations."*

#### 12:00–17:00 — District Manager

1. **Switch to "District Manager"** — lands on Portfolio
2. **Show portfolio KPIs** across all 15 properties
3. **Sort by "Variance (worst first)"** — Hampton SA (-8.1%) surfaces
4. **Filter to "Southeast"** — Nashville outperforming (+10%)
5. **Filter to "Mountain / West"** — Denver leading (+12.8%)
6. **Back to "All Regions"** — show the full picture
7. **Mention AI:** *"Jennifer runs `/portfolio-flash` for a one-page report to share with the C-suite."*

#### 17:00–20:00 — Controller

1. **Switch to "General Manager"**, click **Invoices** tab
2. **Show summary cards:** $46K pending, $18.5K capital approval, 5 anomalies
3. **Point out anomalies:** CleanTex over-contract, Oncor unusual amount
4. **Click Herman Miller** → detail modal, capital approval required
5. **Batch approve** routine invoices, **flag** anomalies
6. **Mention AI:** *"David runs `/invoice-review` for automated contract compliance checking."*

#### 20:00–23:00 — Sales Director

1. **Switch to "Revenue Manager"**, go to **Forecast** tab
2. **Show 90-day forecast chart**
3. **Highlight group insight:** Acme Corp 200 rooms, 58% of inventory
4. **Show market events timeline:** Dallas Auto Show, Medical Conference
5. **Discuss displacement:** *"Is a $165 group rate worth displacing $189 transient ADR?"*
6. **Mention AI:** *"Amanda runs `/displacement-analysis` to quantify the real cost."*

#### 23:00–25:00 — Collaborative Workflow

1. **Rapidly switch personas** — show how tabs change per role
2. **Key message:** Same data, different context, one platform
3. **Close:** *"Every role in the hotel management company — from the executive housekeeper to the SVP of Operations — sees exactly what they need. No more spreadsheet wars. No more version conflicts. One source of truth, powered by AI."*

---

## 8. Data Summary

### Portfolio Profile

| Metric | Value |
|--------|-------|
| Total Properties | 15 |
| Regions | 3 (Texas/South Central, Southeast, Mountain/West) |
| Total Rooms | 3,898 |
| Brands | 9 (Marriott, Hilton, IHG, Hyatt, + select/lifestyle brands) |
| Markets | 10 (Dallas, Houston, Austin, San Antonio, Fort Worth, Nashville, Atlanta, New Orleans, Charlotte, Orlando, Denver, Phoenix) |

### Showcase Properties (Full Room Grids)

| Property | Rooms | Market |
|----------|-------|--------|
| Marriott Dallas Downtown | 340 | Dallas |
| Hilton Houston Galleria | 280 | Houston |
| Hyatt Regency Denver | 450 | Denver |
| **Total** | **1,070** | — |

### Seeded Data Volume

| Data Type | Count | Details |
|-----------|-------|---------|
| Properties | 15 | Across 3 regions |
| Rooms | 1,070 | For 3 showcase properties |
| Daily Summaries | ~450 | 30 days × 15 properties |
| Forecasts | ~1,350 | 90 days × 15 properties |
| Invoices | 17 | Mixed statuses and anomaly flags |
| Groups | 8 | Various stages (lead → actualized) |
| Market Events | 24 | Across all markets |
| Vendor Contracts | ~30 | For contract compliance checking |
| Comp Sets | ~45 | 3 competitors per property |
| Guest Feedback | ~60 | Mixed ratings and sources |
| Night Audits | ~30 | 30 days for showcase properties |

### Financial Data Patterns

The seed data is designed to match realistic Remington Hospitality-style patterns:

- **ADR range:** $99 (Fairfield economy) to $215 (Westin premium)
- **Occupancy range:** 70.2% (Sheraton NOLA) to 85.2% (Residence Inn Atlanta)
- **RevPAR variance:** -8.1% (Hampton SA) to +12.8% (Hyatt Denver)
- **Invoice amounts:** $1,850 (uniforms) to $18,500 (furniture CapEx)
- **Group sizes:** 45 rooms (wedding) to 200 rooms (corporate meeting)

---

## Appendix: Persona Configuration Reference

| Persona ID | Label | Scope | Available Tabs | Default Tab |
|------------|-------|-------|---------------|-------------|
| `gm` | General Manager | Property | Overview, Operations, Invoices, Groups | Overview |
| `revenue-manager` | Revenue Manager | Property | Revenue, Forecast, Groups | Revenue |
| `district-manager` | District Manager | Regional | Portfolio, Revenue, Operations | Portfolio |
| `dos` | Director of Sales | Property | Groups, Revenue | Groups |
| `fom` | Front Office Manager | Property | Operations | Operations |
| `executive-housekeeper` | Executive Housekeeper | Property | Operations | Operations |
| `area-revenue-manager` | Area Revenue Manager | Regional | Portfolio, Revenue, Forecast | Portfolio |
| `svp-ops` | SVP Operations | Corporate | Portfolio, Forecast | Portfolio |
| `vp-revenue` | VP Revenue Management | Corporate | Portfolio, Forecast | Portfolio |
| `vp-sales` | VP Sales & Marketing | Corporate | Portfolio, Groups | Portfolio |
| `rdos` | Regional Director of Sales | Regional | Groups, Portfolio | Groups |
