import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { WithNavbar } from '@/shared/components/hoc/WithNavbar';
import { Button, Modal } from '@/shared/components/ui';
import { FiArrowLeft, FiTrash2, FiX } from 'react-icons/fi';
import { useBatch } from '@/features/batches/hooks/useBatch';
import { useUpdateBatch } from '@/features/batches/hooks/useUpdateBatch';
import { useCloneBatch } from '@/features/batches/hooks/useCloneBatch';
import { useDeleteBatch } from '@/features/batches/hooks/useDeleteBatch';
import { BatchOverviewTab } from '@/features/batches/components/tabs/BatchOverviewTab';
import { ProductIntelligenceTab } from '@/features/batches/components/tabs/ProductIntelligenceTab';
import { IcpTab } from '@/features/batches/components/tabs/IcpTab';
import { AccountsTab } from '@/features/batches/components/tabs/AccountsTab';
import { ContactsFetchedView } from '@/features/batches/components/contactsFetched/ContactsFetchedView';
import { CloneBatchModal } from '@/features/batches/components/CloneBatchModal';
import { BatchCardSkeleton } from '@/features/batches/components/BatchCardSkeleton';
import { getBatchStep } from '@/features/batches/utils/batchFlow';
import type { Batch } from '@/features/batches/types/batchTypes';
import type { UpdateBatchPayload } from '@/features/batches/types/batchTypes';
import toast from 'react-hot-toast';
import { getErrorMessage } from '@/shared/utils/errorHandler';

type TabKey = 'overview' | 'product' | 'icp' | 'accounts';

const BatchDetailPage: React.FC = () => {
    const { batchId } = useParams<{ batchId: string }>();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { data: fetchedBatch, isLoading } = useBatch(batchId || '');
    const updateBatch = useUpdateBatch(batchId || '');

    // Allow deep-linking to a tab, e.g. /batches/:id?tab=accounts (used after sending all emails)
    const initialTab = (searchParams.get('tab') as TabKey) || 'overview';

    const [activeTab, setActiveTab] = useState<TabKey>(initialTab);
    const [formData, setFormData] = useState<Batch | null>(null);
    const [isCloneOpen, setIsCloneOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [isRerankOpen, setIsRerankOpen] = useState(false);
    const [pendingPayload, setPendingPayload] = useState<UpdateBatchPayload | null>(null);
    const [originalProductAnalysis, setOriginalProductAnalysis] = useState<string | null>(null);
    const [isReranking, setIsReranking] = useState(false);
    const cloneBatch = useCloneBatch();
    const deleteBatch = useDeleteBatch();

    // Sync local state when API data is loaded
    useEffect(() => {
        if (fetchedBatch) {
            setFormData(fetchedBatch);
            setOriginalProductAnalysis(JSON.stringify(fetchedBatch.product_analysis || {}));
        }
    }, [fetchedBatch]);

    // ESC closes the re-rank modal (when not busy)
    useEffect(() => {
        if (!isRerankOpen) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && !isReranking && !updateBatch.isPending) {
                setIsRerankOpen(false);
                setPendingPayload(null);
            }
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [isRerankOpen, isReranking, updateBatch.isPending]);

    // Deep links (?tab=accounts) now show the Continue Exploring card first;
    // the button inside guides to the correct next page, so no auto-redirect.
    useEffect(() => {
        // Keep tab param in sync with activeTab for direct links, but don't force navigation
        const tab = searchParams.get('tab') as TabKey | null;
        if (tab && ['overview', 'product', 'icp', 'accounts'].includes(tab)) {
            setActiveTab(tab);
        }
    }, [searchParams]);

    // Handlers for form state
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;
        // Master switch: turning follow-up flagging off clears the delay (shown empty + not sent)
        if (name === 'enable_auto_followup' && !checked) {
            setFormData(prev => prev ? ({
                ...prev,
                enable_auto_followup: false,
                followup_delay_days: undefined,
            }) : prev);
            return;
        }
        setFormData(prev => prev ? ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }) : prev);
    };

    const handleNestedChange = (section: 'product_analysis' | 'icp', name: string, value: any) => {
        setFormData(prev => prev ? ({
            ...prev,
            [section]: {
                ...(prev[section] || {}),
                [name]: value
            }
        }) : prev);
    };

    const handleSave = async () => {
        if (!formData || !batchId) return;

        // Master switches — tied fields are omitted entirely (not even empty) when their flag is off.
        const followupOn = formData.enable_auto_followup ?? true;
        const replyDelayOn = formData.reply_delay_enabled ?? false;

        const payload: UpdateBatchPayload = {
            name: formData.name,
            base_product_id: formData.base_product_id || undefined,
            status: formData.status,
            product_analysis: formData.product_analysis,
            icp: formData.icp,
            cc_emails: formData.cc_emails,
            bcc_emails: formData.bcc_emails,
            human_action_loop_emails: formData.human_action_loop_emails,
            forward_emails: formData.forward_emails,
            enable_auto_followup: followupOn,
            ...(followupOn && formData.followup_delay_days != null
                ? { followup_delay_days: Number(formData.followup_delay_days) }
                : {}),
            max_results: formData.max_results != null ? Number(formData.max_results) : undefined,
            reply_delay_enabled: replyDelayOn,
            ...(replyDelayOn
                ? {
                    ...(formData.reply_timezone ? { reply_timezone: formData.reply_timezone } : {}),
                    ...(formData.reply_working_days ? { reply_working_days: formData.reply_working_days } : {}),
                    ...(formData.reply_working_hours_start ? { reply_working_hours_start: formData.reply_working_hours_start } : {}),
                    ...(formData.reply_working_hours_end ? { reply_working_hours_end: formData.reply_working_hours_end } : {}),
                    ...(formData.reply_base_delay_minutes != null ? { reply_base_delay_minutes: Number(formData.reply_base_delay_minutes) } : {}),
                    ...(formData.reply_delay_buffer_minutes != null ? { reply_delay_buffer_minutes: Number(formData.reply_delay_buffer_minutes) } : {}),
                }
                : {}),
        };

        // If Product Intelligence was edited, ask whether to re-rank contacts
        const currentPI = JSON.stringify(formData.product_analysis || {});
        const hasPIEdit = originalProductAnalysis !== null && currentPI !== originalProductAnalysis;
        if (hasPIEdit) {
            setPendingPayload(payload);
            setIsRerankOpen(true);
            return;
        }

        try {
            await updateBatch.mutateAsync(payload);
            toast.success('Batch saved successfully');
            setOriginalProductAnalysis(JSON.stringify(payload.product_analysis || {}));
        } catch (error) {
            toast.error(getErrorMessage(error));
        }
    };

    const handleConfirmRerank = async (withRerank: boolean) => {
        if (!pendingPayload || !batchId) return;
        if (withRerank) {
            setIsReranking(true);
            try {
                // TODO: replace with real route when provided — for now random delay to simulate re-ranking
                await new Promise((r) => setTimeout(r, 900 + Math.random() * 800));
                toast.success('Contacts re-ranked successfully');
            } catch {
                toast.error('Re-rank failed');
            } finally {
                setIsReranking(false);
            }
        }
        try {
            await updateBatch.mutateAsync(pendingPayload);
            toast.success('Batch saved successfully');
            setOriginalProductAnalysis(JSON.stringify(pendingPayload.product_analysis || {}));
        } catch (error) {
            toast.error(getErrorMessage(error));
        } finally {
            setIsRerankOpen(false);
            setPendingPayload(null);
        }
    };

    const handleClone = async (newName: string) => {
        if (!batchId) return;
        try {
            const cloned = await cloneBatch.mutateAsync({ batchId, batchName: newName });
            toast.success(`Batch cloned as "${cloned.name}"`);
            setIsCloneOpen(false);
            navigate(`/batches/${cloned.id}`);
        } catch (error) {
            toast.error(getErrorMessage(error));
        }
    };

    const handleDelete = async () => {
        if (!batchId) return;
        try {
            await deleteBatch.mutateAsync(batchId);
            toast.success('Batch deleted');
            setIsDeleteOpen(false);
            navigate('/');
        } catch (error) {
            toast.error(getErrorMessage(error));
        }
    };

    const lowerStatus = (formData?.status || '').toLowerCase();
    const batchStep = getBatchStep(lowerStatus);
    // Only these statuses render the outreached accounts view inline on this page
    const isOutreached = batchStep === 'outreached';
    const canDelete = batchStep !== 'outreached';

    // Clicking Accounts always shows the Continue Exploring card first;
    // the button inside then guides to the correct next page per status.
    const handleTabChange = (key: TabKey) => {
        setActiveTab(key);
    };

    const tabs = [
        { key: 'overview' as TabKey, label: 'Batch Overview' },
        { key: 'product' as TabKey, label: 'Product Intelligence' },
        { key: 'icp' as TabKey, label: 'Ideal Customer Profile (ICP)' },
        { key: 'accounts' as TabKey, label: 'Accounts' },
    ];

    if (isLoading || !formData) {
        return (
            <div className="w-full max-w-280 mx-auto">
                <BatchCardSkeleton />
            </div>
        );
    }

    return (
        <div className="w-full pb-12">
            {/* Hero Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
                <div className="flex items-center gap-3">
                    <button onClick={() => navigate('/')} className="p-1.5 rounded-md text-fg hover:bg-bg-muted transition-colors">
                        <FiArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        {/* Change from formData.batch_name to formData.name */}
                        <h2 className="font-sans font-bold text-xl sm:text-2xl tracking-tight text-fg">{formData.name}</h2>
                        <p className="font-sans font-medium text-sm text-fg-body mt-1">
                            Created at: {new Date(formData.created_at).toLocaleString()}
                        </p>
                    </div>
                </div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
                    {canDelete && (
                        <Button variant="danger" className="w-full sm:w-auto max-w-none gap-2 justify-center" onClick={() => setIsDeleteOpen(true)} disabled={deleteBatch.isPending}>
                            <FiTrash2 className="w-4 h-4" />
                            Delete
                        </Button>
                    )}
                    <Button variant="outline" className="w-full sm:w-auto max-w-none justify-center" onClick={() => setIsCloneOpen(true)}>
                        Clone
                    </Button>
                    <Button
                        variant="primary"
                        className="w-full sm:w-auto max-w-none justify-center"
                        onClick={handleSave}
                        isLoading={updateBatch.isPending || isReranking}
                        disabled={updateBatch.isPending || isReranking}
                    >
                        Save
                    </Button>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="border-b border-border mb-6">
                <div className="flex items-center gap-2 overflow-x-auto">
                    {tabs.map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => handleTabChange(tab.key)}
                            className={`px-6 py-4 text-sm font-semibold tracking-tight transition-colors relative whitespace-nowrap ${activeTab === tab.key ? 'text-primary' : 'text-fg-body hover:text-fg'
                                }`}
                        >
                            {tab.label}
                            {activeTab === tab.key && (
                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"></div>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Tab Content */}
            <div className="max-w-[1120px] mx-auto">
                {activeTab === 'overview' && (
                    <BatchOverviewTab formData={formData} handleChange={handleChange} />
                )}
                {activeTab === 'product' && (
                    <ProductIntelligenceTab
                        data={formData.product_analysis || {}}
                        onChange={(name, value) => handleNestedChange('product_analysis', name, value)}
                    />
                )}
                {activeTab === 'icp' && (
                    <IcpTab
                        data={formData.icp || {}}
                        onChange={(name, value) => handleNestedChange('icp', name, value)}
                        batchId={formData.id}
                    />
                )}
                {activeTab === 'accounts' &&
                    (isOutreached ? (
                        <ContactsFetchedView batchId={formData.id} />
                    ) : (
                        <AccountsTab formData={formData} setFormData={setFormData} />
                    ))}
            </div>

            <CloneBatchModal
                isOpen={isCloneOpen}
                onClose={() => setIsCloneOpen(false)}
                defaultName={formData.name}
                onConfirm={handleClone}
                isLoading={cloneBatch.isPending}
            />

            <Modal isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} title="Delete Batch">
                <div className="flex flex-col gap-4">
                    <p className="font-sans text-sm leading-5 text-fg-body">
                        Are you sure you want to delete <span className="font-semibold text-fg">{formData.name}</span>? This will permanently remove the batch and all its dependent data. This cannot be undone.
                    </p>
                    <div className="flex justify-end gap-3 pt-2">
                        <Button variant="ghost" onClick={() => setIsDeleteOpen(false)} disabled={deleteBatch.isPending}>
                            Cancel
                        </Button>
                        <Button variant="danger" onClick={handleDelete} isLoading={deleteBatch.isPending} disabled={deleteBatch.isPending}>
                            Delete Batch
                        </Button>
                    </div>
                </div>
            </Modal>

            <Modal
                isOpen={isRerankOpen}
                onClose={() => {
                    if (!isReranking && !updateBatch.isPending) {
                        setIsRerankOpen(false);
                        setPendingPayload(null);
                    }
                }}
                title=""
            >
                <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between gap-4">
                        <h2 className="text-lg font-semibold text-fg">Re-rank contacts?</h2>
                        <button
                            onClick={() => {
                                if (!isReranking && !updateBatch.isPending) {
                                    setIsRerankOpen(false);
                                    setPendingPayload(null);
                                }
                            }}
                            disabled={isReranking || updateBatch.isPending}
                            aria-label="Close"
                            className="p-1.5 rounded-full bg-bg-page border border-border text-fg-body hover:text-fg hover:bg-bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                        >
                            <FiX className="w-5 h-5" />
                        </button>
                    </div>
                    <p className="font-sans text-sm leading-5 text-fg-body">
                        Product Intelligence was edited. Do you want to re-rank contacts based on the new intelligence?
                    </p>
                    <p className="font-sans text-xs text-fg-muted">Choose <span className="font-semibold">Yes</span> to re-rank (takes a moment) then save, or <span className="font-semibold">No</span> to just save.</p>
                    <div className="flex justify-end gap-3 pt-2">
                        <Button variant="ghost" onClick={() => handleConfirmRerank(false)} disabled={isReranking || updateBatch.isPending}>
                            No, just save
                        </Button>
                        <Button variant="primary" onClick={() => handleConfirmRerank(true)} isLoading={isReranking || updateBatch.isPending} disabled={isReranking || updateBatch.isPending}>
                            Yes, re-rank
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default WithNavbar(BatchDetailPage);