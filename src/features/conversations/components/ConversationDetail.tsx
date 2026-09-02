import React, { useState, useEffect, useRef } from 'react';
import { FiArrowLeft } from 'react-icons/fi';
import { Button } from '@/shared/components/ui';
import type { Conversation } from '@/features/batches/types/batchTypes';
import { getStatusBadge, getClassificationBadge, getHumanActionBadge, getFollowupBadge } from './badgeStyles';
import { MessageBubble } from './MessageBubble';
import { useOutreachThread } from '@/features/batches/hooks/useOutreachThread';
import { useSendManualReply } from '@/features/conversations/hooks/useSendManualReply';
import { useResolveConversation } from '@/features/conversations/hooks/useResolveConversation';
import { useSendFollowup } from '@/features/conversations/hooks/useSendFollowup';
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
  const sendFollowup = useSendFollowup(c.id);
  const [reply, setReply] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  const needsAction = thread?.needs_human_action ?? c.needs_human_action;
  const reason = thread?.human_action_reason || c.human_action_reason || '';
  const needsFollowup = thread?.needs_followup ?? c.needs_followup;
  const statusBadge = getStatusBadge(thread?.status || c.status);
  const classificationBadge = getClassificationBadge(thread?.classification || c.classification);
  const humanBadge = getHumanActionBadge(needsAction);
  const followupBadge = getFollowupBadge(needsFollowup);
  const flagBadges = [classificationBadge, humanBadge, followupBadge].filter(Boolean).slice(0, 3) as ReturnType<typeof getClassificationBadge>[];
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

  const handleFollowup = async () => {
    try {
      await sendFollowup.mutateAsync();
      toast.success('Follow-up sent');
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  };

  const prospectName = `${thread?.first_name ?? c.first_name} ${thread?.last_name ?? c.last_name}`.trim();

  return (
    <div className="flex flex-col bg-white border border-border rounded-xl overflow-hidden h-full min-h-0">
      {/* Detail header — ultra-compact to give max to messages */}
      <div className="flex flex-col gap-1.5 px-4 py-2.5 border-b border-border shrink-0">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            {onBack && (
              <button
                onClick={onBack}
                aria-label="Back to conversations"
                className="lg:hidden inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-bg-page border border-border text-fg hover:bg-white hover:border-primary/20 hover:text-primary transition-colors shrink-0 shadow-sm active:scale-[0.97]"
              >
                <FiArrowLeft className="w-4 h-4" strokeWidth={2} />
                <span className="font-sans font-semibold text-xs">Back</span>
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
        {/* Max 3 tags: Classification + Human Action + Follow-up */}
        {flagBadges.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {flagBadges.map((b, i) => (
              <span
                key={`${b!.label}-${i}`}
                className={`inline-flex items-center justify-center px-2.5 py-1 rounded-full font-sans font-medium text-[11px] leading-3 whitespace-nowrap ${b!.className}`}
              >
                {b!.label}
              </span>
            ))}
          </div>
        )}
        {needsAction && reason && (
          <p className="font-sans text-xs leading-4 text-[#BB4D00] bg-[#FFFBEB] border border-[#FEE685] rounded-md px-2.5 py-1.5 break-words">
            <span className="font-semibold">Reason:</span> {reason}
          </p>
        )}
      </div>

      {/* Alert banner — needs human action — compact */}
      {needsAction && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-[#FFFBEB] border-b border-[#FEE685] shrink-0">
          <div className="flex flex-col gap-0.5 min-w-0">
            <span className="font-sans font-bold text-xs leading-4 tracking-tight text-[#BB4D00]">NEEDS HUMAN ACTION</span>
            <p className="font-sans font-normal text-xs leading-4 tracking-tight text-[#BB4D00] break-words">
              {reason || 'This conversation needs a human to follow up.'}
            </p>
          </div>
          <Button
            variant="inactive"
            onClick={handleResolve}
            isLoading={resolve.isPending}
            disabled={resolve.isPending}
            className="h-[30px] px-3 py-1 text-xs bg-[#FEF3C6] border border-[#FEF3C6] text-[#BB4D00] hover:brightness-95 shrink-0"
          >
            Mark resolved
          </Button>
        </div>
      )}

      {/* Follow-up banner — needs follow-up — compact */}
      {needsFollowup && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-[#EFF6FF] border-b border-[#BFDBFE] shrink-0">
          <div className="flex flex-col gap-0.5 min-w-0">
            <span className="font-sans font-bold text-xs leading-4 tracking-tight text-[#1E40AF]">NEEDS FOLLOW-UP</span>
            <p className="font-sans font-normal text-xs leading-4 tracking-tight text-[#1E40AF] break-words">Flagged for follow-up.</p>
          </div>
          <Button
            variant="primary"
            onClick={handleFollowup}
            isLoading={sendFollowup.isPending}
            disabled={sendFollowup.isPending}
            className="h-[30px] px-3 py-1 text-xs shrink-0"
          >
            Send Follow-up
          </Button>
        </div>
      )}

      {/* Chat history — fits one big mail, scrollable, slightly compact */}
      <div className="flex-1 min-h-[520px] lg:min-h-[600px] max-h-[68vh] lg:max-h-[68vh] overflow-y-auto p-3 sm:px-6 py-4 flex flex-col gap-4 bg-white">
        {loadingThread ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 rounded-full border-4 border-border border-t-primary animate-spin" />
          </div>
        ) : (
          <>
            {/* Original cold email that started the thread */}
            {thread?.email && (
              <div className="flex flex-col gap-1.5 items-start w-full">
                <div className="flex flex-col rounded-xl overflow-hidden border border-border shadow-sm bg-white max-w-[640px] w-full">
                  {/* Mail header —From / To / Subject / Date */}
                  <div className="px-4 py-3 bg-[#F8FAFC] border-b border-border flex flex-col gap-1.5">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold shrink-0">L</div>
                        <div className="flex flex-col min-w-0">
                          <span className="font-sans font-semibold text-sm leading-4 text-primary truncate">Laila Ahmed</span>
                          <span className="font-sans text-xs text-fg-muted truncate">LDC-Sales@sales.linkdatacenter.net</span>
                        </div>
                      </div>
                      {thread.email.sent_at && (
                        <span className="font-sans text-xs text-fg-muted whitespace-nowrap shrink-0">
                          {new Date(thread.email.sent_at).toLocaleString('en-US', { month: 'numeric', day: 'numeric', year: '2-digit', hour: 'numeric', minute: '2-digit' })}
                        </span>
                      )}
                    </div>
                    <div className="font-sans text-xs text-fg-body truncate">
                      <span className="font-semibold text-fg-muted">To:</span> {thread.recipient_email || c.recipient_email || '—'}
                    </div>
                    <div className="font-sans font-semibold text-sm leading-5 text-fg-strong truncate">
                      Subject: {thread.email.subject || thread.subject || c.subject || '—'}
                    </div>
                  </div>
                  {/* Mail body — HTML, p as new line, icons in one row */}
                  <div
                    className="p-4 bg-white font-sans font-normal text-sm leading-6 tracking-tight text-fg break-words prose prose-sm max-w-none prose-p:my-3 prose-p:block [&_p]:my-3 [&_p]:block [&_a]:text-primary [&_a]:underline [&_img]:inline-block [&_table]:w-full [&_table]:border-collapse"
                    dangerouslySetInnerHTML={{ __html: thread.email.body || '' }}
                  />
                  <div className="px-4 py-2 bg-slate-50/60 border-t border-border/50 flex items-center justify-between">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/15">Outbound • Original</span>
                    <span className="font-sans text-xs text-fg-muted">Start of thread</span>
                  </div>
                </div>
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

      {/* Input area — compact to give more to messages */}
      <div className="flex flex-col gap-2 p-3 border-t border-border bg-white shrink-0">
        <textarea
          value={reply}
          onChange={(e) => setReply(e.target.value)}
          placeholder="Type a reply... (Enter to send, Shift+Enter for new line)"
          rows={2}
          className="w-full p-3 bg-bg-page border border-border rounded-lg font-sans font-normal text-sm tracking-tight text-fg-strong outline-none resize-none placeholder:text-fg-muted focus:border-border-focus focus:shadow-[0_0_0_3px_rgba(127,34,254,0.12)] transition-[border-color,box-shadow] duration-150 ease-out"
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
            className="w-[110px] h-9 text-sm"
          >
            Send
          </Button>
        </div>
      </div>
    </div>
  );
};
