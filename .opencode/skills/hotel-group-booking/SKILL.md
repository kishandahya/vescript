---
name: hotel-group-booking
description: Group RFPs, block management, displacement analysis, and group booking workflows for weddings, conferences, and corporate events.
---

## When to use

- The user asks about a group booking, RFP, or block management.
- The user mentions weddings, conferences, corporate events, or group blocks.
- The user wants to evaluate whether to accept a group at a proposed rate.
- The user asks about block pickup, attrition, cutoff dates, or group wash.
- The user wants to draft a proposal or response to a group inquiry.

## What to do

1. **Gather group details** — Identify or ask for:
   - Group name, type (corporate, association, wedding, SMERF, sports)
   - Requested dates (arrival, departure, peak night)
   - Room block (rooms per night pattern)
   - Proposed group rate
   - Food & beverage minimums or event space needs
   - Attrition clause (typically 80% of block)
   - Historical pickup if a repeat group

2. **Run displacement analysis** — This is the core of the evaluation:
   - Pull transient demand forecast for the requested dates from `packages/app/public/hotel-data/forecasts/`
   - Calculate **unconstrained transient demand** (demand if no group existed)
   - Determine **displaced transient rooms** = max(0, unconstrained demand + group block - total inventory)
   - Calculate **displaced transient revenue** = displaced rooms × forecasted transient ADR
   - Calculate **group revenue** = group rooms × group rate + ancillary (F&B, AV, parking)
   - Compute **net displacement** = group total revenue - displaced transient revenue
   - If net displacement is negative, the group destroys value

3. **Evaluate rate position** — Compare the proposed group rate against:
   - Current transient BAR for the period
   - Historical group rates for similar groups
   - Minimum acceptable rate (MAR) from revenue management guidelines
   - Cost per occupied room (CPOR) as the absolute floor

4. **Assess total group value** — Look beyond room revenue:
   - F&B revenue (catering, banquets, restaurant)
   - Meeting room rental
   - AV and other ancillary revenue
   - Future booking potential (annual conferences, repeat weddings)
   - Calculate **total group RevPAR contribution**

5. **Make a recommendation** — Based on displacement analysis:
   - **Accept as-is**: group adds net value, dates are need periods
   - **Counter**: propose a higher rate, smaller block, or shifted dates to reduce displacement
   - **Decline**: displacement exceeds group value, offer alternative dates

6. **Draft deliverables** (if requested):
   - Group proposal letter with rate, terms, and value-adds
   - Block pickup tracking template
   - Reminder email for cutoff date approaching
   - Attrition risk assessment

## Context

- Transient forecasts: `packages/app/public/hotel-data/forecasts/`
- Group history: `packages/app/public/hotel-data/groups/`
- Rate configuration: `packages/app/public/hotel-data/rates/`
- Event space: `packages/app/public/hotel-data/events-space/`
- Convex tables: `groups`, `reservations`, `forecasts`, `eventSpace`

## Output format

Structure the response based on the request:

### For displacement analysis:
```
## Displacement Analysis — [Group Name] — [Dates]

### Group Summary
| Detail | Value |
|--------|-------|
| Group | [name] |
| Type | [corporate/wedding/etc.] |
| Dates | [arrival - departure] |
| Peak Night | [date] |
| Total Room Nights | XXX |
| Proposed Rate | $XXX |

### Displacement Calculation
| Date | Inventory | Transient Fcst | Group Block | Total Demand | Displaced | Disp. Revenue |
|------|-----------|---------------|-------------|--------------|-----------|---------------|

### Revenue Comparison
| Source | Revenue |
|--------|---------|
| Group Room Revenue | $XX,XXX |
| Group F&B Revenue | $XX,XXX |
| Group Ancillary | $X,XXX |
| **Total Group Revenue** | **$XX,XXX** |
| Less: Displaced Transient Revenue | ($XX,XXX) |
| **Net Contribution** | **$XX,XXX** |

### Recommendation
[Accept / Counter / Decline] — [rationale]

### Suggested Counter (if applicable)
- Rate: $XXX (vs. proposed $XXX)
- Block: XX rooms (vs. proposed XX)
- Terms: [modified terms]
```

Always show the math. Revenue managers trust the analysis when they can see the numbers behind the recommendation.
