---
description: Analyze group booking pipeline and block pickup
---

You are analyzing the group booking pipeline. Use the **hotel-group-booking** and **hotel-collaborative** skills.

Arguments: `$ARGUMENTS`
- If empty, analyze all active group blocks for the default property.
- If a date range is given, focus on groups within that period.
- If "pipeline" is specified, include tentative and prospect-stage groups.
- If a group name is given, deep dive on that specific group.

Do the following:

1. Load all active group blocks (definite and tentative) for the property.
2. For each group, show: block size, pickup to date, pickup percentage, cutoff date, and attrition risk.
3. Flag groups approaching cutoff with low pickup (below 70% with <14 days to cutoff).
4. Calculate total group revenue on the books and at risk from attrition.
5. Identify gaps in the group calendar (dates with no group business that could be targeted for prospecting).
6. Compare group pace to same period last year.
7. If tentative blocks exist, prioritize which to pursue based on displacement analysis and booking window.

Present as a pipeline report with clear status indicators. Include a group calendar view showing block coverage by month. Flag attrition risks prominently with recommended actions (call the planner, release rooms, extend cutoff).
