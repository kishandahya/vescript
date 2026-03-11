// ---------------------------------------------------------------------------
// Thin SolidJS wrapper around the Convex vanilla JS client
// ---------------------------------------------------------------------------
import { ConvexClient } from "convex/browser";
import { createSignal, createEffect, onCleanup } from "solid-js";
import type {
  FunctionReference,
  FunctionArgs,
  FunctionReturnType,
} from "convex/server";

// The URL is injected by Vite from `.env.local` (set when running `npx convex dev`).
const CONVEX_URL = import.meta.env.VITE_CONVEX_URL as string | undefined;

let client: ConvexClient | null = null;

/**
 * Lazily initialise a singleton ConvexClient.
 * Returns `null` when no VITE_CONVEX_URL is configured.
 */
export function getConvexClient(): ConvexClient | null {
  if (!CONVEX_URL) return null;
  if (!client) {
    client = new ConvexClient(CONVEX_URL);
  }
  return client;
}

// ---------------------------------------------------------------------------
// Reactive query hook
// ---------------------------------------------------------------------------

/**
 * Subscribe to a Convex query and return a reactive SolidJS accessor.
 *
 * Pass `"skip"` from the args accessor to pause the subscription (e.g. when a
 * required parameter isn't available yet).
 *
 * ```ts
 * const rooms = useConvexQuery(api.roomQueries.getByProperty, () =>
 *   propertyId() ? { propertyId: propertyId()! } : "skip"
 * );
 * ```
 */
export function useConvexQuery<Query extends FunctionReference<"query">>(
  query: Query,
  args: () => FunctionArgs<Query> | "skip",
): () => FunctionReturnType<Query> | undefined {
  const [data, setData] = createSignal<FunctionReturnType<Query>>();

  createEffect(() => {
    const currentArgs = args();
    if (currentArgs === "skip") return;

    const c = getConvexClient();
    if (!c) return;

    const unsubscribe = c.onUpdate(
      query,
      currentArgs,
      (result: FunctionReturnType<Query>) => {
        setData(() => result as any);
      },
    );

    onCleanup(() => unsubscribe());
  });

  return data as () => FunctionReturnType<Query> | undefined;
}

// ---------------------------------------------------------------------------
// Mutation wrapper
// ---------------------------------------------------------------------------

/**
 * Returns an async function that invokes a Convex mutation.
 *
 * ```ts
 * const approve = useConvexMutation(api.invoiceMutations.approve);
 * await approve({ invoiceId });
 * ```
 */
export function useConvexMutation<
  Mutation extends FunctionReference<"mutation">,
>(
  mutation: Mutation,
): (args: FunctionArgs<Mutation>) => Promise<FunctionReturnType<Mutation>> {
  return async (args) => {
    const c = getConvexClient();
    if (!c) throw new Error("Convex client not initialized – is VITE_CONVEX_URL set?");
    return c.mutation(mutation, args);
  };
}
