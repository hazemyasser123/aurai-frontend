export interface PromptLabStatus {
  active_version: string;
  versions: string[];
}

export interface PromptVersion {
  version: string;
  note: string;
  prompts: {
    initial_draft: string;
    classify_and_reply: string;
    followup: string;
  };
  created_at: string;
  updated_at: string;
}

export interface SaveVersionPayload {
  version: string;
  note?: string;
  prompts: {
    initial_draft: string;
    classify_and_reply: string;
    followup: string;
  };
}

export interface ActivatePayload {
  version: string;
}

export interface LabAnalysis {
  id: string;
  product_id: string | null;
  batch_id: string | null;
  executive_summary: string;
  label: string;
}

export interface LabProduct {
  id: string;
  name: string;
  analysis_id: string | null;
  executive_summary: string;
}

export interface LabBatch {
  id: string;
  name: string;
  analysis_id: string | null;
  executive_summary: string;
}

export interface LabAccount {
  id: string;
  name: string;
  domain: string;
  enrichment_status: string;
}

export interface LabAccountContext {
  id: string;
  name: string;
  domain: string;
  global_firmographics?: Record<string, unknown>;
  enrichment_status: string;
  enrichment_data: Record<string, unknown>;
  status: string;
  contacts: Array<{
    id: string;
    first_name: string;
    last_name: string;
    title: string;
    seniority_level: string;
    is_recommended: boolean;
  }>;
}

export interface SimulateDraftPayload {
  product_analysis_id: string;
  contact: {
    first_name: string;
    last_name?: string;
    title?: string;
    seniority_level?: string;
  };
  company_context?: Record<string, unknown>;
  system_prompt?: string;
}

export interface SimulateDraftResponse {
  subject: string;
  body: string;
}

export interface SimulateReplyPayload {
  product_analysis_id: string;
  thread_history?: string;
  system_prompt?: string;
}

export interface SimulateReplyResponse {
  subject: string;
  body: string;
}

export type PromptTabKey = 'initial_draft' | 'classify_and_reply' | 'followup';
