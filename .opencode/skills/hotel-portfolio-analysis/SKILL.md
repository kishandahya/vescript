---
name: hotel-portfolio-analysis
description: Portfolio expense analysis, utility cost benchmarking, labor cost comparison, and cross-property expense optimization with outlier detection.
---

## When to use

- The user asks about portfolio expenses, cost analysis, or expense benchmarking.
- The user mentions utility costs, labor costs, or operational expenses across properties.
- The user wants to compare expense ratios or identify cost-saving opportunities.
- The user asks about expense outliers, over-budget departments, or cost per occupied room.
- The user is preparing for a portfolio financial review or budget planning session.

## What to do

1. **Load portfolio expense data** — Read from Convex query `api.portfolioQueries.getPortfolio` (`convex/portfolioQueries.ts`):
   - Monthly P&L for each property in the portfolio
   - Expense categories: labor, utilities, supplies, maintenance, contract services, insurance, marketing
   - Per-occupied-room (POR) calculations for each category
   - Budget and prior year comparisons

2. **Normalize for comparison** — Expenses must be compared on an apples-to-apples basis:
   - Calculate cost per occupied room (CPOR) for each expense category
   - Calculate cost per available room (CPAR) for fixed costs
   - Express labor as a percentage of revenue
   - Express utilities per square foot and per occupied room
   - Adjust for property size, climate zone, and market tier

3. **Benchmark across portfolio** — For each expense category:
   - Compute portfolio average, median, min, and max
   - Rank properties from most to least efficient
   - Identify outliers (properties >1.5 standard deviations from mean)
   - Compare to industry benchmarks (STR data, CBRE, HotStats) when available

4. **Deep dive on outliers** — For each outlier property:
   - Is the variance structural (older building, larger footprint, union labor) or operational?
   - Has the variance been growing or is it stable?
   - What is the dollar impact of bringing the outlier to portfolio median?
   - Are there specific line items driving the variance?

5. **Analyze utility costs** — Utilities are often the highest-variance controllable expense:
   - Electricity cost per kWh and per occupied room by property
   - Gas/heating cost by property, adjusted for climate
   - Water cost per occupied room
   - Identify properties where utility POR exceeds the portfolio 75th percentile
   - Recommend energy audits, LED retrofits, HVAC optimization, or smart thermostat programs

6. **Labor benchmarking** — Labor is typically 30-45% of revenue:
   - Total labor cost as % of revenue by property
   - Rooms labor CPOR (front office + housekeeping)
   - F&B labor as % of F&B revenue
   - Overtime as % of total labor by property
   - Revenue per full-time equivalent (FTE)
   - Flag properties with labor % >3 points above portfolio average

7. **Recommend cost-saving measures** — Based on analysis:
   - Specific properties to audit (and what to audit)
   - Contract renegotiation opportunities (vendors serving multiple properties)
   - Bulk purchasing or GPO (group purchasing organization) opportunities
   - Staffing model adjustments (cross-training, flexible scheduling)
   - Capital investment for long-term savings (energy efficiency, automation)
   - Quick wins vs. strategic initiatives (90-day vs. 12-month payback)

## Context

- Portfolio financials: Convex query `api.portfolioQueries.getPortfolio` (`convex/portfolioQueries.ts`)
- Schema definition: `convex/schema.ts`
- Data service hooks: `hotel-frontend/data/hotel-data-service.ts`
- Type definitions: `hotel-frontend/data/hotel-types.ts`
- Convex tables: `properties`, `financials`, `budgets`, `utilityRecords`, `laborReports`

## Output format

```
## 💰 Portfolio Expense Analysis — [Region/District] — [Period]

### Portfolio Expense Summary
| Category | Portfolio Total | Avg CPOR | Budget CPOR | Var | % of Revenue |
|----------|----------------|----------|-------------|-----|-------------|
| Labor | $XXX,XXX | $XX.XX | $XX.XX | +/-$X.XX | XX.X% |
| Utilities | $XXX,XXX | $XX.XX | $XX.XX | +/-$X.XX | XX.X% |
| Supplies | $XXX,XXX | $XX.XX | $XX.XX | +/-$X.XX | XX.X% |
| Maintenance | $XXX,XXX | $XX.XX | $XX.XX | +/-$X.XX | XX.X% |

### Property Rankings — Total CPOR
| Rank | Property | CPOR | vs. Portfolio Avg | Status |
|------|----------|------|-------------------|--------|
| 1 | Best property | $XX.XX | -$X.XX | 🟢 |
| ... | | | | |
| N | Worst property | $XX.XX | +$X.XX | 🔴 |

### Outlier Analysis
#### 🔴 [Property Name] — CPOR $XX.XX (+XX% vs. portfolio avg)
| Category | Property CPOR | Portfolio Avg | Variance | $ Impact |
|----------|---------------|---------------|----------|----------|
| Labor | $XX.XX | $XX.XX | +$X.XX | $XX,XXX annually |
| Utilities | $XX.XX | $XX.XX | +$X.XX | $XX,XXX annually |

**Root cause**: [structural/operational explanation]
**Recommendation**: [specific action]
**Estimated savings**: $XX,XXX annually

### Utility Cost Benchmarking
| Property | Elec $/Room | Gas $/Room | Water $/Room | Total $/Room | vs. Avg |
|----------|-------------|------------|-------------|-------------|---------|

### Labor Efficiency
| Property | Labor % Rev | Rooms CPOR | F&B Labor % | OT % | Rev/FTE |
|----------|-------------|------------|-------------|------|---------|

### Top Cost-Saving Opportunities
| # | Initiative | Properties | Est. Savings | Payback | Priority |
|---|-----------|-----------|-------------|---------|----------|
| 1 | [Specific initiative] | [Which properties] | $XX,XXX | X months | High |

### Action Items
- [ ] Audits to schedule
- [ ] Contracts to renegotiate
- [ ] Capital requests to submit
```

Quantify everything in dollars. "Utilities are high" is useless — "$47K annual savings by bringing Property X to portfolio median" gets action.
