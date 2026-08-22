import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button } from '@/shared/components/ui';
import { FiBookmark, FiArchive, FiSearch } from 'react-icons/fi';
import type { Batch } from '@/features/batches/types/batchTypes';

interface AccountsTabProps {
    formData: Batch;
    setFormData: React.Dispatch<React.SetStateAction<Batch | null>>;
}

export const AccountsTab: React.FC<AccountsTabProps> = ({ formData }) => {
    const navigate = useNavigate();

    const isDraft = formData.status === 'Draft';
    const hasAccounts = (formData.accounts_count || 0) > 0;

    // Populated State (If accounts already exist)
    if (hasAccounts) {
        return (
            <Card variant="elevated" className="flex flex-col gap-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between">
                    <h3 className="font-sans font-semibold text-lg tracking-tight text-fg">Accounts ({formData.accounts_count})</h3>
                    <Button variant="outline" onClick={() => navigate(`/batches/${formData.id}/accounts`)}>
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
                    {/* Voice Circle */}
                    <div className="flex justify-center items-center w-36 h-36 bg-bg-purple-50 rounded-xl">
                        <FiBookmark className="w-24 h-24 text-primary" strokeWidth={1.5} />
                    </div>

                    {/* Text Container */}
                    <div className="flex flex-col items-center gap-2">
                        <h3 className="font-sans font-bold text-2xl tracking-tight text-fg">
                            Ready to find your accounts?
                        </h3>
                        <p className="font-sans font-normal text-base text-fg-body">
                            Discover accounts that match your criteria and find the best opportunities for your sales goals.
                        </p>
                    </div>

                    {/* Action Button */}
                    <Button
                        variant="outline"
                        onClick={() => navigate(`/batches/${formData.id}/accounts`)}
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
                {/* Voice Circle */}
                <div className="flex justify-center items-center w-36 h-36 bg-bg-purple-50 rounded-xl">
                    <FiArchive className="w-24 h-24 text-primary" strokeWidth={1.5} />
                </div>

                {/* Text Container */}
                <div className="flex flex-col items-center gap-2">
                    <h3 className="font-sans font-bold text-2xl tracking-tight text-fg">
                        Continue Exploring
                    </h3>
                    <p className="font-sans font-normal text-base text-fg-body">
                        Pick up where you left off and find accounts that match your criteria.
                    </p>
                </div>

                {/* Action Button */}
                <Button
                    variant="outline"
                    onClick={() => navigate(`/batches/${formData.id}/accounts`)}
                >
                    <FiSearch className="w-6 h-6" />
                    Continue Explore Accounts
                </Button>
            </div>
        </Card>
    );
};