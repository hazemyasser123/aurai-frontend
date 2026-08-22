// Enums
export type BatchStatus = "Draft" | "Executed" | "contacts fetched";

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
  batch_name: string;
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
