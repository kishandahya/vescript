import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const updateRoomStatus = mutation({
  args: {
    housekeepingRoomId: v.id("housekeepingRooms"),
    newHkStatus: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.housekeepingRoomId, {
      hkStatus: args.newHkStatus,
    });
  },
});

export const markRush = mutation({
  args: { housekeepingRoomId: v.id("housekeepingRooms") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.housekeepingRoomId, { hkStatus: "rush" });
  },
});

export const assignAttendant = mutation({
  args: {
    housekeepingRoomId: v.id("housekeepingRooms"),
    attendantId: v.string(),
    section: v.number(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.housekeepingRoomId, {
      attendantId: args.attendantId,
      section: args.section,
    });
  },
});
