/**
 * Convex HTTP client wrapper for the Hotel Data MCP server.
 *
 * Initializes ConvexHttpClient using CONVEX_URL env var and exposes
 * typed helper functions for common hotel data query patterns.
 */

import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api.js";

// ---------------------------------------------------------------------------
// Client initialization
// ---------------------------------------------------------------------------

function getConvexUrl(): string {
  const url =
    process.env.CONVEX_URL ??
    process.env.VITE_CONVEX_URL ??
    process.env.NEXT_PUBLIC_CONVEX_URL;

  if (!url) {
    throw new Error(
      "Missing Convex deployment URL. Set CONVEX_URL (or VITE_CONVEX_URL) environment variable.",
    );
  }
  return url;
}

let _client: ConvexHttpClient | null = null;

export function getClient(): ConvexHttpClient {
  if (!_client) {
    _client = new ConvexHttpClient(getConvexUrl());
  }
  return _client;
}

// ---------------------------------------------------------------------------
// Safe query wrapper — returns error object instead of throwing
// ---------------------------------------------------------------------------

async function safeQuery<T>(
  fn: () => Promise<T>,
  context: string,
): Promise<{ ok: true; data: T } | { ok: false; error: string }> {
  try {
    const data = await fn();
    return { ok: true, data };
  } catch (err: any) {
    const message = err?.message ?? String(err);
    return {
      ok: false,
      error: `Failed to query ${context}: ${message}`,
    };
  }
}

// ---------------------------------------------------------------------------
// Property helpers
// ---------------------------------------------------------------------------

export async function getAllProperties() {
  return safeQuery(
    () => getClient().query(api.properties.getAll, {}),
    "all properties",
  );
}

export async function getPropertyBySlug(slug: string) {
  return safeQuery(
    () => getClient().query(api.properties.getById, { slug }),
    `property by slug "${slug}"`,
  );
}

export async function getPropertiesByRegion(regionId: string) {
  return safeQuery(
    () => getClient().query(api.properties.getByRegion, { regionId }),
    `properties in region "${regionId}"`,
  );
}

// ---------------------------------------------------------------------------
// Portfolio / region helpers
// ---------------------------------------------------------------------------

export async function getPortfolio() {
  return safeQuery(
    () => getClient().query(api.portfolioQueries.getPortfolio, {}),
    "portfolio",
  );
}

export async function getRegions() {
  return safeQuery(
    () => getClient().query(api.portfolioQueries.getRegions, {}),
    "regions",
  );
}

export async function getRegionKpis(regionId?: string) {
  return safeQuery(
    () => getClient().query(api.portfolioQueries.getRegionKpis, { regionId }),
    `region KPIs${regionId ? ` for region "${regionId}"` : ""}`,
  );
}

// ---------------------------------------------------------------------------
// Daily summaries
// ---------------------------------------------------------------------------

export async function getSummariesByProperty(propertyId: string) {
  return safeQuery(
    () =>
      getClient().query(api.summaryQueries.getByProperty, {
        propertyId: propertyId as any,
      }),
    `daily summaries for property "${propertyId}"`,
  );
}

export async function getAllLatestSummaries() {
  return safeQuery(
    () => getClient().query(api.summaryQueries.getAllLatest, {}),
    "all latest summaries",
  );
}

// ---------------------------------------------------------------------------
// Rates & comp sets
// ---------------------------------------------------------------------------

export async function getRatesByProperty(propertyId: string) {
  return safeQuery(
    () =>
      getClient().query(api.rateQueries.getByProperty, {
        propertyId: propertyId as any,
      }),
    `rates for property "${propertyId}"`,
  );
}

export async function getCompSetByProperty(propertyId: string) {
  return safeQuery(
    () =>
      getClient().query(api.compSetQueries.getByProperty, {
        propertyId: propertyId as any,
      }),
    `comp set for property "${propertyId}"`,
  );
}

// ---------------------------------------------------------------------------
// Reservations
// ---------------------------------------------------------------------------

export async function getArrivals(propertyId: string) {
  return safeQuery(
    () =>
      getClient().query(api.reservationQueries.getArrivals, {
        propertyId: propertyId as any,
      }),
    `arrivals for property "${propertyId}"`,
  );
}

export async function getDepartures(propertyId: string) {
  return safeQuery(
    () =>
      getClient().query(api.reservationQueries.getDepartures, {
        propertyId: propertyId as any,
      }),
    `departures for property "${propertyId}"`,
  );
}

export async function getVips(propertyId: string) {
  return safeQuery(
    () =>
      getClient().query(api.reservationQueries.getVips, {
        propertyId: propertyId as any,
      }),
    `VIP reservations for property "${propertyId}"`,
  );
}

// ---------------------------------------------------------------------------
// Night audits
// ---------------------------------------------------------------------------

export async function getNightAuditsByProperty(propertyId: string) {
  return safeQuery(
    () =>
      getClient().query((api as any).nightAuditQueries.getByProperty, {
        propertyId: propertyId as any,
      }),
    `night audits for property "${propertyId}"`,
  );
}

export async function getLatestNightAudit(propertyId: string) {
  return safeQuery(
    () =>
      getClient().query((api as any).nightAuditQueries.getLatestByProperty, {
        propertyId: propertyId as any,
      }),
    `latest night audit for property "${propertyId}"`,
  );
}

// ---------------------------------------------------------------------------
// Room stats
// ---------------------------------------------------------------------------

export async function getRoomStats(propertyId: string) {
  return safeQuery(
    () =>
      getClient().query(api.roomQueries.getRoomStats, {
        propertyId: propertyId as any,
      }),
    `room stats for property "${propertyId}"`,
  );
}
