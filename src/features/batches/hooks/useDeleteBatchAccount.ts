import { useMutation, useQueryClient } from "@tanstack/react-query";
import { batchApi } from "@/shared/queries/batches/batchApi";
import { batchKeys } from "@/shared/queries/batches/batchQueries";
import type { Account } from "@/features/batches/types/batchTypes";

export const useDeleteBatchAccount = (batchId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (accountId: string) =>
      batchApi.deleteBatchAccount(batchId, accountId),
    onSuccess: (_data, accountId) => {
      // The DELETE response already confirms success — remove the account from the
      // accounts cache directly, no GET /batches/{id}/accounts refetch needed
      queryClient.setQueryData<Account[]>(
        batchKeys.accounts(batchId),
        (oldData) => (oldData ? oldData.filter((a) => a.id !== accountId) : oldData)
      );
    },
  });
};
