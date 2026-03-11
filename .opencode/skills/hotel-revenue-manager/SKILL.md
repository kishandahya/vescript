---
name: hotel-revenue-manager
description: Rate review, pricing strategy, revenue analysis including ADR, RevPAR, comp set benchmarking, and displacement analysis.
---

## When to use

- The user asks about rate review, pricing, rate adjustments, or revenue analysis.
- The user mentions ADR, RevPAR, comp set, rate shopping, or yield management.
- The user wants to evaluate whether current rates are competitive or need adjustment.
- The user asks about displacement analysis or revenue optimization.

## What to do

1. **Load property rate data** — Read the current rate configuration from Convex query `api.rateQueries.getByProperty` (`convex/rateQueries.ts`). Identify the property's current BAR (Best Available Rate) by room type and date range.

2. **Pull comp set data** — Load competitive set rates from Convex query `api.compSetQueries.getByProperty` (`convex/compSetQueries.ts`). Identify the property's position within the comp set (index, rank, and variance from set average).

3. **Check market events** — Cross-reference the date range against Convex query `api.marketEventQueries.getByMarket` (`convex/marketEventQueries.ts`) for demand generators (conventions, concerts, sports, holidays). Flag compression nights where demand exceeds supply.

4. **Analyze key metrics** — Calculate and present:
   - **ADR** (Average Daily Rate) — current vs. budget vs. last year
   - **RevPAR** (Revenue Per Available Room) — current vs. budget vs. last year
   - **Occupancy %** — on-the-books vs. forecast vs. last year
   - **Rate index** — property ADR ÷ comp set average ADR
   - **RevPAR index (RGI)** — property RevPAR ÷ fair share RevPAR

5. **Identify opportunities** — Flag dates where:
   - The property is priced more than 5% below comp set average on high-demand nights
   - Occupancy forecast exceeds 85% but rates have not been adjusted upward
   - Booking pace is significantly ahead of or behind last year
   - Length-of-stay restrictions or minimum stay could capture more revenue

6. **Recommend rate adjustments** — For each flagged date, propose a specific rate action with rationale:
   - Increase/decrease BAR by $X based on comp set position and demand
   - Open or close rate fences (AAA, senior, government, advance purchase)
   - Adjust length-of-stay restrictions
   - Modify channel availability (close OTAs on compression nights)

7. **Summarize displacement risk** — If group blocks exist for the period, calculate transient revenue displaced vs. group revenue captured. Recommend accepting, modifying, or declining marginal group business.

## Context

- Property rate sheets: Convex query `api.rateQueries.getByProperty` (`convex/rateQueries.ts`)
- Comp set data: Convex query `api.compSetQueries.getByProperty` (`convex/compSetQueries.ts`)
- Market events: Convex query `api.marketEventQueries.getByMarket` (`convex/marketEventQueries.ts`)
- Historical performance: Convex query `api.summaryQueries.getByProperty` (`convex/summaryQueries.ts`)
- Group blocks: Convex query `api.groupQueries.getByProperty` (`convex/groupQueries.ts`)
- Schema definition: `convex/schema.ts`
- Data service hooks: `hotel-frontend/data/hotel-data-service.ts`
- Type definitions: `hotel-frontend/data/hotel-types.ts`
- Convex tables: `rates`, `reservations`, `compSetRates`, `marketEvents`

## Output format

Structure the response as:

```
## Rate Review — [Property Name] — [Date Range]

### Current Position
| Metric | Current | Budget | LY | Var to Budget | Var to LY |
|--------|---------|--------|-----|---------------|-----------|

### Comp Set Benchmarking
| Property | ADR | Occ% | RevPAR | Rate Index |
|----------|-----|------|--------|------------|

### Rate Recommendations
| Date | Current BAR | Recommended BAR | Change | Rationale |
|------|-------------|-----------------|--------|-----------|

### Action Items
- [ ] Specific action with deadline and owner
```

Use currency formatting ($X.XX), percentage formatting (X.X%), and color-code variances (positive = favorable, negative = unfavorable) where the output medium supports it.
