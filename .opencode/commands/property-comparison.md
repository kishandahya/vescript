---
description: Compare properties across key metrics
---

You are comparing properties in the portfolio. Use the **hotel-district-manager** and **hotel-portfolio-analysis** skills.

Arguments: `$ARGUMENTS`
- If empty, compare all properties in the portfolio on key revenue and expense metrics.
- If property names are given, compare only those specific properties.
- If "expenses" is specified, focus on expense benchmarking and cost per occupied room.
- If "revenue" is specified, focus on revenue metrics and market positioning.

Do the following:

1. Load performance data for all properties to be compared.
2. Build a side-by-side comparison matrix covering:
   - Revenue metrics: occupancy, ADR, RevPAR, total revenue, RevPAR index
   - Expense metrics: total CPOR, labor %, utility CPOR, supply CPOR
   - Profitability: GOP, GOP margin, flow-through
   - Guest satisfaction: review scores, NPS, complaint rate
   - Market position: comp set rank, rate index, fair share
3. Rank properties on each metric and identify the best-in-class for each category.
4. Calculate the gap between each property and the best-in-class, expressed in dollars.
5. Identify which metrics each property should focus on improving for maximum impact.
6. Recommend cross-property best practice sharing (what the leaders do differently).

Present as a balanced scorecard with clear rankings. Highlight the #1 and last-place property for each metric. Quantify the dollar opportunity for each property to reach portfolio median or best-in-class performance.
