import { useMutation, useQueryClient } from '@tanstack/react-query';
import { batchApi } from '@/shared/queries/batches/batchApi';
import { batchKeys } from '@/shared/queries/batches/batchQueries';

export const useDeleteBatch = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (batchId: string) => batchApi.deleteBatch(batchId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: batchKeys.lists });
    },
  });
};
