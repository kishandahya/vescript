#!/usr/bin/env node
/**
 * Run-All Orchestrator
 *
 * Executes both mock connectors in sequence:
 *   1. Opera PMS → reservations, rooms, housekeeping, night audits
 *   2. RMS → rates, comp sets, forecasts, demand calendar, market events
 *
 * Usage:
 *   npx tsx connectors/run-all.ts
 */

import { execSync } from "child_process";

const divider = "═".repeat(50);

console.log(divider);
console.log("  🏨 Hotel Copilot — Data Sync Orchestrator");
console.log(divider);

const start = Date.now();

try {
  console.log("\n[1/2] Opera PMS sync...\n");
  execSync("npx tsx connectors/opera-pms-mock.ts", {
    stdio: "inherit",
    cwd: process.cwd(),
  });

  console.log("\n[2/2] RMS sync...\n");
  execSync("npx tsx connectors/rms-mock.ts", {
    stdio: "inherit",
    cwd: process.cwd(),
  });

  const elapsed = ((Date.now() - start) / 1000).toFixed(1);
  console.log(`\n${divider}`);
  console.log(`  ✅ All connectors complete in ${elapsed}s`);
  console.log(divider);
} catch (err) {
  const elapsed = ((Date.now() - start) / 1000).toFixed(1);
  console.error(`\n${divider}`);
  console.error(`  ❌ Connector sync failed after ${elapsed}s`);
  console.error(divider);
  process.exit(1);
}
