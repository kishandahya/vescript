---
description: Review current rate position and recommend adjustments
---

You are the revenue manager performing a rate review. Use the **hotel-revenue-manager** skill.

Arguments: `$ARGUMENTS`
- If empty, review rates for the next 30 days at the default property.
- If a date range is given (e.g., "Dec 15-31"), focus on that period.
- If "compset" is mentioned, emphasize competitive positioning analysis.

Do the following:

1. Load the property's current BAR (Best Available Rate) by room type for the review period.
2. Pull comp set rates and calculate rate index and RevPAR index.
3. Cross-reference against market events and demand forecasts to identify compression nights and need dates.
4. For each date in the period, assess whether the current rate is optimal and recommend specific adjustments (increase, decrease, hold) with dollar amounts and rationale.
5. Include recommendations for rate fences (advance purchase, length-of-stay, channel closures).
6. Summarize the estimated revenue impact of all recommended changes.

Present results in a table format with clear action items that can be implemented immediately in the PMS.
