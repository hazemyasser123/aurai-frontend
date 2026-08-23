import React, { useState, useMemo } from 'react';
import { Button } from '@/shared/components/ui';
import type { Account } from '@/features/batches/types/batchTypes';
import type { OutreachConversation } from '@/features/batches/types/batchTypes';
import { DraftContactListItem } from './DraftContactListItem';
import { DraftEditor } from './DraftEditor';
import { useSendBulkOutreach } from '@/features/batches/hooks/useSendBulkOutreach';
import toast from 'react-hot-toast';
import { getErrorMessage } from '@/shared/utils/errorHandler';

interface Props {
  account: Account;
  conversations: OutreachConversation[];
  defaultExpanded?: boolean;
  onConversationUpdated?: (c: OutreachConversation) => void;
}

export const AccountDraftSection: React.FC<Props> = ({ account, conversations, defaultExpanded = true, onConversationUpdated }) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [selectedId, setSelectedId] = useState<string | null>(conversations[0]?.id ?? null);
  const sendBulk = useSendBulkOutreach();

  const selected = useMemo(() => conversations.find(c => c.id === selectedId) ?? conversations[0] ?? null, [conversations, selectedId]);

  // Keep selection valid when conversations change
  React.useEffect(() => {
    if (!selectedId && conversations[0]) setSelectedId(conversations[0].id);
    if (selectedId && !conversations.find(c => c.id === selectedId) && conversations[0]) setSelectedId(conversations[0].id);
  }, [conversations, selectedId]);

  const handleSendAll = async () => {
    const ids = conversations.map(c => c.id);
    if (ids.length === 0) return;
    try {
      const res = await sendBulk.mutateAsync(ids);
      if (res.failed_count > 0) toast.error(`${res.failed_count} failed, ${res.sent_count} sent`);
      else toast.success(`Sent ${res.sent_count} messages`);
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  };

  const accountName = account.name ?? 'Unnamed Account';
  const domain = account.domain ?? '—';
  const count = conversations.length;
  const initials = (accountName?.charAt(0) ?? '?').toUpperCase();

  return (
    <div className="bg-bg-sidebar border border-border rounded-xl shadow-card p-6 flex flex-col gap-6">
      {/* Account header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {account.logo_url ? (
            <img src={account.logo_url} alt={accountName} className="w-14 h-14 rounded-xl object-cover bg-bg-purple-50 shrink-0" />
          ) : (
            <div className="w-14 h-14 rounded-xl bg-bg-purple-50 flex items-center justify-center font-bold text-primary text-lg shrink-0">
              {initials}
            </div>
          )}
          <div className="flex flex-col min-w-0">
            <span className="font-sans font-semibold text-lg text-fg truncate">{accountName}</span>
            <span className="font-sans font-medium text-sm text-fg-body truncate">{domain} · {count} contact(s)</span>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <Button variant="outline" onClick={handleSendAll} isLoading={sendBulk.isPending} className="h-11 px-5">
            Send All ({count})
          </Button>
          <button
            onClick={() => setIsExpanded(v => !v)}
            className="font-sans font-semibold text-xs text-primary underline hover:text-primary-dark transition-colors cursor-pointer px-2 py-2"
          >
            {isExpanded ? 'Hide Draft(s)' : 'Show Draft(s)'}
          </button>
        </div>
      </div>

      {/* Expandable content */}
      {isExpanded && (
        <div className="flex flex-col lg:flex-row gap-4 items-start">
          {/* Left: Contact list */}
          <div className="w-full lg:w-[320px] flex flex-col gap-2 shrink-0">
            <h3 className="font-sans font-semibold text-sm text-primary">Contact(s)</h3>
            <div className="bg-bg-card rounded-lg p-2 flex flex-col gap-1">
              {conversations.length === 0 ? (
                <p className="text-sm text-fg-body text-center py-8">No drafts yet</p>
              ) : (
                conversations.map(c => (
                  <DraftContactListItem
                    key={c.id}
                    conversation={c}
                    isSelected={c.id === selected?.id}
                    onSelect={() => setSelectedId(c.id)}
                  />
                ))
              )}
            </div>
          </div>

          {/* Right: Draft editor */}
          <div className="flex-1 min-w-0 w-full">
            <h3 className="font-sans font-semibold text-sm text-primary mb-2">Draft</h3>
            {selected ? (
              <DraftEditor conversation={selected} onUpdated={onConversationUpdated} />
            ) : (
              <div className="bg-bg-card rounded-lg p-8 flex items-center justify-center min-h-[320px]">
                <p className="font-sans text-sm text-fg-body">Select a contact to view draft</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
