import React from 'react';
import type { OutreachConversation } from '@/features/batches/types/batchTypes';

interface Props {
  conversation: OutreachConversation;
  isSelected: boolean;
  isChecked?: boolean;
  onToggleCheck?: (id: string) => void;
  onSelect: () => void;
}

export const DraftContactListItem: React.FC<Props> = ({
  conversation,
  isSelected,
  isChecked,
  onToggleCheck,
  onSelect,
}) => {
  const firstName = conversation.first_name ?? '';
  const title = conversation.title ?? '';
  const initials = (firstName?.charAt(0) ?? '?').toUpperCase();

  return (
    <div
      className={`flex items-center gap-2 w-full p-2 rounded-lg text-left transition-colors duration-150 ease-out ${isSelected ? 'bg-bg-purple-50' : 'bg-transparent hover:bg-bg-page'}`}
    >
      {/* Checkbox to pick which contacts to send to */}
      {onToggleCheck && (
        <input
          type="checkbox"
          checked={!!isChecked}
          onChange={() => onToggleCheck(conversation.id)}
          onClick={(e) => e.stopPropagation()}
          className="w-4 h-4 accent-primary cursor-pointer shrink-0"
          aria-label={`Select ${firstName}`}
        />
      )}
      <button
        onClick={onSelect}
        className="flex items-center gap-4 flex-1 min-w-0 text-left"
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
    </div>
  );
};
