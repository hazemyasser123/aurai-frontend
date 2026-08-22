import { systemApi } from "../axiosInstance";
import type {
  Batch,
  Account,
  EnrichAndEvaluatePayload,
  AccountDetails,
  Contact,
  AddManualContactPayload,
} from "@/features/batches/types/batchTypes";
import type {
  CreateBatchPayload,
  AddBatchAccountPayload,
  FetchMoreAccountsPayload,
} from "@/features/batches/types/batchTypes";

export const batchApi = {
  getBatches: async () => {
    const response = await systemApi.get<Batch[]>("/batches");
    return response.data;
  },

  getBatch: async (id: string) => {
    const response = await systemApi.get<Batch>(`/batches/${id}`);
    return response.data;
  },

  createBatch: async (payload: CreateBatchPayload) => {
    const response = await systemApi.post<Batch>("/batches", payload);
    return response.data;
  },

  getBatchAccounts: async (batchId: string) => {
    const response = await systemApi.get<Account[]>(
      `/batches/${batchId}/accounts`,
    );
    return response.data;
  },

  deleteBatchAccount: async (batchId: string, accountId: string) => {
    await systemApi.delete(`/batches/${batchId}/accounts/${accountId}`);
  },

  // New: Add manual accounts
  addBatchAccount: async (batchId: string, payload: AddBatchAccountPayload) => {
    const response = await systemApi.post<Account[]>(
      `/batches/${batchId}/accounts`,
      payload,
    );
    return response.data;
  },

  // New: Fetch more accounts automatically
  fetchMoreAccounts: async (
    batchId: string,
    payload: FetchMoreAccountsPayload,
  ) => {
    const response = await systemApi.post<Account[]>(
      `/batches/${batchId}/fetch-more`,
      payload,
    );
    return response.data;
  },

  enrichAndEvaluateAccounts: async (
    batchId: string,
    payload: EnrichAndEvaluatePayload,
  ) => {
    const response = await systemApi.post(
      `/batches/${batchId}/accounts/enrich-and-evaluate`,
      payload,
    );
    return response.data;
  },
  // New: Get Account Details
  getAccountDetails: async (accountId: string, batchId?: string) => {
    const url = batchId
      ? `/accounts/${accountId}?batch_id=${batchId}`
      : `/accounts/${accountId}`;
    const response = await systemApi.get<AccountDetails>(url);
    return response.data;
  },

  // New: Get Account Contacts
  getAccountContacts: async (accountId: string, batchId?: string) => {
    const url = batchId
      ? `/accounts/${accountId}/contacts?batch_id=${batchId}`
      : `/accounts/${accountId}/contacts`;
    const response = await systemApi.get<Contact[]>(url);
    return response.data;
  },

  // New: Add manual contact
  addManualContact: async (
    accountId: string,
    payload: AddManualContactPayload,
  ) => {
    const response = await systemApi.post<Contact>(
      `/accounts/${accountId}/contacts`,
      payload,
    );
    return response.data;
  },

  // New: Toggle Contact Recommend (Select)
  toggleContactRecommend: async (contactId: string, isRecommended: boolean) => {
    const response = await systemApi.patch(`/contacts/${contactId}/recommend`, {
      is_recommended: isRecommended,
    });
    return response.data;
  },

  getBatchContacts: async (batchId: string) => {
    const response = await systemApi.get<Contact[]>(
      `/batches/${batchId}/contacts`,
    );
    return response.data;
  },
};
