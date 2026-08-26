import React from 'react';
import { TagInput, Textarea } from '@/shared/components/ui';
import type { ProductAnalysis } from '@/features/products/types/productTypes';

interface Props {
  data: ProductAnalysis;
  onChange: (field: keyof ProductAnalysis, value: string | string[]) => void;
}

const SectionCard: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div className="bg-bg-card border border-border rounded-xl p-4 sm:p-5 flex flex-col gap-2 shadow-sm w-full">
    <span className="font-sans font-semibold text-xs tracking-tight text-primary">{label}</span>
    {children}
  </div>
);

export const ProductIntelligencePanel: React.FC<Props> = ({ data, onChange }) => {
  return (
    <div className="w-full max-w-[1120px] mx-auto bg-bg-sidebar border border-border rounded-xl shadow-sm p-4 sm:p-6 flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h3 className="font-sans font-semibold text-lg tracking-tight text-fg">Product Intelligence</h3>
        <span className="font-sans font-semibold text-[10px] leading-3 tracking-widest text-fg-subtle uppercase">Latest Generated Analysis</span>
      </div>

      <div className="flex flex-col gap-4 sm:gap-6 w-full">
        <SectionCard label="Executive Summary">
          <Textarea
            value={data.executive_summary || ''}
            onChange={(e) => onChange('executive_summary', e.target.value)}
            rows={3}
            placeholder="An AI Sales Agent is an autonomous digital worker..."
            className="min-h-[80px] bg-bg-card"
          />
        </SectionCard>

        <SectionCard label="Value Proposition">
          <Textarea
            value={data.value_proposition || ''}
            onChange={(e) => onChange('value_proposition', e.target.value)}
            rows={3}
            placeholder="Scale your outbound sales pipeline..."
            className="min-h-[80px] bg-bg-card"
          />
        </SectionCard>

        <SectionCard label="Estimated ROI">
          <Textarea
            value={data.roi || ''}
            onChange={(e) => onChange('roi', e.target.value)}
            rows={2}
            placeholder="Significantly reduces labor costs..."
            className="min-h-[60px] bg-bg-card"
          />
        </SectionCard>

        <SectionCard label="Unique Selling Points">
          <TagInput values={data.unique_selling_points || []} onChange={(v) => onChange('unique_selling_points', v)} />
        </SectionCard>

        <SectionCard label="Business Problems Solved">
          <TagInput values={data.business_problems_solved || []} onChange={(v) => onChange('business_problems_solved', v)} />
        </SectionCard>

        <SectionCard label="Expected Business Outcomes">
          <TagInput values={data.business_outcomes || []} onChange={(v) => onChange('business_outcomes', v)} />
        </SectionCard>

        <SectionCard label="Competitive Advantages">
          <TagInput values={data.competitive_advantages || []} onChange={(v) => onChange('competitive_advantages', v)} />
        </SectionCard>

        <SectionCard label="Keywords & Intent Topics">
          <TagInput values={data.keywords || []} onChange={(v) => onChange('keywords', v)} />
        </SectionCard>
      </div>
    </div>
  );
};
