import React from 'react';
import type { OutreachConversation } from '@/features/batches/types/batchTypes';

interface Props {
  conversation: OutreachConversation;
  isSelected: boolean;
  onSelect: () => void;
}

export const DraftContactListItem: React.FC<Props> = ({ conversation, isSelected, onSelect }) => {
  const firstName = conversation.first_name ?? '';
  const title = conversation.title ?? '';
  const initials = (firstName?.charAt(0) ?? '?').toUpperCase();

  return (
    <button
      onClick={onSelect}
      className={`flex items-center gap-4 w-full p-2 pr-2 rounded-lg text-left transition-colors duration-150 ease-out ${isSelected ? 'bg-bg-purple-50' : 'bg-transparent hover:bg-bg-page'}`}
    >
      {conversation.photo_url ? (
        <img src={conversation.photo_url} alt={firstName} className="w-10 h-10 rounded-full object-cover bg-bg-purple-50 shrink-0" />
      ) : (
        <div className="w-10 h-10 rounded-full bg-bg-purple-50 flex items-center justify-center font-semibold text-primary text-sm shrink-0">
          {initials}
        </div>
      )}
      <div className="flex flex-col min-w-0 flex-1">
        <span className="font-sans font-medium text-sm text-fg truncate">{firstName} {conversation.last_name}</span>
        <span className="font-sans font-normal text-xs text-fg-medium truncate">{title || '—'}</span>
      </div>
    </button>
  );
};
