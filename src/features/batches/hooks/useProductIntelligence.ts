import { useQuery } from "@tanstack/react-query";
import { batchApi } from "@/shared/queries/batches/batchApi";

/**
 * Fetches the product's own Product Intelligence and ICP for the accounts flow —
 * these are sent (instead of the batch's stored copies) in find-accounts, fetch-more
 * and enrich payloads. Falls back gracefully per-field if the product has neither.
 */
export const useProductIntelligence = (baseProductId?: string) => {
  return useQuery({
    queryKey: ["product", baseProductId, "intelligence"],
    queryFn: () => batchApi.getProductIntelligence(baseProductId as string),
    enabled: !!baseProductId,
    retry: false,
    // Fetch once per product — never refetch on navigation/remount. The products
    // feature invalidates this key when the analysis/ICP is edited.
    staleTime: Infinity,
    gcTime: 30 * 60_000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
};
