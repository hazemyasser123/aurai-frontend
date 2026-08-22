import { useMutation, useQueryClient } from "@tanstack/react-query";
import { batchApi } from "@/shared/queries/batches/batchApi";
import { batchKeys } from "@/shared/queries/batches/batchQueries";

export const useDeleteBatchAccount = (batchId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (accountId: string) =>
      batchApi.deleteBatchAccount(batchId, accountId),
    onSuccess: () => {
      // Refetch the accounts list
      queryClient.invalidateQueries({ queryKey: batchKeys.accounts(batchId) });
    },
  });
};
