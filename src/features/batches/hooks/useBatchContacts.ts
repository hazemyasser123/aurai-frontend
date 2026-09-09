import { useQuery } from "@tanstack/react-query";
import { batchApi } from "@/shared/queries/batches/batchApi";

export const useBatchContacts = (batchId: string) => {
  return useQuery({
    queryKey: ["batches", "detail", batchId, "all-contacts"],
    queryFn: () => batchApi.getBatchContacts(batchId),
    enabled: !!batchId,
    // Flow data changes through explicit actions, which invalidate it —
    // no refetch on remount within the stale window or on window focus
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });
};
