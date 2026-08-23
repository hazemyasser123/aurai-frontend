import { useMutation, useQueryClient } from "@tanstack/react-query";
import { batchApi } from "@/shared/queries/batches/batchApi";
import { batchKeys } from "@/shared/queries/batches/batchQueries";

export const useCloneBatch = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ batchId, batchName }: { batchId: string; batchName: string }) =>
      batchApi.cloneBatch(batchId, batchName),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: batchKeys.all });
    },
  });
};
