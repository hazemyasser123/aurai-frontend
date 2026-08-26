import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSliders, FiArrowRight } from 'react-icons/fi';
import { Badge, Button } from '@/shared/components/ui';
import type { BatchStatus } from '@/features/batches/types/batchTypes';

interface BatchCardProps {
    id: string;
    name: string;
    status: BatchStatus | string;
    createdAt: string;
}

export const BatchCard: React.FC<BatchCardProps> = ({ id, name, status, createdAt }) => {
    const navigate = useNavigate();

    // Map BatchStatus to badge variants — synced with backend BatchStatus enum
    const lowerStatus = status.toLowerCase();
    let badgeVariant: "success" | "info" | "warning" | "danger" = "warning";

    if (lowerStatus === 'draft') {
        badgeVariant = 'warning';
    } else if (lowerStatus === 'enriched') {
        badgeVariant = 'info';
    } else if (lowerStatus === 'contacts fetched') {
        badgeVariant = 'success';
    } else if (lowerStatus === 'emails drafted') {
        badgeVariant = 'info';
    } else if (lowerStatus === 'outriched' || lowerStatus === 'outreached') {
        badgeVariant = 'success';
    } else if (lowerStatus === 'executed') {
        badgeVariant = 'info';
    }

    return (
        <div className="bg-bg-sidebar border border-border rounded-xl p-6 flex flex-col gap-3 w-full hover:shadow-card transition-shadow">
            <div className="flex items-start gap-3">
                <div className="w-12 h-12 bg-bg-card rounded-md flex items-center justify-center border border-border">
                    <FiSliders className="w-6 h-6 text-primary-accent" strokeWidth={1.5} />
                </div>

                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-sans font-semibold text-base tracking-tight text-fg">{name}</h3>
                        <Badge variant={badgeVariant}>
                            {status}
                        </Badge>
                    </div>
                    <p className="font-sans text-xs text-fg-body">Created at: {createdAt}</p>
                </div>
            </div>

            <div className="border-t border-border my-2"></div>

            <Button variant="ghost" className="px-0 self-start" onClick={() => navigate(`/batches/${id}`)}>
                View Batch
                <FiArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Button>
        </div>
    );
};