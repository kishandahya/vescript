import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const updateStage = mutation({
  args: { groupId: v.id("groups"), newStage: v.string() },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.groupId, { stage: args.newStage });
  },
});

export const updatePickup = mutation({
  args: { groupId: v.id("groups"), pickedUp: v.number() },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.groupId, { pickedUp: args.pickedUp });
  },
});
