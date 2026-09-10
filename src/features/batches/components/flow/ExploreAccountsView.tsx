import React, { useState } from 'react';
import { Button, InputField, Modal } from '@/shared/components/ui';
import { FiSearch, FiPlus, FiTrash2, FiExternalLink, FiArrowRight, FiArrowLeft, FiX, FiInfo } from 'react-icons/fi';
import { useBatchAccounts } from '@/features/batches/hooks/useBatchAccounts';
import { useDeleteBatchAccount } from '@/features/batches/hooks/useDeleteBatchAccount';
import { useAddBatchAccount } from '@/features/batches/hooks/useAddBatchAccount';
import { useFetchMoreAccounts } from '@/features/batches/hooks/useFetchMoreAccounts';
import { filterNewAccounts } from '@/features/batches/hooks/useFetchMoreAccounts';
import { useEnrichAndEvaluateAccounts } from '@/features/batches/hooks/useEnrichAndEvaluateAccounts';
import { useSearchAccountCandidates } from '@/features/batches/hooks/useSearchAccountCandidates';
import { AccountCardSkeleton } from '@/features/batches/components/AccountCardSkeleton';
import type { Account, AccountCandidate, Batch } from '@/features/batches/types/batchTypes';
import type { BeginTransition } from '@/features/batches/utils/batchFlow';
import { FindMoreAccountsModal } from '@/features/batches/components/flow/FindMoreAccountsModal';
import toast from 'react-hot-toast';
import { getErrorMessage } from '@/shared/utils/errorHandler';

interface Props {
    batch: Batch;
    /** Runs an action and polls the batch until the target step is confirmed (loading state handled by the tab) */
    beginTransition: BeginTransition;
    /** Go back to the previous flow step (view only — does not change batch status) */
    onBack?: () => void;
}

export const ExploreAccountsView: React.FC<Props> = ({ batch, beginTransition, onBack }) => {
    const batchId = batch.id;
    const { data: accounts, isLoading } = useBatchAccounts(batchId);
    const deleteAccount = useDeleteBatchAccount(batchId);
    const addAccount = useAddBatchAccount(batchId);
    const fetchMore = useFetchMoreAccounts(batchId);
    const enrichMutation = useEnrichAndEvaluateAccounts(batchId);
    const searchCandidates = useSearchAccountCandidates(batchId);

    const [searchQuery, setSearchQuery] = useState('');
    const [accountToDelete, setAccountToDelete] = useState<Account | null>(null);

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [domain, setDomain] = useState('');
    const [searchResults, setSearchResults] = useState<AccountCandidate[]>([]);
    const [hasSearched, setHasSearched] = useState(false);
    const [selectedDomains, setSelectedDomains] = useState<Set<string>>(new Set());

    const [isFindMoreOpen, setIsFindMoreOpen] = useState(false);
    // Accounts fetched by the latest "Find More" that weren't in the batch before — tagged "NEW"
    const [newAccountIds, setNewAccountIds] = useState<Set<string>>(new Set());

    const resetAddModal = () => {
        setDomain('');
        setSearchResults([]);
        setHasSearched(false);
        setSelectedDomains(new Set());
    };

    const handleOpenAddModal = () => {
        resetAddModal();
        setIsAddModalOpen(true);
    };

    const handleCloseAddModal = () => {
        setIsAddModalOpen(false);
        resetAddModal();
    };

    const handleSearchCandidates = async () => {
        const query = domain.trim();
        if (!query) {
            toast.error('Please enter a domain to search.');
            return;
        }
        try {
            // Send the batch's account source along with the search query (documented body)
            const results = await searchCandidates.mutateAsync({
                query,
                max_results: 10,
                account_source: batch.account_source || undefined,
            });
            // Companies already in the batch don't appear in the selection list
            const existingDomains = new Set((accounts || []).map((a) => (a.domain || '').toLowerCase()));
            setSearchResults(results.filter((c) => !existingDomains.has((c.domain || '').toLowerCase())));
            setSelectedDomains(new Set());
            setHasSearched(true);
        } catch (error) {
            toast.error(getErrorMessage(error));
        }
    };

    const toggleCandidate = (candidateDomain: string) => {
        setSelectedDomains((prev) => {
            const next = new Set(prev);
            if (next.has(candidateDomain)) next.delete(candidateDomain);
            else next.add(candidateDomain);
            return next;
        });
    };

    const handleAddSelected = async () => {
        if (selectedDomains.size === 0) {
            toast.error('Select at least one company to add.');
            return;
        }
        try {
            // Send the batch's account source along with the selected domains
            const added = await addAccount.mutateAsync({
                domains: [...selectedDomains],
                account_source: batch.account_source || undefined,
            });
            // Only genuinely-new accounts count — duplicates are skipped
            const fresh = filterNewAccounts(added, accounts);
            if (fresh.length === 0) {
                toast('No new accounts found for this ICP criteria', { icon: <FiInfo /> });
            } else {
                toast.success(`${fresh.length} account(s) added!`);
                setNewAccountIds((prev) => new Set([...prev, ...fresh.map((a) => a.id)]));
            }
            setIsAddModalOpen(false);
            resetAddModal();
        } catch (error) {
            toast.error(getErrorMessage(error));
        }
    };

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

    const handleFindMore = async (count: number) => {
        try {
            // Documented body: count_to_add, account_source, icp
            const fetched = await fetchMore.mutateAsync({
                count_to_add: count,
                account_source: batch.account_source || undefined,
                icp: batch.icp,
            });
            // Only genuinely-new accounts count — duplicates are skipped
            const fresh = filterNewAccounts(fetched, accounts);
            if (fresh.length === 0) {
                toast('No new accounts found for this ICP criteria', { icon: <FiInfo /> });
            } else {
                toast.success(`${fresh.length} new account(s) found!`);
                setNewAccountIds((prev) => new Set([...prev, ...fresh.map((a) => a.id)]));
            }
            setIsFindMoreOpen(false);
        } catch (error) {
            toast.error(getErrorMessage(error));
        }
    };

    // Handle Enrich & Rank API call — always runs, sending ALL account ids
    // (ignored accounts are already excluded by the accounts list)
    const handleEnrichAndRank = async () => {
        const accountIds = (accounts || []).map(acc => acc.id);

        // Send the local Product Intelligence copy. No blocking overlay: the buttons
        // disable until the API responds, then the user is taken to the Enrich & Rank
        // view (which polls processing accounts).
        await beginTransition(
            () => enrichMutation.mutateAsync({
                account_ids: accountIds,
                product_analysis: batch.product_analysis ?? {},
            }),
            'enrich',
            'Enriching & ranking accounts',
            { validate: () => true, silent: true }
        );
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
        <div className="flex flex-col gap-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-3">
                    {onBack && (
                        <button onClick={onBack} title="Back to Ready to Find Accounts" aria-label="Go back" className="p-1.5 rounded-md text-fg hover:bg-bg-muted transition-colors">
                            <FiArrowLeft className="w-5 h-5" />
                        </button>
                    )}
                    <div>
                        <h2 className="font-sans font-bold text-xl sm:text-2xl tracking-tight text-fg">Explore Accounts</h2>
                        <p className="font-sans font-medium text-sm text-fg-body mt-1">
                            Showing {filteredAccounts.length} accounts from batch
                        </p>
                    </div>
                </div>
                {/* Always the real Enrich & Rank CTA — it re-runs enrichment for ALL account ids */}
                <Button
                    variant="gradient"
                    className="w-full sm:w-auto"
                    disabled={isFetchingMore}
                    isLoading={enrichMutation.isPending}
                    onClick={handleEnrichAndRank}
                >
                    Enrich & Rank
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
                <div className="flex items-center gap-3 w-full md:w-auto md:ml-auto">
                    <Button
                        variant="outline"
                        className="py-2 px-3 h-10"
                        onClick={handleOpenAddModal}
                        disabled={isFetchingMore}
                    >
                        <FiPlus className="w-4 h-4" />
                        Add Account
                    </Button>

                    <Button
                        variant="outline"
                        className="py-2 px-3 h-10"
                        onClick={() => setIsFindMoreOpen(true)}
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
                        <p className="text-fg-body font-medium">No accounts yet — use "Find More" or "Add Account" to get some.</p>
                    )}
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
                                <h4 className="font-sans font-semibold text-base text-fg truncate flex items-center gap-2">
                                    <span className="truncate">{account.name}</span>
                                    {newAccountIds.has(account.id) && (
                                        <span className="font-sans font-semibold text-[10px] tracking-wide uppercase bg-bg-purple-50 text-primary rounded-full px-2 py-0.5 shrink-0">
                                            New
                                        </span>
                                    )}
                                </h4>
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

            {/* Find More Accounts Modal */}
            <FindMoreAccountsModal
                isOpen={isFindMoreOpen}
                onClose={() => setIsFindMoreOpen(false)}
                onConfirm={handleFindMore}
                isLoading={isFetchingMore}
            />

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

            {/* Search Accounts Modal */}
            <Modal
                isOpen={isAddModalOpen}
                onClose={handleCloseAddModal}
                title="Search Accounts"
            >
                <div className="flex flex-col gap-4">
                    <p className="font-sans font-normal text-sm text-fg-body leading-relaxed">
                        Search for a company by its domain, then pick the ones you want to add to this batch.
                    </p>

                    {/* Domain search */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3">
                        <InputField
                            label="DOMAIN"
                            placeholder="e.g., microsoft.com"
                            value={domain}
                            onChange={(e) => setDomain(e.target.value)}
                            className="flex-1"
                        />
                        <Button
                            variant="primary"
                            className="h-11 shrink-0"
                            isLoading={searchCandidates.isPending}
                            disabled={searchCandidates.isPending}
                            onClick={handleSearchCandidates}
                        >
                            Search Accounts
                        </Button>
                    </div>

                    {/* Results — pick which companies to add */}
                    {hasSearched && searchResults.length === 0 && (
                        <div className="flex flex-col items-center justify-center gap-2 py-8 border border-dashed border-border rounded-xl text-center">
                            <FiSearch className="w-6 h-6 text-fg-muted" />
                            <p className="font-sans text-sm text-fg-body">No companies found for "{domain.trim()}"</p>
                        </div>
                    )}

                    {searchResults.length > 0 && (
                        <div className="flex flex-col gap-2">
                            <span className="font-sans font-semibold text-xs text-fg-muted">
                                Select the companies to add
                            </span>
                            <div className="flex flex-col divide-y divide-border/50 max-h-72 overflow-auto border border-border rounded-xl p-1">
                                {searchResults.map((candidate) => (
                                    <label
                                        key={candidate.domain}
                                        className="flex items-center gap-3 px-2 py-2.5 rounded-lg hover:bg-bg-muted transition-colors cursor-pointer"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={selectedDomains.has(candidate.domain)}
                                            onChange={() => toggleCandidate(candidate.domain)}
                                            disabled={addAccount.isPending}
                                            className="w-4 h-4 accent-primary cursor-pointer shrink-0"
                                            aria-label={`Select ${candidate.name}`}
                                        />
                                        {candidate.logo_url ? (
                                            <img
                                                src={candidate.logo_url}
                                                alt={candidate.name}
                                                className="w-9 h-9 rounded-lg object-cover bg-bg-purple-50 shrink-0"
                                            />
                                        ) : (
                                            <div className="w-9 h-9 rounded-lg bg-bg-purple-50 flex items-center justify-center font-sans font-bold text-primary text-sm shrink-0">
                                                {candidate.name.charAt(0)}
                                            </div>
                                        )}
                                        <div className="flex flex-col min-w-0">
                                            <span className="font-sans font-medium text-sm text-fg truncate">{candidate.name}</span>
                                            <span className="font-sans font-normal text-xs text-fg-body truncate">{candidate.domain}</span>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="flex justify-end gap-3 mt-2">
                        <Button variant="outline" onClick={handleCloseAddModal}>Cancel</Button>
                        <Button
                            variant="primary"
                            isLoading={addAccount.isPending}
                            disabled={selectedDomains.size === 0 || addAccount.isPending}
                            onClick={handleAddSelected}
                        >
                            Add Selected{selectedDomains.size > 0 ? ` (${selectedDomains.size})` : ''}
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};





