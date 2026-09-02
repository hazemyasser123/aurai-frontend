import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/shared/components/ui';
import type { Conversation } from '@/features/batches/types/batchTypes';
import { getStatusBadge } from './badgeStyles';
import { MessageBubble } from './MessageBubble';
import { useOutreachThread } from '@/features/batches/hooks/useOutreachThread';
import { useSendManualReply } from '@/features/conversations/hooks/useSendManualReply';
import { useResolveConversation } from '@/features/conversations/hooks/useResolveConversation';
import toast from 'react-hot-toast';
import { getErrorMessage } from '@/shared/utils/errorHandler';

interface Props {
  conversation: Conversation;
  onBack?: () => void; // mobile: return to list
}

export const ConversationDetail: React.FC<Props> = ({ conversation: c, onBack }) => {
  const { data: thread, isLoading: loadingThread } = useOutreachThread(c.id);
  const sendReply = useSendManualReply(c.id);
  const resolve = useResolveConversation(c.id);
  const [reply, setReply] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  const needsAction = thread?.needs_human_action ?? c.needs_human_action;
  const reason = thread?.human_action_reason || c.human_action_reason || '';
  const statusBadge = getStatusBadge(thread?.status || c.status);
  const messages = thread?.messages || [];

  useEffect(() => {
    setReply('');
  }, [c.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, loadingThread]);

  const handleSend = async () => {
    if (!reply.trim()) {
      toast.error('Type a reply first');
      return;
    }
    try {
      await sendReply.mutateAsync(reply.trim());
      toast.success('Reply sent');
      setReply('');
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  };

  const handleResolve = async () => {
    try {
      await resolve.mutateAsync();
      toast.success('Marked as resolved');
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  };

  const prospectName = `${thread?.first_name ?? c.first_name} ${thread?.last_name ?? c.last_name}`.trim();

  return (
    <div className="flex flex-col bg-white border border-border rounded-xl overflow-hidden h-full min-h-0">
      {/* Detail header — compact */}
      <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-border shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          {onBack && (
            <button onClick={onBack} className="lg:hidden p-1.5 rounded-md text-fg hover:bg-bg-muted transition-colors shrink-0">
              ←
            </button>
          )}
          {c.photo_url ? (
            <img src={c.photo_url} alt={c.first_name} className="w-10 h-10 rounded-full object-cover bg-bg-purple-50 shrink-0" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-bg-purple-50 flex items-center justify-center font-semibold text-primary text-xs shrink-0">
              {(c.first_name?.charAt(0) ?? '?').toUpperCase()}
            </div>
          )}
          <div className="flex flex-col min-w-0">
            <span className="font-sans font-semibold text-base leading-6 tracking-tight text-fg truncate">{prospectName}</span>
            <span className="font-sans font-medium text-sm leading-5 tracking-tight text-fg-medium truncate text-[13px]">
              • {c.batch_name || c.account_name}
            </span>
            <span className="font-sans font-normal text-xs leading-4 tracking-tight text-fg-medium truncate">
              {c.account_name} • {c.title || ''}
            </span>
          </div>
        </div>
        {statusBadge && (
          <span className={`inline-flex items-center justify-center px-3 py-1 rounded-full font-sans font-medium text-xs leading-4 whitespace-nowrap shrink-0 ${statusBadge.className}`}>
            {statusBadge.label}
          </span>
        )}
      </div>

      {/* Alert banner — needs human action */}
      {needsAction && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-[#FFFBEB] border-b border-[#FEE685] shrink-0">
          <div className="flex flex-col gap-1 min-w-0">
            <span className="font-sans font-bold text-sm leading-5 tracking-tight text-[#BB4D00]">NEEDS HUMAN ACTION</span>
            <p className="font-sans font-normal text-sm leading-5 tracking-tight text-[#BB4D00] break-words">
              {reason || 'This conversation needs a human to follow up.'}
            </p>
          </div>
          <Button
            variant="inactive"
            onClick={handleResolve}
            isLoading={resolve.isPending}
            disabled={resolve.isPending}
            className="h-[34px] px-4 py-1.5 bg-[#FEF3C6] border border-[#FEF3C6] text-[#BB4D00] hover:brightness-95 shrink-0"
          >
            Mark resolved
          </Button>
        </div>
      )}

      {/* Chat history — flexes to fill, scrolls internally so reply bar stays pinned in viewport */}
      <div className="flex-1 min-h-0 overflow-y-auto p-3 sm:px-6 py-4 flex flex-col gap-4 bg-white">
        {loadingThread ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 rounded-full border-4 border-border border-t-primary animate-spin" />
          </div>
        ) : (
          <>
            {/* Original cold email that started the thread */}
            {thread?.email && (
              <div className="flex flex-col gap-2.5 items-start">
                <div className="flex flex-col gap-2 p-4 rounded-lg max-w-[531px] w-fit max-w-full bg-white border border-border">
                  <span className="font-sans font-semibold text-sm leading-5 tracking-tight text-fg-strong">
                    Subject: {thread.email.subject || c.subject || '—'}
                  </span>
                  <div className="font-sans font-normal text-sm leading-5 tracking-tight text-fg whitespace-pre-wrap break-words">
                    {thread.email.body}
                  </div>
                </div>
                {thread.email.sent_at && (
                  <span className="font-sans font-normal text-xs leading-4 tracking-tight text-fg-body px-1">
                    {new Date(thread.email.sent_at).toLocaleString('en-US', { month: 'numeric', day: 'numeric', year: '2-digit', hour: 'numeric', minute: '2-digit' })}
                  </span>
                )}
              </div>
            )}

            {/* Replies after the original email, chronological */}
            {messages.map((m, idx) => (
              <MessageBubble key={m.id ?? idx} message={m} prospectName={prospectName || 'Prospect'} />
            ))}

            {/* Contact hasn't replied yet */}
            {!thread?.email && messages.length === 0 && (
              <p className="text-sm text-fg-body text-center py-12">No messages yet in this thread.</p>
            )}
            <div ref={bottomRef} />
          </>
        )}
      </div>

      {/* Input area */}
      <div className="flex flex-col gap-3 p-4 pb-5 border-t border-border bg-white shrink-0">
        <textarea
          value={reply}
          onChange={(e) => setReply(e.target.value)}
          placeholder="Type a reply... (Enter to send, Shift+Enter for new line)"
          rows={2}
          className="w-full p-4 bg-bg-page border border-border rounded-md font-sans font-normal text-sm tracking-tight text-fg-strong outline-none resize-none placeholder:text-fg-muted focus:border-border-focus focus:shadow-[0_0_0_3px_rgba(127,34,254,0.12)] transition-[border-color,box-shadow] duration-150 ease-out"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
        />
        <div className="flex justify-end">
          <Button
            variant="primary"
            onClick={handleSend}
            isLoading={sendReply.isPending}
            disabled={!reply.trim() || sendReply.isPending}
            className="w-[120px] h-10"
          >
            Send
          </Button>
        </div>
      </div>
    </div>
  );
};
