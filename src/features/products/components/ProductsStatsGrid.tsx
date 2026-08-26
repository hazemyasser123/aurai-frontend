import React from 'react';
import { FiSliders } from 'react-icons/fi';

interface Props {
  total: number;
  ready: number;
  processing: number;
  failed: number;
}

export const ProductsStatsGrid: React.FC<Props> = ({ total, ready, processing, failed }) => {
  const cards = [
    {
      label: 'Total Products',
      value: total,
      bg: 'bg-bg-purple-50',
      iconBg: 'bg-bg-purple-50',
      iconColor: 'text-primary',
    },
    {
      label: 'AI Engines Ready',
      value: ready,
      bg: 'bg-[#F0FDF4]',
      iconBg: 'bg-[#F0FDF4]',
      iconColor: 'text-success',
    },
    {
      label: 'Processing',
      value: processing,
      bg: 'bg-[#FEFCE8]',
      iconBg: 'bg-[#FEFCE8]',
      iconColor: 'text-warning',
    },
    {
      label: 'Failed Analysis',
      value: failed,
      bg: 'bg-[#FEF2F2]',
      iconBg: 'bg-[#FEF2F2]',
      iconColor: 'text-danger',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      {cards.map((c) => (
        <div key={c.label} className="bg-bg-sidebar border border-border rounded-xl p-4 sm:p-6 flex flex-row justify-between items-center h-[92px] min-w-0">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${c.iconBg}`}>
            <FiSliders className={`w-6 h-6 ${c.iconColor}`} strokeWidth={1.6} />
          </div>
          <div className="flex flex-col items-end gap-0">
            <span className="font-sans font-semibold text-xs tracking-tight text-fg-body text-right">{c.label}</span>
            <span className="font-sans font-semibold text-lg leading-6 tracking-tight text-fg text-right">{c.value}</span>
          </div>
        </div>
      ))}
    </div>
  );
};
