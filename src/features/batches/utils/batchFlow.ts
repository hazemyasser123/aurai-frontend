// Central batch lifecycle flow — maps BatchStatus to the step the user should be on
// Correct flow per backend: Draft -> Executed (accounts found) -> Enriched -> contacts fetched -> emails drafted -> outriched/outreached (final)
export type BatchFlowStep = 'explore' | 'executed' | 'enrich' | 'contacts' | 'draft' | 'outreached';

export function getBatchStep(status?: string | null): BatchFlowStep {
    const s = (status || '').toLowerCase();
    switch (s) {
        case 'executed':
            return 'executed';
        case 'enriched':
            return 'enrich';
        case 'contacts fetched':
            return 'contacts';
        case 'emails drafted':
            return 'draft';
        case 'outriched':
        case 'outreached':
            return 'outreached';
        case 'draft':
        default:
            return 'explore';
    }
}

export const STEP_ORDER: BatchFlowStep[] = ['explore', 'executed', 'enrich', 'contacts', 'draft', 'outreached'];

export function getStepIndex(step: BatchFlowStep): number {
    return STEP_ORDER.indexOf(step);
}

/** True if current status is at or past the required step — allows viewing past pages without redirect */
export function isStepAtLeast(currentStatus: string | null | undefined, requiredStep: BatchFlowStep): boolean {
    return getStepIndex(getBatchStep(currentStatus)) >= getStepIndex(requiredStep);
}

export function getStepRoute(batchId: string, step: BatchFlowStep): string {
    switch (step) {
        case 'executed':
            // Executed = explored accounts found (right after Draft) — show explored accounts
            return `/batches/${batchId}/accounts`;
        case 'enrich':
            return `/batches/${batchId}/accounts/enrich`;
        case 'contacts':
            return `/batches/${batchId}/contacts`;
        case 'draft':
            return `/batches/${batchId}/draft`;
        case 'outreached':
            return `/batches/${batchId}?tab=accounts`;
        case 'explore':
        default:
            return `/batches/${batchId}/accounts`;
    }
}

/** Canonical route the user should be on for this batch's current status */
export function getStatusRoute(batchId: string, status?: string | null): string {
    return getStepRoute(batchId, getBatchStep(status));
}
