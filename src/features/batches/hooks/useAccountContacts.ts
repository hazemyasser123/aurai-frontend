import { useQuery } from "@tanstack/react-query";
import { batchApi } from "@/shared/queries/batches/batchApi";

export const useAccountContacts = (accountId: string, batchId?: string) => {
  return useQuery({
    queryKey: ["account", accountId, batchId, "contacts"],
    queryFn: () => batchApi.getAccountContacts(accountId, batchId),
    enabled: !!accountId,
  });
};
