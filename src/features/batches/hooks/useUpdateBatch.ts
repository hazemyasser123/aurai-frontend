import { useMutation, useQueryClient } from "@tanstack/react-query";
import { batchApi } from "@/shared/queries/batches/batchApi";
import { batchKeys } from "@/shared/queries/batches/batchQueries";
import type { UpdateBatchPayload } from "@/features/batches/types/batchTypes";

export const useUpdateBatch = (batchId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateBatchPayload) =>
      batchApi.updateBatch(batchId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: batchKeys.detail(batchId) });
      queryClient.invalidateQueries({ queryKey: batchKeys.all });
    },
  });
};
