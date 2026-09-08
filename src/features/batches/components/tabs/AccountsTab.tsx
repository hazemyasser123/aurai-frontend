import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button } from '@/shared/components/ui';
import { FiSearch } from 'react-icons/fi';
import bookmarkIcon from '@/assets/bookmark.svg';
import archiveBookIcon from '@/assets/archive-book.svg';
import type { Batch } from '@/features/batches/types/batchTypes';
import { useFindAccounts } from '@/features/batches/hooks/useFindAccounts';
import { useQueryClient } from '@tanstack/react-query';
import { batchKeys } from '@/shared/queries/batches/batchQueries';
import { getStatusRoute } from '@/features/batches/utils/batchFlow';
import toast from 'react-hot-toast';
import { getErrorMessage } from '@/shared/utils/errorHandler';

interface AccountsTabProps {
    formData: Batch;
    setFormData: React.Dispatch<React.SetStateAction<Batch | null>>;
}

export const AccountsTab: React.FC<AccountsTabProps> = ({ formData, setFormData }) => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const findAccounts = useFindAccounts();

    const lowerStatus = (formData.status || '').toLowerCase();
    const isDraft = lowerStatus === 'draft';
    const isEnriched = lowerStatus === 'enriched';

    const getCurrentActionLabel = () => {
        const s = lowerStatus;
        if (s === 'draft') return 'Explore Accounts';
        if (s === 'executed') return 'View Explored Accounts';
        if (s === 'enriched') return 'Enrich & Rank';
        if (s === 'contacts fetched') return 'View Contacts';
        if (s === 'emails drafted') return 'View Drafts';
        return 'View Accounts';
    };

    const handleExplore = async () => {
        // If already enriched, go directly to enrich & rank instead of explore
        if (isEnriched) {
            navigate(`/batches/${formData.id}/accounts/enrich`);
            return;
        }
        try {
            const payload = {
                id: formData.id,
                name: formData.name,
                batch_name: formData.name,
                base_product_id: formData.base_product_id,
                product_analysis: formData.product_analysis,
                icp: formData.icp,
                max_results: formData.max_results || 10,
                cc_emails: formData.cc_emails,
                bcc_emails: formData.bcc_emails,
                human_action_loop_emails: formData.human_action_loop_emails,
                forward_emails: formData.forward_emails,
                enable_auto_followup: formData.enable_auto_followup,
                followup_delay_days: formData.followup_delay_days,
            };
            const updated = await findAccounts.mutateAsync(payload);
            const newCount = updated.accounts_count ?? formData.max_results ?? 10;
            const newStatus = updated.status || formData.status;
            setFormData((prev) => (prev ? { ...prev, accounts_count: newCount, status: newStatus } : prev));
            queryClient.invalidateQueries({ queryKey: batchKeys.accounts(formData.id) });
            queryClient.invalidateQueries({ queryKey: batchKeys.detail(formData.id) });
            queryClient.invalidateQueries({ queryKey: batchKeys.all });
            toast.success(`${newCount} accounts found`);
            // After find, if enriched go to enrich page else explore
            if ((newStatus || '').toLowerCase() === 'enriched') {
                navigate(`/batches/${formData.id}/accounts/enrich`);
            } else {
                navigate(`/batches/${formData.id}/accounts`);
            }
        } catch (error) {
            toast.error(getErrorMessage(error));
        }
    };

    // Draft shows bookmark Ready view, all other non-outreached show archive-book Continue view
    if (isDraft) {
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

    // All other non-outreached states (Executed, Enriched, contacts fetched, emails drafted) — archive-book
    return (
        <Card variant="elevated" className="flex flex-col gap-6">
            <h3 className="font-sans font-semibold text-lg tracking-tight text-fg">Accounts</h3>

            <div className="flex flex-col justify-center items-center gap-6 py-16 w-full max-w-[672px] mx-auto text-center">
                <div className="flex justify-center items-center w-36 h-36 bg-[#FEF9C2] rounded-xl">
                    <img src={archiveBookIcon} alt="Archive book" className="w-24 h-24 object-contain" />
                </div>

                <div className="flex flex-col items-center gap-2">
                    <h3 className="font-sans font-bold text-2xl tracking-tight text-fg">
                        Continue Exploring
                    </h3>
                    <p className="font-sans font-normal text-base text-fg-body">
                        You’ve already started exploring accounts. Continue your search without losing your previous selections.
                    </p>
                </div>

                <Button
                    variant="outline"
                    onClick={() => navigate(getStatusRoute(formData.id, formData.status))}
                    isLoading={findAccounts.isPending}
                    disabled={findAccounts.isPending}
                >
                    <FiSearch className="w-6 h-6" />
                    {getCurrentActionLabel()}
                </Button>
            </div>
        </Card>
    );
};