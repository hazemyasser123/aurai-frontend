// Enums — synced with backend (Python str, Enum)
export type BatchStatus = "Draft" | "Enriched" | "contacts fetched" | "emails drafted" | "outriched" | "Executed";
export type BatchAccountStatus = "Best fit" | "likely match" | "poor" | "Ignored";

export interface ProductAnalysis {
  executive_summary?: string;
  unique_selling_points?: string[];
  value_proposition?: string;
  business_problems_solved?: string[];
  business_outcomes?: string[];
  competitive_advantages?: string[];
  roi?: string;
  keywords?: string[];
}

export interface Icp {
  name?: string;
  strategic_summary?: string;
  industries?: string[];
  geographies?: string[];
  min_employees?: number | null;
  max_employees?: number | null;
  min_revenue?: number | null;
  max_revenue?: number | null;
  funding_stages?: string[];
  included_technologies?: string[];
  excluded_technologies?: string[];
  hiring_signals?: string[];
  intent_topics?: string[];
  decision_maker_roles?: string[];
  company_characteristics?: string[];
}

export interface Account {
  id: string;
  domain: string;
  name: string;
  logo_url: string | null;
  status: string;
}

export interface Batch {
  id: string;
  name: string; // Changed from batch_name
  base_product_id?: string;
  status: string;
  created_at: string;
  product_analysis?: ProductAnalysis;
  icp?: Icp;
  accounts_count?: number; // Uses count instead of array
  max_results?: number;
  cc_emails?: string[];
  bcc_emails?: string[];
  human_action_loop_emails?: string[];
  forward_emails?: string[]; // Plural
  enable_auto_followup?: boolean;
  followup_delay_days?: number;
}

// Request shapes
export interface CreateBatchPayload {
  name: string;
  base_product_id?: string;
  max_results?: number;
  cc_emails?: string[];
  bcc_emails?: string[];
  human_action_loop_emails?: string[];
  forward_emails?: string[];
  enable_auto_followup?: boolean;
  followup_delay_days?: number;
}

export interface AddBatchAccountPayload {
  domains: string[];
}

export interface FetchMoreAccountsPayload {
  count_to_add: number;
}

export interface EnrichAndEvaluatePayload {
  account_ids: string[];
}

export interface Contact {
  id: string;
  first_name: string;
  last_name: string;
  title: string;
  photo_url: string | null;
  account_id: string;
  account_name: string;
  account_domain: string;
  is_enriched: boolean;
  primary_email: string | null;
  primary_phone: string | null;
  linkedin_url: string | null;
  is_recommended: boolean;
  relevance_score: number;
}

export interface AccountDetails {
  account: Account;
  contacts_count: number;
  enrichment_status: string;
  enrichment_data: any; // Using any for dynamic enrichment data like news, achievements, etc.
}

export interface AddManualContactPayload {
  batch_id: string;
  first_name: string;
  last_name: string;
  title?: string;
  email?: string;
  phone?: string;
  linkedin_url?: string;
}

export interface SearchContactCandidatesPayload {
  title?: string;
  seniority_level?: string;
  max_results?: number;
}

export interface ContactCandidate {
  source: string;
  source_identifier: string;
  first_name: string;
  last_name: string;
  title: string;
  organization_name?: string;
  linkedin_url?: string | null;
  photo_url?: string | null;
  email?: string | null;
}

export interface AddContactCandidatesPayload {
  batch_id: string;
  candidates: Array<{
    source: string;
    source_identifier: string;
    first_name: string;
    last_name: string;
    title: string;
    linkedin_url?: string | null;
    email?: string | null;
    phone?: string | null;
    raw_source_metadata?: Record<string, unknown> | null;
  }>;
}

export interface UpdateBatchPayload {
  name?: string;
  base_product_id?: string;
  status?: string;
  product_analysis?: ProductAnalysis;
  icp?: Icp;
  cc_emails?: string[];
  bcc_emails?: string[];
  human_action_loop_emails?: string[];
  forward_emails?: string[];
  enable_auto_followup?: boolean;
  followup_delay_days?: number;
  max_results?: number;
}

export interface FindAccountsPayload {
  id?: string;
  name?: string;
  batch_name?: string;
  base_product_id?: string;
  product_analysis?: ProductAnalysis;
  icp?: Icp;
  max_results?: number;
  cc_emails?: string[];
  bcc_emails?: string[];
  human_action_loop_emails?: string[];
  forward_emails?: string[];
  enable_auto_followup?: boolean;
  followup_delay_days?: number;
}

export interface FindBatchContactsPayload {
  account_ids?: string[];
  force?: boolean;
}

// Outreach / Draft Messages
export interface OutreachConversation {
  id: string;
  contact_id: string;
  first_name: string;
  last_name: string;
  title: string;
  photo_url: string | null;
  account_id: string;
  account_name: string;
  account_domain: string;
  recipient_email: string | null;
  channel_type?: string;
  status: string;
  subject: string;
  body: string;
  batch_id?: string;
  batch_name?: string;
  created_at?: string;
  updated_at?: string;
  // outreached / contacts fetched extra fields
  classification?: string;
  needs_human_action?: boolean;
  human_action_reason?: string;
  outreach_status?: string;
  conversation_status?: string;
}

export interface DraftOutreachPayload {
  contact_ids: string[];
}

export interface UpdateOutreachPayload {
  subject?: string;
  body?: string;
}

export interface SendBulkOutreachPayload {
  batch_id?: string;      // Option 1: send all unsent emails in a batch
  email_ids?: string[];   // Option 2: send specific emails by ID
}

export interface SendBulkOutreachResponse {
  sent_count: number;
  batch_status?: string;  // e.g. "outriched" when last unsent email is sent
  emails?: OutreachConversation[];
}

export interface OutreachMessage {
  id?: string;
  direction?: string;
  fromAddress?: string;
  toAddresses?: string[];
  subject?: string;
  bodyText?: string;
  bodyHtml?: string;
  occurredAt?: string;
  displayText?: string;
}

export interface OutreachThread {
  conversation_id: string;
  external_thread_id?: string;
  subject: string;
  recipient_email: string;
  status: string;
  classification?: string;
  needs_human_action?: boolean;
  human_action_reason?: string;
  first_name?: string;
  last_name?: string;
  account_name?: string;
  messages: OutreachMessage[];
}
