import { query } from "./_generated/server";
import { v } from "convex/values";

export const getPortfolio = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("portfolio").first();
  },
});

export const getRegions = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("regions").collect();
  },
});

export const getRegionKpis = query({
  args: { regionId: v.optional(v.string()) },
  handler: async (ctx, { regionId }) => {
    if (regionId) {
      return await ctx.db
        .query("portfolioKpis")
        .withIndex("by_region", (q) => q.eq("regionId", regionId))
        .collect();
    }
    return await ctx.db.query("portfolioKpis").collect();
  },
});
