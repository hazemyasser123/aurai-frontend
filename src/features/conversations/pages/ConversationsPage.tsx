import React, { useState, useMemo } from 'react';
import { WithNavbar } from '@/shared/components/hoc/WithNavbar';
import { useConversations } from '@/features/conversations/hooks/useConversations';
import { useBatches } from '@/features/batches/hooks/useBatches';
import { BatchFilterSelect } from '@/features/conversations/components/BatchFilterSelect';
import { ConversationFilters, type ConversationFilterKey } from '@/features/conversations/components/ConversationFilters';
import { AccountGroup } from '@/features/conversations/components/AccountGroup';
import { ConversationDetail } from '@/features/conversations/components/ConversationDetail';
import type { Conversation } from '@/features/batches/types/batchTypes';

const ConversationsPage: React.FC = () => {
  const { data: conversations, isLoading } = useConversations();
  const { data: batches } = useBatches();

  const [batchFilter, setBatchFilter] = useState('all');
  const [filter, setFilter] = useState<ConversationFilterKey>('all');
  const [selected, setSelected] = useState<Conversation | null>(null);

  const list = Array.isArray(conversations) ? conversations : [];

  // Client-side counts per filter chip (from the full unfiltered list)
  const counts = useMemo<Record<ConversationFilterKey, number>>(() => {
    const cls = (c: Conversation) => (c.classification || '').toLowerCase().replace(/[_-]/g, ' ');
    return {
      all: list.length,
      needs_action: list.filter((c) => c.needs_human_action).length,
      needs_followup: list.filter((c) => c.needs_followup).length,
      interested: list.filter((c) => cls(c).includes('meeting') || cls(c).includes('interested')).length,
      in_conversation: list.filter((c) => cls(c).includes('conversation')).length,
      not_interested: list.filter((c) => cls(c).includes('not interested')).length,
      out_of_office: list.filter((c) => cls(c).includes('office')).length,
    };
  }, [list]);

  // Apply batch + chip filters
  const filtered = useMemo(() => {
    return list.filter((c) => {
      if (batchFilter !== 'all' && c.batch_id !== batchFilter) return false;
      const cls = (c.classification || '').toLowerCase().replace(/[_-]/g, ' ');
      switch (filter) {
        case 'needs_action': return !!c.needs_human_action;
        case 'needs_followup': return !!c.needs_followup;
        case 'interested': return cls.includes('meeting') || cls.includes('interested');
        case 'in_conversation': return cls.includes('conversation');
        case 'not_interested': return cls.includes('not interested');
        case 'out_of_office': return cls.includes('office');
        default: return true;
      }
    });
  }, [list, batchFilter, filter]);

  // Group by account
  const groups = useMemo(() => {
    const byAccount = new Map<string, Conversation[]>();
    filtered.forEach((c) => {
      const arr = byAccount.get(c.account_id) || [];
      arr.push(c);
      byAccount.set(c.account_id, arr);
    });
    return byAccount;
  }, [filtered]);

  // Auto-select the first conversation once, but never force-reopen after
  // the user explicitly goes back (mobile) — that would trap them in detail view.
  const [hasAutoSelected, setHasAutoSelected] = useState(false);
  React.useEffect(() => {
    if (!hasAutoSelected && !selected && filtered.length > 0) {
      setSelected(filtered[0]);
      setHasAutoSelected(true);
    }
  }, [filtered, selected, hasAutoSelected]);

  const selectedStillVisible =
    selected && filtered.some((c) => c.id === selected.id)
      ? selected
      : null;

  return (
    <div className="w-full pb-8 sm:pb-12 max-w-[1120px] mx-auto flex flex-col gap-6">
      {/* Hero Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
        <div className="flex flex-col gap-1 min-w-0">
          <h2 className="font-sans font-bold text-xl sm:text-2xl tracking-tight text-fg">Conversations</h2>
          <p className="font-sans font-medium text-sm text-fg-body">
            {counts.all} conversation(s) across all batches
          </p>
        </div>
        <BatchFilterSelect
          batches={(batches || []).map((b) => ({ id: b.id, name: b.name }))}
          value={batchFilter}
          onChange={setBatchFilter}
        />
      </div>

      {/* Filter chips */}
      <ConversationFilters active={filter} counts={counts} onChange={setFilter} />

      {/* Workspace area — fits viewport so reply bar is always visible */}
      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-4 lg:h-[calc(100vh-140px)] lg:items-stretch">
          <div className="h-[400px] lg:h-full bg-bg-sidebar border border-border rounded-xl animate-pulse" />
          <div className="h-[600px] lg:h-full bg-bg-card border border-border rounded-xl animate-pulse" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-4 lg:h-[calc(100vh-140px)] lg:items-stretch">
          {/* Conversation List — full viewport height, scrolls internally */}
          <div
            className={`bg-bg-sidebar border border-border rounded-xl shadow-card overflow-y-auto max-h-[60vh] lg:max-h-none lg:h-full ${
              selectedStillVisible ? 'hidden lg:block' : ''
            }`}
          >
            {groups.size === 0 ? (
              <p className="text-sm text-fg-body text-center py-12">No conversations match these filters.</p>
            ) : (
              Array.from(groups.entries()).map(([accountId, convs]) => (
                <AccountGroup
                  key={accountId}
                  accountName={convs[0].account_name || 'Unknown Account'}
                  accountDomain={convs[0].account_domain}
                  logoUrl={convs[0].account_logo_url}
                  conversations={convs}
                  activeId={selectedStillVisible?.id ?? null}
                  onSelect={(c) => setSelected(c)}
                />
              ))
            )}
          </div>

          {/* Detail Column — fills viewport, internal scroll keeps reply bar pinned */}
          <div className={`${selectedStillVisible ? '' : 'hidden lg:block'} min-h-[520px] lg:min-h-0 lg:h-full lg:flex lg:flex-col`}>
            {selectedStillVisible ? (
              <ConversationDetail conversation={selectedStillVisible} onBack={() => setSelected(null)} />
            ) : (
              <div className="bg-bg-card border border-border rounded-xl flex items-center justify-center min-h-[520px] lg:h-full">
                <p className="font-sans text-sm text-fg-body">Select a conversation to view it</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default WithNavbar(ConversationsPage);
