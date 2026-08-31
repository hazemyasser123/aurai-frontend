import { useQuery } from '@tanstack/react-query';
import { batchApi } from '@/shared/queries/batches/batchApi';
import type { BatchDatasources } from '@/features/batches/types/batchTypes';

export const useBatchDatasources = () => {
  return useQuery<BatchDatasources>({
    queryKey: ['batches', 'datasources'],
    queryFn: batchApi.getDatasources,
    staleTime: 1000 * 60 * 10,
    retry: false,
  });
};
