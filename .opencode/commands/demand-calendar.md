---
description: Generate demand calendar with market events
---

You are building a demand calendar. Use the **hotel-forecasting** and **hotel-revenue-manager** skills.

Arguments: `$ARGUMENTS`
- If empty, generate a demand calendar for the next 90 days.
- If a month or date range is given, focus on that period.
- If "events" is specified, emphasize market event detail.

Do the following:

1. Load the occupancy forecast and on-the-books data for the period.
2. Pull all known market events: conventions, conferences, sports, concerts, festivals, holidays, school breaks, and local happenings.
3. Overlay demand indicators on a calendar view:
   - Daily forecasted occupancy with color coding (red = compression, yellow = shoulder, blue = need, green = normal)
   - Market events annotated on their dates with expected room night impact
   - Group blocks shown as bars spanning their date ranges
   - Rate recommendations tied to demand level
4. Identify patterns: weekend vs. weekday demand, seasonal trends, event-driven spikes.
5. For each compression night, note the demand driver and recommended rate action.
6. For each need date, suggest promotional tactics or group prospecting targets.
7. Flag dates where events overlap for maximum compression potential.

Present as a visual calendar format (month grid) with a supplementary detail table. This should be printable and postable in the revenue manager's office.
