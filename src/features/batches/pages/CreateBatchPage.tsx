import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { WithNavbar } from '@/shared/components/hoc/WithNavbar';
import { Button, Card, InputField, Select, Textarea } from '@/shared/components/ui';
import { FiArrowLeft } from 'react-icons/fi';
import { useCreateBatch } from '@/features/batches/hooks/useCreateBatch';
import { useProducts } from '@/features/products/hooks/useProducts';
import { useBatchDatasources } from '@/features/batches/hooks/useBatchDatasources';
import { createBatchSchema } from '@/features/batches/schemas/batchSchemas';
import toast from 'react-hot-toast';
import { getErrorMessage } from '@/shared/utils/errorHandler';

const CreateBatchPage: React.FC = () => {
    const navigate = useNavigate();
    const createBatch = useCreateBatch();

    const { data: products, isLoading: isLoadingProducts, isError: isProductsError, error: productsError } = useProducts();
    const { data: datasources } = useBatchDatasources();

    useEffect(() => {
        if (isProductsError) {
            toast.error(getErrorMessage(productsError));
        }
    }, [isProductsError, productsError]);

    const [formData, setFormData] = useState({
        base_product_id: '',
        name: '',
        max_results: 50,
        batch_description: '',
        account_source: 'apollo' as string,
        contact_source: 'apollo' as string,
        cc_emails: '',
        bcc_emails: '',
        human_action_loop_emails: '',
        forward_emails: '', // Changed to plural
        enable_auto_followup: true,
        followup_delay_days: 5,
        reply_delay_enabled: false,
        reply_timezone: 'UTC',
        reply_working_days: [0, 1, 2, 3, 4, 5, 6] as number[],
        reply_working_hours_start: '08:00',
        reply_working_hours_end: '20:00',
        reply_base_delay_minutes: 60,
        reply_delay_buffer_minutes: 20,
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    const accountSourceOptions = useMemo(() => {
        const base = datasources?.accounts ?? [];
        const current = formData.account_source;
        if (current && !base.includes(current)) return [current, ...base];
        return base;
    }, [datasources?.accounts, formData.account_source]);

    const contactSourceOptions = useMemo(() => {
        const base = datasources?.contacts ?? [];
        const current = formData.contact_source;
        if (current && !base.includes(current)) return [current, ...base];
        return base;
    }, [datasources?.contacts, formData.contact_source]);

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
            name: validation.data.name,
            base_product_id: validation.data.base_product_id,
            max_results: validation.data.max_results,
            account_source: validation.data.account_source,
            contact_source: validation.data.contact_source,
            cc_emails: parseEmails(validation.data.cc_emails || ''),
            bcc_emails: parseEmails(validation.data.bcc_emails || ''),
            human_action_loop_emails: parseEmails(validation.data.human_action_loop_emails || ''),
            forward_emails: parseEmails(validation.data.forward_emails || ''), // Fixed mapping
            enable_auto_followup: validation.data.enable_auto_followup,
            followup_delay_days: validation.data.followup_delay_days,
            reply_delay_enabled: validation.data.reply_delay_enabled,
            reply_timezone: validation.data.reply_timezone,
            reply_working_days: validation.data.reply_working_days,
            reply_working_hours_start: validation.data.reply_working_hours_start,
            reply_working_hours_end: validation.data.reply_working_hours_end,
            reply_base_delay_minutes: validation.data.reply_base_delay_minutes,
            reply_delay_buffer_minutes: validation.data.reply_delay_buffer_minutes,
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
                            name="name"
                            id="name"
                            placeholder="e.g., Q3 Enterprise Expansion"
                            value={formData.name}
                            onChange={handleChange}
                            error={errors.name}
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

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Select
                            label="ACCOUNT SOURCE"
                            name="account_source"
                            id="account_source"
                            value={formData.account_source}
                            onChange={handleChange}
                            error={errors.account_source}
                            hint="Where accounts are sourced from"
                        >
                            {accountSourceOptions.map((opt) => (
                                <option key={opt} value={opt}>
                                    {opt.charAt(0).toUpperCase() + opt.slice(1)}
                                </option>
                            ))}
                        </Select>

                        <Select
                            label="CONTACT SOURCE"
                            name="contact_source"
                            id="contact_source"
                            value={formData.contact_source}
                            onChange={handleChange}
                            error={errors.contact_source}
                            hint="Where contacts are sourced from"
                        >
                            {contactSourceOptions.map((opt) => (
                                <option key={opt} value={opt}>
                                    {opt.charAt(0).toUpperCase() + opt.slice(1)}
                                </option>
                            ))}
                        </Select>
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

                    {/* Human-like Auto-Reply Delay — matches Figma reference */}
                    <div className="border-t border-border pt-6 mt-2">
                        <h4 className="font-sans font-semibold text-xs tracking-widest text-[#7F22FE] mb-1">HUMAN-LIKE AUTO-REPLY DELAY</h4>
                        <p className="font-sans font-normal text-xs leading-5 text-fg-body mb-4">
                            Draft AI replies immediately, but send them after a delay during working hours so they don&apos;t feel automated.
                        </p>

                        <div className="flex items-start gap-3 mb-5">
                            <input
                                type="checkbox"
                                name="reply_delay_enabled"
                                id="reply_delay_enabled"
                                checked={formData.reply_delay_enabled}
                                onChange={handleChange}
                                className="mt-0.5 w-4 h-4 accent-primary cursor-pointer rounded"
                            />
                            <div className="flex flex-col gap-0.5">
                                <label htmlFor="reply_delay_enabled" className="font-sans font-semibold text-xs text-fg cursor-pointer">
                                    Enable Reply Delay
                                </label>
                                <span className="font-sans font-normal text-xs text-fg-body">
                                    When off, AI auto-replies send immediately (legacy behavior).
                                </span>
                            </div>
                        </div>

                        <div className="flex flex-col gap-5">
                            {/* Timezone */}
                            <div className="flex flex-col gap-1.5">
                                <span className="font-sans font-semibold text-xs tracking-widest text-[#7F22FE]">TIMEZONE (IANA)</span>
                                <div className={`flex items-center gap-2 px-4 py-2.5 bg-bg-input border rounded-lg ${errors.reply_timezone ? 'border-danger' : 'border-border/60'} transition-colors`}>
                                    <input
                                        name="reply_timezone"
                                        id="reply_timezone"
                                        value={formData.reply_timezone}
                                        onChange={handleChange}
                                        placeholder="UTC"
                                        className="flex-1 bg-transparent outline-none font-sans font-medium text-sm text-fg placeholder:text-fg-muted"
                                    />
                                </div>
                                {errors.reply_timezone && <span className="font-sans text-xs text-danger">{errors.reply_timezone}</span>}
                            </div>

                            {/* Working Days */}
                            <div className="flex flex-col gap-1.5">
                                <span className="font-sans font-semibold text-xs tracking-widest text-[#7F22FE]">WORKING DAYS</span>
                                <div className="flex flex-wrap gap-2">
                                    {[
                                        { v: 0, label: 'Mon' },
                                        { v: 1, label: 'Tue' },
                                        { v: 2, label: 'Wed' },
                                        { v: 3, label: 'Thu' },
                                        { v: 4, label: 'Fri' },
                                        { v: 5, label: 'Sat' },
                                        { v: 6, label: 'Sun' },
                                    ].map((d) => {
                                        const selected = formData.reply_working_days.includes(d.v);
                                        return (
                                            <button
                                                key={d.v}
                                                type="button"
                                                onClick={() =>
                                                    setFormData((prev) => ({
                                                        ...prev,
                                                        reply_working_days: selected
                                                            ? prev.reply_working_days.filter((x) => x !== d.v)
                                                            : [...prev.reply_working_days, d.v].sort((a, b) => a - b),
                                                    }))
                                                }
                                                className={`px-3 py-1.5 rounded-lg border font-sans font-medium text-xs tracking-tight transition-[transform,background-color,color,border-color] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] active:scale-[0.97] ${selected
                                                    ? 'bg-[#EDE9FF] border-[#DDD6FF] text-[#7F22FE]'
                                                    : 'bg-bg-input border-border/60 text-fg-body hover:border-border'
                                                    }`}
                                            >
                                                {d.label}
                                            </button>
                                        );
                                    })}
                                </div>
                                {errors.reply_working_days && <span className="font-sans text-xs text-danger">{errors.reply_working_days}</span>}
                            </div>

                            {/* Hours Start / End — clicking anywhere on the field opens the picker */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex flex-col gap-1.5">
                                    <span className="font-sans font-semibold text-xs tracking-widest text-[#7F22FE]">HOURS START</span>
                                    <div
                                        onClick={(e) => {
                                            const inp = e.currentTarget.querySelector('input') as HTMLInputElement | null;
                                            try { (inp as unknown as { showPicker?: () => void })?.showPicker?.(); } catch { inp?.focus(); }
                                        }}
                                        className={`relative flex items-center bg-bg-input border rounded-lg cursor-pointer ${errors.reply_working_hours_start ? 'border-danger' : 'border-border/60'} hover:border-border transition-colors`}
                                    >
                                        <input
                                            type="time"
                                            name="reply_working_hours_start"
                                            id="reply_working_hours_start"
                                            value={formData.reply_working_hours_start}
                                            onChange={handleChange}
                                            onClick={(e) => { try { (e.currentTarget as unknown as { showPicker?: () => void }).showPicker?.(); } catch { /* ignore */ } }}
                                            className="flex-1 px-4 py-2.5 bg-transparent outline-none font-sans font-medium text-sm text-fg cursor-pointer"
                                        />
                                    </div>
                                    {errors.reply_working_hours_start && <span className="font-sans text-xs text-danger">{errors.reply_working_hours_start}</span>}
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <span className="font-sans font-semibold text-xs tracking-widest text-[#7F22FE]">HOURS END</span>
                                    <div
                                        onClick={(e) => {
                                            const inp = e.currentTarget.querySelector('input') as HTMLInputElement | null;
                                            try { (inp as unknown as { showPicker?: () => void })?.showPicker?.(); } catch { inp?.focus(); }
                                        }}
                                        className={`relative flex items-center bg-bg-input border rounded-lg cursor-pointer ${errors.reply_working_hours_end ? 'border-danger' : 'border-border/60'} hover:border-border transition-colors`}
                                    >
                                        <input
                                            type="time"
                                            name="reply_working_hours_end"
                                            id="reply_working_hours_end"
                                            value={formData.reply_working_hours_end}
                                            onChange={handleChange}
                                            onClick={(e) => { try { (e.currentTarget as unknown as { showPicker?: () => void }).showPicker?.(); } catch { /* ignore */ } }}
                                            className="flex-1 px-4 py-2.5 bg-transparent outline-none font-sans font-medium text-sm text-fg cursor-pointer"
                                        />
                                    </div>
                                    {errors.reply_working_hours_end && <span className="font-sans text-xs text-danger">{errors.reply_working_hours_end}</span>}
                                </div>
                            </div>

                            {/* Base Delay / Random Buffer */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex flex-col gap-1.5">
                                    <span className="font-sans font-semibold text-xs tracking-widest text-[#7F22FE]">BASE DELAY (MIN)</span>
                                    <div className={`flex items-center bg-bg-input border rounded-lg ${errors.reply_base_delay_minutes ? 'border-danger' : 'border-border/60'}`}>
                                        <input
                                            type="number"
                                            name="reply_base_delay_minutes"
                                            id="reply_base_delay_minutes"
                                            value={formData.reply_base_delay_minutes}
                                            onChange={handleChange}
                                            min={0}
                                            className="flex-1 px-4 py-2.5 bg-transparent outline-none font-sans font-medium text-sm text-fg"
                                        />
                                    </div>
                                    {errors.reply_base_delay_minutes && <span className="font-sans text-xs text-danger">{errors.reply_base_delay_minutes}</span>}
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <span className="font-sans font-semibold text-xs tracking-widest text-[#7F22FE]">RANDOM BUFFER (MIN)</span>
                                    <div className={`flex items-center bg-bg-input border rounded-lg ${errors.reply_delay_buffer_minutes ? 'border-danger' : 'border-border/60'}`}>
                                        <input
                                            type="number"
                                            name="reply_delay_buffer_minutes"
                                            id="reply_delay_buffer_minutes"
                                            value={formData.reply_delay_buffer_minutes}
                                            onChange={handleChange}
                                            min={0}
                                            className="flex-1 px-4 py-2.5 bg-transparent outline-none font-sans font-medium text-sm text-fg"
                                        />
                                    </div>
                                    {errors.reply_delay_buffer_minutes && <span className="font-sans text-xs text-danger">{errors.reply_delay_buffer_minutes}</span>}
                                </div>
                            </div>

                            <p className="font-sans font-normal text-xs leading-4 text-fg-body">
                                Send after base delay + a random 0–buffer minutes, constrained to the working window.
                            </p>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default WithNavbar(CreateBatchPage);