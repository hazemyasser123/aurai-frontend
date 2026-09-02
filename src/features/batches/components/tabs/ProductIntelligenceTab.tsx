import React from 'react';
import { Card, Textarea, TagInput } from '@/shared/components/ui';
import type { ProductAnalysis } from '@/features/batches/types/batchTypes';

interface ProductIntelligenceTabProps {
    data: ProductAnalysis;
    onChange: (name: string, value: any) => void;
    disabled?: boolean;
    lockedHint?: string;
}

export const ProductIntelligenceTab: React.FC<ProductIntelligenceTabProps> = ({ data, onChange, disabled = false, lockedHint }) => {
    const hint = disabled ? lockedHint : undefined;
    return (
        <Card variant="elevated" className="flex flex-col gap-6">
            <div className="flex flex-col gap-1">
                <h3 className="font-sans font-semibold text-lg tracking-tight text-fg">Product Intelligence</h3>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-fg-subtle">LATEST GENERATED ANALYSIS</span>
            </div>

            <Textarea label="Executive Summary" value={data.executive_summary || ''} onChange={(e) => onChange('executive_summary', e.target.value)} rows={3} disabled={disabled} hint={hint} />
            <Textarea label="Value Proposition" value={data.value_proposition || ''} onChange={(e) => onChange('value_proposition', e.target.value)} rows={3} disabled={disabled} hint={hint} />
            <Textarea label="Estimated ROI" value={data.roi || ''} onChange={(e) => onChange('roi', e.target.value)} rows={2} disabled={disabled} hint={hint} />

            <TagInput label="Unique Selling Points" values={data.unique_selling_points || []} onChange={(vals) => onChange('unique_selling_points', vals)} disabled={disabled} hint={hint} />
            <TagInput label="Business Problems Solved" values={data.business_problems_solved || []} onChange={(vals) => onChange('business_problems_solved', vals)} disabled={disabled} hint={hint} />
            <TagInput label="Expected Business Outcomes" values={data.business_outcomes || []} onChange={(vals) => onChange('business_outcomes', vals)} disabled={disabled} hint={hint} />
            <TagInput label="Competitive Advantages" values={data.competitive_advantages || []} onChange={(vals) => onChange('competitive_advantages', vals)} disabled={disabled} hint={hint} />
            <TagInput label="Keywords & Intent Topics" values={data.keywords || []} onChange={(vals) => onChange('keywords', vals)} disabled={disabled} hint={hint} />
        </Card>
    );
};