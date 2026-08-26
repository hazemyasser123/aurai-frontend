import React from 'react';
import type { Conversation } from '@/features/batches/types/batchTypes';
import { getStatusBadge, getClassificationBadge } from './badgeStyles';

interface Props {
  conversation: Conversation;
  isActive: boolean;
  onSelect: () => void;
}

export const ConversationItem: React.FC<Props> = ({ conversation: c, isActive, onSelect }) => {
  const initials = `${(c.first_name?.charAt(0) ?? '?').toUpperCase()}${(c.last_name?.charAt(0) ?? '').toUpperCase()}`;
  const statusBadge = getStatusBadge(c.status);
  const classBadge = getClassificationBadge(c.classification);

  return (
    <button
      onClick={onSelect}
      className={`relative w-full text-left p-4 flex gap-3 items-start transition-colors duration-150 ease-out border-l-4 ${
        isActive
          ? 'bg-bg-sidebar border-l-primary'
          : 'bg-transparent border-l-transparent hover:bg-bg-page'
      }`}
    >
      {/* Unread / needs-action dot */}
      {c.needs_human_action && (
        <span className="absolute right-4 top-4 w-2 h-2 rounded-full bg-danger" />
      )}

      {c.photo_url ? (
        <img src={c.photo_url} alt={c.first_name} className="w-10 h-10 rounded-full object-cover bg-bg-purple-50 shrink-0" />
      ) : (
        <div className="w-10 h-10 rounded-full bg-bg-purple-50 flex items-center justify-center font-semibold text-primary text-xs shrink-0">
          {initials}
        </div>
      )}

      <div className="flex flex-col min-w-0 flex-1 gap-0.5">
        <span className="font-sans font-semibold text-base leading-6 tracking-tight text-fg truncate">
          {c.first_name} {c.last_name}
        </span>
        <span className="font-sans font-medium text-xs leading-4 tracking-tight text-fg-medium truncate">
          {c.batch_name || c.account_name || '—'}
        </span>

        <div className="flex flex-wrap gap-2 pt-2">
          {statusBadge && (
            <span className={`inline-flex items-center justify-center px-3 py-1 rounded-full font-sans font-medium text-xs leading-4 whitespace-nowrap ${statusBadge.className}`}>
              {statusBadge.label}
            </span>
          )}
          {classBadge && (
            <span className={`inline-flex items-center justify-center px-3 py-1 rounded-full font-sans font-medium text-xs leading-4 whitespace-nowrap ${classBadge.className}`}>
              {classBadge.label}
            </span>
          )}
        </div>

        <p className="font-sans font-normal text-xs leading-4 tracking-tight text-fg-medium truncate pt-2">
          {c.subject || '—'}
        </p>
      </div>
    </button>
  );
};
