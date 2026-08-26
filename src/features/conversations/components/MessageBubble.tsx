import React from 'react';
import type { OutreachMessage } from '@/features/batches/types/batchTypes';

interface Props {
  message: OutreachMessage;
  prospectName: string;
}

export const MessageBubble: React.FC<Props> = ({ message, prospectName }) => {
  // outbound = agent (right, purple); inbound = prospect (left, white)
  const isAgent = (message.direction || '').toLowerCase().includes('out');
  const body = message.body || '';
  const time = message.created_at
    ? new Date(message.created_at).toLocaleString('en-US', { month: 'numeric', day: 'numeric', year: '2-digit', hour: 'numeric', minute: '2-digit' })
    : '';

  return (
    <div className={`flex flex-col gap-2.5 ${isAgent ? 'items-end' : 'items-start'}`}>
      <div
        className={`flex flex-col gap-2 p-4 rounded-lg max-w-[531px] w-fit max-w-full ${
          isAgent ? 'bg-bg-purple-50 border border-bg-purple-soft' : 'bg-white border border-border'
        }`}
      >
        <span className={`font-sans font-semibold text-sm leading-5 tracking-tight ${isAgent ? 'text-primary' : 'text-fg-strong'}`}>
          {isAgent ? 'Laila' : prospectName}
        </span>
        <div className="font-sans font-normal text-sm leading-5 tracking-tight text-fg whitespace-pre-wrap break-words">
          {body}
        </div>
      </div>
      {time && (
        <span className="font-sans font-normal text-xs leading-4 tracking-tight text-fg-body px-1">
          {time}
        </span>
      )}
    </div>
  );
};
