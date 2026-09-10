import React, { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { Card, Button } from '@/shared/components/ui';
import { FiSearch, FiInfo } from 'react-icons/fi';
import bookmarkIcon from '@/assets/bookmark.svg';
import type { Batch } from '@/features/batches/types/batchTypes';
import { useFindAccounts } from '@/features/batches/hooks/useFindAccounts';
import { batchApi } from '@/shared/queries/batches/batchApi';
import { batchKeys } from '@/shared/queries/batches/batchQueries';
import { getBatchStep, getStepIndex, STEP_ORDER } from '@/features/batches/utils/batchFlow';
import type { BatchFlowStep, BeginTransition } from '@/features/batches/utils/batchFlow';
import { STEP_STATUS } from '@/features/batches/utils/batchFlow';
import { ExploreAccountsView } from '@/features/batches/components/flow/ExploreAccountsView';
import { EnrichAndRankView } from '@/features/batches/components/flow/EnrichAndRankView';
import { BatchContactsView } from '@/features/batches/components/flow/BatchContactsView';
import { DraftMessagesView } from '@/features/batches/components/flow/DraftMessagesView';
import { ContactsFetchedView } from '@/features/batches/components/contactsFetched/ContactsFetchedView';
import toast from 'react-hot-toast';
import { getErrorMessage } from '@/shared/utils/errorHandler';

// Status-transition polling: how often to re-check the batch status, and how long to wait
// before declaring the step failed and returning the user to the previous state.
const TRANSITION_POLL_MS = 5000;
const TRANSITION_TIMEOUT_MS = 180000;

// Module-scope time helpers (React purity: no impure Date.now calls in component scope)
const transitionDeadline = () => Date.now() + TRANSITION_TIMEOUT_MS;
const now = () => Date.now();

interface AccountsTabProps {
    formData: Batch;
    setFormData: React.Dispatch<React.SetStateAction<Batch | null>>;
}

// The whole accounts flow lives inside this tab. Each status renders its own step view:
// explore (Draft) -> executed -> enrich -> contacts -> draft (emails drafted) -> outreached
export const AccountsTab: React.FC<AccountsTabProps> = ({ formData, setFormData }) => {
    const findAccounts = useFindAccounts();
    const queryClient = useQueryClient();

    // Status-transition state: while a forward action is pending we either trust the
    // action's response or poll until the backend confirms the new status, showing a
    // blocking loading state meanwhile. Polling stops as soon as the user leaves the tab.
    const [transitionLabel, setTransitionLabel] = useState<string | null>(null);
    const cancelledRef = useRef(false);

    // Stop any in-flight polling when the tab (or the whole page) unmounts
    useEffect(() => () => {
        cancelledRef.current = true;
    }, []);

    const beginTransition: BeginTransition = async (action, targetStep, label, options) => {
        // Silent transitions skip the blocking overlay — the caller disables its own buttons
        const showOverlay = !options?.silent;
        if (showOverlay) setTransitionLabel(label);
        const targetIdx = getStepIndex(targetStep);
        const startingStatus = formData.status;
        try {
            const result = await action();

            // Response-validated transition: the action's own response confirms (or
            // fails) the step — no batch polling needed. E.g. drafting returns the
            // drafts themselves; an empty array means nothing was generated.
            if (options?.validate) {
                if (!options.validate(result)) {
                    toast(options?.validationMessage || `${label} could not be completed`, { icon: <FiInfo /> });
                    return false;
                }
                setFormData((prev) => (prev ? { ...prev, status: STEP_STATUS[targetStep] } : prev));
                // Sync the detail cache too — otherwise the next refetch reverts the optimistic status
                queryClient.setQueryData<Batch>(
                    batchKeys.detail(formData.id),
                    (old) => (old ? { ...old, status: STEP_STATUS[targetStep] } : old)
                );
                // Land on the live step's view — even when the status didn't change
                // (e.g. enriching pending accounts while already at the enrich step)
                applyViewStep(null);
                return true;
            }

            // Fast path: the action response itself may carry the updated batch status
            const resultStatus = (result as { status?: unknown } | null | undefined)?.status;
            if (
                typeof resultStatus === 'string' &&
                resultStatus !== startingStatus &&
                getStepIndex(getBatchStep(resultStatus)) >= targetIdx
            ) {
                setFormData((prev) => (prev ? { ...prev, status: resultStatus } : prev));
                // Sync the detail cache too — otherwise the next refetch reverts the optimistic status
                queryClient.setQueryData<Batch>(
                    batchKeys.detail(formData.id),
                    (old) => (old ? { ...old, status: resultStatus } : old)
                );
                applyViewStep(null);
                return true;
            }

            // Poll the batch detail until the backend confirms the target step —
            // succeeds when the status has actually changed and reached (or passed) it
            const deadline = transitionDeadline();
            while (now() < deadline) {
                if (cancelledRef.current) return false; // user left — stop silently
                const fresh = await batchApi.getBatch(formData.id);
                if (cancelledRef.current) return false;
                const stepIdx = getStepIndex(getBatchStep(fresh.status));
                if (fresh.status !== startingStatus && stepIdx >= targetIdx) {
                    // Confirmed — sync local formData and the query cache
                    setFormData((prev) => (prev ? { ...prev, status: fresh.status } : prev));
                    queryClient.setQueryData(batchKeys.detail(formData.id), fresh);
                    applyViewStep(null);
                    return true;
                }
                await new Promise((resolve) => setTimeout(resolve, TRANSITION_POLL_MS));
            }
            // Timed out — the step didn't confirm; the batch stays on its previous status.
            // The operation may still complete server-side — tell the user to refresh.
            toast(
                `${label} is taking longer than expected. It may still be running in the background — please refresh the page to see the latest status.`,
                { icon: <FiInfo />, duration: 8000 }
            );
            return false;
        } catch (error) {
            if (!cancelledRef.current) {
                toast.error(getErrorMessage(error));
            }
            return false;
        } finally {
            if (showOverlay) setTransitionLabel(null);
        }
    };

    const currentStep = getBatchStep(formData.status);

    // Transient override for viewing earlier steps (back navigation) — never mutates batch status.
    // Synced to the ?step= URL param so back-navigation from account/contact details
    // and reloads restore the exact flow view the user was seeing.
    const [searchParams, setSearchParams] = useSearchParams();
    const [viewStep, setViewStep] = useState<BatchFlowStep | null>(() => {
        const stepParam = searchParams.get('step');
        return stepParam && STEP_ORDER.includes(stepParam as BatchFlowStep) ? (stepParam as BatchFlowStep) : null;
    });
    const [prevStatus, setPrevStatus] = useState(formData.status);

    // Snap back to the live step whenever the batch advances (render-phase adjustment)
    if (prevStatus !== formData.status) {
        setPrevStatus(formData.status);
        setViewStep(null);
    }

    const applyViewStep = (step: BatchFlowStep | null) => {
        setViewStep(step);
        const next = new URLSearchParams(searchParams);
        if (step) next.set('step', step);
        else next.delete('step');
        setSearchParams(next, { replace: true });
    };

    const effectiveStep = viewStep ?? currentStep;

    // Never step back past "Explore Accounts" — the "Ready to find accounts" card
    // is only for batches that are still Drafted
    const canGoBack = getStepIndex(effectiveStep) > getStepIndex('executed');
    const handleBack = () => {
        if (canGoBack) {
            applyViewStep(STEP_ORDER[getStepIndex(effectiveStep) - 1]);
        }
    };

    // Only offered while viewing an earlier step — walks the view forward toward the live step
    const isViewingEarlierStep = effectiveStep !== currentStep;
    const handleGoForward = () => {
        const idx = getStepIndex(effectiveStep);
        if (idx < getStepIndex(currentStep)) {
            applyViewStep(STEP_ORDER[idx + 1]);
        }
    };

    const handleExplore = async () => {
        // Documented body only: batch_id, id, account_source, icp, max_results
        const payload = {
            batch_id: formData.id,
            id: formData.id,
            account_source: formData.account_source || undefined,
            icp: formData.icp,
            max_results: formData.max_results || 10,
        };
        const confirmed = await beginTransition(
            () => findAccounts.mutateAsync(payload),
            'executed',
            'Finding accounts'
        );
        if (confirmed) {
            toast.success('Accounts found');
        }
    };

    // Blocking loading state while a status transition is pending/being polled
    if (transitionLabel) {
        return (
            <div className="flex flex-col items-center justify-center gap-5 py-32 text-center">
                <div className="w-12 h-12 rounded-full border-4 border-border border-t-primary animate-spin" />
                <div className="flex flex-col gap-1">
                    <p className="font-sans font-semibold text-base text-fg">{transitionLabel}…</p>
                    <p className="font-sans text-sm text-fg-body">This may take a moment. We'll let you know as soon as it's done.</p>
                </div>
            </div>
        );
    }

    // Draft (explore step) shows the "Ready to find accounts" card — only while the batch is actually Drafted
    if (currentStep === 'explore') {
        return (
            <Card variant="elevated" className="flex flex-col gap-6">
                <h3 className="font-sans font-semibold text-lg tracking-tight text-fg">Accounts</h3>

                <div className="flex flex-col justify-center items-center gap-6 py-16 w-full max-w-[672px] mx-auto text-center">
                    <div className="flex justify-center items-center w-36 h-36 bg-bg-purple-50 rounded-xl">
                        <img src={bookmarkIcon} alt="Bookmark" className="w-24 h-24 object-contain" />
                    </div>

                    <div className="flex flex-col items-center gap-2">
                        <h3 className="font-sans font-bold text-2xl tracking-tight text-fg">
                            Ready to find your accounts?
                        </h3>
                        <p className="font-sans font-normal text-base text-fg-body">
                            Discover accounts that match your criteria and find the best opportunities for your sales goals.
                        </p>
                    </div>

                    <Button
                        variant="outline"
                        onClick={handleExplore}
                        isLoading={findAccounts.isPending}
                        disabled={findAccounts.isPending}
                    >
                        <FiSearch className="w-6 h-6" />
                        Explore Accounts
                    </Button>
                </div>
            </Card>
        );
    }

    // Each flow step renders its own view inside the tab
    switch (effectiveStep) {
        case 'executed':
            return (
                <ExploreAccountsView
                    batch={formData}
                    beginTransition={beginTransition}
                    onBack={canGoBack ? handleBack : undefined}
                />
            );
        case 'enrich':
            return (
                <EnrichAndRankView
                    batch={formData}
                    beginTransition={beginTransition}
                    onBack={canGoBack ? handleBack : undefined}
                />
            );
        case 'contacts':
            return (
                <BatchContactsView
                    batch={formData}
                    beginTransition={beginTransition}
                    onBack={canGoBack ? handleBack : undefined}
                    onGoForward={isViewingEarlierStep ? handleGoForward : undefined}
                />
            );
        case 'draft':
            return <DraftMessagesView batch={formData} beginTransition={beginTransition} onBack={canGoBack ? handleBack : undefined} onGoForward={isViewingEarlierStep ? handleGoForward : undefined} />;
        case 'outreached':
            return (
                <ContactsFetchedView
                    batch={formData}
                    beginTransition={beginTransition}
                />
            );
        default:
            return <DraftMessagesView batch={formData} beginTransition={beginTransition} onBack={canGoBack ? handleBack : undefined} onGoForward={isViewingEarlierStep ? handleGoForward : undefined} />;
    }
};


