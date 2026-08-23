import { useQuery } from "@tanstack/react-query";
import { batchApi } from "@/shared/queries/batches/batchApi";

export const useBatchOutreach = (batchId: string) => {
  return useQuery({
    queryKey: ["batches", batchId, "outreach"],
    queryFn: () => batchApi.getBatchOutreach(batchId),
    enabled: !!batchId,
  });
};
