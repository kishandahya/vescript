import { query } from "./_generated/server";
import { v } from "convex/values";

export const getAll = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("properties").collect();
  },
});

export const getById = query({
  args: { slug: v.string() },
  handler: async (ctx, { slug }) => {
    return await ctx.db
      .query("properties")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .first();
  },
});

export const getByRegion = query({
  args: { regionId: v.string() },
  handler: async (ctx, { regionId }) => {
    return await ctx.db
      .query("properties")
      .withIndex("by_region", (q) => q.eq("regionId", regionId))
      .collect();
  },
});
