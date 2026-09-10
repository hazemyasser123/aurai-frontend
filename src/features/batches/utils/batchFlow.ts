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

export const STEP_LABELS: Record<BatchFlowStep, string> = {
    explore: 'Ready to Find Accounts',
    executed: 'Explore Accounts',
    enrich: 'Enrich & Rank',
    contacts: 'Batch Contacts',
    draft: 'Draft Messages',
    outreached: 'Outreached',
};

/** The canonical status value the backend sets when a step completes */
export const STEP_STATUS: Record<BatchFlowStep, string> = {
    explore: 'Draft',
    executed: 'Executed',
    enrich: 'Enriched',
    contacts: 'contacts fetched',
    draft: 'emails drafted',
    outreached: 'outriched',
};

/** Options for a flow transition — the action's own HTTP response decides the move */
export interface TransitionOptions {
    /** Validate the action's response. Returning false fails the transition immediately
     *  (info toast, stay on the current view). E.g. drafting returns the drafts
     *  themselves; an empty array means nothing was generated. */
    validate?: (result: unknown) => boolean;
    /** Message shown as an info toast when validation fails */
    validationMessage?: string;
    /** Skip the blocking loading overlay — the caller disables its own buttons instead */
    silent?: boolean;
}

export type BeginTransition = (
    action: () => Promise<unknown>,
    targetStep: BatchFlowStep,
    label: string,
    options?: TransitionOptions
) => Promise<boolean>;

export function getStepIndex(step: BatchFlowStep): number {
    return STEP_ORDER.indexOf(step);
}

// Session-scoped memory of the furthest flow step each batch has been verified at
// (i.e. a flow page rendered with batch data whose status passed its guard).
// Lets flow pages skip redundant GET /batches/:id refetches when the user moves
// BACKWARDS in the flow — the batch can only have advanced further, so the cached
// status is always sufficient for the guards. Forward entries still refetch.
const verifiedStepByBatch = new Map<string, BatchFlowStep>();

export function rememberVerifiedStep(batchId: string, status?: string | null): void {
    if (!batchId) return;
    const step = getBatchStep(status);
    const prev = verifiedStepByBatch.get(batchId);
    if (prev === undefined || getStepIndex(step) > getStepIndex(prev)) {
        verifiedStepByBatch.set(batchId, step);
    }
}

/** True if this batch has already been verified at or past `step` (backward/lateral navigation) */
export function hasVerifiedStep(batchId: string, step: BatchFlowStep): boolean {
    const verified = verifiedStepByBatch.get(batchId);
    return verified !== undefined && getStepIndex(verified) >= getStepIndex(step);
}
