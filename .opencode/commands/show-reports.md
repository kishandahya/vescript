---
description: List and display recent scheduled reports (morning briefings, revenue flashes)
---

List the most recent scheduled reports available for the current persona.

Arguments: `$ARGUMENTS`
- If empty, show the 5 most recent reports
- If a date is specified, show reports from that date
- If "morning" or "briefing" is specified, show only morning briefings
- If "revenue" or "flash" is specified, show only revenue flash reports

Look in the `.opencode/openwork/agentlab/logs/` directory for report files.
For each report found, show:
1. Report type (Morning Briefing or Revenue Flash)
2. Date and time generated
3. A brief 2-3 line summary of key findings
4. Offer to show the full report if the user wants detail

If no reports are found, explain that scheduled reports haven't run yet and offer to generate one on-demand using the appropriate command (/morning-briefing or /portfolio-flash).
