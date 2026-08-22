import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { WithNavbar } from '@/shared/components/hoc/WithNavbar';
import { Button } from '@/shared/components/ui';
import { FiArrowLeft } from 'react-icons/fi';
import { useBatch } from '@/features/batches/hooks/useBatch';
import { BatchOverviewTab } from '@/features/batches/components/tabs/BatchOverviewTab';
import { ProductIntelligenceTab } from '@/features/batches/components/tabs/ProductIntelligenceTab';
import { IcpTab } from '@/features/batches/components/tabs/IcpTab';
import { AccountsTab } from '@/features/batches/components/tabs/AccountsTab';
import { BatchCardSkeleton } from '@/features/batches/components/BatchCardSkeleton';
import type { Batch } from '@/features/batches/types/batchTypes';

type TabKey = 'overview' | 'product' | 'icp' | 'accounts';

const BatchDetailPage: React.FC = () => {
    const { batchId } = useParams<{ batchId: string }>();
    const navigate = useNavigate();
    const { data: fetchedBatch, isLoading } = useBatch(batchId || '');

    const [activeTab, setActiveTab] = useState<TabKey>('overview');
    const [formData, setFormData] = useState<Batch | null>(null);

    // Sync local state when API data is loaded
    useEffect(() => {
        if (fetchedBatch) {
            setFormData(fetchedBatch);
        }
    }, [fetchedBatch]);

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
                    <Button variant="outline" className="w-full sm:w-auto">Clone</Button>
                    <Button variant="primary" className="w-full sm:w-auto">Save</Button>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="border-b border-border mb-6">
                <div className="flex items-center gap-2 overflow-x-auto">
                    {tabs.map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
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
                {/* Update this line to pass formData */}
                {activeTab === 'accounts' && <AccountsTab formData={formData} setFormData={setFormData} />}
            </div>
        </div>
    );
};

export default WithNavbar(BatchDetailPage);