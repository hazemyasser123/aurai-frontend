import React from 'react';

export type ConversationFilterKey =
  | 'all'
  | 'needs_action'
  | 'needs_followup'
  | 'interested'
  | 'in_conversation'
  | 'not_interested'
  | 'out_of_office';

interface Props {
  active: ConversationFilterKey;
  counts: Record<ConversationFilterKey, number>;
  onChange: (k: ConversationFilterKey) => void;
}

export const ConversationFilters: React.FC<Props> = ({ active, counts, onChange }) => {
  const chips: Array<{ key: ConversationFilterKey; label: string }> = [
    { key: 'all', label: 'All' },
    { key: 'needs_action', label: 'Needs Action' },
    { key: 'needs_followup', label: 'Needs Follow-up' },
    { key: 'interested', label: 'Interested' },
    { key: 'in_conversation', label: 'In Conversation' },
    { key: 'not_interested', label: 'Not Interested' },
    { key: 'out_of_office', label: 'Out of Office' },
  ];

  return (
    <div className="flex items-center gap-2 px-6 overflow-x-auto pb-1">
      {chips.map((chip) => {
        const isActive = active === chip.key;
        return (
          <button
            key={chip.key}
            onClick={() => onChange(chip.key)}
            className={`flex items-center gap-2 px-4 h-9 rounded-full font-sans font-medium text-sm leading-5 tracking-tight whitespace-nowrap transition-colors duration-150 ease-out cursor-pointer ${
              isActive
                ? 'bg-bg-purple-50 border border-border-light text-primary'
                : 'bg-bg-page border border-[#D1D5DC] text-fg-medium hover:border-primary/40'
            }`}
          >
            {chip.label}
            <span
              className={`inline-flex items-center justify-center px-1.5 min-w-[20px] h-4 rounded-full font-sans font-normal text-xs leading-4 ${
                isActive ? 'bg-border-light text-primary' : 'bg-[#D1D5DC] text-fg-medium'
              }`}
            >
              {counts[chip.key] ?? 0}
            </span>
          </button>
        );
      })}
    </div>
  );
};
