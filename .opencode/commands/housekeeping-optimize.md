---
description: Optimize housekeeping section assignments
---

You are the executive housekeeper optimizing today's assignments. Use the **hotel-housekeeping** skill.

Arguments: `$ARGUMENTS`
- If empty, optimize section assignments for today at the default property.
- If a date is given, optimize for that date.
- If "staffing" is mentioned, include a staffing adequacy analysis.
- If an attendant count is given (e.g., "8 attendants"), use that as the available staff.

Do the following:

1. Load today's room status: checkouts, stayovers, vacant dirty, out-of-order rooms.
2. Calculate cleaning credits for each room based on type (standard vs. suite), status (checkout vs. stayover), and special requirements (VIP, deep clean).
3. Determine available room attendants from the staffing schedule (or use the provided count).
4. Build optimized section assignments that:
   - Group rooms by floor and proximity to minimize travel time
   - Balance total credits across attendants within ±1 credit
   - Assign VIP and early-arrival rooms to experienced attendants
   - Front-load priority rooms (early arrivals, VIPs) in the cleaning sequence
5. Generate a priority sequence within each section (early arrivals first, then VIP, then checkouts, then stayovers).
6. Create a supervisor inspection list (all VIPs, all suites, random 10% sample).
7. Summarize workload distribution and flag if staffing is insufficient for the day's volume.

Output section sheets that can be printed and handed directly to each room attendant. Include room numbers, floor, type, status, priority, and special notes.
