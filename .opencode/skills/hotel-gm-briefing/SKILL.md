---
name: hotel-gm-briefing
description: Morning briefing, daily report, and hotel overview aggregating night audit, arrivals, departures, and guest feedback into an executive digest.
---

## When to use

- The user asks for a morning briefing, daily report, or GM summary.
- The user says "what happened last night" or "what's happening today."
- The user requests an overview of hotel operations for the day.
- It is the start of a new work session and the user is a General Manager or hotel executive.

## What to do

1. **Pull night audit summary** — Read the latest night audit data from Convex table `nightAudits` (see `convex/schema.ts`). Extract:
   - Rooms sold, occupancy %, ADR, RevPAR
   - Total revenue by department (rooms, F&B, other)
   - No-shows, cancellations, walk-ins, walked guests
   - Over/short on cash and credit card reconciliation

2. **Compile today's operations** — Load today's operational data:
   - **Arrivals**: total check-ins expected, VIPs, group arrivals, early arrivals
   - **Departures**: total check-outs, late check-outs, group departures
   - **Stayovers**: in-house guest count
   - **Room availability**: rooms available to sell, out-of-order, out-of-inventory
   - **Occupancy forecast**: projected occupancy for today and next 7 days

3. **Guest experience snapshot** — Aggregate recent guest feedback:
   - Last 24 hours of guest complaints and resolutions from Convex table `guestFeedback` (see `convex/schema.ts`)
   - Online review scores (TripAdvisor, Google, OTA ratings) and recent trends
   - VIP guests in-house with special requests or preferences
   - Service recovery actions pending

4. **Financial pulse** — Summarize:
   - MTD revenue vs. budget (rooms, total)
   - MTD occupancy and ADR vs. budget
   - Accounts receivable aging highlights (anything overdue 60+ days)
   - Today's group revenue on the books

5. **Staffing and maintenance** — Note:
   - Key staffing gaps or call-outs
   - Maintenance issues affecting guest rooms or public areas
   - Safety or compliance items requiring attention

6. **Weather and local events** — Include a brief note on today's weather forecast and any local events that may affect operations (demand generators, road closures, etc.).

## Context

- Night audit data: Convex table `nightAudits` (see `convex/schema.ts`)
- Guest feedback: Convex table `guestFeedback` (see `convex/schema.ts`)
- Market events: Convex query `api.marketEventQueries.getByMarket` (`convex/marketEventQueries.ts`)
- Schema definition: `convex/schema.ts`
- Data service hooks: `hotel-frontend/data/hotel-data-service.ts`
- Type definitions: `hotel-frontend/data/hotel-types.ts`
- Convex tables: `reservations`, `nightAudits`, `guestFeedback`, `staffSchedules`

## Output format

Structure the response as a concise executive digest:

```
## 🏨 Morning Briefing — [Property Name] — [Date]

### Last Night at a Glance
| Metric | Actual | Budget | Var |
|--------|--------|--------|-----|
| Occupancy | X.X% | X.X% | +/-X.X% |
| ADR | $XXX | $XXX | +/-$XX |
| RevPAR | $XXX | $XXX | +/-$XX |
| Rooms Revenue | $XX,XXX | $XX,XXX | +/-$X,XXX |

### Today's Operations
- **Arrivals**: XX (X VIP, X group)
- **Departures**: XX
- **In-House**: XXX guests
- **Available**: XX rooms

### Guest Experience
- Online score: X.X/5 (trend: ↑/↓)
- Open issues: X items requiring follow-up

### VIP Watch
| Guest | Room | Arrival | Notes |
|-------|------|---------|-------|

### Heads Up
- ⚠️ Key alerts and items needing GM attention

### Action Items
- [ ] Critical actions for today
```

Keep the briefing to one screenful — GMs scan, they don't read essays. Lead with the number, follow with the context, close with the action.
