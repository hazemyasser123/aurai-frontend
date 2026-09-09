import { useMutation, useQueryClient } from "@tanstack/react-query";
import { batchApi } from "@/shared/queries/batches/batchApi";
import { batchKeys } from "@/shared/queries/batches/batchQueries";

export const useCloneBatch = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ batchId, batchName }: { batchId: string; batchName: string }) =>
      batchApi.cloneBatch(batchId, batchName),
    onSuccess: () => {
      // Clone only adds a new batch — the source batch's detail is unchanged
      queryClient.invalidateQueries({ queryKey: batchKeys.lists });
    },
  });
};
