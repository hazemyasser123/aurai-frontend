import { useMutation, useQueryClient } from "@tanstack/react-query";
import { batchApi } from "@/shared/queries/batches/batchApi";
import { batchKeys } from "@/shared/queries/batches/batchQueries";
import type { Batch, UpdateBatchPayload } from "@/features/batches/types/batchTypes";

export const useUpdateBatch = (batchId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateBatchPayload) =>
      batchApi.updateBatch(batchId, payload),
    onSuccess: (updated, payload) => {
      // The PUT response already tells us the batch was saved — write it into the
      // detail cache instead of triggering another GET. If the response isn't the
      // batch itself, merge the saved payload into the cached copy.
      const saved = updated as Batch | undefined;
      if (saved && typeof saved === 'object' && 'id' in saved) {
        queryClient.setQueryData(batchKeys.detail(batchId), saved);
      } else {
        queryClient.setQueryData<Batch>(batchKeys.detail(batchId), (old) =>
          old ? { ...old, ...payload } : old
        );
      }
      // Batch cards (name/status) — cheap when the list isn't mounted (marked stale only)
      queryClient.invalidateQueries({ queryKey: batchKeys.lists });
    },
  });
};
