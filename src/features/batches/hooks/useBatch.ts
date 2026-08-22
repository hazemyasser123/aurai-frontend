import { useQuery } from "@tanstack/react-query";
import { batchApi } from "@/shared/queries/batches/batchApi";
import { batchKeys } from "@/shared/queries/batches/batchQueries";

export const useBatch = (batchId: string) => {
  return useQuery({
    queryKey: batchKeys.detail(batchId),
    queryFn: () => batchApi.getBatch(batchId),
    enabled: !!batchId,
  });
};
