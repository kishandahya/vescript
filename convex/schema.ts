import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  properties: defineTable({
    name: v.string(),
    brand: v.string(),
    market: v.string(),
    totalRooms: v.number(),
    propertyType: v.string(),
    regionId: v.string(),
    address: v.string(),
    compSetIds: v.array(v.string()),
    slug: v.string(),
  }).index("by_slug", ["slug"])
    .index("by_region", ["regionId"]),

  regions: defineTable({
    name: v.string(),
    slug: v.string(),
  }).index("by_slug", ["slug"]),

  portfolio: defineTable({
    name: v.string(),
    totalProperties: v.number(),
    totalRooms: v.number(),
    disclaimer: v.string(),
  }),

  rooms: defineTable({
    propertyId: v.id("properties"),
    number: v.string(),
    floor: v.number(),
    roomType: v.string(),
    status: v.string(),
    guestName: v.optional(v.string()),
    specialRequests: v.optional(v.string()),
    isVip: v.optional(v.boolean()),
    isConnecting: v.optional(v.boolean()),
    lateCheckout: v.optional(v.boolean()),
  }).index("by_property", ["propertyId"]),

  reservations: defineTable({
    propertyId: v.id("properties"),
    guestName: v.string(),
    roomNumber: v.string(),
    vipTier: v.optional(v.string()),
    groupName: v.optional(v.string()),
    specialRequests: v.optional(v.string()),
    eta: v.optional(v.string()),
    checkoutTime: v.optional(v.string()),
    balance: v.optional(v.number()),
    loyaltyTier: v.optional(v.string()),
    reservationType: v.string(),
  }).index("by_property", ["propertyId"])
    .index("by_property_type", ["propertyId", "reservationType"]),

  dailySummaries: defineTable({
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
  }).index("by_property", ["propertyId"])
    .index("by_property_date", ["propertyId", "date"]),

  compSets: defineTable({
    propertyId: v.id("properties"),
    competitorName: v.string(),
    adr: v.number(),
    occupancy: v.number(),
    revpar: v.number(),
    indexScore: v.number(),
  }).index("by_property", ["propertyId"]),

  dailyRates: defineTable({
    propertyId: v.id("properties"),
    date: v.string(),
    roomType: v.string(),
    bar: v.number(),
    restrictions: v.optional(v.string()),
  }).index("by_property", ["propertyId"])
    .index("by_property_date", ["propertyId", "date"]),

  forecasts: defineTable({
    propertyId: v.id("properties"),
    date: v.string(),
    dayOfWeek: v.string(),
    otbRooms: v.number(),
    forecast: v.number(),
    budget: v.number(),
    priorYear: v.number(),
    marketEvents: v.optional(v.array(v.string())),
  }).index("by_property", ["propertyId"]),

  groups: defineTable({
    propertyId: v.id("properties"),
    name: v.string(),
    contact: v.string(),
    stage: v.string(),
    startDate: v.string(),
    endDate: v.string(),
    roomNights: v.number(),
    rate: v.number(),
    revenueEstimate: v.number(),
    deadline: v.optional(v.string()),
    blockSize: v.number(),
    pickedUp: v.number(),
    cutoffDate: v.optional(v.string()),
    notes: v.optional(v.string()),
  }).index("by_property", ["propertyId"]),

  invoices: defineTable({
    propertyId: v.id("properties"),
    vendor: v.string(),
    category: v.string(),
    amount: v.number(),
    dueDate: v.string(),
    status: v.string(),
    flags: v.array(v.string()),
    description: v.string(),
    contractReference: v.optional(v.string()),
  }).index("by_property", ["propertyId"])
    .index("by_status", ["status"]),

  marketEvents: defineTable({
    market: v.string(),
    name: v.string(),
    startDate: v.string(),
    endDate: v.string(),
    demandImpact: v.string(),
    eventType: v.string(),
  }).index("by_market", ["market"]),

  housekeepingRooms: defineTable({
    propertyId: v.id("properties"),
    roomNumber: v.string(),
    floor: v.number(),
    hkStatus: v.string(),
    attendantId: v.optional(v.string()),
    section: v.optional(v.number()),
  }).index("by_property", ["propertyId"]),

  attendants: defineTable({
    propertyId: v.id("properties"),
    name: v.string(),
    shift: v.string(),
    sectionCapacity: v.number(),
  }).index("by_property", ["propertyId"]),

  nightAudits: defineTable({
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
  }).index("by_property", ["propertyId"])
    .index("by_property_date", ["propertyId", "date"]),

  guestFeedback: defineTable({
    propertyId: v.id("properties"),
    source: v.string(),
    rating: v.number(),
    text: v.string(),
    responseStatus: v.string(),
    date: v.string(),
    guestName: v.optional(v.string()),
  }).index("by_property", ["propertyId"]),

  vendorContracts: defineTable({
    propertyId: v.id("properties"),
    vendorName: v.string(),
    category: v.string(),
    contractedRate: v.number(),
    paymentTerms: v.string(),
  }).index("by_property", ["propertyId"]),

  portfolioKpis: defineTable({
    regionId: v.optional(v.string()),
    propertyId: v.id("properties"),
    month: v.string(),
    occupancy: v.number(),
    adr: v.number(),
    revpar: v.number(),
    revenue: v.number(),
    laborPct: v.number(),
    gopMargin: v.number(),
    utilityCost: v.number(),
  }).index("by_property", ["propertyId"])
    .index("by_region", ["regionId"]),

  expenseComparisons: defineTable({
    propertyId: v.id("properties"),
    category: v.string(),
    currentAmount: v.number(),
    priorYearAmount: v.number(),
    budgetAmount: v.number(),
  }).index("by_property", ["propertyId"]),

  demandCalendar: defineTable({
    propertyId: v.id("properties"),
    date: v.string(),
    expectedOccupancy: v.number(),
    events: v.optional(v.array(v.string())),
  }).index("by_property", ["propertyId"])
    .index("by_property_date", ["propertyId", "date"]),
});
