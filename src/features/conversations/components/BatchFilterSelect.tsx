import React from 'react';
import { FiChevronDown } from 'react-icons/fi';

interface Props {
  batches: Array<{ id: string; name: string }>;
  value: string; // 'all' or batch id
  onChange: (v: string) => void;
}

export const BatchFilterSelect: React.FC<Props> = ({ batches, value, onChange }) => {
  const selectedLabel = value === 'all' ? 'All Batches' : (batches.find((b) => b.id === value)?.name ?? 'All Batches');

  return (
    <div className="relative w-[165px] h-12 shrink-0">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none w-full h-full bg-bg-sidebar border border-border rounded-lg pl-3 pr-9 outline-none cursor-pointer text-transparent"
      >
        <option value="all">All Batches</option>
        {batches.map((b) => (
          <option key={b.id} value={b.id}>
            {b.name}
          </option>
        ))}
      </select>
      {/* Two-line overlay per Figma: "Batches:" bold label + current selection */}
      <span className="absolute left-3 top-2 font-sans font-bold text-sm leading-5 tracking-tight text-fg-strong pointer-events-none">
        Batches:
      </span>
      <span className="absolute left-3 bottom-1.5 font-sans font-medium text-xs leading-4 tracking-tight text-fg-body pointer-events-none truncate pr-6 max-w-[120px]">
        {selectedLabel}
      </span>
      <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-fg-body pointer-events-none" />
    </div>
  );
};
