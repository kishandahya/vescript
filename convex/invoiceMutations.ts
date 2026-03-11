import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const approve = mutation({
  args: { invoiceId: v.id("invoices") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.invoiceId, { status: "approved" });
  },
});

export const flag = mutation({
  args: { invoiceId: v.id("invoices") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.invoiceId, { status: "flagged" });
  },
});

export const routeToRegional = mutation({
  args: { invoiceId: v.id("invoices") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.invoiceId, { status: "routed" });
  },
});

export const reject = mutation({
  args: { invoiceId: v.id("invoices") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.invoiceId, { status: "rejected" });
  },
});
