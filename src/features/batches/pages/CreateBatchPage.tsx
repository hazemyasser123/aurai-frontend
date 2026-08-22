import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { WithNavbar } from '@/shared/components/hoc/WithNavbar';
import { Button, Card, InputField, Select, Textarea } from '@/shared/components/ui';
import { FiArrowLeft } from 'react-icons/fi';
import { useCreateBatch } from '@/features/batches/hooks/useCreateBatch';
import { useProducts } from '@/features/products/hooks/useProducts';
import { createBatchSchema } from '@/features/batches/schemas/batchSchemas';
import toast from 'react-hot-toast';
import { getErrorMessage } from '@/shared/utils/errorHandler';

const CreateBatchPage: React.FC = () => {
    const navigate = useNavigate();
    const createBatch = useCreateBatch();

    const { data: products, isLoading: isLoadingProducts, isError: isProductsError, error: productsError } = useProducts();

    useEffect(() => {
        if (isProductsError) {
            toast.error(getErrorMessage(productsError));
        }
    }, [isProductsError, productsError]);

    const [formData, setFormData] = useState({
        base_product_id: '',
        batch_name: '',
        max_results: 50,
        batch_description: '',
        cc_emails: '',
        bcc_emails: '',
        human_action_loop_emails: '',
        forward_emails: '', // Changed to plural
        enable_auto_followup: true,
        followup_delay_days: 5,
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const parseEmails = (str: string) => {
        if (!str) return [];
        return str.split(',').map(email => email.trim()).filter(Boolean);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});

        const validation = createBatchSchema.safeParse(formData);

        if (!validation.success) {
            const mappedErrors: Record<string, string> = {};
            validation.error.issues.forEach(issue => {
                mappedErrors[issue.path[0] as string] = issue.message;
            });
            setErrors(mappedErrors);
            toast.error("Please fix the highlighted errors.");
            return;
        }

        const payload = {
            batch_name: validation.data.batch_name,
            base_product_id: validation.data.base_product_id,
            max_results: validation.data.max_results,
            cc_emails: parseEmails(validation.data.cc_emails || ''),
            bcc_emails: parseEmails(validation.data.bcc_emails || ''),
            human_action_loop_emails: parseEmails(validation.data.human_action_loop_emails || ''),
            forward_emails: parseEmails(validation.data.forward_emails || ''), // Fixed mapping
            enable_auto_followup: validation.data.enable_auto_followup,
            followup_delay_days: validation.data.followup_delay_days,
        };

        try {
            await createBatch.mutateAsync(payload);
            toast.success("Batch created successfully");
            navigate('/');
        } catch (error) {
            toast.error(getErrorMessage(error));
        }
    };

    return (
        <div className="w-full pb-12">
            {/* Hero Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
                <div className="flex items-center gap-3">
                    <button onClick={() => navigate('/')} className="p-1.5 rounded-md text-fg hover:bg-bg-muted transition-colors">
                        <FiArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h2 className="font-sans font-bold text-xl sm:text-2xl tracking-tight text-fg">Create Target Batch</h2>
                        <p className="font-sans font-medium text-sm text-fg-body mt-1">
                            Generate target account batches.
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-4 w-full sm:w-auto">
                    <Button variant="outline" className="w-full sm:w-auto" onClick={() => navigate('/')}>
                        Cancel
                    </Button>
                    <Button variant="primary" className="w-full sm:w-auto" isLoading={createBatch.isPending} onClick={handleSubmit}>
                        Save
                    </Button>
                </div>
            </div>

            {/* Form Container */}
            <div className="flex flex-col gap-6 max-w-[1120px] mx-auto">

                {/* Batch Details Card */}
                <Card variant="elevated" className="flex flex-col gap-6">
                    <h3 className="font-sans font-semibold text-lg tracking-tight text-fg">Batch Details</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Select
                            label="BASE PRODUCT *"
                            name="base_product_id"
                            id="base_product_id"
                            value={formData.base_product_id}
                            onChange={handleChange}
                            error={errors.base_product_id}
                            disabled={isLoadingProducts}
                        >
                            <option value="">
                                {isLoadingProducts ? "Loading products..." : "Select a product..."}
                            </option>
                            {products?.map((product) => (
                                <option key={product.id} value={product.id}>
                                    {product.name}
                                </option>
                            ))}
                        </Select>

                        <InputField
                            label="BATCH NAME *"
                            type="text"
                            name="batch_name"
                            id="batch_name"
                            placeholder="e.g., Q3 Enterprise Expansion"
                            value={formData.batch_name}
                            onChange={handleChange}
                            error={errors.batch_name}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InputField
                            label="MAX RESULTS"
                            type="number"
                            name="max_results"
                            id="max_results"
                            placeholder="e.g., 50"
                            value={formData.max_results}
                            onChange={handleChange}
                            error={errors.max_results}
                        />
                    </div>

                    <Textarea
                        label="BATCH DESCRIPTION"
                        name="batch_description"
                        id="batch_description"
                        placeholder="Briefly describe the goal of this batch..."
                        value={formData.batch_description}
                        onChange={handleChange}
                        rows={4}
                    />
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
                        <InputField
                            label="CC"
                            type="text"
                            name="cc_emails"
                            id="cc_emails"
                            placeholder="Add Cc email address"
                            value={formData.cc_emails}
                            onChange={handleChange}
                            error={errors.cc_emails}
                            hint="Attached to every email sent. Separate multiple addresses by commas."
                        />

                        <InputField
                            label="BCC"
                            type="text"
                            name="bcc_emails"
                            id="bcc_emails"
                            placeholder="Add Bcc email address"
                            value={formData.bcc_emails}
                            onChange={handleChange}
                            error={errors.bcc_emails}
                            hint="Attached to every email sent. Separate multiple addresses by commas."
                        />

                        <InputField
                            label="LOOP IN ON HUMAN ACTION"
                            type="text"
                            name="human_action_loop_emails"
                            id="human_action_loop_emails"
                            placeholder="Add email address to loop in..."
                            value={formData.human_action_loop_emails}
                            onChange={handleChange}
                            error={errors.human_action_loop_emails}
                            hint="Looped into the live thread the moment a conversation needs human action. Separate multiple by commas."
                        />

                        <InputField
                            label="FORWARD EMAILS" // Updated label
                            type="text"
                            name="forward_emails" // Updated name
                            id="forward_emails"
                            placeholder="Add forward email addresses..." // Updated placeholder
                            value={formData.forward_emails}
                            onChange={handleChange}
                            error={errors.forward_emails}
                            hint="Forward email addresses. Separate multiple addresses by commas." // Updated hint
                        />
                    </div>

                    {/* Advanced Follow-up Settings */}
                    <div className="border-t border-border pt-6 mt-2">
                        <h4 className="font-sans font-semibold text-xs tracking-tight text-primary mb-4">Advanced Follow-up Settings</h4>

                        <div className="flex flex-col gap-6">
                            <div className="flex items-start gap-3">
                                <input
                                    type="checkbox"
                                    name="enable_auto_followup"
                                    id="enable_auto_followup"
                                    checked={formData.enable_auto_followup}
                                    onChange={handleChange}
                                    className="mt-1 w-4 h-4 accent-primary cursor-pointer"
                                />
                                <div>
                                    <label htmlFor="enable_auto_followup" className="font-sans font-semibold text-xs text-fg cursor-pointer">
                                        Enable Auto Follow up Flagging
                                    </label>
                                    <p className="font-sans font-normal text-xs text-fg-body mt-1">
                                        When off, no follow up flags are raised.
                                    </p>
                                </div>
                            </div>

                            <div className="max-w-md">
                                <InputField
                                    label="Follow-up Delay (Days)"
                                    type="number"
                                    name="followup_delay_days"
                                    id="followup_delay_days"
                                    placeholder="e.g., 5"
                                    value={formData.followup_delay_days}
                                    onChange={handleChange}
                                    error={errors.followup_delay_days}
                                    hint="Days after the last outbound send before a conversation is flagged Needs Follow-up."
                                />
                            </div>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default WithNavbar(CreateBatchPage);