# Hotel Copilot — Demo Scenarios

Four walkthrough scenarios demonstrating Hotel Copilot's AI agent capabilities across different hotel management personas.

## Prerequisites

Before running these demos, ensure:

1. Convex is deployed and seeded (`npx convex dev`, then `npm run convex:seed`)
2. Mock connectors have been run at least once:
   ```bash
   CONVEX_URL=<your-url> npx tsx connectors/run-all.ts
   ```
3. OpenCode is installed and configured with the `opencode.json` in this repo

---

## Scenario 1: GM Morning Briefing

**Persona**: James Wilson — General Manager, Fairfield Inn Dallas Plano  
**Agent**: `hotel-gm`  
**Time**: 6:55 AM, start of shift

### Context

James Wilson manages the Fairfield Inn Dallas Plano (property slug: `fairfield-dallas`). He arrives each morning and needs a concise digest of last night's performance, today's operations, and anything requiring his immediate attention.

### Steps

1. **Open OpenCode** and select the `hotel-gm` agent

2. **Run the morning briefing command:**
   ```
   /morning-briefing
   ```

3. **Expected output** — a structured executive digest:
   - **Last Night at a Glance**: Night audit summary with occupancy %, ADR, RevPAR, rooms revenue vs. budget
   - **Today's Operations**: Arriving guests, departing guests, VIPs, group arrivals, room availability
   - **VIP Watch**: Table of VIP guests with room numbers, arrival times, special requests
   - **Heads Up**: Alerts requiring GM attention (maintenance issues, guest complaints, staffing gaps)
   - **Action Items**: Top 3 prioritized tasks for the day

4. **Follow-up questions to try:**
   ```
   How did we do on revenue vs. budget this month so far?
   ```
   ```
   Are there any VIP guests arriving today that I should personally greet?
   ```
   ```
   What's our occupancy forecast for the rest of this week?
   ```

### What to look for

- The agent automatically knows which property James manages (from `config/personas.json`)
- All numbers come from real Convex data via the MCP `get_property_summary`, `get_arrivals_departures`, and `get_night_audit` tools
- The tone is direct and actionable — scannable, not verbose
- Budget variances are clearly marked as favorable or unfavorable

---

## Scenario 2: Revenue Manager Rate Review

**Persona**: Sarah Chen — Revenue Manager, Marriott Dallas Downtown  
**Agent**: `hotel-revenue-mgr`  
**Time**: 8:30 AM, after morning revenue call

### Context

Sarah Chen manages revenue for the Marriott Dallas Downtown (property slug: `marriott-dallas`). She needs to assess whether the property's rates are correctly positioned against the competitive set, identify dates that need rate adjustments, and quantify the revenue impact.

### Steps

1. **Open OpenCode** and select the `hotel-revenue-mgr` agent

2. **Run the rate review command:**
   ```
   /rate-review
   ```

3. **Expected output** — a structured rate analysis:
   - **Current Position**: ADR, RevPAR, occupancy vs. budget and last year
   - **Comp Set Benchmarking**: Table showing each competitor's ADR, occupancy, RevPAR, and rate index
   - **Rate Recommendations**: Date-by-date table with current BAR, recommended BAR, change amount, and rationale
   - **Action Items**: Specific rate changes to implement in the PMS

4. **Deep dive into competitive positioning:**
   ```
   How are we positioned versus the comp set on ADR? Are we leaving money on the table?
   ```

5. **Ask about specific dates:**
   ```
   What does the demand picture look like for next weekend? Should we raise rates?
   ```

6. **Displacement analysis:**
   ```
   We have a group request for 40 rooms next Friday at $139. Should we accept it or hold for transient?
   ```

### What to look for

- The agent uses `get_rate_position` to pull comp set data with specific competitor names and rates
- Rate recommendations include dollar amounts (not just "raise rates") and ROI rationale
- Every recommendation is backed by a data point (comp set gap, demand signal, booking pace)
- The RevPAR index (RGI) is used to frame competitive position

---

## Scenario 3: District Manager Portfolio Check

**Persona**: Mike Torres — District Manager, Texas / South Central Region  
**Agent**: `hotel-district-mgr`  
**Time**: 9:00 AM, preparing for weekly portfolio review call

### Context

Mike Torres oversees all properties in the Texas / South Central region (region ID: `texas-south-central`). He needs a quick portfolio flash to identify which properties are performing well, which need attention, and where to focus his time this week.

### Steps

1. **Open OpenCode** and select the `hotel-district-mgr` agent

2. **Run the portfolio flash command:**
   ```
   /portfolio-flash
   ```

3. **Expected output** — a portfolio scorecard:
   - **Portfolio Summary**: Aggregate occupancy, ADR, RevPAR, total revenue vs. budget
   - **Property Scorecard**: All properties ranked by RevPAR variance with 🔴🟡🟢 status indicators
   - **Properties Needing Attention**: Deep dive on underperformers with root cause analysis and coaching recommendations
   - **Portfolio Wins**: Properties exceeding budget with transferable best practices

4. **Compare specific properties:**
   ```
   /property-comparison
   ```

5. **Drill into an underperformer:**
   ```
   Tell me more about [property name]. What's driving the miss and what should the GM do?
   ```

6. **Ask for a resource allocation recommendation:**
   ```
   Which property should I visit this week? Where will my time have the most impact?
   ```

### What to look for

- The agent uses `get_portfolio_overview` with the region filter to show only Texas properties
- Properties are ranked worst-first so problems surface immediately
- Traffic light indicators (🔴 >5% miss, 🟡 2-5% miss, 🟢 on/above budget) make scanning fast
- Coaching recommendations are specific and actionable (not generic advice)
- The agent proactively identifies patterns across the region

---

## Scenario 4: SVP Operations Overview

**Persona**: Linda Park — SVP Operations, Full Portfolio  
**Agent**: `hotel-svp`  
**Time**: Monday 10:00 AM, preparing for executive committee meeting

### Context

Linda Park oversees the entire portfolio of 15 properties across 3 regions. She needs a high-level executive view: portfolio-wide KPIs, regional comparisons, and the 2-3 things that most need her attention this week.

### Steps

1. **Open OpenCode** and select the `hotel-svp` agent

2. **Ask for the portfolio overview:**
   ```
   Give me the portfolio overview. How are we doing this month?
   ```

3. **Expected output** — an executive summary:
   - **Portfolio KPIs**: Total revenue, weighted occupancy, portfolio ADR, RevPAR, GOP margin vs. budget
   - **Regional Comparison**: Each region's performance ranked with revenue contribution
   - **Top/Bottom Performers**: Best and worst properties with key drivers
   - **Strategic Alerts**: 2-3 items requiring SVP attention

4. **Ask for regional comparison:**
   ```
   Compare the regions. Which is carrying the portfolio and which is dragging?
   ```

5. **Drill into a specific concern:**
   ```
   What's happening in [region]? Why are they behind budget?
   ```

6. **Strategic question:**
   ```
   Based on the data, where should we be investing capital improvements?
   ```

### What to look for

- The agent starts with the one-sentence headline, then provides supporting data
- Responses are concise and executive-level — no property-level detail unless asked
- The agent thinks in terms of enterprise value: revenue at risk, margin improvement opportunity
- Regional comparisons highlight trends, not just snapshots
- The agent proactively surfaces the 2-3 things that matter most

---

## Tips for Running the Demo

1. **Start with Scenario 1** (GM Morning Briefing) — it's the most tangible and relatable
2. **Show persona switching** — demonstrate how the same underlying data is presented differently for each role
3. **Highlight MCP tool calls** — if your OpenCode setup shows tool invocations, point out which Convex queries are being called
4. **Ask follow-up questions** — the agents are designed for conversation, not just one-shot reports
5. **Try the `/show-reports` command** — demonstrates the automation system

## Data Reset

To reset and re-generate all demo data:

```bash
# Re-seed base data
npm run convex:seed

# Re-run mock connectors
CONVEX_URL=<your-url> npx tsx connectors/run-all.ts
```

This gives you fresh, realistic data with today's dates.
