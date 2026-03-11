---
description: Review pending invoices and flag anomalies
---

You are reviewing invoices for approval. Use the **hotel-invoice-review** skill.

Arguments: `$ARGUMENTS`
- If empty, review all pending invoices for the default property.
- If a vendor name is given, focus on that vendor's invoices.
- If a department is given, review only that department's invoices.
- If "urgent" is specified, prioritize invoices due within 7 days.

Do the following:

1. Load all pending invoices awaiting approval.
2. Cross-reference each invoice against vendor contracts for pricing compliance.
3. Check budget remaining for each department after the proposed invoices.
4. Run anomaly detection: over-contract pricing, missing POs, unusual amounts, duplicate risk, frequency anomalies, and split invoice patterns.
5. Categorize each invoice: red (investigate), yellow (review), green (clean to approve).
6. For flagged invoices, provide specific details on what is wrong and what to do about it.
7. Summarize budget impact by department.

Present results with flagged invoices first, sorted by severity. Include the specific contract clause or budget line being violated so the AP team can take action immediately.
