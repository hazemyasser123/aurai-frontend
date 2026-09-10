import { useMutation, useQueryClient } from "@tanstack/react-query";
import { batchApi } from "@/shared/queries/batches/batchApi";
import { batchKeys } from "@/shared/queries/batches/batchQueries";
import type { AddBatchAccountPayload, Account } from "@/features/batches/types/batchTypes";
import { filterNewAccounts } from "@/features/batches/hooks/useFetchMoreAccounts";

export const useAddBatchAccount = (batchId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: AddBatchAccountPayload) =>
      batchApi.addBatchAccount(batchId, payload),
    onSuccess: (newAccounts) => {
      // Append only genuinely-new accounts — the add response already contains
      // them, so no GET /batches/{id}/accounts refetch is needed
      queryClient.setQueryData<Account[]>(
        batchKeys.accounts(batchId),
        (oldData) => [...(oldData || []), ...filterNewAccounts(newAccounts, oldData)]
      );
    },
  });
};
