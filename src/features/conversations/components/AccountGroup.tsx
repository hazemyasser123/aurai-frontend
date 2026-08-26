import React, { useState } from 'react';
import { FiChevronDown, FiChevronUp } from 'react-icons/fi';
import type { Conversation } from '@/features/batches/types/batchTypes';
import { ConversationItem } from './ConversationItem';

interface Props {
  accountName: string;
  accountDomain?: string;
  logoUrl?: string | null;
  conversations: Conversation[];
  activeId: string | null;
  onSelect: (c: Conversation) => void;
  defaultOpen?: boolean;
}

export const AccountGroup: React.FC<Props> = ({
  accountName,
  accountDomain,
  logoUrl,
  conversations,
  activeId,
  onSelect,
  defaultOpen = true,
}) => {
  const [open, setOpen] = useState(defaultOpen);
  const initials = (accountName?.charAt(0) ?? '?').toUpperCase();

  return (
    <div className="border-b border-border last:border-b-0">
      {/* Account group header */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-3 w-full p-4 border-b border-border text-left hover:bg-bg-page transition-colors duration-150 ease-out"
      >
        {logoUrl ? (
          <img src={logoUrl} alt={accountName} className="w-14 h-14 rounded-xl object-cover bg-bg-purple-50 shrink-0" />
        ) : (
          <div className="w-14 h-14 rounded-xl bg-bg-purple-50 flex items-center justify-center font-bold text-primary shrink-0">
            {initials}
          </div>
        )}
        <div className="flex flex-col min-w-0 flex-1 gap-1">
          <div className="flex items-center gap-2">
            <span className="font-sans font-semibold text-lg leading-[26px] tracking-tight text-fg truncate">{accountName}</span>
            <span className="inline-flex items-center justify-center px-1.5 min-w-[18px] h-4 rounded-full bg-bg-purple-50 font-sans font-normal text-xs text-primary shrink-0">
              {conversations.length}
            </span>
          </div>
          <span className="font-sans font-medium text-sm leading-5 tracking-tight text-fg-body truncate">
            {accountDomain || '—'}
          </span>
        </div>
        {open ? (
          <FiChevronUp className="w-[18px] h-[18px] text-fg shrink-0" />
        ) : (
          <FiChevronDown className="w-[18px] h-[18px] text-fg shrink-0" />
        )}
      </button>

      {/* Contact cards */}
      {open && (
        <div className="flex flex-col bg-white divide-y divide-border/60">
          {conversations.map((c) => (
            <ConversationItem
              key={c.id}
              conversation={c}
              isActive={c.id === activeId}
              onSelect={() => onSelect(c)}
            />
          ))}
        </div>
      )}
    </div>
  );
};
