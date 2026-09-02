import React, { useEffect, useMemo } from 'react';
import { Card, InputField, Select, TagInput } from '@/shared/components/ui';
import { useProducts } from '@/features/products/hooks/useProducts';
import { useBatchDatasources } from '@/features/batches/hooks/useBatchDatasources';
import type { Batch } from '@/features/batches/types/batchTypes';
import toast from 'react-hot-toast';
import { getErrorMessage } from '@/shared/utils/errorHandler';

interface BatchOverviewTabProps {
    formData: Batch;
    handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
}

export const BatchOverviewTab: React.FC<BatchOverviewTabProps> = ({ formData, handleChange }) => {
    const { data: products, isLoading: isLoadingProducts, isError: isProductsError, error: productsError } = useProducts();
    const { data: datasources } = useBatchDatasources();

    const accountSourceOptions = useMemo(() => {
        const base = datasources?.accounts ?? [];
        const current = formData.account_source as string | undefined;
        if (current && !base.includes(current)) return [current, ...base];
        return base;
    }, [datasources?.accounts, formData.account_source]);

    const contactSourceOptions = useMemo(() => {
        const base = datasources?.contacts ?? [];
        const current = formData.contact_source as string | undefined;
        if (current && !base.includes(current)) return [current, ...base];
        return base;
    }, [datasources?.contacts, formData.contact_source]);

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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Select
                        label="ACCOUNT SOURCE"
                        name="account_source"
                        value={(formData.account_source as string) || 'apollo'}
                        onChange={handleChange}
                        disabled={isLocked}
                        hint={isLocked ? lockedHint : "Where accounts are sourced from"}
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
                        value={(formData.contact_source as string) || 'apollo'}
                        onChange={handleChange}
                        disabled={isLocked}
                        hint={isLocked ? lockedHint : "Where contacts are sourced from"}
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
                    <TagInput
                        label="CC"
                        values={formData.cc_emails || []}
                        onChange={(newVals) => handleChange({ target: { name: 'cc_emails', value: newVals, type: 'text' } } as any)}
                        hint="Attached to every email sent."
                        validateAsEmail
                    />
                    <TagInput
                        label="BCC"
                        values={formData.bcc_emails || []}
                        onChange={(newVals) => handleChange({ target: { name: 'bcc_emails', value: newVals, type: 'text' } } as any)}
                        hint="Attached to every email sent."
                        validateAsEmail
                    />
                    <TagInput
                        label="LOOP IN ON HUMAN ACTION"
                        values={formData.human_action_loop_emails || []}
                        onChange={(newVals) => handleChange({ target: { name: 'human_action_loop_emails', value: newVals, type: 'text' } } as any)}
                        hint="Looped into the live thread the moment a conversation needs human action."
                        validateAsEmail
                    />
                    <TagInput
                        label="FORWARD EMAILS"
                        values={formData.forward_emails || []}
                        onChange={(newVals) => handleChange({ target: { name: 'forward_emails', value: newVals, type: 'text' } } as any)}
                        hint="Email addresses to forward to."
                        validateAsEmail
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

                {/* Human-like Auto-Reply Delay — mirrors CreateBatchPage / Figma reference */}
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
                            checked={!!formData.reply_delay_enabled}
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
                            <div className="flex items-center gap-2 px-4 py-2.5 bg-bg-input border rounded-lg border-border/60 transition-colors">
                                <input
                                    name="reply_timezone"
                                    id="reply_timezone"
                                    value={formData.reply_timezone || 'UTC'}
                                    onChange={handleChange}
                                    placeholder="UTC"
                                    className="flex-1 bg-transparent outline-none font-sans font-medium text-sm text-fg placeholder:text-fg-muted"
                                />
                            </div>
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
                                    const days = (formData.reply_working_days as number[] | undefined) ?? [0, 1, 2, 3, 4, 5, 6];
                                    const selected = days.includes(d.v);
                                    return (
                                        <button
                                            key={d.v}
                                            type="button"
                                            onClick={() => {
                                                const next = selected ? days.filter((x) => x !== d.v) : [...days, d.v].sort((a, b) => a - b);
                                                handleChange({ target: { name: 'reply_working_days', value: next, type: 'text' } } as unknown as React.ChangeEvent<HTMLInputElement>);
                                            }}
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
                                    className="relative flex items-center bg-bg-input border rounded-lg border-border/60 cursor-pointer hover:border-border transition-colors"
                                >
                                    <input
                                        type="time"
                                        name="reply_working_hours_start"
                                        id="reply_working_hours_start"
                                        value={formData.reply_working_hours_start || '08:00'}
                                        onChange={handleChange}
                                        onClick={(e) => {
                                            try { (e.currentTarget as unknown as { showPicker?: () => void }).showPicker?.(); } catch { /* ignore */ }
                                        }}
                                        className="flex-1 px-4 py-2.5 bg-transparent outline-none font-sans font-medium text-sm text-fg cursor-pointer"
                                    />
                                </div>
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <span className="font-sans font-semibold text-xs tracking-widest text-[#7F22FE]">HOURS END</span>
                                <div
                                    onClick={(e) => {
                                        const inp = e.currentTarget.querySelector('input') as HTMLInputElement | null;
                                        try { (inp as unknown as { showPicker?: () => void })?.showPicker?.(); } catch { inp?.focus(); }
                                    }}
                                    className="relative flex items-center bg-bg-input border rounded-lg border-border/60 cursor-pointer hover:border-border transition-colors"
                                >
                                    <input
                                        type="time"
                                        name="reply_working_hours_end"
                                        id="reply_working_hours_end"
                                        value={formData.reply_working_hours_end || '20:00'}
                                        onChange={handleChange}
                                        onClick={(e) => {
                                            try { (e.currentTarget as unknown as { showPicker?: () => void }).showPicker?.(); } catch { /* ignore */ }
                                        }}
                                        className="flex-1 px-4 py-2.5 bg-transparent outline-none font-sans font-medium text-sm text-fg cursor-pointer"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Base Delay / Random Buffer */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex flex-col gap-1.5">
                                <span className="font-sans font-semibold text-xs tracking-widest text-[#7F22FE]">BASE DELAY (MIN)</span>
                                <div className="flex items-center bg-bg-input border rounded-lg border-border/60">
                                    <input
                                        type="number"
                                        name="reply_base_delay_minutes"
                                        id="reply_base_delay_minutes"
                                        value={formData.reply_base_delay_minutes ?? 60}
                                        onChange={handleChange}
                                        min={0}
                                        className="flex-1 px-4 py-2.5 bg-transparent outline-none font-sans font-medium text-sm text-fg"
                                    />
                                </div>
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <span className="font-sans font-semibold text-xs tracking-widest text-[#7F22FE]">RANDOM BUFFER (MIN)</span>
                                <div className="flex items-center bg-bg-input border rounded-lg border-border/60">
                                    <input
                                        type="number"
                                        name="reply_delay_buffer_minutes"
                                        id="reply_delay_buffer_minutes"
                                        value={formData.reply_delay_buffer_minutes ?? 20}
                                        onChange={handleChange}
                                        min={0}
                                        className="flex-1 px-4 py-2.5 bg-transparent outline-none font-sans font-medium text-sm text-fg"
                                    />
                                </div>
                            </div>
                        </div>

                        <p className="font-sans font-normal text-xs leading-4 text-fg-body">
                            Send after base delay + a random 0–buffer minutes, constrained to the working window.
                        </p>
                    </div>
                </div>
            </Card>
        </div>
    );
};