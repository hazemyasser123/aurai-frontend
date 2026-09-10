import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/shared/components/ui';
import { FiArrowLeft, FiArrowRight } from 'react-icons/fi';
import { useBatchAccounts, useIgnoredAccountIds } from '@/features/batches/hooks/useBatchAccounts';
import { useBatchContacts } from '@/features/batches/hooks/useBatchContacts';
import { useBatchOutreach } from '@/features/batches/hooks/useBatchOutreach';
import { useDraftOutreach } from '@/features/batches/hooks/useDraftOutreach';
import { AccountContactsSection } from '@/features/batches/components/AccountContactsSection';
import { STEP_LABELS } from '@/features/batches/utils/batchFlow';
import type { BeginTransition } from '@/features/batches/utils/batchFlow';
import type { Batch } from '@/features/batches/types/batchTypes';
import toast from 'react-hot-toast';

interface Props {
    batch: Batch;
    /** Runs an action and polls the batch until the target step is confirmed (loading state handled by the tab) */
    beginTransition: BeginTransition;
    /** Go back to the previous flow step (view only — does not change batch status) */
    onBack?: () => void;
    /** Present when viewing an earlier step than the batch's current step — advances the view forward instead of re-running the action */
    onGoForward?: () => void;
}

export const BatchContactsView: React.FC<Props> = ({ batch, beginTransition, onBack, onGoForward }) => {
    const batchId = batch.id;
    const navigate = useNavigate();
    const { data: accounts, isLoading: isLoadingAccounts } = useBatchAccounts(batchId);
    const { data: contacts, isLoading: isLoadingContacts } = useBatchContacts(batchId);
    const { data: ignoredAccountIds } = useIgnoredAccountIds(batchId);
    const { data: outreach } = useBatchOutreach(batchId);
    // The local Product Intelligence copy — sent with the draft request
    const draftOutreach = useDraftOutreach(batchId, batch.product_analysis);

    // View Details opens the full contact details page (GET /contacts/{id})
    const handleViewDetails = (contactId: string) => {
        navigate(`/contacts/${contactId}?batchId=${batchId}`);
    };

    // Contacts tied to Ignored accounts are excluded everywhere — display and drafts
    const visibleContacts = useMemo(
        () => contacts?.filter((c) => !ignoredAccountIds?.includes(c.account_id)),
        [contacts, ignoredAccountIds]
    );

    // Contacts that already have a drafted/sent conversation — locked, not re-draftable
    const draftedContactIds = useMemo(
        () => new Set((outreach || []).map((c) => c.contact_id).filter(Boolean)),
        [outreach]
    );

    // The contacts the next draft run will cover: selected (recommended), not yet drafted
    const selectedContactIds = useMemo(
        () => (visibleContacts || [])
            .filter((c) => c.is_recommended && !draftedContactIds.has(c.id))
            .map((c) => c.id),
        [visibleContacts, draftedContactIds]
    );

    // Draft only the selected contacts — never everything.
    // The draft response itself confirms the step: empty array → nothing was
    // generated (info toast, no status change); drafts → 'emails drafted'.
    const handleDraftMessages = async () => {
        if (selectedContactIds.length === 0) {
            toast.error('No selected contacts to draft messages for');
            return;
        }
        await beginTransition(
            () => draftOutreach.mutateAsync(selectedContactIds),
            'draft',
            'Drafting messages',
            {
                validate: (result) => Array.isArray(result) && result.length > 0,
                validationMessage: 'Unable to generate message drafts',
            }
        );
    };

    // Group contacts by account_id
    const groupedData = useMemo(() => {
        if (!accounts || !visibleContacts) return [];

        return accounts.map(account => ({
            ...account,
            contacts: visibleContacts.filter(c => c.account_id === account.id)
        }));
    }, [accounts, visibleContacts]);

    const isLoading = isLoadingAccounts || isLoadingContacts;
    const totalContacts = visibleContacts?.length || 0;
    const totalAccounts = accounts?.length || 0;

    if (isLoading) {
        return (
            <div className="flex flex-col gap-6">
                <div className="h-12 bg-bg-sidebar rounded-xl animate-pulse"></div>
                <div className="h-64 bg-bg-sidebar rounded-xl animate-pulse"></div>
                <div className="h-64 bg-bg-sidebar rounded-xl animate-pulse"></div>
            </div>
        );
    }

    // The CTA adapts to the selection: with selected contacts it drafts them;
    // without any, it's just navigation to the drafts step
    const cta = onGoForward ? (
        selectedContactIds.length > 0 ? (
            <Button
                variant="outline"
                className="w-full sm:w-auto"
                onClick={handleDraftMessages}
                isLoading={draftOutreach.isPending}
                disabled={draftOutreach.isPending}
            >
                Draft Messages ({selectedContactIds.length})
            </Button>
        ) : (
            <Button
                variant="outline"
                className="w-full sm:w-auto"
                onClick={onGoForward}
            >
                Go to {STEP_LABELS.draft}
                <FiArrowRight className="w-4 h-4" />
            </Button>
        )
    ) : (
        <Button
            variant="gradient"
            className="w-full sm:w-auto"
            onClick={handleDraftMessages}
            isLoading={draftOutreach.isPending}
            disabled={draftOutreach.isPending || selectedContactIds.length === 0}
        >
            Draft Messages{selectedContactIds.length > 0 ? ` (${selectedContactIds.length})` : ''}
        </Button>
    );

    return (
        <div className="flex flex-col gap-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-3">
                    {onBack && (
                        <button onClick={onBack} title="Back to Enrich & Rank" aria-label="Go back" className="p-1.5 rounded-md text-fg hover:bg-bg-muted transition-colors">
                            <FiArrowLeft className="w-5 h-5" />
                        </button>
                    )}
                    <div>
                        <h2 className="font-sans font-bold text-xl sm:text-2xl tracking-tight text-fg">Batch Contacts</h2>
                        <p className="font-sans font-medium text-sm text-fg-body mt-1">
                            {totalContacts} enriched contact(s) across {totalAccounts} account(s)
                        </p>
                    </div>
                </div>
                {cta}
            </div>

            {/* Account Sections */}
            {groupedData.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-center border border-dashed border-border rounded-xl">
                    <p className="text-fg-body font-medium">No contacts found for this batch.</p>
                </div>
            ) : (
                groupedData.map(group => (
                    <AccountContactsSection
                        key={group.id}
                        account={group}
                        contacts={group.contacts}
                        batchId={batchId}
                        draftedContactIds={draftedContactIds}
                        onViewDetails={(contact) => handleViewDetails(contact.id)}
                    />
                ))
            )}
        </div>
    );
};
