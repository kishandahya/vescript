import { query } from "./_generated/server";
import { v } from "convex/values";

export const getByMarket = query({
  args: { market: v.string() },
  handler: async (ctx, { market }) => {
    return await ctx.db
      .query("marketEvents")
      .withIndex("by_market", (q) => q.eq("market", market))
      .collect();
  },
});
