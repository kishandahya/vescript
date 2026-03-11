#!/usr/bin/env node
/**
 * Hotel Data MCP Server
 *
 * Bridges Convex hotel data queries to AI-accessible MCP tools.
 * Spawned as a local stdio process by OpenWork / opencode.
 *
 * Registered tools:
 *   - get_property_summary
 *   - get_portfolio_overview
 *   - get_rate_position
 *   - get_arrivals_departures
 *   - get_night_audit
 *   - search_properties
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

import * as convex from "./convex-client.js";

// ---------------------------------------------------------------------------
// Persona scoping helpers
// ---------------------------------------------------------------------------

type Persona =
  | "gm"
  | "revenue_manager"
  | "district_manager"
  | "svp";

const PROPERTY_SCOPED: Persona[] = ["gm", "revenue_manager"];
const REGIONAL_SCOPED: Persona[] = ["district_manager"];
// SVP and undefined → broadest scope (all properties)

function isPropertyScoped(persona?: string): boolean {
  return PROPERTY_SCOPED.includes(persona as Persona);
}

function isRegionalScoped(persona?: string): boolean {
  return REGIONAL_SCOPED.includes(persona as Persona);
}

/**
 * Resolve properties visible to a persona.
 * Returns an array of property objects (with _id, slug, name, etc.).
 */
async function resolveProperties(opts: {
  propertyId?: string;
  region?: string;
  persona?: string;
}): Promise<{ ok: true; data: any[] } | { ok: false; error: string }> {
  const { propertyId, region, persona } = opts;

  // Property-scoped personas MUST have a property_id
  if (isPropertyScoped(persona) && !propertyId) {
    return {
      ok: false,
      error: `Persona "${persona}" requires a property_id parameter. Please specify which property to query.`,
    };
  }

  // If a specific property is requested, return just that one
  if (propertyId) {
    const result = await convex.getPropertyBySlug(propertyId);
    if (!result.ok) return result;
    if (!result.data) {
      return { ok: false, error: `Property "${propertyId}" not found. Use search_properties to find valid property slugs.` };
    }
    return { ok: true, data: [result.data] };
  }

  // Regional filter
  if (region || isRegionalScoped(persona)) {
    if (!region) {
      return {
        ok: false,
        error: `Persona "${persona}" benefits from a region filter. Use get_portfolio_overview to see available regions, then pass a region parameter.`,
      };
    }
    return await convex.getPropertiesByRegion(region);
  }

  // Broadest scope — all properties
  return await convex.getAllProperties();
}

// ---------------------------------------------------------------------------
// Helper: today's date string
// ---------------------------------------------------------------------------

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

// ---------------------------------------------------------------------------
// MCP Server setup
// ---------------------------------------------------------------------------

const server = new McpServer({
  name: "hotel-data",
  version: "0.1.0",
});

// ========================================================================
// Tool 1: get_property_summary
// ========================================================================

server.tool(
  "get_property_summary",
  `Returns key performance indicators (KPIs) for a hotel property or set of properties.
Metrics include: occupancy %, ADR (average daily rate), RevPAR, revenue, budget comparisons, MTD and YTD revenue.
Use this when the user asks about how a property is performing, daily metrics, or revenue summary.
- GM / Revenue Manager: must provide property_id for their specific property
- District Manager: can filter by region
- SVP: returns all properties`,
  {
    property_id: z
      .string()
      .optional()
      .describe(
        "Property slug (e.g. 'grand-atlantic-miami'). Required for GM/Revenue Manager personas. Use search_properties to discover slugs.",
      ),
    persona: z
      .enum(["gm", "revenue_manager", "district_manager", "svp"])
      .optional()
      .describe("Role-based scope. Determines data breadth."),
    date: z
      .string()
      .optional()
      .describe("Date filter (YYYY-MM-DD). Defaults to latest available."),
    region: z
      .string()
      .optional()
      .describe("Region ID to filter by (for district_manager or broader scopes)."),
  },
  async ({ property_id, persona, date, region }) => {
    const propsResult = await resolveProperties({
      propertyId: property_id,
      region,
      persona,
    });
    if (!propsResult.ok) {
      return { content: [{ type: "text" as const, text: JSON.stringify({ error: propsResult.error }) }] };
    }

    const properties = propsResult.data;
    const summaries: any[] = [];

    for (const prop of properties) {
      const summaryResult = await convex.getSummariesByProperty(prop._id);
      if (!summaryResult.ok) {
        summaries.push({
          property: prop.name,
          slug: prop.slug,
          error: summaryResult.error,
        });
        continue;
      }

      let records = summaryResult.data || [];

      // Filter by date if provided
      if (date) {
        records = records.filter((s: any) => s.date === date);
      }

      // Take the latest record if no date filter or multiple exist
      const latest =
        records.length > 0
          ? records.sort((a: any, b: any) => (b.date > a.date ? 1 : -1))[0]
          : null;

      summaries.push({
        property: prop.name,
        slug: prop.slug,
        region: prop.regionId,
        totalRooms: prop.totalRooms,
        ...(latest
          ? {
              date: latest.date,
              occupancy: latest.occupancy,
              adr: latest.adr,
              revpar: latest.revpar,
              revenue: latest.revenue,
              budgetOccupancy: latest.budgetOccupancy,
              budgetAdr: latest.budgetAdr,
              budgetRevpar: latest.budgetRevpar,
              budgetRevenue: latest.budgetRevenue,
              mtdRevenue: latest.mtdRevenue,
              mtdBudget: latest.mtdBudget,
              ytdRevenue: latest.ytdRevenue,
              ytdBudget: latest.ytdBudget,
              occupancyVsBudget:
                latest.budgetOccupancy > 0
                  ? `${((latest.occupancy / latest.budgetOccupancy) * 100).toFixed(1)}%`
                  : "N/A",
              revenueVsBudget:
                latest.budgetRevenue > 0
                  ? `${((latest.revenue / latest.budgetRevenue) * 100).toFixed(1)}%`
                  : "N/A",
            }
          : { note: "No summary data available for this property" }),
      });
    }

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(
            {
              tool: "get_property_summary",
              date: date || "latest",
              propertyCount: properties.length,
              summaries,
            },
            null,
            2,
          ),
        },
      ],
    };
  },
);

// ========================================================================
// Tool 2: get_portfolio_overview
// ========================================================================

server.tool(
  "get_portfolio_overview",
  `Returns a cross-property portfolio rollup with KPIs per property and regional aggregates.
Includes: total rooms, average occupancy, total revenue, GOP margin, labor %, per-property comparison.
Use when the user asks about portfolio performance, property comparisons, or regional rollups.
- District Manager: filter by region
- SVP: sees entire portfolio`,
  {
    region: z
      .string()
      .optional()
      .describe("Region ID to filter. Omit for full portfolio view."),
    persona: z
      .enum(["gm", "revenue_manager", "district_manager", "svp"])
      .optional()
      .describe("Role-based scope."),
  },
  async ({ region, persona }) => {
    // Fetch portfolio metadata
    const portfolioResult = await convex.getPortfolio();
    const regionsResult = await convex.getRegions();
    const kpisResult = await convex.getRegionKpis(region);

    const errors: string[] = [];
    if (!portfolioResult.ok) errors.push(portfolioResult.error);
    if (!regionsResult.ok) errors.push(regionsResult.error);
    if (!kpisResult.ok) errors.push(kpisResult.error);

    if (errors.length === 3) {
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify({ error: "Unable to fetch portfolio data", details: errors }),
          },
        ],
      };
    }

    const portfolio = portfolioResult.ok ? portfolioResult.data : null;
    const regions = regionsResult.ok ? regionsResult.data : [];
    const kpis = kpisResult.ok ? kpisResult.data : [];

    // Aggregate KPIs
    const totalRooms = kpis.reduce(
      (sum: number, k: any) => sum + (k.revenue || 0) / Math.max(k.revpar || 1, 1),
      0,
    );
    const avgOccupancy =
      kpis.length > 0
        ? kpis.reduce((sum: number, k: any) => sum + (k.occupancy || 0), 0) / kpis.length
        : 0;
    const totalRevenue = kpis.reduce((sum: number, k: any) => sum + (k.revenue || 0), 0);
    const avgAdr =
      kpis.length > 0
        ? kpis.reduce((sum: number, k: any) => sum + (k.adr || 0), 0) / kpis.length
        : 0;
    const avgRevpar =
      kpis.length > 0
        ? kpis.reduce((sum: number, k: any) => sum + (k.revpar || 0), 0) / kpis.length
        : 0;
    const avgGopMargin =
      kpis.length > 0
        ? kpis.reduce((sum: number, k: any) => sum + (k.gopMargin || 0), 0) / kpis.length
        : 0;
    const avgLaborPct =
      kpis.length > 0
        ? kpis.reduce((sum: number, k: any) => sum + (k.laborPct || 0), 0) / kpis.length
        : 0;

    // Per-property breakdown
    const propertyBreakdown = kpis.map((k: any) => ({
      propertyId: k.propertyId,
      regionId: k.regionId,
      month: k.month,
      occupancy: k.occupancy,
      adr: k.adr,
      revpar: k.revpar,
      revenue: k.revenue,
      laborPct: k.laborPct,
      gopMargin: k.gopMargin,
    }));

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(
            {
              tool: "get_portfolio_overview",
              regionFilter: region || "all",
              portfolio: portfolio
                ? {
                    name: portfolio.name,
                    totalProperties: portfolio.totalProperties,
                    totalRooms: portfolio.totalRooms,
                  }
                : null,
              regions: regions || [],
              aggregates: {
                propertyCount: kpis.length,
                avgOccupancy: Number(avgOccupancy.toFixed(1)),
                avgAdr: Number(avgAdr.toFixed(2)),
                avgRevpar: Number(avgRevpar.toFixed(2)),
                totalRevenue: Number(totalRevenue.toFixed(2)),
                avgGopMargin: Number(avgGopMargin.toFixed(1)),
                avgLaborPct: Number(avgLaborPct.toFixed(1)),
              },
              propertyBreakdown,
            },
            null,
            2,
          ),
        },
      ],
    };
  },
);

// ========================================================================
// Tool 3: get_rate_position
// ========================================================================

server.tool(
  "get_rate_position",
  `Returns the property's current rate positioning versus its competitive set.
Shows: our rates by room type, comp set average/min/max ADR, occupancy index, RevPAR index.
Use when the user asks about pricing, rate shopping, competitive positioning, or comp set analysis.
Requires a property_id.`,
  {
    property_id: z
      .string()
      .describe("Property slug (e.g. 'grand-atlantic-miami'). Required."),
    date: z
      .string()
      .optional()
      .describe("Date to check rates for (YYYY-MM-DD). Defaults to latest available."),
  },
  async ({ property_id, date }) => {
    // Resolve property
    const propResult = await convex.getPropertyBySlug(property_id);
    if (!propResult.ok) {
      return { content: [{ type: "text" as const, text: JSON.stringify({ error: propResult.error }) }] };
    }
    if (!propResult.data) {
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify({
              error: `Property "${property_id}" not found. Use search_properties to find valid slugs.`,
            }),
          },
        ],
      };
    }
    const property = propResult.data;

    // Fetch rates and comp set in parallel
    const [ratesResult, compResult] = await Promise.all([
      convex.getRatesByProperty(property._id),
      convex.getCompSetByProperty(property._id),
    ]);

    // Process our rates
    let ourRates: any[] = [];
    if (ratesResult.ok && ratesResult.data) {
      ourRates = ratesResult.data;
      if (date) {
        ourRates = ourRates.filter((r: any) => r.date === date);
      }
    }

    // Process comp set
    let compSet: any[] = [];
    if (compResult.ok && compResult.data) {
      compSet = compResult.data;
    }

    // Calculate comp set aggregates
    const compAdrs = compSet.map((c: any) => c.adr).filter((v: number) => v > 0);
    const compOccupancies = compSet.map((c: any) => c.occupancy).filter((v: number) => v > 0);

    const compAvgAdr = compAdrs.length > 0 ? compAdrs.reduce((a: number, b: number) => a + b, 0) / compAdrs.length : 0;
    const compMinAdr = compAdrs.length > 0 ? Math.min(...compAdrs) : 0;
    const compMaxAdr = compAdrs.length > 0 ? Math.max(...compAdrs) : 0;
    const compAvgOccupancy =
      compOccupancies.length > 0
        ? compOccupancies.reduce((a: number, b: number) => a + b, 0) / compOccupancies.length
        : 0;

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(
            {
              tool: "get_rate_position",
              property: {
                name: property.name,
                slug: property.slug,
                market: property.market,
                totalRooms: property.totalRooms,
              },
              dateFilter: date || "latest",
              ourRates: ourRates.map((r: any) => ({
                date: r.date,
                roomType: r.roomType,
                bar: r.bar,
                restrictions: r.restrictions || "none",
              })),
              compSet: {
                competitors: compSet.map((c: any) => ({
                  name: c.competitorName,
                  adr: c.adr,
                  occupancy: c.occupancy,
                  revpar: c.revpar,
                  indexScore: c.indexScore,
                })),
                summary: {
                  avgAdr: Number(compAvgAdr.toFixed(2)),
                  minAdr: Number(compMinAdr.toFixed(2)),
                  maxAdr: Number(compMaxAdr.toFixed(2)),
                  avgOccupancy: Number(compAvgOccupancy.toFixed(1)),
                  competitorCount: compSet.length,
                },
              },
            },
            null,
            2,
          ),
        },
      ],
    };
  },
);

// ========================================================================
// Tool 4: get_arrivals_departures
// ========================================================================

server.tool(
  "get_arrivals_departures",
  `Returns today's guest movement for a property: arriving guests, departing guests, stayovers, and VIP guests.
Includes guest names, room numbers, VIP tiers, special requests, group affiliations, and ETAs.
Use when the user asks about today's arrivals, departures, guest activity, or front desk operations.
Requires a property_id.`,
  {
    property_id: z
      .string()
      .describe("Property slug (e.g. 'grand-atlantic-miami'). Required."),
    date: z
      .string()
      .optional()
      .describe("Date (YYYY-MM-DD). Current data represents today's snapshot."),
  },
  async ({ property_id, date }) => {
    const propResult = await convex.getPropertyBySlug(property_id);
    if (!propResult.ok) {
      return { content: [{ type: "text" as const, text: JSON.stringify({ error: propResult.error }) }] };
    }
    if (!propResult.data) {
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify({
              error: `Property "${property_id}" not found. Use search_properties to find valid slugs.`,
            }),
          },
        ],
      };
    }
    const property = propResult.data;

    // Fetch arrivals, departures, VIPs in parallel
    const [arrivalsResult, departuresResult, vipsResult, roomStatsResult] = await Promise.all([
      convex.getArrivals(property._id),
      convex.getDepartures(property._id),
      convex.getVips(property._id),
      convex.getRoomStats(property._id),
    ]);

    const arrivals = arrivalsResult.ok ? arrivalsResult.data || [] : [];
    const departures = departuresResult.ok ? departuresResult.data || [] : [];
    const vips = vipsResult.ok ? vipsResult.data || [] : [];
    const roomStats = roomStatsResult.ok ? roomStatsResult.data : null;

    const formatGuest = (r: any) => ({
      guestName: r.guestName,
      roomNumber: r.roomNumber,
      vipTier: r.vipTier || null,
      groupName: r.groupName || null,
      specialRequests: r.specialRequests || null,
      eta: r.eta || null,
      checkoutTime: r.checkoutTime || null,
      balance: r.balance ?? null,
      loyaltyTier: r.loyaltyTier || null,
    });

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(
            {
              tool: "get_arrivals_departures",
              property: {
                name: property.name,
                slug: property.slug,
                totalRooms: property.totalRooms,
              },
              date: date || todayStr(),
              summary: {
                arrivingGuests: arrivals.length,
                departingGuests: departures.length,
                vipGuests: vips.length,
                ...(roomStats
                  ? {
                      occupiedRooms: roomStats.occupied || 0,
                      availableRooms:
                        (roomStats["vacant-clean"] || 0) + (roomStats["vacant-dirty"] || 0),
                      dueIn: roomStats["due-in"] || 0,
                      dueOut: roomStats["due-out"] || 0,
                      outOfOrder: roomStats.ooo || 0,
                    }
                  : {}),
              },
              arrivals: arrivals.map(formatGuest),
              departures: departures.map(formatGuest),
              vips: vips.map(formatGuest),
            },
            null,
            2,
          ),
        },
      ],
    };
  },
);

// ========================================================================
// Tool 5: get_night_audit
// ========================================================================

server.tool(
  "get_night_audit",
  `Returns the last night audit report for a property.
Includes: rooms sold (occupied), room revenue, F&B revenue, other revenue, total revenue,
comp rooms, adjustments, refunds, and available rooms.
Use when the user asks about last night's performance, night audit, end-of-day numbers, or revenue reconciliation.
Requires a property_id.`,
  {
    property_id: z
      .string()
      .describe("Property slug (e.g. 'grand-atlantic-miami'). Required."),
    date: z
      .string()
      .optional()
      .describe("Audit date (YYYY-MM-DD). Defaults to most recent audit."),
  },
  async ({ property_id, date }) => {
    const propResult = await convex.getPropertyBySlug(property_id);
    if (!propResult.ok) {
      return { content: [{ type: "text" as const, text: JSON.stringify({ error: propResult.error }) }] };
    }
    if (!propResult.data) {
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify({
              error: `Property "${property_id}" not found. Use search_properties to find valid slugs.`,
            }),
          },
        ],
      };
    }
    const property = propResult.data;

    const auditsResult = await convex.getNightAuditsByProperty(property._id);

    if (!auditsResult.ok) {
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify({
              tool: "get_night_audit",
              property: { name: property.name, slug: property.slug },
              error: auditsResult.error,
            }),
          },
        ],
      };
    }

    let audits = auditsResult.data || [];

    // Filter by date if provided
    if (date) {
      audits = audits.filter((a: any) => a.date === date);
    }

    // Take the most recent audit
    const latest =
      audits.length > 0
        ? audits.sort((a: any, b: any) => (b.date > a.date ? 1 : -1))[0]
        : null;

    if (!latest) {
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify({
              tool: "get_night_audit",
              property: { name: property.name, slug: property.slug },
              note: date
                ? `No night audit found for date ${date}.`
                : "No night audit data available for this property.",
            }),
          },
        ],
      };
    }

    const occupancyPct =
      latest.availableRooms > 0
        ? ((latest.occupiedRooms / latest.availableRooms) * 100).toFixed(1)
        : "N/A";

    const adr =
      latest.occupiedRooms > 0
        ? (latest.roomRevenue / latest.occupiedRooms).toFixed(2)
        : "N/A";

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(
            {
              tool: "get_night_audit",
              property: {
                name: property.name,
                slug: property.slug,
                totalRooms: property.totalRooms,
              },
              audit: {
                date: latest.date,
                roomsSold: latest.occupiedRooms,
                availableRooms: latest.availableRooms,
                occupancyPct,
                calculatedAdr: adr,
                roomRevenue: latest.roomRevenue,
                fbRevenue: latest.fbRevenue,
                otherRevenue: latest.otherRevenue,
                totalRevenue: latest.totalRevenue,
                compRooms: latest.comps,
                adjustments: latest.adjustments,
                refunds: latest.refunds,
              },
            },
            null,
            2,
          ),
        },
      ],
    };
  },
);

// ========================================================================
// Tool 6: search_properties
// ========================================================================

server.tool(
  "search_properties",
  `Search for hotel properties by name, region, or brand.
Returns a list of matching properties with slug, name, brand, market, room count, and region.
Use this to discover property slugs before calling other tools, or to answer questions like
"which properties are in the Southeast?" or "show me all Marriott properties."`,
  {
    query: z
      .string()
      .optional()
      .describe("Free-text search against property name, brand, or market. Case-insensitive."),
    region: z
      .string()
      .optional()
      .describe("Region ID to filter by."),
  },
  async ({ query, region }) => {
    let propertiesResult;

    if (region) {
      propertiesResult = await convex.getPropertiesByRegion(region);
    } else {
      propertiesResult = await convex.getAllProperties();
    }

    if (!propertiesResult.ok) {
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify({ error: propertiesResult.error }),
          },
        ],
      };
    }

    let properties = propertiesResult.data || [];

    // Apply free-text filter
    if (query) {
      const q = query.toLowerCase();
      properties = properties.filter(
        (p: any) =>
          (p.name && p.name.toLowerCase().includes(q)) ||
          (p.brand && p.brand.toLowerCase().includes(q)) ||
          (p.market && p.market.toLowerCase().includes(q)) ||
          (p.slug && p.slug.toLowerCase().includes(q)) ||
          (p.propertyType && p.propertyType.toLowerCase().includes(q)),
      );
    }

    // Fetch regions for enrichment
    const regionsResult = await convex.getRegions();
    const regionMap: Record<string, string> = {};
    if (regionsResult.ok && regionsResult.data) {
      for (const r of regionsResult.data) {
        regionMap[(r as any)._id] = (r as any).name;
        if ((r as any).slug) regionMap[(r as any).slug] = (r as any).name;
      }
    }

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(
            {
              tool: "search_properties",
              query: query || null,
              regionFilter: region || null,
              resultCount: properties.length,
              properties: properties.map((p: any) => ({
                slug: p.slug,
                name: p.name,
                brand: p.brand,
                market: p.market,
                propertyType: p.propertyType,
                totalRooms: p.totalRooms,
                regionId: p.regionId,
                regionName: regionMap[p.regionId] || p.regionId,
                address: p.address,
              })),
            },
            null,
            2,
          ),
        },
      ],
    };
  },
);

// ---------------------------------------------------------------------------
// Start server
// ---------------------------------------------------------------------------

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  // Server is now listening on stdio — it will process JSON-RPC messages
  // until the parent process closes the connection.
}

main().catch((err) => {
  console.error("Hotel Data MCP server failed to start:", err);
  process.exit(1);
});
