// Central batch lifecycle flow — maps BatchStatus to the step the user should be on
// Flow: Draft -> Enriched -> contacts fetched -> emails drafted -> outriched/Executed
export type BatchFlowStep = 'explore' | 'enrich' | 'contacts' | 'draft' | 'outreached';

export function getBatchStep(status?: string | null): BatchFlowStep {
    const s = (status || '').toLowerCase();
    switch (s) {
        case 'enriched':
            return 'enrich';
        case 'contacts fetched':
            return 'contacts';
        case 'emails drafted':
            return 'draft';
        case 'outriched':
        case 'outreached':
        case 'executed':
            return 'outreached';
        case 'draft':
        default:
            return 'explore';
    }
}

export function getStepRoute(batchId: string, step: BatchFlowStep): string {
    switch (step) {
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
