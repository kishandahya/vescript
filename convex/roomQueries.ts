import { query } from "./_generated/server";
import { v } from "convex/values";

export const getByProperty = query({
  args: { propertyId: v.id("properties") },
  handler: async (ctx, { propertyId }) => {
    return await ctx.db
      .query("rooms")
      .withIndex("by_property", (q) => q.eq("propertyId", propertyId))
      .collect();
  },
});

export const getRoomStats = query({
  args: { propertyId: v.id("properties") },
  handler: async (ctx, { propertyId }) => {
    const rooms = await ctx.db
      .query("rooms")
      .withIndex("by_property", (q) => q.eq("propertyId", propertyId))
      .collect();

    const stats: Record<string, number> = {
      occupied: 0,
      "vacant-clean": 0,
      "vacant-dirty": 0,
      ooo: 0,
      "due-out": 0,
      "due-in": 0,
      inspected: 0,
      total: rooms.length,
    };

    for (const room of rooms) {
      if (stats[room.status] !== undefined) {
        stats[room.status]++;
      }
    }

    return stats;
  },
});
