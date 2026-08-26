import { useMutation, useQueryClient } from "@tanstack/react-query";
import { batchApi } from "@/shared/queries/batches/batchApi";
import { batchKeys } from "@/shared/queries/batches/batchQueries";
import type { FindAccountsPayload } from "@/features/batches/types/batchTypes";

export const useFindAccounts = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: FindAccountsPayload) => batchApi.findAccounts(payload),
    onSuccess: (_data, variables) => {
      if (variables.id) {
        queryClient.invalidateQueries({ queryKey: batchKeys.detail(variables.id) });
        queryClient.invalidateQueries({ queryKey: batchKeys.accounts(variables.id) });
      }
      queryClient.invalidateQueries({ queryKey: batchKeys.all });
    },
  });
};
