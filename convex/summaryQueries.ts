import { query } from "./_generated/server";
import { v } from "convex/values";

export const getByProperty = query({
  args: { propertyId: v.id("properties") },
  handler: async (ctx, { propertyId }) => {
    return await ctx.db
      .query("dailySummaries")
      .withIndex("by_property", (q) => q.eq("propertyId", propertyId))
      .collect();
  },
});

export const getByRegion = query({
  args: { regionId: v.string() },
  handler: async (ctx, { regionId }) => {
    const properties = await ctx.db
      .query("properties")
      .withIndex("by_region", (q) => q.eq("regionId", regionId))
      .collect();

    const summaries = [];
    for (const property of properties) {
      const propertySummaries = await ctx.db
        .query("dailySummaries")
        .withIndex("by_property", (q) => q.eq("propertyId", property._id))
        .collect();
      summaries.push(...propertySummaries);
    }

    return summaries;
  },
});
