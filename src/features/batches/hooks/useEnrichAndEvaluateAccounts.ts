import { useMutation, useQueryClient } from "@tanstack/react-query";
import { batchApi } from "@/shared/queries/batches/batchApi";
import { batchKeys } from "@/shared/queries/batches/batchQueries";
import type { EnrichAndEvaluatePayload } from "@/features/batches/types/batchTypes";

export const useEnrichAndEvaluateAccounts = (batchId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: EnrichAndEvaluatePayload) =>
      batchApi.enrichAndEvaluateAccounts(batchId, payload),
    onSuccess: () => {
      // Invalidate the accounts list to eventually show updated statuses
      queryClient.invalidateQueries({ queryKey: batchKeys.accounts(batchId) });
    },
  });
};
