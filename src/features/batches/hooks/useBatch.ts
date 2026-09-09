import { useQuery } from "@tanstack/react-query";
import { batchApi } from "@/shared/queries/batches/batchApi";
import { batchKeys } from "@/shared/queries/batches/batchQueries";

interface UseBatchOptions {
  /** Serve the cached batch without refetching on mount (used for backward flow navigation) */
  skipRefetchOnMount?: boolean;
}

export const useBatch = (batchId: string, options?: UseBatchOptions) => {
  return useQuery({
    queryKey: batchKeys.detail(batchId),
    queryFn: () => batchApi.getBatch(batchId),
    enabled: !!batchId,
    // Fresh cached data satisfies status guards on backward navigation.
    // Explicit invalidations (find accounts, update batch, ...) still refetch active queries.
    staleTime: options?.skipRefetchOnMount ? Infinity : 0,
  });
};
