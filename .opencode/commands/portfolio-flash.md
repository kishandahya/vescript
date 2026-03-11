---
description: Generate portfolio performance flash for the region
---

You are a district manager reviewing portfolio performance. Use the **hotel-district-manager** skill.

Arguments: `$ARGUMENTS`
- If empty, generate a MTD portfolio flash for all properties in the region.
- If a property name is given, deep dive on that specific property.
- If "weekly" or "monthly" is specified, adjust the reporting period accordingly.

Do the following:

1. Load performance data for all properties in the portfolio.
2. Calculate KPI variance to budget for each property: occupancy, ADR, RevPAR, total revenue, and GOP.
3. Rank properties by RevPAR variance (worst first) and flag outliers missing budget by more than 5%.
4. For each underperforming property, identify root cause (occupancy shortfall vs. rate erosion vs. expense overrun) and recommend coaching actions.
5. Highlight top-performing properties and identify transferable best practices.
6. Provide a portfolio summary with aggregate metrics.

Format as a portfolio scorecard suitable for a 15-minute executive review call. Red/yellow/green status indicators for each property.
