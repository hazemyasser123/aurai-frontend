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
  OutreachMessage,
} from "@/features/batches/types/batchTypes";

// Normalize outreach API response: extract array + flatten nested contact/account objects
const normalizeOutreachResponse = (data: unknown): OutreachConversation[] => {
  let list: unknown[] = [];
  if (Array.isArray(data)) {
    list = data;
  } else if (data && typeof data === 'object') {
    const obj = data as Record<string, unknown>;
    for (const key of ['outreach', 'data', 'conversations', 'items', 'results']) {
      if (Array.isArray(obj[key])) { list = obj[key] as unknown[]; break; }
    }
  }

  return list.map((raw) => {
    const item = raw as Record<string, unknown>;
    const contact = (item.contact && typeof item.contact === 'object' ? item.contact : {}) as Record<string, unknown>;
    const account = (item.account && typeof item.account === 'object' ? item.account : {}) as Record<string, unknown>;
    return {
      id: String(item.id ?? ''),
      email_id: (item.email_id as string) ?? undefined,
      contact_id: String(item.contact_id ?? contact.id ?? ''),
      // Flatten nested contact
      first_name: ((item.first_name ?? contact.first_name) ?? '') as string,
      last_name: ((item.last_name ?? contact.last_name) ?? '') as string,
      title: ((item.title ?? contact.title) ?? '') as string,
      photo_url: ((item.photo_url ?? contact.photo_url) ?? null) as string | null,
      account_id: String(item.account_id ?? contact.account_id ?? account.id ?? ''),
      account_name: ((item.account_name ?? contact.account_name ?? account.name) ?? '') as string,
      account_domain: ((item.account_domain ?? contact.account_domain ?? account.domain) ?? '') as string,
      account_logo_url: ((item.account_logo_url ?? account.logo_url) ?? null) as string | null,
      recipient_email: ((item.recipient_email ?? contact.primary_email) ?? null) as string | null,
      channel_type: item.channel_type as string | undefined,
      status: (item.status ?? '') as string,
      subject: (item.subject ?? '') as string,
      body: (item.body ?? '') as string,
      batch_id: (item.batch_id ?? undefined) as string | undefined,
      batch_name: item.batch_name as string | undefined,
      created_at: item.created_at as string | undefined,
      updated_at: item.updated_at as string | undefined,
      last_message_at: item.last_message_at as string | undefined,
      message_count: typeof item.message_count === 'number' ? item.message_count : undefined,
      classification: item.classification as string | undefined,
      needs_human_action: item.needs_human_action as boolean | undefined,
      human_action_reason: item.human_action_reason as string | undefined,
      needs_followup: item.needs_followup as boolean | undefined,
      outreach_status: item.outreach_status as string | undefined,
      conversation_status: item.conversation_status as string | undefined,
    } as OutreachConversation;
  });
};

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

  findAccounts: async (payload: import("@/features/batches/types/batchTypes").FindAccountsPayload) => {
    const response = await systemApi.post<Batch>("/batches/find-accounts", payload);
    return response.data;
  },

  findBatchContacts: async (batchId: string, payload?: import("@/features/batches/types/batchTypes").FindBatchContactsPayload) => {
    const response = await systemApi.post<Contact[]>(`/batches/${batchId}/contacts/search`, payload || {});
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
    const response = await systemApi.get<unknown>(`/batches/${batchId}/outreach`);
    return normalizeOutreachResponse(response.data);
  },

  draftBatchOutreach: async (batchId: string, payload: DraftOutreachPayload) => {
    const response = await systemApi.post<unknown>(`/batches/${batchId}/outreach/draft`, payload);
    return normalizeOutreachResponse(response.data);
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

  getOutreachThread: async (conversationId: string): Promise<OutreachThread> => {
    const response = await systemApi.get<unknown>(
      `/outreach/conversations/${conversationId}/thread`,
    );
    const data = response.data as Record<string, unknown>;
    const contact = (data?.contact && typeof data.contact === 'object' ? data.contact : {}) as Record<string, unknown>;
    const account = (data?.account && typeof data.account === 'object' ? data.account : {}) as Record<string, unknown>;
    const email = (data?.email && typeof data.email === 'object' ? data.email : null) as Record<string, unknown> | null;
    const rawMessages = Array.isArray(data?.messages) ? (data!.messages as unknown[]) : [];

    return {
      id: String(data?.id ?? conversationId),
      conversation_id: String(data?.id ?? conversationId),
      email_id: (data?.email_id as string) ?? undefined,
      batch_id: (data?.batch_id as string) ?? undefined,
      contact_id: String(data?.contact_id ?? contact.id ?? ''),
      account_id: String(data?.account_id ?? account.id ?? ''),
      status: (data?.status as string) ?? '',
      needs_human_action: !!data?.needs_human_action,
      human_action_reason: data?.human_action_reason as string | undefined,
      // Flatten nested contact
      first_name: ((data?.first_name ?? contact.first_name) ?? '') as string,
      last_name: ((data?.last_name ?? contact.last_name) ?? '') as string,
      title: ((data?.title ?? contact.title) ?? '') as string,
      photo_url: ((data?.photo_url ?? contact.photo_url) ?? null) as string | null,
      recipient_email: ((contact.primary_email ?? data?.recipient_email) ?? null) as string | null,
      account_name: ((data?.account_name ?? contact.account_name ?? account.name) ?? '') as string,
      account_domain: ((data?.account_domain ?? contact.account_domain ?? account.domain) ?? '') as string,
      account_logo_url: (account.logo_url ?? null) as string | null,
      // Original cold email that started the thread
      email: email
        ? {
            id: email.id as string | undefined,
            subject: (email.subject as string) ?? '',
            body: (email.body as string) ?? '',
            sent_at: (email.sent_at as string | null) ?? null,
          }
        : null,
      // Normalize messages to a common shape (body / direction / created_at)
      messages: rawMessages.map((m) => {
        const msg = m as Record<string, unknown>;
        return {
          id: msg.id as string | undefined,
          direction: (msg.direction as string) ?? 'inbound',
          sender: msg.sender as string | undefined,
          body: (msg.body ?? msg.bodyText ?? msg.bodyHtml ?? '') as string,
          created_at: (msg.created_at ?? msg.occurredAt) as string | undefined,
        };
      }),
    } as OutreachThread;
  },

  getOutreachConversation: async (conversationId: string) => {
    const response = await systemApi.get<OutreachConversation>(
      `/outreach/conversations/${conversationId}`,
    );
    return response.data;
  },

  // Conversations inbox
  listConversations: async (params?: import("@/features/batches/types/batchTypes").ListConversationsParams) => {
    return normalizeOutreachResponse(
      (await systemApi.get<unknown>("/outreach/conversations", { params })).data,
    );
  },

  // Send a rep-authored reply into a live thread (clears human-action flag server-side).
  // Body shape per API doc: { "body": "..." } — 422 if missing/empty.
  sendManualReply: async (conversationId: string, content: string) => {
    const response = await systemApi.post<OutreachMessage>(
      `/outreach/conversations/${conversationId}/reply`,
      { body: content },
    );
    return response.data;
  },

  // Clear the human-action flag without sending a reply
  resolveConversation: async (conversationId: string) => {
    const response = await systemApi.post<OutreachConversation>(
      `/outreach/conversations/${conversationId}/resolve`,
    );
    return response.data;
  },

  cloneBatch: async (batchId: string, batchName: string) => {
    // Try dedicated clone endpoint if backend provides it — uses `name` per spec
    try {
      const response = await systemApi.post<Batch>(`/batches/${batchId}/clone`, {
        name: batchName,
      });
      return response.data;
    } catch (err: unknown) {
      const axiosErr = err as { response?: { status?: number } };
      // If endpoint doesn't exist (404/405), fallback to manual clone via create
      if (axiosErr.response?.status === 404 || axiosErr.response?.status === 405 || axiosErr.response?.status === 422) {
        const original = await systemApi.get<Batch>(`/batches/${batchId}`);
        const b = original.data as Batch & Record<string, unknown>;
        // Build create payload copying everything except id/status/created_at — uses `name`
        const payload: CreateBatchPayload & Record<string, unknown> = {
          name: batchName,
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
