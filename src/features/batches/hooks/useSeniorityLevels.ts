import { useQuery } from '@tanstack/react-query';
import { batchApi } from '@/shared/queries/batches/batchApi';

export const useSeniorityLevels = () => {
  return useQuery<string[]>({
    queryKey: ['batches', 'seniority-levels'],
    queryFn: batchApi.getSeniorityLevels,
    staleTime: 1000 * 60 * 10,
    retry: false,
  });
};
