export interface Product {
  id: string;
  name: string;
  type?: string;
  description?: string | null;
  status?: string;
  created_at?: string;
  updated_at?: string;
}

export type ProductType = "Product" | "Service" | "Solution";
export type ProductStatus = "Draft" | "Processing" | "Ready" | "Failed";

export const PRODUCT_REGISTRATION_TYPES = [
  'Product (Software, Physical, Goods)',
  'Service (Consulting, Implementation, Outsourcing)',
  'Solution (Bundled Package, Integrated Platform)',
] as const;

export type ProductRegistrationType = typeof PRODUCT_REGISTRATION_TYPES[number];

export interface CreateProductPayload {
  name: string;
  type: string;
  description?: string;
}

export interface ProductSource {
  id: string;
  product_id: string;
  source_type: string; // Text | File
  file_name?: string | null;
  storage_path?: string | null;
  content?: string | null;
  mime_type?: string | null;
  created_at?: string;
}

export interface ProductAnalysis {
  id?: string;
  product_id?: string;
  executive_summary?: string;
  unique_selling_points?: string[];
  value_proposition?: string;
  business_problems_solved?: string[];
  business_outcomes?: string[];
  competitive_advantages?: string[];
  roi?: string;
  keywords?: string[];
  generated_by_model?: string;
  prompt_version?: string;
  raw_llm_response?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ProductIcp {
  id?: string;
  product_id?: string;
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
  created_at?: string;
  updated_at?: string;
}
