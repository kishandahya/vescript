import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const upsertReservation = mutation({
  args: {
    propertyId: v.id("properties"),
    guestName: v.string(),
    roomNumber: v.string(),
    reservationType: v.string(),
    vipTier: v.optional(v.string()),
    groupName: v.optional(v.string()),
    specialRequests: v.optional(v.string()),
    eta: v.optional(v.string()),
    checkoutTime: v.optional(v.string()),
    balance: v.optional(v.number()),
    loyaltyTier: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("reservations")
      .withIndex("by_property", (q) => q.eq("propertyId", args.propertyId))
      .collect();
    const match = existing.find(
      (r) =>
        r.guestName === args.guestName &&
        r.roomNumber === args.roomNumber &&
        r.reservationType === args.reservationType,
    );
    if (match) {
      await ctx.db.patch(match._id, args);
    } else {
      await ctx.db.insert("reservations", args);
    }
  },
});

export const upsertRoom = mutation({
  args: {
    propertyId: v.id("properties"),
    number: v.string(),
    floor: v.number(),
    roomType: v.string(),
    status: v.string(),
    guestName: v.optional(v.string()),
    isVip: v.optional(v.boolean()),
    lateCheckout: v.optional(v.boolean()),
    specialRequests: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("rooms")
      .withIndex("by_property", (q) => q.eq("propertyId", args.propertyId))
      .collect();
    const match = existing.find((r) => r.number === args.number);
    if (match) {
      await ctx.db.patch(match._id, args);
    } else {
      await ctx.db.insert("rooms", args);
    }
  },
});

export const upsertHousekeepingRoom = mutation({
  args: {
    propertyId: v.id("properties"),
    roomNumber: v.string(),
    floor: v.number(),
    hkStatus: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("housekeepingRooms")
      .withIndex("by_property", (q) => q.eq("propertyId", args.propertyId))
      .collect();
    const match = existing.find((r) => r.roomNumber === args.roomNumber);
    if (match) {
      await ctx.db.patch(match._id, args);
    } else {
      await ctx.db.insert("housekeepingRooms", args);
    }
  },
});

export const upsertNightAudit = mutation({
  args: {
    propertyId: v.id("properties"),
    date: v.string(),
    roomRevenue: v.number(),
    fbRevenue: v.number(),
    otherRevenue: v.number(),
    totalRevenue: v.number(),
    comps: v.number(),
    adjustments: v.number(),
    refunds: v.number(),
    occupiedRooms: v.number(),
    availableRooms: v.number(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("nightAudits")
      .withIndex("by_property_date", (q) =>
        q.eq("propertyId", args.propertyId).eq("date", args.date),
      )
      .first();
    if (existing) {
      await ctx.db.patch(existing._id, args);
    } else {
      await ctx.db.insert("nightAudits", args);
    }
  },
});

export const upsertDailySummary = mutation({
  args: {
    propertyId: v.id("properties"),
    date: v.string(),
    occupancy: v.number(),
    adr: v.number(),
    revpar: v.number(),
    revenue: v.number(),
    budgetOccupancy: v.number(),
    budgetAdr: v.number(),
    budgetRevpar: v.number(),
    budgetRevenue: v.number(),
    mtdRevenue: v.number(),
    mtdBudget: v.number(),
    ytdRevenue: v.number(),
    ytdBudget: v.number(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("dailySummaries")
      .withIndex("by_property_date", (q) =>
        q.eq("propertyId", args.propertyId).eq("date", args.date),
      )
      .first();
    if (existing) {
      await ctx.db.patch(existing._id, args);
    } else {
      await ctx.db.insert("dailySummaries", args);
    }
  },
});

export const upsertDailyRate = mutation({
  args: {
    propertyId: v.id("properties"),
    date: v.string(),
    roomType: v.string(),
    bar: v.number(),
    restrictions: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("dailyRates")
      .withIndex("by_property_date", (q) =>
        q.eq("propertyId", args.propertyId).eq("date", args.date),
      )
      .collect();
    const match = existing.find((r) => r.roomType === args.roomType);
    if (match) {
      await ctx.db.patch(match._id, args);
    } else {
      await ctx.db.insert("dailyRates", args);
    }
  },
});

export const upsertCompSet = mutation({
  args: {
    propertyId: v.id("properties"),
    competitorName: v.string(),
    adr: v.number(),
    occupancy: v.number(),
    revpar: v.number(),
    indexScore: v.number(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("compSets")
      .withIndex("by_property", (q) => q.eq("propertyId", args.propertyId))
      .collect();
    const match = existing.find(
      (r) => r.competitorName === args.competitorName,
    );
    if (match) {
      await ctx.db.patch(match._id, args);
    } else {
      await ctx.db.insert("compSets", args);
    }
  },
});

export const upsertForecast = mutation({
  args: {
    propertyId: v.id("properties"),
    date: v.string(),
    dayOfWeek: v.string(),
    otbRooms: v.number(),
    forecast: v.number(),
    budget: v.number(),
    priorYear: v.number(),
    marketEvents: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("forecasts")
      .withIndex("by_property", (q) => q.eq("propertyId", args.propertyId))
      .collect();
    const match = existing.find((r) => r.date === args.date);
    if (match) {
      await ctx.db.patch(match._id, args);
    } else {
      await ctx.db.insert("forecasts", args);
    }
  },
});

export const upsertDemandCalendar = mutation({
  args: {
    propertyId: v.id("properties"),
    date: v.string(),
    expectedOccupancy: v.number(),
    events: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("demandCalendar")
      .withIndex("by_property_date", (q) =>
        q.eq("propertyId", args.propertyId).eq("date", args.date),
      )
      .first();
    if (existing) {
      await ctx.db.patch(existing._id, args);
    } else {
      await ctx.db.insert("demandCalendar", args);
    }
  },
});

export const upsertMarketEvent = mutation({
  args: {
    market: v.string(),
    name: v.string(),
    startDate: v.string(),
    endDate: v.string(),
    demandImpact: v.string(),
    eventType: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("marketEvents")
      .withIndex("by_market", (q) => q.eq("market", args.market))
      .collect();
    const match = existing.find((r) => r.name === args.name);
    if (match) {
      await ctx.db.patch(match._id, args);
    } else {
      await ctx.db.insert("marketEvents", args);
    }
  },
});
