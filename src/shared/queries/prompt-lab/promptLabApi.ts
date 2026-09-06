import { systemApi } from '../axiosInstance';
import type {
  PromptLabStatus,
  PromptVersion,
  SaveVersionPayload,
  LabAnalysis,
  LabProduct,
  LabBatch,
  LabAccount,
  LabAccountContext,
  SimulateDraftPayload,
  SimulateDraftResponse,
  SimulateReplyPayload,
  SimulateReplyResponse,
} from '@/features/prompt-lab/types/promptLabTypes';

export const promptLabApi = {
  getStatus: async (): Promise<PromptLabStatus> => {
    const res = await systemApi.get<PromptLabStatus>('/prompt-lab');
    return res.data;
  },

  getVersion: async (version: string): Promise<PromptVersion> => {
    const res = await systemApi.get<PromptVersion>(`/prompt-lab/versions/${encodeURIComponent(version)}`);
    return res.data;
  },

  saveVersion: async (payload: SaveVersionPayload): Promise<PromptVersion> => {
    const res = await systemApi.post<PromptVersion>('/prompt-lab/versions', payload);
    return res.data;
  },

  activateVersion: async (version: string): Promise<PromptVersion> => {
    const res = await systemApi.post<PromptVersion>('/prompt-lab/activate', { version });
    return res.data;
  },

  listAnalyses: async (): Promise<LabAnalysis[]> => {
    const res = await systemApi.get<LabAnalysis[]>('/prompt-lab/analyses');
    return res.data;
  },

  listProducts: async (): Promise<LabProduct[]> => {
    const res = await systemApi.get<LabProduct[]>('/prompt-lab/products');
    return res.data;
  },

  listBatches: async (): Promise<LabBatch[]> => {
    const res = await systemApi.get<LabBatch[]>('/prompt-lab/batches');
    return res.data;
  },

  searchAccounts: async (q?: string, limit: number = 20): Promise<LabAccount[]> => {
    const res = await systemApi.get<LabAccount[]>('/prompt-lab/accounts', { params: { q, limit } });
    return res.data;
  },

  getAccountContext: async (accountId: string): Promise<LabAccountContext> => {
    const res = await systemApi.get<LabAccountContext>(`/prompt-lab/accounts/${accountId}`);
    return res.data;
  },

  simulateDraft: async (payload: SimulateDraftPayload): Promise<SimulateDraftResponse> => {
    const res = await systemApi.post<SimulateDraftResponse>('/prompt-lab/simulate/draft', payload);
    return res.data;
  },

  simulateReply: async (payload: SimulateReplyPayload): Promise<SimulateReplyResponse> => {
    const res = await systemApi.post<SimulateReplyResponse>('/prompt-lab/simulate/reply', payload);
    return res.data;
  },
};
