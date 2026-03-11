---
name: hotel-forecasting
description: Occupancy forecasting, demand analysis, booking pace tracking, and compression night identification using on-the-books data and market intelligence.
---

## When to use

- The user asks for an occupancy forecast, demand forecast, or booking pace analysis.
- The user mentions "OTB" (on the books), "pace," "pickup," or "need dates."
- The user asks about compression nights or high-demand periods.
- The user wants a 30-day, 60-day, or 90-day forecast.
- The user is preparing for a revenue strategy meeting or budget review.

## What to do

1. **Pull on-the-books data** — Load current reservation data from `packages/app/public/hotel-data/reservations/` or Convex. For each future date, count:
   - Definite individual reservations
   - Group block rooms (definite and tentative)
   - Total OTB rooms
   - Available inventory remaining

2. **Load historical patterns** — From `packages/app/public/hotel-data/historical/`, pull:
   - Same-day-last-year (SDLY) actuals for occupancy, ADR, RevPAR
   - Same-day-last-year OTB at the same booking window
   - Day-of-week seasonal patterns
   - Historical pickup curves (how many rooms book in the last 7, 14, 30 days)
   - Cancellation and no-show rates by segment

3. **Factor in market events** — Cross-reference against `packages/app/public/hotel-data/events/`:
   - Citywide conventions and conferences
   - Local events (sports, concerts, festivals)
   - Holiday periods and school breaks
   - New hotel supply entering the market
   - Construction or road closures affecting access

4. **Build day-by-day forecast** — For each date in the forecast window:
   - Start with OTB rooms
   - Add expected pickup based on historical booking curves, adjusted for:
     - Day of week
     - Seasonality
     - Market events (demand multiplier)
     - Current booking pace vs. SDLY pace
   - Subtract expected cancellations and no-shows (use segment-specific rates)
   - Result: **forecasted occupied rooms** and **forecasted occupancy %**

5. **Identify key date categories**:
   - 🔴 **Compression nights**: forecasted occupancy >95%, limited inventory, rate maximization opportunity
   - 🟡 **Shoulder dates**: 80-95% occupancy, rate optimization opportunity
   - 🔵 **Need dates**: forecasted occupancy <70%, require promotional activity or group business
   - ⚪ **Sold out**: no remaining inventory, manage waitlist and upsell

6. **Calculate pace variance** — Show how current OTB compares to SDLY at the same point:
   - Rooms pace: +/- X rooms vs. SDLY
   - Revenue pace: +/- $X vs. SDLY
   - ADR pace: +/- $X vs. SDLY
   - Flag dates where pace is deteriorating week over week

7. **Provide forecast confidence** — Rate forecast confidence based on:
   - Booking window (nearer dates = higher confidence)
   - Group certainty (definite vs. tentative blocks)
   - Market event confirmation status

## Context

- Reservations: `packages/app/public/hotel-data/reservations/`
- Historical performance: `packages/app/public/hotel-data/historical/`
- Market events: `packages/app/public/hotel-data/events/`
- Group blocks: `packages/app/public/hotel-data/groups/`
- Forecasts: `packages/app/public/hotel-data/forecasts/`
- Convex tables: `reservations`, `historicalPerformance`, `marketEvents`, `groups`

## Output format

```
## 📈 Occupancy Forecast — [Property Name] — [Date Range]

### Forecast Summary
| Period | Avg Occ% | Avg ADR | RevPAR | vs. Budget | vs. LY |
|--------|----------|---------|--------|------------|--------|
| Week 1 | | | | | |
| Week 2 | | | | | |
| Month 1 | | | | | |

### Day-by-Day Forecast
| Date | DOW | OTB | Pickup Fcst | C&N Adj | Fcst Occ | Fcst % | SDLY | Pace +/- | Status |
|------|-----|-----|-------------|---------|----------|--------|------|----------|--------|

🔴 Compression  🟡 Shoulder  🔵 Need Date  ⚪ Sold Out

### Compression Nights (rate maximization)
| Date | Fcst Occ% | Remaining | Recommendation |
|------|-----------|-----------|----------------|

### Need Dates (promotional opportunity)
| Date | Fcst Occ% | Gap to Budget | Recommendation |
|------|-----------|---------------|----------------|

### Booking Pace Analysis
| Segment | OTB | SDLY OTB | Var | Trend |
|---------|-----|----------|-----|-------|
| Transient | | | | |
| Group | | | | |
| Contract | | | | |

### Market Events Impacting Forecast
| Date | Event | Expected Impact | Confidence |
|------|-------|-----------------|------------|

### Action Items
- [ ] Rate actions for compression nights
- [ ] Promotional actions for need dates
- [ ] Group block follow-ups for tentative business
```

Present the forecast as a decision-making tool, not just a data dump. Every number should lead to an action.
