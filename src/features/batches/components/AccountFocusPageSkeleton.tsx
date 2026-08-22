import React from 'react';
import { Skeleton } from '@/shared/components/ui';

export const AccountFocusPageSkeleton: React.FC = () => {
    return (
        <div className="w-full pb-12 max-w-[1120px] mx-auto">
            {/* Hero Header Skeleton */}
            <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-md bg-bg-sidebar"></div>
                    <div className="h-8 w-48 bg-bg-sidebar rounded-md"></div>
                </div>
                <div className="h-10 w-40 bg-bg-sidebar rounded-md"></div>
            </div>

            {/* Hero Section (Company Info) Skeleton */}
            <div className="flex flex-col md:flex-row items-center gap-6 mb-6 p-6 bg-bg-sidebar border border-border rounded-xl">
                {/* Logo Placeholder */}
                <Skeleton className="w-24 h-24 rounded-lg flex-shrink-0" />

                {/* Info Placeholder */}
                <div className="flex-1 space-y-3 min-w-0">
                    <Skeleton className="h-6 w-40" />
                    <Skeleton className="h-4 w-24" />
                    <div className="flex flex-wrap gap-4 mt-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-4 w-28" />
                        <Skeleton className="h-4 w-20" />
                    </div>
                </div>

                {/* Alexa Rank Placeholder */}
                <Skeleton className="h-10 w-32 rounded-lg flex-shrink-0" />
            </div>

            {/* Contacts Section Skeleton */}
            <div className="flex flex-col gap-6 mb-6 p-6 bg-bg-sidebar border border-border rounded-xl">
                <div className="flex justify-between items-center">
                    <Skeleton className="h-6 w-32" />
                    <div className="flex gap-3">
                        <Skeleton className="h-10 w-64 rounded-full" />
                        <Skeleton className="h-10 w-32 rounded-md" />
                    </div>
                </div>

                <div className="space-y-4">
                    {/* Recommended Contact */}
                    <Skeleton className="h-24 w-full rounded-lg" />
                    {/* All Contacts */}
                    <Skeleton className="h-24 w-full rounded-lg" />
                    <Skeleton className="h-24 w-full rounded-lg" />
                    <Skeleton className="h-24 w-full rounded-lg" />
                </div>
            </div>

            {/* Collapsible Sections Skeleton */}
            <div className="flex flex-col gap-4">
                <Skeleton className="h-12 w-full rounded-xl" />
                <Skeleton className="h-12 w-full rounded-xl" />
                <Skeleton className="h-12 w-full rounded-xl" />
                <Skeleton className="h-12 w-full rounded-xl" />
                <Skeleton className="h-12 w-full rounded-xl" />
            </div>
        </div>
    );
};