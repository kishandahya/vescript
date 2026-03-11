import { query } from "./_generated/server";
import { v } from "convex/values";

export const getArrivals = query({
  args: { propertyId: v.id("properties") },
  handler: async (ctx, { propertyId }) => {
    return await ctx.db
      .query("reservations")
      .withIndex("by_property_type", (q) =>
        q.eq("propertyId", propertyId).eq("reservationType", "arrival"),
      )
      .collect();
  },
});

export const getDepartures = query({
  args: { propertyId: v.id("properties") },
  handler: async (ctx, { propertyId }) => {
    return await ctx.db
      .query("reservations")
      .withIndex("by_property_type", (q) =>
        q.eq("propertyId", propertyId).eq("reservationType", "departure"),
      )
      .collect();
  },
});

export const getVips = query({
  args: { propertyId: v.id("properties") },
  handler: async (ctx, { propertyId }) => {
    const reservations = await ctx.db
      .query("reservations")
      .withIndex("by_property", (q) => q.eq("propertyId", propertyId))
      .collect();

    return reservations.filter((r) => r.vipTier !== undefined && r.vipTier !== null);
  },
});
