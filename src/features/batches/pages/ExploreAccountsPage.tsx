import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { WithNavbar } from '@/shared/components/hoc/WithNavbar';
import { Button, InputField, Modal, Textarea } from '@/shared/components/ui';
import { FiArrowLeft, FiSearch, FiPlus, FiTrash2, FiExternalLink, FiArrowRight, FiX } from 'react-icons/fi';
import { useBatchAccounts } from '@/features/batches/hooks/useBatchAccounts';
import { useDeleteBatchAccount } from '@/features/batches/hooks/useDeleteBatchAccount';
import { useAddBatchAccount } from '@/features/batches/hooks/useAddBatchAccount';
import { useFetchMoreAccounts } from '@/features/batches/hooks/useFetchMoreAccounts';
import { useEnrichAndEvaluateAccounts } from '@/features/batches/hooks/useEnrichAndEvaluateAccounts';
import { AccountCardSkeleton } from '@/features/batches/components/AccountCardSkeleton';
import type { Account } from '@/features/batches/types/batchTypes';
import toast from 'react-hot-toast';
import { getErrorMessage } from '@/shared/utils/errorHandler';

const ExploreAccountsPage: React.FC = () => {
    const { batchId } = useParams<{ batchId: string }>();
    const navigate = useNavigate();

    const { data: accounts, isLoading } = useBatchAccounts(batchId || '');
    const deleteAccount = useDeleteBatchAccount(batchId || '');
    const addAccount = useAddBatchAccount(batchId || '');
    const fetchMore = useFetchMoreAccounts(batchId || '');
    const enrichMutation = useEnrichAndEvaluateAccounts(batchId || '');

    const [searchQuery, setSearchQuery] = useState('');
    const [accountToDelete, setAccountToDelete] = useState<Account | null>(null);

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [domainsInput, setDomainsInput] = useState('');

    const isFetchingMore = fetchMore.isPending;

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

    const handleAddAccount = async () => {
        const domains = domainsInput.split(/[\s,]+/).map(d => d.trim()).filter(Boolean);
        if (domains.length === 0) {
            toast.error("Please enter at least one domain.");
            return;
        }

        try {
            await addAccount.mutateAsync({ domains });
            toast.success("Accounts added successfully!");
            setIsAddModalOpen(false);
            setDomainsInput('');
        } catch (error) {
            toast.error(getErrorMessage(error));
        }
    };

    const handleFindMore = async () => {
        try {
            await fetchMore.mutateAsync({ count_to_add: 10 });
            toast.success("New accounts fetched successfully!");
        } catch (error) {
            toast.error(getErrorMessage(error));
        }
    };

    // New: Handle Enrich & Rank API call
    const handleEnrichAndRank = async () => {
        if (!accounts || accounts.length === 0) {
            toast.error("There are no accounts to enrich.");
            return;
        }

        const accountIds = accounts.map(acc => acc.id);

        try {
            await enrichMutation.mutateAsync({ account_ids: accountIds });
            toast.success("Enrichment & Ranking process started!");
            navigate(`/batches/${batchId}/accounts/enrich`);
        } catch (error) {
            toast.error(getErrorMessage(error));
        }
    };

    const handleExportCSV = () => {
        if (filteredAccounts.length === 0) {
            toast.error("There are no accounts to export.");
            return;
        }

        const headers = ["ID", "Name", "Domain", "Status", "Logo URL"];
        const rows = filteredAccounts.map(acc => [
            `"${acc.id}"`,
            `"${acc.name.replace(/"/g, '""')}"`,
            `"${acc.domain}"`,
            `"${acc.status}"`,
            `"${acc.logo_url || ''}"`
        ].join(","));

        const csvContent = [headers.join(","), ...rows].join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `batch_${batchId}_accounts.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        toast.success("CSV exported successfully!");
    };

    return (
        <div className="w-full pb-12">
            {/* Hero Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
                <div className="flex items-center gap-3">
                    <button onClick={() => navigate(`/batches/${batchId}`)} className="p-1.5 rounded-md text-fg hover:bg-bg-muted transition-colors">
                        <FiArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h2 className="font-sans font-bold text-xl sm:text-2xl tracking-tight text-fg">Explore Accounts</h2>
                        <p className="font-sans font-medium text-sm text-fg-body mt-1">
                            Showing {filteredAccounts.length} accounts from batch
                        </p>
                    </div>
                </div>
                <Button
                    variant="gradient"
                    className="w-full sm:w-auto"
                    disabled={isFetchingMore || !accounts || accounts.length === 0}
                    isLoading={enrichMutation.isPending}
                    onClick={handleEnrichAndRank}
                >
                    Enrich & Rank
                    <FiArrowRight className="w-4 h-4" />
                </Button>
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
                <div className="flex items-center gap-3 w-full md:w-auto md:ml-auto">
                    <Button
                        variant="outline"
                        className="py-2 px-3 h-10"
                        onClick={() => setIsAddModalOpen(true)}
                        disabled={isFetchingMore}
                    >
                        <FiPlus className="w-4 h-4" />
                        Add Account
                    </Button>

                    <Button
                        variant="outline"
                        className="py-2 px-3 h-10"
                        isLoading={isFetchingMore}
                        onClick={handleFindMore}
                        disabled={addAccount.isPending}
                    >
                        <FiSearch className="w-4 h-4" />
                        Find More
                    </Button>

                    <Button
                        variant="outline"
                        className="py-2 px-3 h-10"
                        onClick={handleExportCSV}
                        disabled={isFetchingMore || filteredAccounts.length === 0}
                    >
                        <FiExternalLink className="w-4 h-4" />
                        Export CSV
                    </Button>
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
                    <p className="text-fg-body font-medium">No accounts found matching "{searchQuery}"</p>
                    <button
                        className="text-sm text-primary hover:underline mt-2"
                        onClick={() => setSearchQuery('')}
                    >
                        Clear search
                    </button>
                </div>
            ) : (
                <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 ${isFetchingMore ? 'pointer-events-none opacity-60' : ''}`}>
                    {filteredAccounts.map((account) => (
                        <div key={account.id} className="bg-bg-sidebar border border-border rounded-xl p-6 flex items-center gap-4 relative hover:shadow-card transition-shadow">
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

                            <button
                                className="absolute top-3 right-3 p-1.5 rounded-md bg-bg-card hover:bg-danger-bg hover:text-danger transition-colors text-fg-body disabled:cursor-not-allowed"
                                onClick={() => setAccountToDelete(account)}
                                disabled={isFetchingMore}
                            >
                                <FiTrash2 className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
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

            {/* Add Account Modal */}
            <Modal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                title="Add Manual Accounts"
            >
                <div className="flex flex-col gap-4">
                    <p className="font-sans font-normal text-sm text-fg-body leading-relaxed">
                        Enter the domains of the companies you want to add to this batch. Separate multiple domains by commas or new lines.
                    </p>
                    <Textarea
                        label="DOMAINS *"
                        placeholder="e.g., google.com, microsoft.com"
                        value={domainsInput}
                        onChange={(e) => setDomainsInput(e.target.value)}
                        rows={4}
                    />
                    <div className="flex justify-end gap-3 mt-4">
                        <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
                        <Button
                            variant="primary"
                            isLoading={addAccount.isPending}
                            onClick={handleAddAccount}
                        >
                            Add Accounts
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default WithNavbar(ExploreAccountsPage);