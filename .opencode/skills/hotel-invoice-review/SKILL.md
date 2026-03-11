---
name: hotel-invoice-review
description: Invoice review, bill approval, expense analysis, and vendor management with anomaly detection and contract compliance checking.
---

## When to use

- The user asks to review invoices, approve bills, or check expenses.
- The user mentions vendor management, purchase orders, or procurement.
- The user wants to flag unusual charges or verify contract compliance.
- The user asks about budget remaining or expense tracking.

## What to do

1. **Load invoice data** — Read pending invoices from `packages/app/public/hotel-data/invoices/` or query Convex for invoice records. For each invoice, extract:
   - Vendor name and vendor ID
   - Invoice number, date, and due date
   - Line items with quantities, unit prices, and totals
   - PO number (if referenced)
   - Department and GL code assignment

2. **Cross-reference vendor contracts** — For each vendor, check against contract terms in `packages/app/public/hotel-data/contracts/`:
   - Are unit prices within contracted rates? Flag any line item exceeding the contract price by more than 2%.
   - Is the vendor billing the correct entity and address?
   - Are payment terms consistent with the contract (Net 30, Net 60, etc.)?
   - Is the contract still active or has it expired?

3. **Check budget remaining** — For each department/GL code:
   - Pull MTD and YTD spend from `packages/app/public/hotel-data/budgets/`
   - Calculate remaining budget after this invoice
   - Flag if approving this invoice would exceed the monthly or annual budget
   - Show burn rate (% of budget consumed vs. % of period elapsed)

4. **Run anomaly detection** — Flag invoices that exhibit:
   - **Over-contract pricing**: unit price exceeds contract by >2%
   - **Unusual amounts**: invoice total is >2 standard deviations from the vendor's historical average
   - **Missing PO**: invoice has no matching purchase order
   - **Duplicate risk**: similar amount from same vendor within 7 days
   - **Frequency anomaly**: vendor billing more frequently than typical pattern
   - **Round number bias**: suspiciously round amounts ($5,000.00 exactly)
   - **New vendor**: first invoice from this vendor, requires extra scrutiny
   - **Split invoice risk**: multiple invoices just below approval threshold

5. **Prioritize for review** — Sort invoices into:
   - 🔴 **Requires investigation**: anomalies detected, do not approve
   - 🟡 **Review recommended**: minor flags, approval at manager discretion
   - 🟢 **Clean**: matches contract, within budget, no anomalies

6. **Provide approval recommendations** — For each invoice, state:
   - Approve, hold, or reject with specific reason
   - If holding, what information is needed to resolve
   - Suggested GL coding corrections if miscoded

## Context

- Pending invoices: `packages/app/public/hotel-data/invoices/`
- Vendor contracts: `packages/app/public/hotel-data/contracts/`
- Budget data: `packages/app/public/hotel-data/budgets/`
- Purchase orders: `packages/app/public/hotel-data/purchase-orders/`
- Historical invoices: `packages/app/public/hotel-data/invoices/history/`
- Convex tables: `invoices`, `vendors`, `contracts`, `purchaseOrders`, `budgets`

## Output format

```
## Invoice Review — [Property Name] — [Date]

### Summary
- **Total invoices pending**: XX
- **Total amount**: $XX,XXX
- 🔴 X invoices flagged for investigation
- 🟡 X invoices for manager review
- 🟢 X invoices clean to approve

### Flagged Invoices
#### 🔴 [Vendor Name] — Invoice #XXXX — $X,XXX
| Flag | Detail |
|------|--------|
| Over-contract | Line item X at $XX vs. contract $XX (+XX%) |
| Missing PO | No matching purchase order found |

**Recommendation**: Hold — request updated pricing per contract §X.X

#### 🟡 [Vendor Name] — Invoice #XXXX — $X,XXX
| Flag | Detail |
|------|--------|
| Budget impact | Approving puts Dept X at 95% of monthly budget |

**Recommendation**: Approve with GM awareness

### Clean Invoices (ready to approve)
| Vendor | Invoice # | Amount | Department | PO # | Contract ✓ |
|--------|-----------|--------|------------|------|------------|

### Budget Impact Summary
| Department | MTD Budget | MTD Spend | These Invoices | Remaining | % Used |
|------------|-----------|-----------|----------------|-----------|--------|

### Action Items
- [ ] Follow up on flagged invoices
```

Be specific about what is wrong and cite the contract clause or budget line. Vague flags waste everyone's time.
