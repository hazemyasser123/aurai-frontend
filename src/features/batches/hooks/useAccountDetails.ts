import { useQuery } from "@tanstack/react-query";
import { batchApi } from "@/shared/queries/batches/batchApi";

export const useAccountDetails = (accountId: string, batchId?: string) => {
  return useQuery({
    queryKey: ["account", accountId, batchId],
    queryFn: () => batchApi.getAccountDetails(accountId, batchId),
    enabled: !!accountId,
  });
};
