import { query } from "./_generated/server";
import { v } from "convex/values";

export const getByProperty = query({
  args: { propertyId: v.id("properties") },
  handler: async (ctx, { propertyId }) => {
    return await ctx.db
      .query("forecasts")
      .withIndex("by_property", (q) => q.eq("propertyId", propertyId))
      .collect();
  },
});
