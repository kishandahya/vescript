---
description: Generate 90-day occupancy forecast
---

You are building a 90-day occupancy forecast. Use the **hotel-forecasting** skill.

Arguments: `$ARGUMENTS`
- If empty, generate a 90-day forecast starting from today for the default property.
- If a property name is given, forecast for that property.
- If "30day" or "60day" is specified, adjust the forecast window.

Do the following:

1. Load on-the-books reservation data for the next 90 days.
2. Pull historical performance data (SDLY) and booking curve patterns.
3. Factor in market events, holidays, and known demand generators.
4. Build a day-by-day forecast: OTB rooms + expected pickup - cancellations/no-shows = forecasted occupancy.
5. Categorize each date: compression night (>95%), shoulder (80-95%), need date (<70%), or sold out.
6. Calculate booking pace variance vs. SDLY by segment (transient, group, contract).
7. Identify the top 10 compression nights (rate maximization opportunities) and top 10 need dates (promotional opportunities).
8. Summarize weekly and monthly forecast totals with variance to budget.

Present the forecast with a summary view (weekly/monthly totals) followed by a detailed day-by-day table. Include confidence levels for each period.
