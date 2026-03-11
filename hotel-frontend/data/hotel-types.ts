// ---------------------------------------------------------------------------
// Hotel domain types – mirrors the Convex schema at convex/schema.ts
// ---------------------------------------------------------------------------

// Room statuses
export type RoomStatus =
  | "occupied"
  | "vacant-clean"
  | "vacant-dirty"
  | "ooo"
  | "due-out"
  | "due-in"
  | "inspected";

// Group stages
export type GroupStage =
  | "lead"
  | "prospect"
  | "tentative"
  | "definite"
  | "actualized"
  | "lost";

// Invoice flags
export type InvoiceFlag =
  | "over-contract"
  | "unusual-amount"
  | "missing-po"
  | "duplicate"
  | "capital-approval";

// Invoice status
export type InvoiceStatus =
  | "pending"
  | "approved"
  | "flagged"
  | "rejected"
  | "routed";

// Housekeeping status
export type HkStatus =
  | "dirty"
  | "in-progress"
  | "clean"
  | "inspected"
  | "rush";

// Reservation type
export type ReservationType = "arrival" | "departure";

// Demand impact
export type DemandImpact = "high" | "medium" | "low";

// ---------------------------------------------------------------------------
// Personas & tabs
// ---------------------------------------------------------------------------

export type HotelPersona =
  | "gm"
  | "revenue-manager"
  | "district-manager"
  | "dos"
  | "fom"
  | "executive-housekeeper"
  | "area-revenue-manager"
  | "svp-ops"
  | "vp-revenue"
  | "vp-sales"
  | "rdos";

export type HotelTab =
  | "overview"
  | "portfolio"
  | "revenue"
  | "forecast"
  | "operations"
  | "groups"
  | "invoices";

export interface PersonaConfig {
  id: HotelPersona;
  label: string;
  scope: "property" | "regional" | "corporate";
  tabs: HotelTab[];
  defaultTab: HotelTab;
}

export const PERSONA_CONFIGS: Record<HotelPersona, PersonaConfig> = {
  gm: {
    id: "gm",
    label: "General Manager",
    scope: "property",
    tabs: ["overview", "operations", "invoices", "groups"],
    defaultTab: "overview",
  },
  "revenue-manager": {
    id: "revenue-manager",
    label: "Revenue Manager",
    scope: "property",
    tabs: ["revenue", "forecast", "groups"],
    defaultTab: "revenue",
  },
  "district-manager": {
    id: "district-manager",
    label: "District Manager",
    scope: "regional",
    tabs: ["portfolio", "revenue", "operations"],
    defaultTab: "portfolio",
  },
  dos: {
    id: "dos",
    label: "Director of Sales",
    scope: "property",
    tabs: ["groups", "revenue"],
    defaultTab: "groups",
  },
  fom: {
    id: "fom",
    label: "Front Office Manager",
    scope: "property",
    tabs: ["operations"],
    defaultTab: "operations",
  },
  "executive-housekeeper": {
    id: "executive-housekeeper",
    label: "Executive Housekeeper",
    scope: "property",
    tabs: ["operations"],
    defaultTab: "operations",
  },
  "area-revenue-manager": {
    id: "area-revenue-manager",
    label: "Area Revenue Manager",
    scope: "regional",
    tabs: ["portfolio", "revenue", "forecast"],
    defaultTab: "portfolio",
  },
  "svp-ops": {
    id: "svp-ops",
    label: "SVP Operations",
    scope: "corporate",
    tabs: ["portfolio", "forecast"],
    defaultTab: "portfolio",
  },
  "vp-revenue": {
    id: "vp-revenue",
    label: "VP Revenue Management",
    scope: "corporate",
    tabs: ["portfolio", "forecast"],
    defaultTab: "portfolio",
  },
  "vp-sales": {
    id: "vp-sales",
    label: "VP Sales & Marketing",
    scope: "corporate",
    tabs: ["portfolio", "groups"],
    defaultTab: "portfolio",
  },
  rdos: {
    id: "rdos",
    label: "Regional Director of Sales",
    scope: "regional",
    tabs: ["groups", "portfolio"],
    defaultTab: "groups",
  },
};

// ---------------------------------------------------------------------------
// Entity interfaces – correspond 1-to-1 with Convex tables
// ---------------------------------------------------------------------------

export interface Property {
  _id: string;
  name: string;
  brand: string;
  market: string;
  totalRooms: number;
  propertyType: string;
  regionId: string;
  address: string;
  compSetIds: string[];
  slug: string;
}

export interface Region {
  _id: string;
  name: string;
  slug: string;
}

export interface Portfolio {
  _id: string;
  name: string;
  totalProperties: number;
  totalRooms: number;
  disclaimer: string;
}

export interface Room {
  _id: string;
  propertyId: string;
  number: string;
  floor: number;
  roomType: string;
  status: RoomStatus | string;
  guestName?: string;
  specialRequests?: string;
  isVip?: boolean;
  isConnecting?: boolean;
  lateCheckout?: boolean;
}

export interface Reservation {
  _id: string;
  propertyId: string;
  guestName: string;
  roomNumber: string;
  vipTier?: string;
  groupName?: string;
  specialRequests?: string;
  eta?: string;
  checkoutTime?: string;
  balance?: number;
  loyaltyTier?: string;
  reservationType: ReservationType | string;
}

export interface DailySummary {
  _id: string;
  propertyId: string;
  date: string;
  occupancy: number;
  adr: number;
  revpar: number;
  revenue: number;
  budgetOccupancy: number;
  budgetAdr: number;
  budgetRevpar: number;
  budgetRevenue: number;
  mtdRevenue: number;
  mtdBudget: number;
  ytdRevenue: number;
  ytdBudget: number;
}

export interface CompSetEntry {
  _id: string;
  propertyId: string;
  competitorName: string;
  adr: number;
  occupancy: number;
  revpar: number;
  indexScore: number;
}

export interface DailyRate {
  _id: string;
  propertyId: string;
  date: string;
  roomType: string;
  bar: number;
  restrictions?: string;
}

export interface ForecastDay {
  _id: string;
  propertyId: string;
  date: string;
  dayOfWeek: string;
  otbRooms: number;
  forecast: number;
  budget: number;
  priorYear: number;
  marketEvents?: string[];
}

export interface GroupOpportunity {
  _id: string;
  propertyId: string;
  name: string;
  contact: string;
  stage: GroupStage | string;
  startDate: string;
  endDate: string;
  roomNights: number;
  rate: number;
  revenueEstimate: number;
  deadline?: string;
  blockSize: number;
  pickedUp: number;
  cutoffDate?: string;
  notes?: string;
}

export interface Invoice {
  _id: string;
  propertyId: string;
  vendor: string;
  category: string;
  amount: number;
  dueDate: string;
  status: InvoiceStatus | string;
  flags: (InvoiceFlag | string)[];
  description: string;
  contractReference?: string;
}

export interface MarketEvent {
  _id: string;
  market: string;
  name: string;
  startDate: string;
  endDate: string;
  demandImpact: DemandImpact | string;
  eventType: string;
}

export interface HousekeepingRoom {
  _id: string;
  propertyId: string;
  roomNumber: string;
  floor: number;
  hkStatus: HkStatus | string;
  attendantId?: string;
  section?: number;
}

export interface Attendant {
  _id: string;
  propertyId: string;
  name: string;
  shift: string;
  sectionCapacity: number;
}

export interface NightAudit {
  _id: string;
  propertyId: string;
  date: string;
  roomRevenue: number;
  fbRevenue: number;
  otherRevenue: number;
  totalRevenue: number;
  comps: number;
  adjustments: number;
  refunds: number;
  occupiedRooms: number;
  availableRooms: number;
}

export interface GuestFeedback {
  _id: string;
  propertyId: string;
  source: string;
  rating: number;
  text: string;
  responseStatus: string;
  date: string;
  guestName?: string;
}

export interface VendorContract {
  _id: string;
  propertyId: string;
  vendorName: string;
  category: string;
  contractedRate: number;
  paymentTerms: string;
}

export interface PortfolioKpi {
  _id: string;
  regionId?: string;
  propertyId: string;
  month: string;
  occupancy: number;
  adr: number;
  revpar: number;
  revenue: number;
  laborPct: number;
  gopMargin: number;
  utilityCost: number;
}

export interface ExpenseComparison {
  _id: string;
  propertyId: string;
  category: string;
  currentAmount: number;
  priorYearAmount: number;
  budgetAmount: number;
}

export interface DemandCalendarEntry {
  _id: string;
  propertyId: string;
  date: string;
  expectedOccupancy: number;
  events?: string[];
}
