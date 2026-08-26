import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button } from '@/shared/components/ui';
import { FiBookmark, FiArchive, FiSearch } from 'react-icons/fi';
import type { Batch } from '@/features/batches/types/batchTypes';
import { useFindAccounts } from '@/features/batches/hooks/useFindAccounts';
import { useQueryClient } from '@tanstack/react-query';
import { batchKeys } from '@/shared/queries/batches/batchQueries';
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
    const hasAccounts = (formData.accounts_count || 0) > 0;

    const getAccountsDestination = () => (isEnriched ? `/batches/${formData.id}/accounts/enrich` : `/batches/${formData.id}/accounts`);

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

    // Populated State (If accounts already exist)
    if (hasAccounts) {
        return (
            <Card variant="elevated" className="flex flex-col gap-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between">
                    <h3 className="font-sans font-semibold text-lg tracking-tight text-fg">Accounts ({formData.accounts_count})</h3>
                    <Button variant="outline" onClick={() => navigate(getAccountsDestination())}>
                        View All Accounts
                    </Button>
                </div>
            </Card>
        );
    }

    // Draft Empty State
    if (isDraft) {
        return (
            <Card variant="elevated" className="flex flex-col gap-6">
                <h3 className="font-sans font-semibold text-lg tracking-tight text-fg">Accounts</h3>

                <div className="flex flex-col justify-center items-center gap-6 py-16 w-full max-w-[672px] mx-auto text-center">
                    <div className="flex justify-center items-center w-36 h-36 bg-bg-purple-50 rounded-xl">
                        <FiBookmark className="w-24 h-24 text-primary" strokeWidth={1.5} />
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

    // Active / Completed Empty State (Drop State)
    return (
        <Card variant="elevated" className="flex flex-col gap-6">
            <h3 className="font-sans font-semibold text-lg tracking-tight text-fg">Accounts</h3>

            <div className="flex flex-col justify-center items-center gap-6 py-16 w-full max-w-[672px] mx-auto text-center">
                <div className="flex justify-center items-center w-36 h-36 bg-bg-purple-50 rounded-xl">
                    <FiArchive className="w-24 h-24 text-primary" strokeWidth={1.5} />
                </div>

                <div className="flex flex-col items-center gap-2">
                    <h3 className="font-sans font-bold text-2xl tracking-tight text-fg">
                        Continue Exploring
                    </h3>
                    <p className="font-sans font-normal text-base text-fg-body">
                        Pick up where you left off and find accounts that match your criteria.
                    </p>
                </div>

                <Button
                    variant="outline"
                    onClick={handleExplore}
                    isLoading={findAccounts.isPending}
                    disabled={findAccounts.isPending}
                >
                    <FiSearch className="w-6 h-6" />
                    Continue Explore Accounts
                </Button>
            </div>
        </Card>
    );
};