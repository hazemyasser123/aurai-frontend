import { useQuery } from "@tanstack/react-query";
import { batchApi } from "@/shared/queries/batches/batchApi";
import { batchKeys } from "@/shared/queries/batches/batchQueries";

export const useBatchAccounts = (batchId: string) => {
  return useQuery({
    queryKey: batchKeys.accounts(batchId),
    queryFn: () => batchApi.getBatchAccounts(batchId),
    enabled: !!batchId,
  });
};
