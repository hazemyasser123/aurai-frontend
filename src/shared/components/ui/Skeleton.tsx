import React from 'react';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> { }

export const Skeleton: React.FC<SkeletonProps> = ({ className = '', ...props }) => {
    return (
        <div
            className={`relative overflow-hidden bg-bg-muted rounded-md ${className}`}
            {...props}
        >
            {/* Shimmer overlay */}
            <div className="absolute inset-0 -translate-x-full animate-shimmer bg-linear-to-r from-transparent via-black/5 dark:via-white/10 to-transparent" />
        </div>
    );
};