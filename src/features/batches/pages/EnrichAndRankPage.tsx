import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { WithNavbar } from '@/shared/components/hoc/WithNavbar';
import { Button, InputField, Modal } from '@/shared/components/ui';
import { FiArrowLeft, FiArrowRight, FiSearch, FiX, FiTrash2 } from 'react-icons/fi';
import { RiSearchAi3Line } from "react-icons/ri";
import { useBatchAccounts } from '@/features/batches/hooks/useBatchAccounts';
import { useDeleteBatchAccount } from '@/features/batches/hooks/useDeleteBatchAccount';
import { useFindBatchContacts } from '@/features/batches/hooks/useFindBatchContacts';
import { useBatch } from '@/features/batches/hooks/useBatch';
import { isStepAtLeast, getStatusRoute } from '@/features/batches/utils/batchFlow';
import { AccountCardSkeleton } from '@/features/batches/components/AccountCardSkeleton';
import { AccountStatusBadge } from '@/features/batches/components/AccountStatusBadge';
import type { Account } from '@/features/batches/types/batchTypes';
import toast from 'react-hot-toast';
import { getErrorMessage } from '@/shared/utils/errorHandler';

const EnrichAndRankPage: React.FC = () => {
    const { batchId } = useParams<{ batchId: string }>();
    const navigate = useNavigate();

    const { data: accounts, isLoading } = useBatchAccounts(batchId || '');
    const { data: batch, isLoading: isLoadingBatch } = useBatch(batchId || '');
    const deleteAccount = useDeleteBatchAccount(batchId || '');
    const findContacts = useFindBatchContacts(batchId || '');

    // Past viewing allowed: this page requires at least 'enrich' (Enriched).
    // If status is still Draft/Executed (before enrich), redirect to canonical (explore).
    // If status is already past enrich (contacts/draft/outreached), user can still view via back button but primary action becomes navigation.
    useEffect(() => {
        if (!batch || !batchId) return;
        if (!isStepAtLeast(batch.status, 'enrich')) {
            navigate(getStatusRoute(batchId, batch.status), { replace: true });
        }
    }, [batch, batchId, navigate]);

    const isPastContacts = isStepAtLeast(batch?.status, 'contacts');

    const [searchQuery, setSearchQuery] = useState('');
    const [accountToDelete, setAccountToDelete] = useState<Account | null>(null);

    const filteredAccounts = accounts?.filter(account => {
        const lowerCaseQuery = searchQuery.toLowerCase();
        return (
            account.name.toLowerCase().includes(lowerCaseQuery) ||
            account.domain.toLowerCase().includes(lowerCaseQuery)
        );
    }) || [];

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
        if (!accounts || accounts.length === 0) {
            toast.error("No accounts to find contacts for");
            return;
        }
        try {
            const accountIds = accounts.map((a) => a.id);
            await findContacts.mutateAsync({ account_ids: accountIds });
            toast.success("Contacts search started");
            navigate(`/batches/${batchId}/contacts`);
        } catch (error) {
            toast.error(getErrorMessage(error));
        }
    };

    return (
        <div className="w-full pb-12">
            {/* Hero Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
                <div className="flex items-center gap-3">
                    <button onClick={() => navigate(`/batches/${batchId}/accounts`)} className="p-1.5 rounded-md text-fg hover:bg-bg-muted transition-colors">
                        <FiArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h2 className="font-sans font-bold text-xl sm:text-2xl tracking-tight text-fg">Enrich & Rank Accounts</h2>
                        <p className="font-sans font-medium text-sm text-fg-body mt-1">
                            Showing {filteredAccounts.length} accounts from batch
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-4 w-full sm:w-auto">
                    <Button
                        variant="outline"
                        className="w-full sm:w-auto"
                        onClick={() => navigate(`/batches/${batchId}/accounts`)}
                    >
                        <FiArrowLeft className="w-4 h-4" />
                        Explore Accounts
                    </Button>
                    {isPastContacts ? (
                        <Button
                            variant="outline"
                            className="w-full sm:w-auto"
                            onClick={() => navigate(`/batches/${batchId}/contacts`)}
                        >
                            View Contacts
                            <FiArrowRight className="w-4 h-4" />
                        </Button>
                    ) : (
                        <Button
                            variant="gradient"
                            className="w-full sm:w-auto"
                            onClick={handleFindContacts}
                            isLoading={findContacts.isPending}
                            disabled={findContacts.isPending}
                        >
                            <RiSearchAi3Line className="w-4 h-4" />
                            Find Contacts
                            <FiArrowRight className="w-4 h-4" />
                        </Button>
                    )}
                </div>
            </div>

            {/* Controllers */}
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-6">
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
            {isLoading || isLoadingBatch ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <AccountCardSkeleton key={i} />
                    ))}
                </div>
            ) : filteredAccounts.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-center border border-dashed border-border rounded-xl">
                    <FiSearch className="w-10 h-10 text-fg-muted mb-4" />
                    <p className="text-fg-body font-medium">No accounts found matching "{searchQuery}"</p>
                    <button
                        className="text-sm text-primary hover:underline mt-2"
                        onClick={() => setSearchQuery('')}
                    >
                        Clear search
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredAccounts.map((account) => {
                        // FIX: Check for 'error' and 'processing' (case-insensitive)
                        const lowerStatus = account.status?.toLowerCase() || '';
                        const batchLower = (batch?.status || '').toLowerCase();
                        const isExecutedPhase = batchLower === 'executed';
                        const isDisabled = lowerStatus === 'error' || lowerStatus === 'processing' || isExecutedPhase;

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
                                        title={isExecutedPhase ? 'Company details unavailable until enrichment — enrich first' : undefined}
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

export default WithNavbar(EnrichAndRankPage);