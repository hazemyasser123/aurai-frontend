import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { promptLabApi } from './promptLabApi';
import type { SaveVersionPayload } from '@/features/prompt-lab/types/promptLabTypes';

export const usePromptLabStatus = () =>
  useQuery({
    queryKey: ['prompt-lab', 'status'],
    queryFn: promptLabApi.getStatus,
  });

export const usePromptVersion = (version: string | null) =>
  useQuery({
    queryKey: ['prompt-lab', 'version', version],
    queryFn: () => promptLabApi.getVersion(version!),
    enabled: !!version,
  });

export const useSavePromptVersion = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: SaveVersionPayload) => promptLabApi.saveVersion(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['prompt-lab', 'status'] });
    },
  });
};

export const useActivatePromptVersion = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (version: string) => promptLabApi.activateVersion(version),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['prompt-lab', 'status'] });
    },
  });
};

export const useLabAnalyses = () =>
  useQuery({ queryKey: ['prompt-lab', 'analyses'], queryFn: promptLabApi.listAnalyses });

export const useLabProducts = () =>
  useQuery({ queryKey: ['prompt-lab', 'products'], queryFn: promptLabApi.listProducts });

export const useLabBatches = () =>
  useQuery({ queryKey: ['prompt-lab', 'batches'], queryFn: promptLabApi.listBatches });

export const useLabAccountSearch = (q: string, limit = 20) =>
  useQuery({
    queryKey: ['prompt-lab', 'accounts', q, limit],
    queryFn: () => promptLabApi.searchAccounts(q || undefined, limit),
    enabled: true,
  });

export const useSimulateDraft = () =>
  useMutation({ mutationFn: promptLabApi.simulateDraft });

export const useSimulateReply = () =>
  useMutation({ mutationFn: promptLabApi.simulateReply });
