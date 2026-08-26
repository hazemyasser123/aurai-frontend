import React, { useEffect } from 'react';
import { Card, InputField, Select, TagInput } from '@/shared/components/ui';
import { useProducts } from '@/features/products/hooks/useProducts';
import type { Batch } from '@/features/batches/types/batchTypes';
import toast from 'react-hot-toast';
import { getErrorMessage } from '@/shared/utils/errorHandler';

interface BatchOverviewTabProps {
    formData: Batch;
    handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
}

export const BatchOverviewTab: React.FC<BatchOverviewTabProps> = ({ formData, handleChange }) => {
    const { data: products, isLoading: isLoadingProducts, isError: isProductsError, error: productsError } = useProducts();

    useEffect(() => {
        if (isProductsError) {
            toast.error(getErrorMessage(productsError));
        }
    }, [isProductsError, productsError]);

    // Lock core fields if batch is no longer Draft — covers Enriched, contacts fetched, emails drafted, outriched, Executed
    const lower = (formData.status || '').toLowerCase();
    const isLocked = lower !== 'draft';
    const lockedHint = isLocked ? `Locked because batch status is "${formData.status}" (editable only while Draft).` : undefined;

    return (
        <div className="flex flex-col gap-6">
            {/* Batch Details Card */}
            <Card variant="elevated" className="flex flex-col gap-6">
                <h3 className="font-sans font-semibold text-lg tracking-tight text-fg">Batch Details</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Select
                        label="BASE PRODUCT *"
                        name="base_product_id"
                        value={formData.base_product_id ? String(formData.base_product_id) : ''}
                        onChange={handleChange}
                        disabled={isLocked}
                        hint={lockedHint}
                    >
                        <option value="">
                            {isLoadingProducts ? "Loading products..." : "Select a product..."}
                        </option>
                        {products?.map((product) => (
                            <option key={String(product.id)} value={String(product.id)}>
                                {product.name}
                            </option>
                        ))}
                    </Select>

                    <InputField
                        label="BATCH NAME *"
                        name="name"
                        value={formData.name || ''}
                        onChange={handleChange}
                        disabled={isLocked}
                        hint={lockedHint}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputField
                        label="MAX RESULTS"
                        type="number"
                        name="max_results"
                        value={formData.max_results || 0}
                        onChange={handleChange}
                        disabled={isLocked}
                        hint={lockedHint}
                    />
                </div>
            </Card>

            {/* Outreach Settings Card */}
            <Card variant="elevated" className="flex flex-col gap-6">
                <div>
                    <h3 className="font-sans font-semibold text-lg tracking-tight text-fg">Outreach Settings</h3>
                    <p className="font-sans font-medium text-xs text-fg-body mt-1">
                        All optional - leave empty to keep today's default behavior.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-8">
                    <TagInput
                        label="CC"
                        values={formData.cc_emails || []}
                        onChange={(newVals) => handleChange({ target: { name: 'cc_emails', value: newVals, type: 'text' } } as any)}
                        hint="Attached to every email sent."
                    />
                    <TagInput
                        label="BCC"
                        values={formData.bcc_emails || []}
                        onChange={(newVals) => handleChange({ target: { name: 'bcc_emails', value: newVals, type: 'text' } } as any)}
                        hint="Attached to every email sent."
                    />
                    <TagInput
                        label="LOOP IN ON HUMAN ACTION"
                        values={formData.human_action_loop_emails || []}
                        onChange={(newVals) => handleChange({ target: { name: 'human_action_loop_emails', value: newVals, type: 'text' } } as any)}
                        hint="Looped into the live thread the moment a conversation needs human action."
                    />
                    <TagInput
                        label="FORWARD EMAILS"
                        values={formData.forward_emails || []}
                        onChange={(newVals) => handleChange({ target: { name: 'forward_emails', value: newVals, type: 'text' } } as any)}
                        hint="Email addresses to forward to."
                    />
                </div>

                <div className="border-t border-border pt-6 mt-2">
                    <h4 className="font-sans font-semibold text-xs tracking-tight text-primary mb-4">Advanced Follow-up Settings</h4>
                    <div className="flex flex-col gap-6">
                        <div className="flex items-start gap-3">
                            <input
                                type="checkbox"
                                name="enable_auto_followup"
                                id="enable_auto_followup"
                                checked={formData.enable_auto_followup || false}
                                onChange={handleChange}
                                className="mt-1 w-4 h-4 accent-primary cursor-pointer"
                            />
                            <div>
                                <label htmlFor="enable_auto_followup" className="font-sans font-semibold text-xs text-fg cursor-pointer">
                                    Enable Auto Follow up Flagging
                                </label>
                                <p className="font-sans font-normal text-xs text-fg-body mt-1">When off, no follow up flags are raised.</p>
                            </div>
                        </div>
                        <div className="max-w-md">
                            <InputField
                                label="Follow-up Delay (Days)"
                                type="number"
                                name="followup_delay_days"
                                value={formData.followup_delay_days || 5}
                                onChange={handleChange}
                            />
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    );
};