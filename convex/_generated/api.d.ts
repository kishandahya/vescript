/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as compSetQueries from "../compSetQueries.js";
import type * as connectorMutations from "../connectorMutations.js";
import type * as forecastQueries from "../forecastQueries.js";
import type * as groupMutations from "../groupMutations.js";
import type * as groupQueries from "../groupQueries.js";
import type * as housekeepingMutations from "../housekeepingMutations.js";
import type * as housekeepingQueries from "../housekeepingQueries.js";
import type * as invoiceMutations from "../invoiceMutations.js";
import type * as invoiceQueries from "../invoiceQueries.js";
import type * as marketEventQueries from "../marketEventQueries.js";
import type * as portfolioQueries from "../portfolioQueries.js";
import type * as properties from "../properties.js";
import type * as rateMutations from "../rateMutations.js";
import type * as rateQueries from "../rateQueries.js";
import type * as reservationQueries from "../reservationQueries.js";
import type * as roomMutations from "../roomMutations.js";
import type * as roomQueries from "../roomQueries.js";
import type * as seed from "../seed.js";
import type * as seedFinancial from "../seedFinancial.js";
import type * as seedRooms from "../seedRooms.js";
import type * as summaryQueries from "../summaryQueries.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  compSetQueries: typeof compSetQueries;
  connectorMutations: typeof connectorMutations;
  forecastQueries: typeof forecastQueries;
  groupMutations: typeof groupMutations;
  groupQueries: typeof groupQueries;
  housekeepingMutations: typeof housekeepingMutations;
  housekeepingQueries: typeof housekeepingQueries;
  invoiceMutations: typeof invoiceMutations;
  invoiceQueries: typeof invoiceQueries;
  marketEventQueries: typeof marketEventQueries;
  portfolioQueries: typeof portfolioQueries;
  properties: typeof properties;
  rateMutations: typeof rateMutations;
  rateQueries: typeof rateQueries;
  reservationQueries: typeof reservationQueries;
  roomMutations: typeof roomMutations;
  roomQueries: typeof roomQueries;
  seed: typeof seed;
  seedFinancial: typeof seedFinancial;
  seedRooms: typeof seedRooms;
  summaryQueries: typeof summaryQueries;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
