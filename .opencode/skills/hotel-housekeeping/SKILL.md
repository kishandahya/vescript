---
name: hotel-housekeeping
description: Section assignment optimization, cleaning schedule management, room attendant workload balancing, and housekeeping coordination.
---

## When to use

- The user asks about housekeeping assignments, section sheets, or room attendant scheduling.
- The user mentions cleaning optimization, turnover rooms, or housekeeping staffing.
- The user wants to balance workloads across room attendants.
- The user is the executive housekeeper, housekeeping supervisor, or rooms division manager.

## What to do

1. **Load room status and reservations** — Pull from `packages/app/public/hotel-data/rooms/` and `packages/app/public/hotel-data/reservations/`:
   - Rooms with departures today (checkout rooms = full clean)
   - Stayover rooms (service clean, lighter workload)
   - Vacant dirty rooms from last night (deep clean if >1 night vacant)
   - Out-of-order rooms (maintenance, not assigned to attendants)
   - DND (Do Not Disturb) rooms from prior day
   - Early arrivals needing priority cleaning

2. **Calculate cleaning credits** — Assign workload credits per room type:
   - Standard checkout room: 1.0 credit (baseline ~30 min)
   - Suite/premium checkout: 1.5 credits (~45 min)
   - Stayover standard: 0.5 credits (~15 min)
   - Stayover suite: 0.75 credits (~20 min)
   - Deep clean/vacant dirty: 1.25 credits (~35 min)
   - VIP pre-arrival inspection: +0.25 credits
   - Adjust for specific room features (kitchen, multiple bathrooms, rollaway beds)

3. **Determine available attendants** — Load staffing data from `packages/app/public/hotel-data/staffing/`:
   - Scheduled attendants for today's shift
   - Call-outs or absences
   - Part-time vs. full-time (max credits differ)
   - Attendant skills (trained for suites, ADA rooms, VIP preparation)
   - Target credits per attendant per shift (typically 14-16 for 8-hour shift)

4. **Optimize section assignments** — Build assignments that:
   - Group rooms by floor and proximity (minimize travel time between rooms)
   - Balance total credits across attendants (±1 credit variance max)
   - Assign VIP and early-arrival rooms to the most experienced attendants
   - Keep checkout rooms on the same section as their stayover neighbors when possible
   - Assign ADA rooms to trained attendants
   - Consider elevator access and linen closet proximity
   - Front-load checkout rooms that have early arrivals assigned

5. **Priority sequencing** — Within each section, order rooms by:
   1. Early arrivals (guest arriving before 2 PM, confirmed)
   2. VIP arrivals
   3. Checkout rooms with reservations arriving today
   4. Other checkout rooms
   5. Stayover rooms
   6. Vacant dirty rooms (no immediate arrival)

6. **Generate supervisor inspection list** — Flag rooms for inspection:
   - All VIP arrivals
   - All suite checkouts
   - Random 10% sample of standard checkouts
   - Any room with a prior guest complaint about cleanliness
   - New attendant's rooms (100% inspection during training period)

## Context

- Room status: `packages/app/public/hotel-data/rooms/`
- Reservations: `packages/app/public/hotel-data/reservations/`
- Staff schedules: `packages/app/public/hotel-data/staffing/`
- Room types: `packages/app/public/hotel-data/room-types/`
- VIP list: `packages/app/public/hotel-data/vip/`
- Convex tables: `rooms`, `reservations`, `staffSchedules`, `roomTypes`

## Output format

```
## 🧹 Housekeeping Assignments — [Property Name] — [Date]

### Shift Summary
| Metric | Count |
|--------|-------|
| Checkout rooms | XX |
| Stayover rooms | XX |
| Vacant dirty | XX |
| Total credits | XX.X |
| Attendants available | X |
| Avg credits/attendant | XX.X |

### Section Assignments
#### [Attendant Name] — Section [X] — [XX.X credits]
| Priority | Room | Floor | Type | Status | Credits | Notes |
|----------|------|-------|------|--------|---------|-------|
| 1 | 301 | 3 | King Suite | C/O - Early Arr | 1.5 | VIP arrival 1PM |
| 2 | 305 | 3 | Double | C/O | 1.0 | |
| 3 | 303 | 3 | King | Stayover | 0.5 | |

#### [Attendant Name] — Section [Y] — [XX.X credits]
...

### Supervisor Inspection List
| Room | Reason | Assigned To | Priority |
|------|--------|-------------|----------|

### Early Arrival Watch (clean by time)
| Room | Type | Arrival Time | Attendant | Section |
|------|------|-------------|-----------|---------|

### Workload Balance
| Attendant | Checkouts | Stayovers | Total Credits | vs. Average |
|-----------|-----------|-----------|---------------|-------------|

### Notes
- Rooms with DND from yesterday: [list]
- Out-of-order rooms (skip): [list]
```

Print section sheets that can be handed directly to attendants. Include room numbers large and clear. The priority column tells them what to clean first.
