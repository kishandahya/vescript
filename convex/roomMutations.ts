import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const updateStatus = mutation({
  args: { roomId: v.id("rooms"), newStatus: v.string() },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.roomId, { status: args.newStatus });
  },
});

export const assignGuest = mutation({
  args: {
    roomId: v.id("rooms"),
    guestName: v.string(),
    specialRequests: v.optional(v.string()),
    isVip: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.roomId, {
      guestName: args.guestName,
      specialRequests: args.specialRequests,
      isVip: args.isVip,
    });
  },
});
