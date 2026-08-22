import React from 'react';
import { Skeleton } from '@/shared/components/ui';

export const AccountCardSkeleton: React.FC = () => {
    return (
        <div className="bg-bg-sidebar border border-border rounded-xl p-6 flex items-center gap-4 relative h-24">
            {/* Logo Placeholder */}
            <Skeleton className="w-14 h-14 rounded-xl" />

            {/* Text Placeholders */}
            <div className="flex flex-col gap-2 flex-1 min-w-0">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-48" />
                <Skeleton className="h-3 w-24" />
            </div>

            {/* Trash Button Placeholder */}
            <Skeleton className="absolute top-3 right-3 w-6 h-6 rounded-md" />
        </div>
    );
};