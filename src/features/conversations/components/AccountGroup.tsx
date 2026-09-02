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
      {/* Account group header — compact to save vertical space */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2.5 w-full p-3 border-b border-border text-left hover:bg-bg-page transition-colors duration-150 ease-out"
      >
        {logoUrl ? (
          <img src={logoUrl} alt={accountName} className="w-9 h-9 rounded-lg object-cover bg-bg-purple-50 shrink-0" />
        ) : (
          <div className="w-9 h-9 rounded-lg bg-bg-purple-50 flex items-center justify-center font-bold text-primary text-sm shrink-0">
            {initials}
          </div>
        )}
        <div className="flex flex-col min-w-0 flex-1 gap-0.5">
          <div className="flex items-center gap-1.5">
            <span className="font-sans font-semibold text-sm leading-5 tracking-tight text-fg truncate">{accountName}</span>
            <span className="inline-flex items-center justify-center px-1.5 min-w-[18px] h-4 rounded-full bg-bg-purple-50 font-sans font-medium text-xs text-primary shrink-0">
              {conversations.length}
            </span>
          </div>
          <span className="font-sans font-normal text-xs leading-4 tracking-tight text-fg-body truncate">
            {accountDomain || '—'}
          </span>
        </div>
        {open ? (
          <FiChevronUp className="w-4 h-4 text-fg-muted shrink-0" />
        ) : (
          <FiChevronDown className="w-4 h-4 text-fg-muted shrink-0" />
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
