import type { Batch, ProductAnalysis, Icp } from "@/features/batches/types/batchTypes";

export interface ProductIntelligenceOverride {
  product_analysis?: ProductAnalysis;
  icp?: Icp;
}

/**
 * Full batch payload — everything from Batch Overview, Product Intelligence and ICP.
 * Master switches are respected: tied fields are omitted entirely when their flag is off.
 * Used by find-accounts and fetch-more; the Save button builds on the same shape plus status.
 *
 * When `intelligence` is provided (fetched from the product's own endpoints), its
 * product_analysis/icp are sent instead of the batch's stored copies.
 */
export function buildFullBatchPayload(batch: Batch, intelligence?: ProductIntelligenceOverride) {
  const followupOn = batch.enable_auto_followup ?? true;
  const replyDelayOn = batch.reply_delay_enabled ?? false;

  return {
    // Batch Overview
    name: batch.name,
    batch_name: batch.name,
    base_product_id: batch.base_product_id,
    max_results: batch.max_results,
    account_source: batch.account_source || undefined,
    contact_source: batch.contact_source || undefined,
    cc_emails: batch.cc_emails,
    bcc_emails: batch.bcc_emails,
    human_action_loop_emails: batch.human_action_loop_emails,
    forward_emails: batch.forward_emails,
    enable_auto_followup: followupOn,
    ...(followupOn && batch.followup_delay_days != null
      ? { followup_delay_days: Number(batch.followup_delay_days) }
      : {}),
    reply_delay_enabled: replyDelayOn,
    ...(replyDelayOn
      ? {
          ...(batch.reply_timezone ? { reply_timezone: batch.reply_timezone } : {}),
          ...(batch.reply_working_days ? { reply_working_days: batch.reply_working_days } : {}),
          ...(batch.reply_working_hours_start ? { reply_working_hours_start: batch.reply_working_hours_start } : {}),
          ...(batch.reply_working_hours_end ? { reply_working_hours_end: batch.reply_working_hours_end } : {}),
          ...(batch.reply_base_delay_minutes != null ? { reply_base_delay_minutes: Number(batch.reply_base_delay_minutes) } : {}),
          ...(batch.reply_delay_buffer_minutes != null ? { reply_delay_buffer_minutes: Number(batch.reply_delay_buffer_minutes) } : {}),
        }
      : {}),
    // Product Intelligence — the product's own, when available
    product_analysis: intelligence?.product_analysis ?? batch.product_analysis,
    // Ideal Customer Profile (ICP) — the product's own, when available
    icp: intelligence?.icp ?? batch.icp,
  };
}
