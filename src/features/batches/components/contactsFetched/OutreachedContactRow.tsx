import React from 'react';
import { Button } from '@/shared/components/ui';
import { OutreachBadge } from './OutreachBadge';
import type { OutreachConversation } from '@/features/batches/types/batchTypes';

interface Props {
  conversation: OutreachConversation;
  onViewConversation: (c: OutreachConversation) => void;
}

export const OutreachedContactRow: React.FC<Props> = ({ conversation, onViewConversation }) => {
  const firstName = conversation.first_name ?? '';
  const lastName = conversation.last_name ?? '';
  const title = conversation.title ?? '';
  const initials = (firstName?.charAt(0) ?? '?').toUpperCase();

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-1">
      <div className="flex items-center gap-4 flex-1 min-w-0">
        {conversation.photo_url ? (
          <img src={conversation.photo_url} alt={firstName} className="w-10 h-10 rounded-full object-cover bg-bg-purple-50 shrink-0" />
        ) : (
          <div className="w-10 h-10 rounded-full bg-bg-purple-50 flex items-center justify-center font-semibold text-primary text-sm shrink-0">
            {initials}
          </div>
        )}
        <div className="flex flex-col min-w-0">
          <span className="font-sans font-medium text-sm text-fg truncate">
            {firstName} {lastName}
          </span>
          <span className="font-sans font-normal text-xs text-fg-medium truncate">{title || '—'}</span>
        </div>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <OutreachBadge
          status={conversation.status || conversation.outreach_status || conversation.conversation_status}
          classification={conversation.classification}
          needsHumanAction={conversation.needs_human_action}
          outreachStatus={conversation.outreach_status}
        />
        <Button
          variant="outline"
          className="h-10 px-4 py-2 min-w-0 text-xs"
          onClick={() => onViewConversation(conversation)}
        >
          View Conversation
        </Button>
      </div>
    </div>
  );
};
