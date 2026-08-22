import { useMutation, useQueryClient } from "@tanstack/react-query";
import { batchApi } from "@/shared/queries/batches/batchApi";
import { batchKeys } from "@/shared/queries/batches/batchQueries";
import type {
  AddBatchAccountPayload,
  Account,
} from "@/features/batches/types/batchTypes";

export const useAddBatchAccount = (batchId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: AddBatchAccountPayload) =>
      batchApi.addBatchAccount(batchId, payload),
    onSuccess: (newAccounts) => {
      // Update the cache directly by appending the new accounts
      queryClient.setQueryData<Account[]>(
        batchKeys.accounts(batchId),
        (oldData) => {
          return [...(oldData || []), ...newAccounts];
        },
      );
    },
  });
};
