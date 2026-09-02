import React, { useMemo, useState } from 'react';
import { useBatchAccounts } from '@/features/batches/hooks/useBatchAccounts';
import { useBatchOutreach } from '@/features/batches/hooks/useBatchOutreach';
import { useOutreachThread } from '@/features/batches/hooks/useOutreachThread';
import { OutreachedAccountCard } from './OutreachedAccountCard';
import type { OutreachConversation } from '@/features/batches/types/batchTypes';
import { Modal, Button } from '@/shared/components/ui';

interface Props {
  batchId: string;
}

export const ContactsFetchedView: React.FC<Props> = ({ batchId }) => {
  const { data: accounts, isLoading: loadingAccounts } = useBatchAccounts(batchId);
  const { data: outreach, isLoading: loadingOutreach, isError, error } = useBatchOutreach(batchId);
  const [selected, setSelected] = useState<OutreachConversation | null>(null);
  const { data: thread, isLoading: loadingThread } = useOutreachThread(selected?.id ?? null);

  const grouped = useMemo(() => {
    if (!accounts || !outreach) return [];
    const byAccount = new Map<string, OutreachConversation[]>();
    outreach.forEach((c) => {
      const list = byAccount.get(c.account_id) || [];
      list.push(c);
      byAccount.set(c.account_id, list);
    });
    // Keep account order as returned by accounts API, only include accounts that have outreach
    return accounts
      .map((acc) => ({
        account: acc,
        conversations: byAccount.get(acc.id) || [],
      }))
      .filter((g) => g.conversations.length > 0);
  }, [accounts, outreach]);

  const isLoading = loadingAccounts || loadingOutreach;

  const handleViewConversation = (c: OutreachConversation) => {
    setSelected(c);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <div className="h-32 bg-bg-sidebar border border-border rounded-xl animate-pulse" />
        <div className="h-64 bg-bg-sidebar border border-border rounded-xl animate-pulse" />
        <div className="h-64 bg-bg-sidebar border border-border rounded-xl animate-pulse" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-16 bg-bg-sidebar border border-border rounded-xl">
        <p className="font-sans font-medium text-sm text-danger">Failed to load outreached contacts</p>
        <p className="font-sans text-xs text-fg-body">{String((error as Error)?.message || 'Please try again')}</p>
      </div>
    );
  }

  if (!outreach || outreach.length === 0) {
    return (
      <div className="bg-bg-sidebar border border-border rounded-xl shadow-sm p-12 flex flex-col items-center gap-3 text-center">
        <h3 className="font-sans font-semibold text-lg text-fg">No outreached contacts yet</h3>
        <p className="font-sans text-sm text-fg-body max-w-md">
          Contacts have been fetched but no outreach has been sent. Draft and send messages from the Contacts page to see them here.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Outer container matching Figma: bg #F9FAFB border 1px #E5E7EB rounded 12px p-6 */}
      <div className="bg-bg-sidebar border border-border rounded-xl shadow-sm p-6 flex flex-col gap-6">
        <h3 className="font-sans font-semibold text-lg tracking-tight text-fg-alt">Accounts</h3>
        <div className="flex flex-col gap-6">
          {grouped.map(({ account, conversations }) => (
            <OutreachedAccountCard
              key={account.id}
              account={account}
              conversations={conversations}
              onViewConversation={handleViewConversation}
            />
          ))}
        </div>
      </div>

      {/* View Conversation Modal — integrated with GET /outreach/conversations/{id}/thread */}
      <Modal isOpen={!!selected} onClose={() => setSelected(null)} title={selected ? `${selected.first_name} ${selected.last_name} — Conversation` : 'Conversation'}>
        <div className="flex flex-col gap-4">
          {selected && (
            <>
              <div className="flex items-center gap-3 p-3 bg-bg-page rounded-lg">
                {selected.photo_url ? (
                  <img src={selected.photo_url} alt={selected.first_name} className="w-10 h-10 rounded-full object-cover bg-bg-purple-50" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-bg-purple-50 flex items-center justify-center font-semibold text-primary text-sm">
                    {(selected.first_name?.charAt(0) ?? '?').toUpperCase()}
                  </div>
                )}
                <div className="flex flex-col">
                  <span className="font-sans font-medium text-sm text-fg">
                    {selected.first_name} {selected.last_name}
                  </span>
                  <span className="font-sans text-xs text-fg-body">{selected.title || '—'} · {selected.recipient_email || 'No email'}</span>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <span className="font-sans font-semibold text-xs text-fg-strong">Subject</span>
                <div className="px-4 py-2.5 bg-bg-input border border-border rounded-lg text-sm text-fg-strong">
                  {thread?.subject || thread?.email?.subject || selected.subject || '—'}
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <span className="font-sans font-semibold text-xs text-fg-strong">Body</span>
                <div className="p-4 bg-bg-input border border-border rounded-lg text-sm leading-6 text-fg-strong max-h-[280px] overflow-auto">
                  {loadingThread ? (
                    <span className="text-fg-body">Loading thread...</span>
                  ) : thread?.messages && thread.messages.length > 0 ? (
                    <div className="flex flex-col gap-4">
                      {thread.messages.map((m, idx) => {
                        const isOutbound = (m.direction || '').toLowerCase().includes('out');
                        const htmlBodyRaw = (m as unknown as { body_html?: string; bodyHtml?: string }).body_html || (m as unknown as { bodyHtml?: string }).bodyHtml || '';
                        const textBody = (m as unknown as { display_text?: string }).display_text || m.body || '';
                        let html: string;
                        let isHtml: boolean;
                        if (isOutbound) {
                          html = htmlBodyRaw && htmlBodyRaw.includes('<') ? htmlBodyRaw : textBody;
                          isHtml = html.includes('<');
                        } else {
                          let inboundHtml = htmlBodyRaw;
                          if (inboundHtml && inboundHtml.includes('<hr')) inboundHtml = inboundHtml.split('<hr')[0];
                          if (inboundHtml && inboundHtml.includes('divRplyFwdMsg')) inboundHtml = inboundHtml.split('<div id="divRplyFwdMsg"')[0];
                          if (inboundHtml && inboundHtml.trim().includes('<')) {
                            html = inboundHtml;
                            isHtml = true;
                          } else {
                            html = textBody;
                            isHtml = false;
                          }
                        }
                        const time = (m as { occurred_at?: string }).occurred_at || m.created_at || (m as { occurredAt?: string }).occurredAt;
                        return (
                          <div key={idx} className="flex flex-col gap-1 p-3 bg-bg-card rounded-lg border border-border/50">
                            <span className="font-sans font-medium text-xs text-fg-muted">
                              {isOutbound ? 'You' : 'Contact'} · {time ? new Date(time).toLocaleString() : ''}
                            </span>
                            {isHtml ? (
                              <div
                                className="prose prose-sm max-w-none break-words [&_p]:my-2 [&_p]:block [&_a]:text-primary [&_a]:underline [&_img]:inline-block [&_table]:w-full"
                                dangerouslySetInnerHTML={{ __html: html }}
                              />
                            ) : (
                              <div className="font-sans font-normal text-sm leading-6 text-fg whitespace-pre-wrap break-words">{html}</div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : thread?.email?.body ? (
                    <div
                      className="prose prose-sm max-w-none break-words [&_p]:my-2 [&_p]:block [&_a]:text-primary [&_a]:underline"
                      dangerouslySetInnerHTML={{ __html: thread.email.body }}
                    />
                  ) : (
                    <div
                      className="break-words [&_h1]:text-xl [&_h1]:font-bold [&_p]:my-2 [&_p]:block [&_a]:text-primary [&_a]:underline prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ __html: selected.body || '<p>No content</p>' }}
                    />
                  )}
                </div>
              </div>

              <div className="flex justify-end">
                <Button variant="outline" onClick={() => setSelected(null)}>
                  Close
                </Button>
              </div>
            </>
          )}
        </div>
      </Modal>
    </div>
  );
};
