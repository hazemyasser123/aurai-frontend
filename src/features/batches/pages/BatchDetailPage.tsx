import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { WithNavbar } from '@/shared/components/hoc/WithNavbar';
import { Button } from '@/shared/components/ui';
import { FiArrowLeft } from 'react-icons/fi';
import { useBatch } from '@/features/batches/hooks/useBatch';
import { useUpdateBatch } from '@/features/batches/hooks/useUpdateBatch';
import { useCloneBatch } from '@/features/batches/hooks/useCloneBatch';
import { BatchOverviewTab } from '@/features/batches/components/tabs/BatchOverviewTab';
import { ProductIntelligenceTab } from '@/features/batches/components/tabs/ProductIntelligenceTab';
import { IcpTab } from '@/features/batches/components/tabs/IcpTab';
import { AccountsTab } from '@/features/batches/components/tabs/AccountsTab';
import { ContactsFetchedView } from '@/features/batches/components/contactsFetched/ContactsFetchedView';
import { CloneBatchModal } from '@/features/batches/components/CloneBatchModal';
import { BatchCardSkeleton } from '@/features/batches/components/BatchCardSkeleton';
import { getBatchStep, getStepRoute } from '@/features/batches/utils/batchFlow';
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
    const cloneBatch = useCloneBatch();

    // Sync local state when API data is loaded
    useEffect(() => {
        if (fetchedBatch) {
            setFormData(fetchedBatch);
        }
    }, [fetchedBatch]);

    // Access control for deep links (?tab=accounts): intermediate statuses redirect
    // to their canonical page instead of showing the accounts tab here.
    useEffect(() => {
        if (!fetchedBatch || !batchId) return;
        const tab = searchParams.get('tab');
        if (tab === 'accounts') {
            const step = getBatchStep(fetchedBatch.status);
            if (step === 'contacts' || step === 'draft') {
                navigate(getStepRoute(batchId, step), { replace: true });
            }
        }
    }, [fetchedBatch, batchId, searchParams, navigate]);

    // Handlers for form state
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;
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
            enable_auto_followup: formData.enable_auto_followup,
            followup_delay_days: formData.followup_delay_days != null ? Number(formData.followup_delay_days) : undefined,
            max_results: formData.max_results != null ? Number(formData.max_results) : undefined,
        };

        try {
            await updateBatch.mutateAsync(payload);
            toast.success('Batch saved successfully');
        } catch (error) {
            toast.error(getErrorMessage(error));
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

    const lowerStatus = (formData?.status || '').toLowerCase();
    const batchStep = getBatchStep(lowerStatus);
    // Only these statuses render the outreached accounts view inline on this page
    const isOutreached = batchStep === 'outreached';

    // Access control: clicking Accounts routes to the step matching the batch status.
    // Deep-links (?tab=accounts) for intermediate statuses are redirected in the effect below.
    const handleTabChange = (key: TabKey) => {
        if (key === 'accounts') {
            switch (batchStep) {
                case 'contacts':
                    navigate(getStepRoute(formData!.id, 'contacts'));
                    return;
                case 'draft':
                    navigate(getStepRoute(formData!.id, 'draft'));
                    return;
                case 'outreached':
                    // stay on this page and show the outreached accounts view
                    setActiveTab(key);
                    return;
                default:
                    // explore / enrich: show AccountsTab which routes further
                    setActiveTab(key);
                    return;
            }
        }
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
                <div className="flex items-center gap-4 w-full sm:w-auto">
                    <Button variant="outline" className="w-full sm:w-auto" onClick={() => setIsCloneOpen(true)}>
                        Clone
                    </Button>
                    <Button
                        variant="primary"
                        className="w-full sm:w-auto"
                        onClick={handleSave}
                        isLoading={updateBatch.isPending}
                        disabled={updateBatch.isPending}
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
        </div>
    );
};

export default WithNavbar(BatchDetailPage);