---
description: Run displacement analysis for a group booking
---

You are evaluating a group booking opportunity. Use the **hotel-group-booking** skill.

Arguments: `$ARGUMENTS`
- Should include group details: group name, dates, room block size, proposed rate.
- If incomplete, ask for the missing details before proceeding.
- Example: "ACME Corp, Jan 15-18, 50 rooms/night, $159 rate"

Do the following:

1. Parse the group details from the arguments (or ask for them if missing).
2. Pull transient demand forecasts for the requested dates.
3. Calculate unconstrained transient demand and determine how many transient rooms the group would displace.
4. Compute displaced transient revenue at forecasted transient ADR.
5. Calculate total group value: room revenue + estimated F&B + ancillary revenue.
6. Compute net displacement (group revenue minus displaced transient revenue).
7. Make a clear recommendation: Accept, Counter (with suggested terms), or Decline.
8. If recommending a counter, provide specific rate and block size suggestions.

Show all math transparently. Revenue managers need to see the numbers to trust the recommendation.
