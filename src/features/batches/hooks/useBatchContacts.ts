import { useQuery } from "@tanstack/react-query";
import { batchApi } from "@/shared/queries/batches/batchApi";

export const useBatchContacts = (batchId: string) => {
  return useQuery({
    queryKey: ["batches", "detail", batchId, "all-contacts"],
    queryFn: () => batchApi.getBatchContacts(batchId),
    enabled: !!batchId,
  });
};
