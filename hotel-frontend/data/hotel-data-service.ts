// ---------------------------------------------------------------------------
// Convenience hooks wrapping Convex queries / mutations for the hotel module.
//
// NOTE: The `api` import references auto-generated code produced by
// `npx convex dev`. Until that command has been run at least once the import
// will be unresolved and TypeScript will report an error – this is expected.
// ---------------------------------------------------------------------------
import { useConvexQuery, useConvexMutation } from "./convex-client";
// @ts-ignore – generated file may not exist yet
import { api } from "../../convex/_generated/api";

// ---------------------------------------------------------------------------
// Property queries  (convex/properties.ts)
// ---------------------------------------------------------------------------

/** All properties. */
export const useProperties = () =>
  useConvexQuery(api.properties.getAll, () => ({}));

/** Single property by slug. Pass `null` to skip. */
export const useProperty = (slug: () => string | null) =>
  useConvexQuery(api.properties.getById, () => {
    const s = slug();
    return s ? { slug: s } : "skip";
  });

/** Properties within a region. */
export const usePropertiesByRegion = (regionId: () => string | null) =>
  useConvexQuery(api.properties.getByRegion, () => {
    const r = regionId();
    return r ? { regionId: r } : "skip";
  });

// ---------------------------------------------------------------------------
// Room queries  (convex/roomQueries.ts)
// ---------------------------------------------------------------------------

export const useRooms = (propertyId: () => string | null) =>
  useConvexQuery(api.roomQueries.getByProperty, () => {
    const id = propertyId();
    return id ? { propertyId: id } : "skip";
  });

export const useRoomStats = (propertyId: () => string | null) =>
  useConvexQuery(api.roomQueries.getRoomStats, () => {
    const id = propertyId();
    return id ? { propertyId: id } : "skip";
  });

// ---------------------------------------------------------------------------
// Room mutations  (convex/roomMutations.ts)
// ---------------------------------------------------------------------------

export const useUpdateRoomStatus = () =>
  useConvexMutation(api.roomMutations.updateStatus);

export const useAssignGuest = () =>
  useConvexMutation(api.roomMutations.assignGuest);

// ---------------------------------------------------------------------------
// Reservation queries  (convex/reservationQueries.ts)
// ---------------------------------------------------------------------------

export const useArrivals = (propertyId: () => string | null) =>
  useConvexQuery(api.reservationQueries.getArrivals, () => {
    const id = propertyId();
    return id ? { propertyId: id } : "skip";
  });

export const useDepartures = (propertyId: () => string | null) =>
  useConvexQuery(api.reservationQueries.getDepartures, () => {
    const id = propertyId();
    return id ? { propertyId: id } : "skip";
  });

export const useVips = (propertyId: () => string | null) =>
  useConvexQuery(api.reservationQueries.getVips, () => {
    const id = propertyId();
    return id ? { propertyId: id } : "skip";
  });

// ---------------------------------------------------------------------------
// Daily summary queries  (convex/summaryQueries.ts)
// ---------------------------------------------------------------------------

export const useDailySummaries = (propertyId: () => string | null) =>
  useConvexQuery(api.summaryQueries.getByProperty, () => {
    const id = propertyId();
    return id ? { propertyId: id } : "skip";
  });

export const useRegionSummaries = (regionId: () => string | null) =>
  useConvexQuery(api.summaryQueries.getByRegion, () => {
    const r = regionId();
    return r ? { regionId: r } : "skip";
  });

/** Latest daily summary for every property (portfolio view). */
export const useAllLatestSummaries = () =>
  useConvexQuery(api.summaryQueries.getAllLatest, () => ({}));

// ---------------------------------------------------------------------------
// Comp set queries  (convex/compSetQueries.ts)
// ---------------------------------------------------------------------------

export const useCompSet = (propertyId: () => string | null) =>
  useConvexQuery(api.compSetQueries.getByProperty, () => {
    const id = propertyId();
    return id ? { propertyId: id } : "skip";
  });

// ---------------------------------------------------------------------------
// Daily rate queries  (convex/rateQueries.ts)
// ---------------------------------------------------------------------------

export const useDailyRates = (propertyId: () => string | null) =>
  useConvexQuery(api.rateQueries.getByProperty, () => {
    const id = propertyId();
    return id ? { propertyId: id } : "skip";
  });

// ---------------------------------------------------------------------------
// Rate mutations  (convex/rateMutations.ts)
// ---------------------------------------------------------------------------

export const useUpdateBar = () =>
  useConvexMutation(api.rateMutations.updateBar);

// ---------------------------------------------------------------------------
// Forecast queries  (convex/forecastQueries.ts)
// ---------------------------------------------------------------------------

export const useForecasts = (propertyId: () => string | null) =>
  useConvexQuery(api.forecastQueries.getByProperty, () => {
    const id = propertyId();
    return id ? { propertyId: id } : "skip";
  });

// ---------------------------------------------------------------------------
// Group queries  (convex/groupQueries.ts)
// ---------------------------------------------------------------------------

export const useGroupPipeline = () =>
  useConvexQuery(api.groupQueries.getPipeline, () => ({}));

export const useGroup = (groupId: () => string | null) =>
  useConvexQuery(api.groupQueries.getById, () => {
    const id = groupId();
    return id ? { id } : "skip";
  });

export const useGroupsByProperty = (propertyId: () => string | null) =>
  useConvexQuery(api.groupQueries.getByProperty, () => {
    const id = propertyId();
    return id ? { propertyId: id } : "skip";
  });

// ---------------------------------------------------------------------------
// Group mutations  (convex/groupMutations.ts)
// ---------------------------------------------------------------------------

export const useUpdateGroupStage = () =>
  useConvexMutation(api.groupMutations.updateStage);

export const useUpdateGroupPickup = () =>
  useConvexMutation(api.groupMutations.updatePickup);

// ---------------------------------------------------------------------------
// Invoice queries  (convex/invoiceQueries.ts)
// ---------------------------------------------------------------------------

export const useInvoicesByProperty = (propertyId: () => string | null) =>
  useConvexQuery(api.invoiceQueries.getByProperty, () => {
    const id = propertyId();
    return id ? { propertyId: id } : "skip";
  });

export const usePendingInvoices = (propertyId: () => string | null) =>
  useConvexQuery(api.invoiceQueries.getPending, () => {
    const id = propertyId();
    // getPending allows optional propertyId
    return id ? { propertyId: id } : ({} as any);
  });

export const useInvoicesByFlag = (flag: () => string | null) =>
  useConvexQuery(api.invoiceQueries.getByFlags, () => {
    const f = flag();
    return f ? { flag: f } : "skip";
  });

// ---------------------------------------------------------------------------
// Invoice mutations  (convex/invoiceMutations.ts)
// ---------------------------------------------------------------------------

export const useApproveInvoice = () =>
  useConvexMutation(api.invoiceMutations.approve);

export const useFlagInvoice = () =>
  useConvexMutation(api.invoiceMutations.flag);

export const useRouteInvoiceToRegional = () =>
  useConvexMutation(api.invoiceMutations.routeToRegional);

export const useRejectInvoice = () =>
  useConvexMutation(api.invoiceMutations.reject);

// ---------------------------------------------------------------------------
// Market event queries  (convex/marketEventQueries.ts)
// ---------------------------------------------------------------------------

export const useMarketEvents = (market: () => string | null) =>
  useConvexQuery(api.marketEventQueries.getByMarket, () => {
    const m = market();
    return m ? { market: m } : "skip";
  });

// ---------------------------------------------------------------------------
// Housekeeping queries  (convex/housekeepingQueries.ts)
// ---------------------------------------------------------------------------

export const useHousekeepingBoard = (propertyId: () => string | null) =>
  useConvexQuery(api.housekeepingQueries.getBoard, () => {
    const id = propertyId();
    return id ? { propertyId: id } : "skip";
  });

export const useHousekeepingProgress = (propertyId: () => string | null) =>
  useConvexQuery(api.housekeepingQueries.getProgress, () => {
    const id = propertyId();
    return id ? { propertyId: id } : "skip";
  });

// ---------------------------------------------------------------------------
// Housekeeping mutations  (convex/housekeepingMutations.ts)
// ---------------------------------------------------------------------------

export const useUpdateHkRoomStatus = () =>
  useConvexMutation(api.housekeepingMutations.updateRoomStatus);

export const useMarkRush = () =>
  useConvexMutation(api.housekeepingMutations.markRush);

export const useAssignAttendant = () =>
  useConvexMutation(api.housekeepingMutations.assignAttendant);

// ---------------------------------------------------------------------------
// Portfolio queries  (convex/portfolioQueries.ts)
// ---------------------------------------------------------------------------

export const usePortfolio = () =>
  useConvexQuery(api.portfolioQueries.getPortfolio, () => ({}));

export const useRegions = () =>
  useConvexQuery(api.portfolioQueries.getRegions, () => ({}));

export const useRegionKpis = (regionId: () => string | null) =>
  useConvexQuery(api.portfolioQueries.getRegionKpis, () => {
    const r = regionId();
    // getRegionKpis allows optional regionId – pass empty object for all
    return r ? { regionId: r } : ({} as any);
  });
