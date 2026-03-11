import { query } from "./_generated/server";
import { v } from "convex/values";

export const getBoard = query({
  args: { propertyId: v.id("properties") },
  handler: async (ctx, { propertyId }) => {
    const rooms = await ctx.db
      .query("housekeepingRooms")
      .withIndex("by_property", (q) => q.eq("propertyId", propertyId))
      .collect();

    const attendants = await ctx.db
      .query("attendants")
      .withIndex("by_property", (q) => q.eq("propertyId", propertyId))
      .collect();

    return { rooms, attendants };
  },
});

export const getProgress = query({
  args: { propertyId: v.id("properties") },
  handler: async (ctx, { propertyId }) => {
    const rooms = await ctx.db
      .query("housekeepingRooms")
      .withIndex("by_property", (q) => q.eq("propertyId", propertyId))
      .collect();

    const total = rooms.length;
    const clean = rooms.filter((r) => r.hkStatus === "clean" || r.hkStatus === "inspected").length;
    const dirty = rooms.filter((r) => r.hkStatus === "dirty").length;
    const inProgress = rooms.filter((r) => r.hkStatus === "in-progress").length;
    const rush = rooms.filter((r) => r.hkStatus === "rush").length;

    return {
      total,
      clean,
      dirty,
      inProgress,
      rush,
      completionPct: total > 0 ? Math.round((clean / total) * 100) : 0,
    };
  },
});
