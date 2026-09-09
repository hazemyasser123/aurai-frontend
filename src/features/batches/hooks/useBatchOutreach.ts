import { useQuery } from "@tanstack/react-query";
import { batchApi } from "@/shared/queries/batches/batchApi";
import { batchKeys } from "@/shared/queries/batches/batchQueries";

export const useBatchOutreach = (batchId: string) => {
  return useQuery({
    queryKey: batchKeys.outreach(batchId),
    queryFn: () => batchApi.getBatchOutreach(batchId),
    enabled: !!batchId,
    // Flow data changes through explicit actions (draft/send), which invalidate it —
    // no refetch on remount within the stale window or on window focus
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });
};
