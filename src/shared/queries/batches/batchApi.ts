import { systemApi } from "../axiosInstance";
import type {
  Batch,
  Account,
  EnrichAndEvaluatePayload,
  AccountDetails,
  Contact,
  AddManualContactPayload,
  SearchContactCandidatesPayload,
  ContactCandidate,
  AddContactCandidatesPayload,
} from "@/features/batches/types/batchTypes";
import type {
  CreateBatchPayload,
  AddBatchAccountPayload,
  FetchMoreAccountsPayload,
  UpdateBatchPayload,
  OutreachConversation,
  DraftOutreachPayload,
  UpdateOutreachPayload,
  SendBulkOutreachPayload,
  SendBulkOutreachResponse,
  OutreachThread,
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

  // Find Contacts — search candidates by title + seniority
  searchContactCandidates: async (
    accountId: string,
    payload: SearchContactCandidatesPayload,
  ) => {
    const response = await systemApi.post<ContactCandidate[]>(
      `/accounts/${accountId}/contacts/search-candidates`,
      payload,
    );
    return response.data;
  },

  // Add selected candidates to account/batch
  addContactCandidates: async (
    accountId: string,
    payload: AddContactCandidatesPayload,
  ) => {
    const response = await systemApi.post<Contact[]>(
      `/accounts/${accountId}/contacts/add-candidates`,
      payload,
    );
    return response.data;
  },

  updateBatch: async (batchId: string, payload: UpdateBatchPayload) => {
    const response = await systemApi.put<Batch>(
      `/batches/${batchId}`,
      payload,
    );
    return response.data;
  },

  // Outreach — Draft & Send
  getBatchOutreach: async (batchId: string) => {
    const response = await systemApi.get<OutreachConversation[]>(
      `/batches/${batchId}/outreach`,
    );
    return response.data;
  },

  draftBatchOutreach: async (batchId: string, payload: DraftOutreachPayload) => {
    const response = await systemApi.post<OutreachConversation[]>(
      `/batches/${batchId}/outreach/draft`,
      payload,
    );
    return response.data;
  },

  updateOutreachDraft: async (
    conversationId: string,
    payload: UpdateOutreachPayload,
  ) => {
    const response = await systemApi.patch<OutreachConversation>(
      `/outreach/conversations/${conversationId}`,
      payload,
    );
    return response.data;
  },

  sendOutreach: async (conversationId: string) => {
    const response = await systemApi.post<OutreachConversation>(
      `/outreach/conversations/${conversationId}/send`,
    );
    return response.data;
  },

  sendBulkOutreach: async (payload: SendBulkOutreachPayload) => {
    const response = await systemApi.post<SendBulkOutreachResponse>(
      `/outreach/conversations/send-bulk`,
      payload,
    );
    return response.data;
  },

  getOutreachThread: async (conversationId: string) => {
    const response = await systemApi.get<OutreachThread>(
      `/outreach/conversations/${conversationId}/thread`,
    );
    return response.data;
  },

  getOutreachConversation: async (conversationId: string) => {
    const response = await systemApi.get<OutreachConversation>(
      `/outreach/conversations/${conversationId}`,
    );
    return response.data;
  },

  cloneBatch: async (batchId: string, batchName: string) => {
    // Try dedicated clone endpoint if backend provides it
    try {
      const response = await systemApi.post<Batch>(`/batches/${batchId}/clone`, {
        batch_name: batchName,
      });
      return response.data;
    } catch (err: unknown) {
      const axiosErr = err as { response?: { status?: number } };
      // If endpoint doesn't exist (404/405), fallback to manual clone via create
      if (axiosErr.response?.status === 404 || axiosErr.response?.status === 405 || axiosErr.response?.status === 422) {
        const original = await systemApi.get<Batch>(`/batches/${batchId}`);
        const b = original.data as Batch & Record<string, unknown>;
        // Build create payload copying everything except id/status/created_at
        const payload: CreateBatchPayload & Record<string, unknown> = {
          batch_name: batchName,
          base_product_id: b.base_product_id as string | undefined,
          max_results: b.max_results as number | undefined,
          cc_emails: b.cc_emails as string[] | undefined,
          bcc_emails: b.bcc_emails as string[] | undefined,
          human_action_loop_emails: b.human_action_loop_emails as string[] | undefined,
          forward_emails: b.forward_emails as string[] | undefined,
          enable_auto_followup: b.enable_auto_followup as boolean | undefined,
          followup_delay_days: b.followup_delay_days as number | undefined,
          // preserve product intelligence & ICP if present
          ...(b.product_analysis ? { product_analysis: b.product_analysis as unknown } : {}),
          ...(b.icp ? { icp: b.icp as unknown } : {}),
          // preserve reply delay settings if backend stores them on batch
          ...(b.reply_delay_enabled !== undefined ? { reply_delay_enabled: b.reply_delay_enabled } : {}),
          ...(b.reply_timezone ? { reply_timezone: b.reply_timezone } : {}),
          ...(b.reply_working_days ? { reply_working_days: b.reply_working_days } : {}),
          ...(b.reply_working_hours_start ? { reply_working_hours_start: b.reply_working_hours_start } : {}),
          ...(b.reply_working_hours_end ? { reply_working_hours_end: b.reply_working_hours_end } : {}),
          ...(b.reply_base_delay_minutes ? { reply_base_delay_minutes: b.reply_base_delay_minutes } : {}),
          ...(b.reply_delay_buffer_minutes ? { reply_delay_buffer_minutes: b.reply_delay_buffer_minutes } : {}),
        };
        const created = await systemApi.post<Batch>(`/batches`, payload);
        return created.data;
      }
      throw err;
    }
  },
};
