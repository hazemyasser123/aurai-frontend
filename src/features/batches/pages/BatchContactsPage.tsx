import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { WithNavbar } from '@/shared/components/hoc/WithNavbar';
import { Button, Modal, InputField } from '@/shared/components/ui';
import { FiArrowLeft, FiArrowRight } from 'react-icons/fi';
import { useBatchAccounts } from '@/features/batches/hooks/useBatchAccounts';
import { useBatchContacts } from '@/features/batches/hooks/useBatchContacts';
import { useDraftOutreach } from '@/features/batches/hooks/useDraftOutreach';
import { useBatch } from '@/features/batches/hooks/useBatch';
import { isStepAtLeast, getStatusRoute } from '@/features/batches/utils/batchFlow';
import { AccountContactsSection } from '@/features/batches/components/AccountContactsSection';
import type { Contact } from '@/features/batches/types/batchTypes';
import toast from 'react-hot-toast';
import { getErrorMessage } from '@/shared/utils/errorHandler';

const BatchContactsPage: React.FC = () => {
    const { batchId } = useParams<{ batchId: string }>();
    const navigate = useNavigate();

    const { data: accounts, isLoading: isLoadingAccounts } = useBatchAccounts(batchId || '');
    const { data: contacts, isLoading: isLoadingContacts } = useBatchContacts(batchId || '');
    const { data: batch, isLoading: isLoadingBatch } = useBatch(batchId || '');

    // Past viewing allowed: requires at least 'contacts' (contacts fetched).
    // If status is still Draft/Executed/Enriched (before contacts), redirect to canonical.
    useEffect(() => {
        if (!batch || !batchId) return;
        if (!isStepAtLeast(batch.status, 'contacts')) {
            navigate(getStatusRoute(batchId, batch.status), { replace: true });
        }
    }, [batch, batchId, navigate]);

    const isPastDraft = isStepAtLeast(batch?.status, 'draft');

    const [contactToView, setContactToView] = useState<Contact | null>(null);
    const draftOutreach = useDraftOutreach(batchId || '');

    const handleDraftMessages = async () => {
        if (!contacts || contacts.length === 0) {
            toast.error('No contacts to draft messages for');
            return;
        }
        try {
            // POST /batches/{id}/outreach/draft per spec — draft for all contacts in batch
            await draftOutreach.mutateAsync(contacts.map((c) => c.id));
            toast.success('Drafts created');
            navigate(`/batches/${batchId}/draft`);
        } catch (e) {
            toast.error(getErrorMessage(e));
        }
    };

    // Group contacts by account_id
    const groupedData = useMemo(() => {
        if (!accounts || !contacts) return [];

        return accounts.map(account => ({
            ...account,
            contacts: contacts.filter(c => c.account_id === account.id)
        }));
    }, [accounts, contacts]);

    const isLoading = isLoadingAccounts || isLoadingContacts || isLoadingBatch;
    const totalContacts = contacts?.length || 0;
    const totalAccounts = accounts?.length || 0;

    if (isLoading) {
        return (
            <div className="w-full pb-12 max-w-[1120px] mx-auto">
                <div className="h-12 bg-bg-sidebar rounded-xl animate-pulse mb-8"></div>
                <div className="h-64 bg-bg-sidebar rounded-xl animate-pulse mb-6"></div>
                <div className="h-64 bg-bg-sidebar rounded-xl animate-pulse mb-6"></div>
            </div>
        );
    }

    return (
        <div className="w-full pb-12 max-w-[1120px] mx-auto">
            {/* Hero Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
                <div className="flex items-center gap-3">
                    <button onClick={() => navigate(`/batches/${batchId}/accounts/enrich`)} className="p-1.5 rounded-md text-fg hover:bg-bg-muted transition-colors">
                        <FiArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h2 className="font-sans font-bold text-xl sm:text-2xl tracking-tight text-fg">Batch Contacts</h2>
                        <p className="font-sans font-medium text-sm text-fg-body mt-1">
                            {totalContacts} enriched contact(s) across {totalAccounts} account(s)
                        </p>
                    </div>
                </div>
                {isPastDraft ? (
                    <Button
                        variant="outline"
                        className="w-full sm:w-auto"
                        onClick={() => navigate(`/batches/${batchId}/draft`)}
                    >
                        View Drafts
                        <FiArrowRight className="w-4 h-4" />
                    </Button>
                ) : (
                    <Button
                        variant="gradient"
                        className="w-full sm:w-auto"
                        onClick={handleDraftMessages}
                        isLoading={draftOutreach.isPending}
                        disabled={draftOutreach.isPending || totalContacts === 0}
                    >
                        Draft Messages
                        <FiArrowRight className="w-4 h-4" />
                    </Button>
                )}
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
                        onViewDetails={setContactToView}
                    />
                ))
            )}

            {/* View Details Modal */}
            <Modal
                isOpen={!!contactToView}
                onClose={() => setContactToView(null)}
                title="Contact Details"
            >
                <div className="flex flex-col gap-4">
                    <div className="grid grid-cols-2 gap-4">
                        <InputField label="First Name" value={contactToView?.first_name || ''} readOnly />
                        <InputField label="Last Name" value={contactToView?.last_name || ''} readOnly />
                    </div>
                    <InputField label="Title" value={contactToView?.title || ''} readOnly />
                    <InputField label="Email" value={contactToView?.primary_email || 'N/A'} readOnly />
                    <InputField label="Phone" value={contactToView?.primary_phone || 'N/A'} readOnly />
                    <InputField label="LinkedIn URL" value={contactToView?.linkedin_url || 'N/A'} readOnly />
                    <div className="flex justify-end mt-4">
                        <Button variant="outline" onClick={() => setContactToView(null)}>Close</Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default WithNavbar(BatchContactsPage);