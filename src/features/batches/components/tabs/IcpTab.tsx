import React from 'react';
import { Card, InputField, TagInput } from '@/shared/components/ui';
import { IcpChatAssistant } from '@/shared/components/icp/IcpChatAssistant';
import { batchApi } from '@/shared/queries/batches/batchApi';
import type { Icp } from '@/features/batches/types/batchTypes';

interface IcpTabProps {
    data: Icp;
    onChange: (name: string, value: any) => void;
    batchId?: string;
    disabled?: boolean;
    lockedHint?: string;
}

export const IcpTab: React.FC<IcpTabProps> = ({ data, onChange, batchId, disabled = false, lockedHint }) => {
    const hint = disabled ? lockedHint : undefined;
    const handleApply = (proposed: Record<string, unknown>) => {
        if (disabled) return;
        Object.entries(proposed).forEach(([k, v]) => onChange(k, v));
    };

    return (
        <div className="relative">
            <Card variant="elevated" className="flex flex-col gap-6">
                <div className="flex flex-col gap-1">
                    <h3 className="font-sans font-semibold text-lg tracking-tight text-fg">Ideal Customer Profile (ICP)</h3>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-fg-subtle">TARGET ACCOUNT PARAMETERS</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputField label="Target Profile Name" value={data.name || ''} onChange={(e) => onChange('name', e.target.value)} disabled={disabled} hint={hint} />
                </div>

                <div className="flex flex-col gap-2">
                    <label className="font-sans font-semibold text-xs tracking-tight text-primary">Strategic Summary</label>
                    <textarea
                        className={`flex items-start gap-3 w-full min-h-30 px-4 py-2.5 border border-solid rounded-lg font-sans font-normal text-sm outline-none transition-[border-color,box-shadow] resize-y ${disabled ? 'bg-bg-muted text-fg-muted cursor-not-allowed border-border opacity-60' : 'bg-bg-input text-fg-strong border-border focus:border-border-focus focus:shadow-[0_0_0_3px_rgba(127,34,254,0.12)]'}`}
                        value={data.strategic_summary || ''}
                        onChange={(e) => onChange('strategic_summary', e.target.value)}
                        rows={3}
                        disabled={disabled}
                    />
                    {hint && <span className="font-sans font-normal text-xs leading-4 text-fg-muted mt-1">{hint}</span>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputField label="Min Employees" type="number" value={data.min_employees || ''} onChange={(e) => onChange('min_employees', Number(e.target.value))} disabled={disabled} hint={hint} />
                    <InputField label="Max Employees" type="number" value={data.max_employees || ''} onChange={(e) => onChange('max_employees', Number(e.target.value))} disabled={disabled} hint={hint} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputField label="Min Revenue ($ Millions)" type="number" value={data.min_revenue || ''} onChange={(e) => onChange('min_revenue', Number(e.target.value))} disabled={disabled} hint={hint} />
                    <InputField label="Max Revenue ($ Millions)" type="number" value={data.max_revenue || ''} onChange={(e) => onChange('max_revenue', Number(e.target.value))} disabled={disabled} hint={hint} />
                </div>

                <TagInput label="Target Industries" values={data.industries || []} onChange={(vals) => onChange('industries', vals)} disabled={disabled} hint={hint} />
                <TagInput label="Target Geographies" values={data.geographies || []} onChange={(vals) => onChange('geographies', vals)} disabled={disabled} hint={hint} />
                <TagInput label="Included Technologies" values={data.included_technologies || []} onChange={(vals) => onChange('included_technologies', vals)} disabled={disabled} hint={hint} />
                <TagInput label="Funding Stages" values={data.funding_stages || []} onChange={(vals) => onChange('funding_stages', vals)} disabled={disabled} hint={hint} />
                <TagInput label="Excluded Technologies" values={data.excluded_technologies || []} onChange={(vals) => onChange('excluded_technologies', vals)} disabled={disabled} hint={hint} />
                <TagInput label="Hiring Signals" values={data.hiring_signals || []} onChange={(vals) => onChange('hiring_signals', vals)} disabled={disabled} hint={hint} />
                <TagInput label="Intent Topics" values={data.intent_topics || []} onChange={(vals) => onChange('intent_topics', vals)} disabled={disabled} hint={hint} />
                <TagInput label="Decision Maker Personas" values={data.decision_maker_roles || []} onChange={(vals) => onChange('decision_maker_roles', vals)} disabled={disabled} hint={hint} />
                <TagInput label="Target Company Characteristics" values={data.company_characteristics || []} onChange={(vals) => onChange('company_characteristics', vals)} disabled={disabled} hint={hint} />
            </Card>

            {/* ICB Assistant — per-session chat, Apply updates form without API call, Save persists */}
            {batchId && (
                <IcpChatAssistant
                    currentIcp={data as unknown as Record<string, unknown>}
                    onApply={handleApply}
                    chatFn={({ message, current_icp }) => batchApi.chatIcp(batchId, { message, current_icp })}
                    title="ICB Assistant"
                    disabled={disabled}
                    lockedHint={lockedHint}
                />
            )}
        </div>
    );
};