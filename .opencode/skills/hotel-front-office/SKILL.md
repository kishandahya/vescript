---
name: hotel-front-office
description: Room grid management, arrivals and departures tracking, room status coordination, VIP management, and oversell resolution.
---

## When to use

- The user asks about today's arrivals, departures, or room status.
- The user mentions the room grid, room assignments, or inventory management.
- The user asks about VIP guests, special requests, or guest preferences.
- The user is dealing with an oversold situation or walk risk.
- The user needs to coordinate room moves, upgrades, or early check-ins.

## What to do

1. **Load today's operational snapshot** — Pull from `packages/app/public/hotel-data/reservations/` and `packages/app/public/hotel-data/rooms/`:
   - Total arrivals (individual, group, walk-in forecast)
   - Total departures (expected check-outs, late check-outs approved)
   - Stayovers (in-house continuing guests)
   - Room inventory: total, occupied, vacant clean, vacant dirty, out-of-order, out-of-inventory

2. **Build the room grid** — Create a visual representation of room status:
   - By floor and room number
   - Status: occupied (departing today, stayover), vacant clean, vacant dirty, OOO, OOI
   - Assigned arrivals mapped to specific rooms
   - Unassigned arrivals needing room assignment

3. **VIP management** — Identify and highlight:
   - VIP arrivals today with tier level (VIP1-VIP5 or property-specific classification)
   - Pre-arrival preferences (room type, floor, pillow type, minibar, welcome amenity)
   - Returning guests with history notes
   - Guests with complaints from prior stays needing service recovery
   - Loyalty program elite members with guaranteed benefits

4. **Identify oversold situations** — Calculate:
   - Net rooms available = (departures + vacant rooms) - (arrivals + stayovers + OOO)
   - If negative: quantify the oversell and recommend resolution:
     - Which reservations to walk (lowest rate, no loyalty, latest booking)
     - Partner hotels for walked guests
     - Estimated walk cost (competitor room + transportation + compensation)
     - Upgrade opportunities to open standard rooms

5. **Coordinate room assignments** — For unassigned arrivals:
   - Match guest preferences to available rooms
   - Prioritize VIPs and loyalty members for preferred rooms
   - Group same-party reservations on the same floor
   - Consider accessibility needs, connecting room requests, and quiet room requests
   - Balance housekeeping workload across floors

6. **Track departures** — For check-outs:
   - Flag expected departures not yet checked out (by 11 AM, noon, etc.)
   - Late check-out requests and approvals
   - Express check-out vs. front desk check-out
   - Rooms cleared for rush cleaning (needed for early arrivals)

## Context

- Reservations: `packages/app/public/hotel-data/reservations/`
- Room inventory: `packages/app/public/hotel-data/rooms/`
- Guest profiles: `packages/app/public/hotel-data/guests/`
- VIP list: `packages/app/public/hotel-data/vip/`
- Housekeeping status: `packages/app/public/hotel-data/housekeeping/`
- Convex tables: `reservations`, `rooms`, `guestProfiles`, `roomAssignments`

## Output format

```
## 🏨 Front Office Dashboard — [Property Name] — [Date]

### At a Glance
| Metric | Count |
|--------|-------|
| Arrivals | XX |
| Departures | XX |
| Stayovers | XX |
| In-House | XXX |
| Available Tonight | XX |
| Oversell Risk | ✅ None / ⚠️ X rooms |

### Room Status Grid
| Floor | Vacant Clean | Vacant Dirty | Occupied-Dep | Occupied-Stay | OOO | OOI |
|-------|-------------|-------------|--------------|---------------|-----|-----|

### VIP Arrivals
| Guest | Room | Tier | ETA | Special Requests | Notes |
|-------|------|------|-----|-----------------|-------|

### Unassigned Arrivals (action needed)
| Confirmation | Guest | Room Type | Preferences | Suggested Room |
|-------------|-------|-----------|-------------|----------------|

### Oversell Resolution (if applicable)
| Priority | Reservation | Rate | Loyalty | Action |
|----------|-------------|------|---------|--------|

### Departures Not Yet Checked Out (past due)
| Room | Guest | Expected | Late CO? | Notes |
|------|-------|----------|----------|-------|

### Action Items
- [ ] Room assignments to complete
- [ ] VIP amenities to place
- [ ] Departures to follow up
```

This is a real-time operational tool — update it frequently and always show the current state, not stale data. Time-stamp every refresh.
