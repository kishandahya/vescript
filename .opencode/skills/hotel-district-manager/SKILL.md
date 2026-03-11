---
name: hotel-district-manager
description: Portfolio flash, property comparison, and regional performance analysis for multi-property oversight with KPI variance tracking and coaching recommendations.
---

## When to use

- The user asks about portfolio performance, regional overview, or multi-property comparison.
- The user is a district manager, area director, VP of operations, or any role overseeing multiple properties.
- The user asks to compare hotels, rank properties, or identify underperformers.
- The user mentions "portfolio flash," "property scorecard," or "regional report."

## What to do

1. **Load multi-property data** — Read performance data for all properties in the portfolio from Convex query `api.portfolioQueries.getPortfolio` (`convex/portfolioQueries.ts`). Identify the properties under management and their respective budgets.

2. **Calculate KPI variance to budget** — For each property, compute:
   - Occupancy %: actual vs. budget vs. LY
   - ADR: actual vs. budget vs. LY
   - RevPAR: actual vs. budget vs. LY
   - Total revenue: actual vs. budget
   - GOP (Gross Operating Profit): actual vs. budget
   - Guest satisfaction score: current vs. target

3. **Rank and flag outliers** — Sort properties by variance to budget (worst first). Flag any property that:
   - Misses RevPAR budget by more than 5%
   - Has occupancy below 70% (or market-adjusted threshold)
   - Shows declining guest satisfaction (3+ consecutive periods of decline)
   - Has labor cost ratio above brand standard
   - Is significantly outperforming budget (identify what they are doing right)

4. **Analyze trends** — For each flagged property:
   - Is the miss getting worse or improving week over week?
   - What is driving the variance (occupancy shortfall vs. rate erosion)?
   - Are there market-level factors (new supply, demand shifts) or property-specific issues?

5. **Suggest coaching actions** — For each underperforming property, recommend:
   - Specific operational actions the GM should take
   - Revenue management tactics to course-correct
   - Whether an on-site visit is warranted and what to focus on
   - Timeline for expected improvement

6. **Highlight wins** — Call out properties exceeding budget and identify transferable best practices for the portfolio.

## Context

- Portfolio data: Convex query `api.portfolioQueries.getPortfolio` (`convex/portfolioQueries.ts`)
- Comp set data: Convex query `api.compSetQueries.getByProperty` (`convex/compSetQueries.ts`)
- Schema definition: `convex/schema.ts`
- Data service hooks: `hotel-frontend/data/hotel-data-service.ts`
- Type definitions: `hotel-frontend/data/hotel-types.ts`
- Convex tables: `properties`, `budgets`, `monthlyPerformance`, `guestSatisfaction`

## Output format

Structure the response as a portfolio executive summary:

```
## 📊 Portfolio Flash — [Region/District] — [Period]

### Portfolio Summary
| Metric | Actual | Budget | Var | LY | Var to LY |
|--------|--------|--------|-----|-----|-----------|

### Property Scorecard (ranked by RevPAR variance)
| Property | Occ% | ADR | RevPAR | Rev Var $ | GOP Var $ | Guest Score | Status |
|----------|------|-----|--------|-----------|-----------|-------------|--------|

🔴 = >5% miss  🟡 = 2-5% miss  🟢 = on/above budget

### Properties Needing Attention
#### [Property Name] — 🔴 RevPAR -X.X% to budget
- **Root cause**: [occupancy/rate/mix]
- **Trend**: [improving/declining/flat]
- **Recommended actions**:
  1. Specific action
  2. Specific action
- **Next check-in**: [date]

### Portfolio Wins
- 🏆 [Property] — [what they did well and why]

### Action Items
- [ ] District manager actions with deadlines
```

Present data density appropriate for a 15-minute portfolio review call. Lead with the red flags, celebrate the wins, close with specific next steps.
