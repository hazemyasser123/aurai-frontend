import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, InputField, Modal } from '@/shared/components/ui';
import { FiArrowRight, FiArrowLeft, FiSearch, FiX, FiTrash2, FiInfo } from 'react-icons/fi';
import { RiSearchAi3Line } from "react-icons/ri";
import { useBatchAccounts } from '@/features/batches/hooks/useBatchAccounts';
import { useDeleteBatchAccount } from '@/features/batches/hooks/useDeleteBatchAccount';
import { useFindBatchContacts } from '@/features/batches/hooks/useFindBatchContacts';
import { AccountCardSkeleton } from '@/features/batches/components/AccountCardSkeleton';
import { AccountStatusBadge } from '@/features/batches/components/AccountStatusBadge';
import type { BeginTransition } from '@/features/batches/utils/batchFlow';
import type { Batch } from '@/features/batches/types/batchTypes';
import type { Account } from '@/features/batches/types/batchTypes';
import toast from 'react-hot-toast';
import { getErrorMessage } from '@/shared/utils/errorHandler';

// Polling cadence + cap shared with the other flow polls
const POLLING_TIMEOUT_MS = 180000;
const pollNow = () => Date.now();

interface Props {
    batch: Batch;
    /** Runs an action and polls the batch until the target step is confirmed (loading state handled by the tab) */
    beginTransition: BeginTransition;
    /** Go back to the previous flow step (view only — does not change batch status) */
    onBack?: () => void;
}

export const EnrichAndRankView: React.FC<Props> = ({ batch, beginTransition, onBack }) => {
    const batchId = batch.id;
    const navigate = useNavigate();

    // Keep polling while any account is still processing the enrichment —
    // every 5s, capped at 3 minutes, then a graceful "refresh the page" message
    const processingDeadlineRef = useRef<number | null>(null);
    const { data: accounts, isLoading } = useBatchAccounts(batchId, {
        refetchInterval: (query) => {
            const list = query.state.data as Account[] | undefined;
            const stillProcessing = list?.some((a) => (a.status || '').toLowerCase() === 'processing');
            if (!stillProcessing) {
                processingDeadlineRef.current = null;
                return false;
            }
            const nowMs = pollNow();
            if (processingDeadlineRef.current === null) {
                processingDeadlineRef.current = nowMs + POLLING_TIMEOUT_MS;
            } else if (nowMs > processingDeadlineRef.current) {
                processingDeadlineRef.current = null;
                toast(
                    'Enrichment is taking longer than usual. It may still be running in the background — please refresh the page to see the latest status.',
                    { icon: <FiInfo />, duration: 8000 }
                );
                return false;
            }
            return 5000;
        },
    });
    const deleteAccount = useDeleteBatchAccount(batchId);
    const findContacts = useFindBatchContacts(batchId);

    const [searchQuery, setSearchQuery] = useState('');
    const [accountToDelete, setAccountToDelete] = useState<Account | null>(null);

    // Past the explore step — accounts without a status (not yet enriched) are ignored
    const visibleAccounts = (accounts || []).filter((a) => a.status);

    // Accounts still going through enrichment
    const processingCount = (accounts || []).filter((a) => (a.status || '').toLowerCase() === 'processing').length;
    const isProcessing = processingCount > 0;

    const filteredAccounts = visibleAccounts.filter(account => {
        const lowerCaseQuery = searchQuery.toLowerCase();
        return (
            account.name.toLowerCase().includes(lowerCaseQuery) ||
            account.domain.toLowerCase().includes(lowerCaseQuery)
        );
    });

    const handleConfirmDelete = async () => {
        if (!accountToDelete) return;
        try {
            await deleteAccount.mutateAsync(accountToDelete.id);
            toast.success("Account deleted successfully");
            setAccountToDelete(null);
        } catch (error) {
            toast.error(getErrorMessage(error));
        }
    };

    const handleFindContacts = async () => {
        if (isProcessing) return;
        if (visibleAccounts.length === 0) {
            toast.error("No accounts to find contacts for");
            return;
        }
        // Only enriched (non-null-status) accounts are sent — pending ones are ignored.
        // Sends the batch's contact source + local ICP/Product Intelligence copies.
        const accountIds = visibleAccounts.map((a) => a.id);
        await beginTransition(
            () => findContacts.mutateAsync({
                account_ids: accountIds,
                contact_source: batch.contact_source || undefined,
                icp: batch.icp,
                product_analysis: batch.product_analysis,
            }),
            'contacts',
            'Finding contacts'
        );
    };

    return (
        <div className="flex flex-col gap-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-3">
                    {onBack && (
                        <button onClick={onBack} title="Back to Explore Accounts" aria-label="Go back" className="p-1.5 rounded-md text-fg hover:bg-bg-muted transition-colors">
                            <FiArrowLeft className="w-5 h-5" />
                        </button>
                    )}
                    <div>
                        <h2 className="font-sans font-bold text-xl sm:text-2xl tracking-tight text-fg">Enrich & Rank Accounts</h2>
                        <p className="font-sans font-medium text-sm text-fg-body mt-1">
                            Showing {filteredAccounts.length} accounts from batch
                        </p>
                    </div>
                </div>
                {/* Always the real Find Contacts CTA — it runs the contacts pipeline
                    for all enriched account ids */}
                <Button
                    variant="gradient"
                    className="w-full sm:w-auto"
                    onClick={handleFindContacts}
                    isLoading={findContacts.isPending}
                    disabled={findContacts.isPending || isProcessing}
                >
                    <RiSearchAi3Line className="w-4 h-4" />
                    Find Contacts
                    <FiArrowRight className="w-4 h-4" />
                </Button>
            </div>

            {/* Controllers */}
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                <h3 className="font-sans font-medium text-xl text-fg whitespace-nowrap">Accounts ({filteredAccounts.length})</h3>
                <div className="relative w-full md:max-w-md">
                    <InputField
                        placeholder="Search accounts"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 pr-10 rounded-full"
                    />
                    <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-fg-body" />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-fg-body hover:text-fg transition-colors"
                        >
                            <FiX className="w-5 h-5" />
                        </button>
                    )}
                </div>
            </div>

            {/* Account Cards Grid */}
            {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <AccountCardSkeleton key={i} />
                    ))}
                </div>
            ) : filteredAccounts.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-center border border-dashed border-border rounded-xl">
                    <FiSearch className="w-10 h-10 text-fg-muted mb-4" />
                    {searchQuery ? (
                        <>
                            <p className="text-fg-body font-medium">No accounts found matching "{searchQuery}"</p>
                            <button
                                className="text-sm text-primary hover:underline mt-2"
                                onClick={() => setSearchQuery('')}
                            >
                                Clear search
                            </button>
                        </>
                    ) : (
                        <p className="text-fg-body font-medium">No accounts yet — go back to Explore Accounts to add some.</p>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredAccounts.map((account) => {
                        // FIX: Check for 'error' and 'processing' (case-insensitive)
                        const lowerStatus = account.status?.toLowerCase() || '';
                        const isDisabled = lowerStatus === 'error' || lowerStatus === 'processing';

                        return (
                            <div key={account.id} className="bg-bg-sidebar border border-border rounded-xl p-6 flex flex-col gap-6 relative hover:shadow-card transition-shadow min-h-[177px]">
                                {/* Top Section */}
                                <div className="flex items-center gap-4">
                                    {account.logo_url ? (
                                        <img
                                            src={account.logo_url}
                                            alt={account.name}
                                            className="w-14 h-14 rounded-xl object-cover flex-shrink-0 bg-bg-purple-50"
                                        />
                                    ) : (
                                        <div className="w-14 h-14 bg-bg-purple-50 rounded-xl flex items-center justify-center flex-shrink-0">
                                            <span className="font-sans font-bold text-xl text-primary">
                                                {account.name.charAt(0)}
                                            </span>
                                        </div>
                                    )}

                                    <div className="flex flex-col gap-1 flex-1 min-w-0">
                                        <h4 className="font-sans font-semibold text-base text-fg truncate">{account.name}</h4>
                                        <p className="font-sans font-medium text-sm text-fg-body truncate">{account.domain}</p>
                                        <p className="font-sans font-medium text-xs text-fg-muted">ID: {account.id}</p>
                                    </div>
                                </div>

                                {/* Divider */}
                                <div className="border-t border-border my-1"></div>

                                {/* Footer Section */}
                                <div className="flex items-center justify-between mt-auto">
                                    <Button
                                        variant="ghost"
                                        className="py-1 px-2 h-8 text-xs"
                                        disabled={isDisabled}
                                        onClick={() => navigate(`/batches/${batchId}/accounts/${account.id}`)}
                                    >
                                        View Full Details
                                        <FiArrowRight className="w-3 h-3" />
                                    </Button>

                                    <AccountStatusBadge status={account.status} />
                                </div>

                                {/* Delete Button */}
                                <button
                                    className="absolute top-3 right-3 p-1.5 rounded-md bg-bg-card hover:bg-danger-bg hover:text-danger transition-colors text-fg-body"
                                    onClick={() => setAccountToDelete(account)}
                                >
                                    <FiTrash2 className="w-4 h-4" />
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={!!accountToDelete}
                onClose={() => setAccountToDelete(null)}
                title="Delete Account?"
            >
                <div className="flex flex-col gap-4">
                    <p className="font-sans font-normal text-sm text-fg-body leading-relaxed">
                        Are you sure you want to remove <span className="font-semibold text-fg">{accountToDelete?.name}</span> from this batch? This action cannot be undone.
                    </p>
                    <div className="flex justify-end gap-3 mt-4">
                        <Button variant="outline" onClick={() => setAccountToDelete(null)}>Cancel</Button>
                        <Button
                            variant="danger"
                            isLoading={deleteAccount.isPending}
                            onClick={handleConfirmDelete}
                        >
                            Delete
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

