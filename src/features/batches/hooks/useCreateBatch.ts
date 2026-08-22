import { useMutation, useQueryClient } from "@tanstack/react-query";
import { batchApi } from "@/shared/queries/batches/batchApi";
import { batchKeys } from "@/shared/queries/batches/batchQueries";
import type { CreateBatchPayload } from "@/features/batches/types/batchTypes";

export const useCreateBatch = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: batchKeys.create,
    mutationFn: (payload: CreateBatchPayload) => batchApi.createBatch(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: batchKeys.all });
    },
  });
};
