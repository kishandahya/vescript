import { query } from "./_generated/server";
import { v } from "convex/values";

export const getByProperty = query({
  args: { propertyId: v.id("properties") },
  handler: async (ctx, { propertyId }) => {
    return await ctx.db
      .query("invoices")
      .withIndex("by_property", (q) => q.eq("propertyId", propertyId))
      .collect();
  },
});

export const getPending = query({
  args: { propertyId: v.optional(v.id("properties")) },
  handler: async (ctx, { propertyId }) => {
    if (propertyId) {
      const invoices = await ctx.db
        .query("invoices")
        .withIndex("by_property", (q) => q.eq("propertyId", propertyId))
        .collect();
      return invoices.filter((inv) => inv.status === "pending");
    }
    return await ctx.db
      .query("invoices")
      .withIndex("by_status", (q) => q.eq("status", "pending"))
      .collect();
  },
});

export const getByFlags = query({
  args: { flag: v.string() },
  handler: async (ctx, { flag }) => {
    const allInvoices = await ctx.db.query("invoices").collect();
    return allInvoices.filter((inv) => inv.flags.includes(flag));
  },
});
