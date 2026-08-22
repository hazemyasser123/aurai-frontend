import React from 'react';
import { Skeleton } from '@/shared/components/ui';

export const BatchCardSkeleton: React.FC = () => {
    return (
        <div className="bg-bg-sidebar border border-border rounded-xl p-6 flex flex-col gap-3 w-full">
            <div className="flex items-start gap-3">
                {/* Icon Placeholder */}
                <Skeleton className="w-12 h-12 rounded-md" />

                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        {/* Title Placeholder */}
                        <Skeleton className="h-4 w-24" />
                        {/* Badge Placeholder */}
                        <Skeleton className="h-5 w-16 rounded-full" />
                    </div>
                    {/* Subtitle Placeholder */}
                    <Skeleton className="h-3 w-32 mt-1" />
                </div>
            </div>

            <div className="border-t border-border my-2"></div>

            {/* Button Placeholder */}
            <Skeleton className="h-8 w-24 rounded-md self-start" />
        </div>
    );
};