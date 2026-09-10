import React, { useEffect, useMemo, useState } from 'react';
import { useBatchAccounts, useIgnoredAccountIds } from '@/features/batches/hooks/useBatchAccounts';
import { useBatchContacts } from '@/features/batches/hooks/useBatchContacts';
import { useBatchOutreach } from '@/features/batches/hooks/useBatchOutreach';
import { useDraftOutreach } from '@/features/batches/hooks/useDraftOutreach';
import { useOutreachThread } from '@/features/batches/hooks/useOutreachThread';
import { useFetchMoreAccounts } from '@/features/batches/hooks/useFetchMoreAccounts';
import { filterNewAccounts } from '@/features/batches/hooks/useFetchMoreAccounts';
import { useFindBatchContacts } from '@/features/batches/hooks/useFindBatchContacts';
import { OutreachedAccountCard } from './OutreachedAccountCard';
import { RemainingAccountCard } from './RemainingAccountCard';
import { FindMoreAccountsModal } from '@/features/batches/components/flow/FindMoreAccountsModal';
import type { Batch, Contact, OutreachConversation } from '@/features/batches/types/batchTypes';
import type { BeginTransition } from '@/features/batches/utils/batchFlow';
import { Modal, Button } from '@/shared/components/ui';
import { FiPlus, FiSearch, FiInfo } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { getErrorMessage } from '@/shared/utils/errorHandler';

interface Props {
  batch: Batch;
  /** Runs an action and polls the batch until the target step is confirmed (loading state handled by the tab) */
  beginTransition: BeginTransition;
}

export const ContactsFetchedView: React.FC<Props> = ({ batch, beginTransition }) => {
  const batchId = batch.id;
  const { data: accounts, isLoading: loadingAccounts } = useBatchAccounts(batchId);
  const { data: contacts, isLoading: loadingContacts } = useBatchContacts(batchId);
  const { data: ignoredAccountIds } = useIgnoredAccountIds(batchId);
  const { data: outreach, isLoading: loadingOutreach, isError, error } = useBatchOutreach(batchId);
  const [selected, setSelected] = useState<OutreachConversation | null>(null);
  const { data: thread, isLoading: loadingThread } = useOutreachThread(selected?.id ?? null);
  const draftOutreach = useDraftOutreach(batchId, batch.product_analysis);

  // Grow outreach — the batch stays expandable even after being outreached
  const fetchMore = useFetchMoreAccounts(batchId);
  const findContacts = useFindBatchContacts(batchId);
  const [isFindMoreOpen, setIsFindMoreOpen] = useState(false);

  const handleFindMoreAccounts = async (count: number) => {
    try {
      // Documented body: count_to_add, account_source, icp
      const fetched = await fetchMore.mutateAsync({
        count_to_add: count,
        account_source: batch.account_source || undefined,
        icp: batch.icp,
      });
      // Only genuinely-new accounts count — duplicates are skipped
      const fresh = filterNewAccounts(fetched, accounts);
      if (fresh.length === 0) {
        toast('No new accounts found for this ICP criteria', { icon: <FiInfo /> });
      } else {
        toast.success(`${fresh.length} new account(s) found!`);
      }
      setIsFindMoreOpen(false);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleFindMoreContacts = async () => {
    if (!accounts || accounts.length === 0) {
      toast.error('No accounts to find contacts for');
      return;
    }
    // Runs the pipeline again for the visible accounts — backend moves the
    // batch back to 'contacts fetched' so the new contacts enter the flow
    await beginTransition(
      () => findContacts.mutateAsync({
        account_ids: accounts.map((a) => a.id),
        contact_source: batch.contact_source || undefined,
        icp: batch.icp,
        product_analysis: batch.product_analysis,
      }),
      'contacts',
      'Finding contacts'
    );
  };

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

  // Accounts & contacts not yet outreached — visible so they can be outreached later.
  // Contacts tied to Ignored accounts are excluded everywhere.
  const remainingGroups = useMemo(() => {
    if (!contacts) return [];
    const visibleContacts = ignoredAccountIds
      ? contacts.filter((ct) => !ignoredAccountIds.includes(ct.account_id))
      : contacts;
    const outreachedIds = new Set((outreach || []).map((o) => o.contact_id).filter(Boolean));
    const remaining = visibleContacts.filter((ct) => !outreachedIds.has(ct.id));
    if (remaining.length === 0) return [];
    const byAccount = new Map<string, Contact[]>();
    remaining.forEach((ct) => {
      const list = byAccount.get(ct.account_id) || [];
      list.push(ct);
      byAccount.set(ct.account_id, list);
    });
    const groups: Array<{ account: { id: string; name: string; domain: string; logo_url: string | null }; contacts: Contact[] }> = [];
    // Keep account order as returned by accounts API
    (accounts || []).forEach((acc) => {
      const list = byAccount.get(acc.id);
      if (list && list.length > 0) {
        groups.push({ account: { id: acc.id, name: acc.name, domain: acc.domain, logo_url: acc.logo_url }, contacts: list });
        byAccount.delete(acc.id);
      }
    });
    // Orphan contacts whose account is not in the accounts list
    byAccount.forEach((list, accountId) => {
      const first = list[0];
      groups.push({
        account: { id: accountId, name: first.account_name || 'Unnamed Account', domain: first.account_domain || '—', logo_url: null },
        contacts: list,
      });
    });
    return groups;
  }, [accounts, contacts, outreach, ignoredAccountIds]);

  const remainingCount = useMemo(() => remainingGroups.reduce((sum, g) => sum + g.contacts.length, 0), [remainingGroups]);

  // Who to draft for — checkboxes, not all-or-none. Persisted per batch so it survives close/reopen.
  const storageKey = `aurai:remaining-selection:${batchId}`;
  const [selectedRemaining, setSelectedRemaining] = useState<Set<string>>(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const arr: unknown = JSON.parse(raw);
        if (Array.isArray(arr)) return new Set(arr.filter((x): x is string => typeof x === 'string'));
      }
    } catch {
      // Corrupt or unavailable storage — start fresh
    }
    return new Set();
  });

  // Reload persisted selection if the batch changes without remount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(`aurai:remaining-selection:${batchId}`);
      if (raw) {
        const arr: unknown = JSON.parse(raw);
        if (Array.isArray(arr)) {
          setSelectedRemaining(new Set(arr.filter((x): x is string => typeof x === 'string')));
          return;
        }
      }
      setSelectedRemaining(new Set());
    } catch {
      setSelectedRemaining(new Set());
    }
  }, [batchId]);

  // Persist on every change
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify([...selectedRemaining]));
    } catch {
      // Storage full or unavailable — selection just won't persist
    }
  }, [storageKey, selectedRemaining]);

  // Prune selection when the remaining list changes (e.g. after drafting).
  // Guard on contacts being loaded: while refetching on tab revisit, contacts is
  // briefly undefined and remainingGroups is momentarily [] — pruning then would
  // wipe (and persist) a valid persisted selection.
  useEffect(() => {
    if (contacts === undefined) return;
    setSelectedRemaining((prev) => {
      if (prev.size === 0) return prev;
      const valid = new Set(remainingGroups.flatMap((g) => g.contacts.map((ct) => ct.id)));
      const next = new Set([...prev].filter((id) => valid.has(id)));
      return next.size === prev.size ? prev : next;
    });
  }, [remainingGroups, contacts]);

  const handleToggleRemaining = (contactId: string) => {
    setSelectedRemaining((prev) => {
      const next = new Set(prev);
      if (next.has(contactId)) next.delete(contactId);
      else next.add(contactId);
      return next;
    });
  };

  const handleSelectAllRemaining = () => {
    setSelectedRemaining(new Set(remainingGroups.flatMap((g) => g.contacts.map((ct) => ct.id))));
  };

  const handleClearRemainingSelection = () => {
    setSelectedRemaining(new Set());
  };

  const selectedRemainingCount = selectedRemaining.size;
  const allRemainingSelected = remainingCount > 0 && selectedRemainingCount === remainingCount;

  const isLoading = loadingAccounts || loadingOutreach || loadingContacts;

  const handleViewConversation = (c: OutreachConversation) => {
    setSelected(c);
  };

  const handleDraftRemaining = async (contactIds: string[]) => {
    if (contactIds.length === 0) {
      toast.error('Select at least one contact to draft for');
      return;
    }
    try {
      const drafts = await draftOutreach.mutateAsync(contactIds);
      const count = Array.isArray(drafts) ? drafts.length : contactIds.length;
      setSelectedRemaining(new Set());
      toast.success(`${count} draft(s) created — review and send from the Drafts page`);
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  };

  const handleDraftSelected = () => {
    const valid = new Set(remainingGroups.flatMap((g) => g.contacts.map((ct) => ct.id)));
    handleDraftRemaining([...selectedRemaining].filter((id) => valid.has(id)));
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

  if ((!outreach || outreach.length === 0) && remainingGroups.length === 0) {
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
      {/* Grow outreach — the batch stays expandable even after being outreached */}
      <div className="bg-bg-sidebar border border-border rounded-xl shadow-sm p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h3 className="font-sans font-semibold text-lg tracking-tight text-fg-alt">Grow your outreach</h3>
          <p className="font-sans text-sm text-fg-body">
            Find more accounts, then run contacts for them to keep the conversation going.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 shrink-0">
          <Button
            variant="outline"
            className="h-10 px-4 text-xs w-full sm:w-auto"
            onClick={() => setIsFindMoreOpen(true)}
            disabled={fetchMore.isPending}
          >
            <FiPlus className="w-4 h-4" />
            Find More Accounts
          </Button>
          <Button
            variant="outline"
            className="h-10 px-4 text-xs w-full sm:w-auto"
            onClick={handleFindMoreContacts}
            isLoading={findContacts.isPending}
            disabled={findContacts.isPending || !accounts || accounts.length === 0}
          >
            <FiSearch className="w-4 h-4" />
            Find More Contacts
          </Button>
        </div>
      </div>

      {/* Outer container matching Figma: bg #F9FAFB border 1px #E5E7EB rounded 12px p-6 */}
      {grouped.length > 0 && (
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
      )}

      {/* Accounts & contacts not yet outreached — kept visible so they can be outreached later */}
      {remainingGroups.length > 0 && (
        <div className="bg-bg-sidebar border border-border rounded-xl shadow-sm p-6 flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex flex-col gap-1">
              <h3 className="font-sans font-semibold text-lg tracking-tight text-fg-alt">Not yet outreached</h3>
              <p className="font-sans text-sm text-fg-body">
                {remainingCount} contact(s) across {remainingGroups.length} account(s) have no outreach yet. Check who to draft for, then send them from the Drafts page.
              </p>
              <button
                type="button"
                onClick={allRemainingSelected ? handleClearRemainingSelection : handleSelectAllRemaining}
                className="self-start font-sans font-semibold text-xs text-primary hover:text-primary-dark transition-colors cursor-pointer"
              >
                {allRemainingSelected ? 'Clear selection' : 'Select all'}
              </button>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 shrink-0">
              {selectedRemainingCount > 0 && (
                <Button
                  variant="primary"
                  className="h-10 px-4 text-xs w-full sm:w-auto"
                  onClick={handleDraftSelected}
                  isLoading={draftOutreach.isPending}
                  disabled={draftOutreach.isPending}
                >
                  Draft selected ({selectedRemainingCount})
                </Button>
              )}
              <Button
                variant="gradient"
                className="h-10 px-4 text-xs w-full sm:w-auto"
                onClick={() => handleDraftRemaining(remainingGroups.flatMap((g) => g.contacts.map((ct) => ct.id)))}
                isLoading={draftOutreach.isPending}
                disabled={draftOutreach.isPending}
              >
                Draft all remaining ({remainingCount})
              </Button>
            </div>
          </div>
          <div className="flex flex-col gap-6">
            {remainingGroups.map(({ account, contacts: groupContacts }) => (
              <RemainingAccountCard
                key={account.id}
                account={account}
                contacts={groupContacts}
                onDraft={handleDraftRemaining}
                isDrafting={draftOutreach.isPending}
                selectedIds={selectedRemaining}
                onToggleSelect={handleToggleRemaining}
              />
            ))}
          </div>
        </div>
      )}

      {/* View Conversation Modal — integrated with GET /outreach/conversations/{id}/thread */}
      <Modal isOpen={!!selected} onClose={() => setSelected(null)} title={selected ? `${selected.first_name} ${selected.last_name} — Conversation` : 'Conversation'}>        <div className="flex flex-col gap-4">
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

      {/* Find More Accounts Modal */}
      <FindMoreAccountsModal
        isOpen={isFindMoreOpen}
        onClose={() => setIsFindMoreOpen(false)}
        onConfirm={handleFindMoreAccounts}
        isLoading={fetchMore.isPending}
      />
    </div>
  );
};



