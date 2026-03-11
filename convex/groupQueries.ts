import { query } from "./_generated/server";
import { v } from "convex/values";

export const getPipeline = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("groups").collect();
  },
});

export const getById = query({
  args: { id: v.id("groups") },
  handler: async (ctx, { id }) => {
    return await ctx.db.get(id);
  },
});

export const getByProperty = query({
  args: { propertyId: v.id("properties") },
  handler: async (ctx, { propertyId }) => {
    return await ctx.db
      .query("groups")
      .withIndex("by_property", (q) => q.eq("propertyId", propertyId))
      .collect();
  },
});
