import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const updateBar = mutation({
  args: { rateId: v.id("dailyRates"), newBar: v.number() },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.rateId, { bar: args.newBar });
  },
});
