import React from 'react';
import { InputField, TagInput, Textarea } from '@/shared/components/ui';
import { IcpChatAssistant } from '@/shared/components/icp/IcpChatAssistant';
import { productApi } from '@/shared/queries/products/productApi';
import type { ProductIcp } from '@/features/products/types/productTypes';

interface Props {
  data: ProductIcp;
  onChange: (field: keyof ProductIcp, value: string | string[] | number | null) => void;
  productId?: string;
}

const SectionCard: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <div className={`bg-bg-card border border-border rounded-xl p-4 sm:p-5 flex flex-col gap-4 shadow-sm w-full ${className || ''}`}>
    {children}
  </div>
);

export const IcpPanel: React.FC<Props> = ({ data, onChange, productId }) => {
  const handleApply = (proposed: Record<string, unknown>) => {
    Object.entries(proposed).forEach(([k, v]) => onChange(k as keyof ProductIcp, v as never));
  };

  return (
    <div className="relative w-full max-w-[1120px] mx-auto bg-bg-sidebar border border-border rounded-xl shadow-sm p-4 sm:p-6 flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h3 className="font-sans font-semibold text-lg tracking-tight text-fg">Ideal Customer Profile (ICP)</h3>
        <span className="font-sans font-semibold text-[10px] leading-3 tracking-widest text-fg-subtle uppercase">Target Account Parameters</span>
      </div>

      <SectionCard>
        <InputField label="Target Profile Name" value={data.name || ''} onChange={(e) => onChange('name', e.target.value)} placeholder="High-Volume Merchants" />
        <Textarea label="Strategic Summary" value={data.strategic_summary || ''} onChange={(e) => onChange('strategic_summary', e.target.value)} rows={3} placeholder="Strategic summary..." />
      </SectionCard>

      <SectionCard>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InputField label="Min Employees" type="number" value={data.min_employees ?? ''} onChange={(e) => onChange('min_employees', e.target.value ? Number(e.target.value) : null)} />
          <InputField label="Max Employees" type="number" value={data.max_employees ?? ''} onChange={(e) => onChange('max_employees', e.target.value ? Number(e.target.value) : null)} />
          <InputField label="Min Revenue" type="number" value={data.min_revenue ?? ''} onChange={(e) => onChange('min_revenue', e.target.value ? Number(e.target.value) : null)} />
          <InputField label="Max Revenue" type="number" value={data.max_revenue ?? ''} onChange={(e) => onChange('max_revenue', e.target.value ? Number(e.target.value) : null)} />
        </div>
      </SectionCard>

      <SectionCard>
        <div className="flex flex-col gap-4">
          <TagInput label="Target Industries" values={data.industries || []} onChange={(v) => onChange('industries', v)} />
          <TagInput label="Target Geographies" values={data.geographies || []} onChange={(v) => onChange('geographies', v)} />
          <TagInput label="Included Technologies" values={data.included_technologies || []} onChange={(v) => onChange('included_technologies', v)} />
          <TagInput label="Excluded Technologies" values={data.excluded_technologies || []} onChange={(v) => onChange('excluded_technologies', v)} />
          <TagInput label="Funding Stages" values={data.funding_stages || []} onChange={(v) => onChange('funding_stages', v)} />
          <TagInput label="Hiring Signals" values={data.hiring_signals || []} onChange={(v) => onChange('hiring_signals', v)} />
          <TagInput label="Intent Topics" values={data.intent_topics || []} onChange={(v) => onChange('intent_topics', v)} />
          <TagInput label="Decision Maker Personas" values={data.decision_maker_roles || []} onChange={(v) => onChange('decision_maker_roles', v)} />
          <TagInput label="Target Company Characteristics" values={data.company_characteristics || []} onChange={(v) => onChange('company_characteristics', v)} />
        </div>
      </SectionCard>

      {productId && (
        <IcpChatAssistant
          currentIcp={data as unknown as Record<string, unknown>}
          onApply={handleApply}
          chatFn={({ message, current_icp }) => productApi.chatIcp(productId, { message, current_icp })}
          title="ICB Assistant"
        />
      )}
    </div>
  );
};
