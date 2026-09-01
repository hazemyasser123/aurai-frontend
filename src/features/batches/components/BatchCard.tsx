import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSliders, FiArrowRight, FiTrash2 } from 'react-icons/fi';
import { Badge, Button, Modal } from '@/shared/components/ui';
import { useDeleteBatch } from '@/features/batches/hooks/useDeleteBatch';
import { getBatchStep } from '@/features/batches/utils/batchFlow';
import toast from 'react-hot-toast';
import { getErrorMessage } from '@/shared/utils/errorHandler';
import type { BatchStatus } from '@/features/batches/types/batchTypes';

interface BatchCardProps {
    id: string;
    name: string;
    status: BatchStatus | string;
    createdAt: string;
}

export const BatchCard: React.FC<BatchCardProps> = ({ id, name, status, createdAt }) => {
    const navigate = useNavigate();
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const deleteBatch = useDeleteBatch();

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

    const canDelete = getBatchStep(status) !== 'outreached';

    const handleDelete = async () => {
        try {
            await deleteBatch.mutateAsync(id);
            toast.success('Batch deleted');
            setIsDeleteOpen(false);
        } catch (err) {
            toast.error(getErrorMessage(err));
        }
    };

    return (
        <>
            <div className="bg-bg-sidebar border border-border rounded-xl p-6 flex flex-col gap-3 w-full hover:shadow-card transition-shadow">
                <div className="flex items-start gap-3">
                    <div className="w-12 h-12 bg-bg-card rounded-md flex items-center justify-center border border-border">
                        <FiSliders className="w-6 h-6 text-primary-accent" strokeWidth={1.5} />
                    </div>

                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <h3 className="font-sans font-semibold text-base tracking-tight text-fg truncate">{name}</h3>
                            <Badge variant={badgeVariant}>{status}</Badge>
                        </div>
                        <p className="font-sans text-xs text-fg-body">Created at: {createdAt}</p>
                    </div>
                </div>

                <div className="border-t border-border my-2"></div>

                <div className="flex items-center justify-between gap-2">
                    <Button variant="ghost" className="px-0" onClick={() => navigate(`/batches/${id}`)}>
                        View Batch
                        <FiArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </Button>
                    {canDelete && (
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsDeleteOpen(true);
                            }}
                            className="p-2 rounded-md text-fg-body hover:text-danger hover:bg-danger-bg transition-colors"
                            title="Delete batch"
                            aria-label="Delete batch"
                        >
                            <FiTrash2 className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>

            <Modal isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} title="Delete Batch">
                <div className="flex flex-col gap-4">
                    <p className="font-sans text-sm leading-5 text-fg-body">
                        Delete <span className="font-semibold text-fg">{name}</span>? This will permanently remove the batch and its dependent data.
                    </p>
                    <div className="flex justify-end gap-3">
                        <Button variant="ghost" onClick={() => setIsDeleteOpen(false)} disabled={deleteBatch.isPending}>
                            Cancel
                        </Button>
                        <Button variant="danger" onClick={handleDelete} isLoading={deleteBatch.isPending} disabled={deleteBatch.isPending}>
                            Delete
                        </Button>
                    </div>
                </div>
            </Modal>
        </>
    );
};