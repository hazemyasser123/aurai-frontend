import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { WithNavbar } from '@/shared/components/hoc/WithNavbar';
import { BatchCard } from '@/features/batches/components/BatchCard';
import { BatchCardSkeleton } from '@/features/batches/components/BatchCardSkeleton';
import { Button } from '@/shared/components/ui';
import { FiPlus, FiSliders } from 'react-icons/fi';
import { useBatches } from '@/features/batches/hooks/useBatches';
import toast from 'react-hot-toast';
import { getErrorMessage } from '@/shared/utils/errorHandler';

const BatchListPage: React.FC = () => {
    const navigate = useNavigate();
    const { data: batches, isLoading, isError, error } = useBatches();

    // Show error toast if fetch fails
    useEffect(() => {
        if (isError) {
            toast.error(getErrorMessage(error));
        }
    }, [isError, error]);

    return (
        <div className="w-full">
            {/* Hero Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
                <div>
                    <h2 className="font-sans font-bold text-xl sm:text-2xl tracking-tight text-fg">Outreach Batches</h2>
                    <p className="font-sans font-medium text-sm text-fg-body mt-1">
                        Manage and view your generated target account batches.
                    </p>
                </div>
                {/* Hide the primary button if we are in the empty state, since the empty state has its own button */}
                {!isLoading && batches && batches.length > 0 && (
                    <Button
                        variant="primary"
                        className="w-full sm:w-auto max-w-none py-2 px-4 h-10"
                        onClick={() => navigate('/batches/new')}
                    >
                        <FiPlus className="w-4.5 h-4.5" />
                        New Batch
                    </Button>
                )}
            </div>

            {/* Loading State */}
            {isLoading && (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                    {Array.from({ length: 6 }).map((_, index) => (
                        <BatchCardSkeleton key={`skeleton-${index}`} />
                    ))}
                </div>
            )}

            {/* Empty State */}
            {!isLoading && !isError && batches?.length === 0 && (
                <div className="flex flex-col justify-center items-center gap-6 py-16 w-full max-w-2xl mx-auto text-center">
                    {/* Voice Circle */}
                    <div className="flex justify-center items-center w-36 h-36 bg-bg-purple-50 rounded-xl">
                        <FiSliders className="w-24 h-24 text-primary" strokeWidth={2} />
                    </div>

                    {/* Text Container */}
                    <div className="flex flex-col items-center gap-2">
                        <h3 className="font-sans font-bold text-2xl tracking-tight text-fg">
                            No Batches Found
                        </h3>
                        <p className="font-sans font-normal text-base text-fg-body">
                            Create your target account batch to start finding leads.
                        </p>
                    </div>

                    {/* Button */}
                    <Button variant="outline" onClick={() => navigate('/batches/new')}>
                        <FiPlus className="w-6 h-6" />
                        Create New Batch
                    </Button>
                </div>
            )}

            {/* Statistics Grid / Cards */}
            {!isLoading && batches && batches.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                    {batches.map((batch) => (
                        <BatchCard
                            key={batch.id}
                            id={batch.id}
                            name={batch.name}
                            // Pass the exact status from the API directly
                            status={batch.status}
                            createdAt={new Date(batch.created_at).toLocaleString()}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default WithNavbar(BatchListPage);