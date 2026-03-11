---
name: hotel-collaborative
description: Revenue meeting prep, strategy meeting agendas, cross-department coordination materials with pickup summaries, pace analysis, and action item tracking.
---

## When to use

- The user asks to prepare for a revenue meeting, strategy meeting, or operations meeting.
- The user mentions "rev meeting," "strategy call," or "weekly revenue."
- The user needs cross-department coordination materials or meeting agendas.
- The user wants to generate pre-read materials for a scheduled meeting.
- The user asks about action item follow-up from prior meetings.

## What to do

1. **Identify meeting type** — Determine which meeting format to prepare:
   - **Weekly Revenue Strategy Meeting**: rate review, pickup analysis, forecast update, competitive positioning
   - **Monthly P&L Review**: financial performance, expense control, budget variance
   - **Quarterly Business Review (QBR)**: strategic direction, market analysis, capital planning
   - **Daily Operations Huddle**: today's priorities, guest issues, staffing, maintenance
   - **Group Review Meeting**: group pipeline, tentative blocks, booking pace

2. **Generate pickup summary** (for revenue meetings) — From `packages/app/public/hotel-data/reservations/`:
   - 7-day pickup: rooms and revenue added to the books in the last 7 days
   - Pickup by segment (transient, group, contract, OTA, direct)
   - Pickup by rate code (BAR, corporate, government, package, discount)
   - Compare pickup pace to same period last year
   - Net pickup (gross pickup minus cancellations)

3. **Compile booking pace analysis** — For the next 90 days:
   - OTB vs. SDLY OTB at the same lead time
   - Revenue on the books vs. SDLY revenue at same lead time
   - ADR trend: is the rate holding, eroding, or improving?
   - Identify dates with strong positive pace (opportunity to push rate)
   - Identify dates with lagging pace (need promotional or group activity)

4. **Assess rate strategy compliance** — Review whether the agreed-upon rate strategy from the last meeting was executed:
   - Were approved rate changes implemented in the PMS and channel manager?
   - Are closed channels actually closed? Are opened channels producing?
   - Are LOS restrictions in place for compression nights?
   - Did any unauthorized discounting occur?

5. **Prepare competitive intelligence** — From `packages/app/public/hotel-data/compset/`:
   - Comp set rate positioning for key future dates
   - Recent rate moves by competitors
   - New promotions or packages in the market
   - OTA ranking changes

6. **Generate agenda and pre-read** — Assemble the meeting package:
   - Structured agenda with time allocations
   - Key metrics summary (one page, scannable)
   - Discussion topics with supporting data
   - Open action items from prior meetings with status updates
   - Decision items requiring agreement in this meeting

7. **Track action items** — Maintain a running action item log:
   - Action, owner, due date, status (open/completed/overdue)
   - Flag overdue items prominently
   - Carry forward incomplete items to the next meeting agenda

## Context

- Reservations: `packages/app/public/hotel-data/reservations/`
- Historical data: `packages/app/public/hotel-data/historical/`
- Comp set data: `packages/app/public/hotel-data/compset/`
- Rate configuration: `packages/app/public/hotel-data/rates/`
- Meeting history: `packages/app/public/hotel-data/meetings/`
- Group pipeline: `packages/app/public/hotel-data/groups/`
- Convex tables: `reservations`, `meetings`, `actionItems`, `compSetRates`

## Output format

### For Revenue Strategy Meeting:
```
## 📋 Revenue Strategy Meeting — [Property Name] — [Date]

### Agenda (60 minutes)
1. [5 min] Last week's action item review
2. [10 min] Pickup and pace analysis
3. [10 min] Forecast review and need dates
4. [10 min] Rate strategy by date
5. [10 min] Group pipeline update
6. [10 min] Competitive positioning
7. [5 min] Action items and next steps

### Action Items from Last Meeting
| # | Action | Owner | Due | Status |
|---|--------|-------|-----|--------|
| 1 | | | | ✅ / ⏳ / 🔴 |

### 7-Day Pickup Summary
| Segment | Rooms | Revenue | ADR | vs. LY Pickup |
|---------|-------|---------|-----|---------------|

### Pace Report (Next 30/60/90 Days)
| Period | OTB Rooms | SDLY OTB | Var | OTB Rev | SDLY Rev | Var |
|--------|-----------|----------|-----|---------|----------|-----|

### Rate Strategy Recommendations
| Date Range | Current BAR | Recommended | Rationale |
|------------|-------------|-------------|-----------|

### Group Pipeline
| Group | Dates | Rooms | Rate | Status | Decision Needed |
|-------|-------|-------|------|--------|-----------------|

### Competitive Positioning
| Competitor | Rate | vs. Our Rate | Notes |
|------------|------|-------------|-------|

### New Action Items
| # | Action | Owner | Due |
|---|--------|-------|-----|
```

The pre-read should be sent 24 hours before the meeting. Keep it to 2 pages max — if people have to read more, they won't read anything.
