import React, { useMemo, useState } from 'react';
import { Button } from '@/shared/components/ui';
import { FiArrowRight, FiArrowLeft, FiInfo } from 'react-icons/fi';
import { useBatchAccounts, useIgnoredAccountIds } from '@/features/batches/hooks/useBatchAccounts';
import { useBatchContacts } from '@/features/batches/hooks/useBatchContacts';
import { useBatchOutreach } from '@/features/batches/hooks/useBatchOutreach';
import { useDraftOutreach } from '@/features/batches/hooks/useDraftOutreach';
import { useSendBulkOutreach } from '@/features/batches/hooks/useSendBulkOutreach';
import { AccountDraftSection } from '@/features/batches/components/draft/AccountDraftSection';
import { STEP_LABELS } from '@/features/batches/utils/batchFlow';
import type { BeginTransition } from '@/features/batches/utils/batchFlow';
import type { Batch } from '@/features/batches/types/batchTypes';
import type { OutreachConversation } from '@/features/batches/types/batchTypes';
import toast from 'react-hot-toast';
import { getErrorMessage } from '@/shared/utils/errorHandler';

interface Props {
    batch: Batch;
    /** Runs an action and polls the batch until the target step is confirmed (loading state handled by the tab) */
    beginTransition: BeginTransition;
    /** Go back to the previous flow step (view only — does not change batch status) */
    onBack?: () => void;
    /** Present when viewing an earlier step than the batch's current step — advances the view forward instead of re-running the action */
    onGoForward?: () => void;
}

export const DraftMessagesView: React.FC<Props> = ({ batch, beginTransition, onBack, onGoForward }) => {
  const batchId = batch.id;
  const { data: accounts, isLoading: isLoadingAccounts } = useBatchAccounts(batchId);
  const { data: rawContacts, isLoading: isLoadingContacts } = useBatchContacts(batchId);
  const { data: ignoredAccountIds } = useIgnoredAccountIds(batchId);
  const { data: outreach, isLoading: isLoadingOutreach } = useBatchOutreach(batchId);

  const draftMutation = useDraftOutreach(batchId, batch.product_analysis);
  const sendBulk = useSendBulkOutreach(batchId);

  const normalizeOutreach = (data: unknown): OutreachConversation[] => {
    if (Array.isArray(data)) return data as OutreachConversation[];
    if (data && typeof data === 'object') {
      const obj = data as Record<string, unknown>;
      if (Array.isArray(obj.outreach)) return obj.outreach as OutreachConversation[];
      if (Array.isArray(obj.data)) return obj.data as OutreachConversation[];
      if (Array.isArray(obj.conversations)) return obj.conversations as OutreachConversation[];
      if (Array.isArray(obj.items)) return obj.items as OutreachConversation[];
    }
    return [];
  };

  // Seed local copy from cached query data so remounts (e.g. back → forward) show drafts immediately
  const [localOutreach, setLocalOutreach] = useState<OutreachConversation[]>(() =>
    outreach !== undefined ? normalizeOutreach(outreach) : []
  );
  const [prevOutreach, setPrevOutreach] = useState(outreach);

  // Sync local copy when server outreach data changes (render-phase adjustment)
  if (outreach !== prevOutreach) {
    setPrevOutreach(outreach);
    setLocalOutreach(outreach !== undefined ? normalizeOutreach(outreach) : []);
  }

  // Ensure localOutreach is always an array. Conversations tied to Ignored accounts are
  // excluded everywhere — display AND the Send All count (they're never sent).
  const safeOutreach = useMemo(
    () => (Array.isArray(localOutreach) ? localOutreach : []).filter(
      (c) => !ignoredAccountIds?.includes(c.account_id)
    ),
    [localOutreach, ignoredAccountIds]
  );

  // Contacts tied to Ignored accounts are excluded everywhere — display and drafts
  const contacts = useMemo(
    () => rawContacts?.filter((c) => !ignoredAccountIds?.includes(c.account_id)),
    [rawContacts, ignoredAccountIds]
  );

  // Group outreach by account_id
  const grouped = useMemo(() => {
    if (!accounts) return [];
    const byAccount = new Map<string, OutreachConversation[]>();
    safeOutreach.forEach((c) => {
      const arr = byAccount.get(c.account_id) || [];
      arr.push(c);
      byAccount.set(c.account_id, arr);
    });
    return accounts.map((acc) => ({
      account: acc,
      conversations: byAccount.get(acc.id) || [],
    })).filter((g) => g.conversations.length > 0 || safeOutreach.length === 0);
  }, [accounts, safeOutreach]);

  // Accounts with drafts or all accounts if no drafts yet (to show per-account empty)
  const displayGroups = useMemo(() => {
    if (safeOutreach.length > 0) {
      return grouped.filter((g) => g.conversations.length > 0);
    }
    if (accounts) return accounts.map((acc) => ({ account: acc, conversations: [] as OutreachConversation[] }));
    return [];
  }, [grouped, safeOutreach, accounts]);

  const totalContacts = safeOutreach.length > 0 ? safeOutreach.length : (contacts?.length ?? 0);
  const isLoading = isLoadingAccounts || isLoadingContacts || isLoadingOutreach;

  // All visible contacts are selected by default for "Generate Drafts"
  const selectedContactIds = useMemo(
    () => (contacts ?? []).map((c) => c.id),
    [contacts]
  );

  const handleGenerateDrafts = async () => {
    if (selectedContactIds.length === 0) {
      toast.error('No selected contacts to draft for');
      return;
    }
    try {
      const drafts = await draftMutation.mutateAsync(selectedContactIds);
      const normalized = normalizeOutreach(drafts);
      if (normalized.length === 0) {
        toast('Unable to generate message drafts', { icon: <FiInfo /> });
        return;
      }
      setLocalOutreach(normalized);
      toast.success(`Generated ${normalized.length} drafts`);
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  };

  const handleSendAll = async () => {
    if (!batchId) return;
    // The tab polls until the backend confirms the outreached status
    // POST /outreach/conversations/send-bulk — send the drafted conversations
    await beginTransition(
      () => sendBulk.mutateAsync({ conversation_ids: safeOutreach.map((c) => c.id) }),
      'outreached',
      'Sending outreach'
    );
  };

  const handleConversationUpdated = (updated: OutreachConversation) => {
    setLocalOutreach((prev) => (Array.isArray(prev) ? prev : []).map((c) => (c.id === updated.id ? updated : c)));
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <div className="h-12 bg-bg-sidebar rounded-xl animate-pulse" />
        <div className="h-64 bg-bg-sidebar rounded-xl animate-pulse" />
        <div className="h-64 bg-bg-sidebar rounded-xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          {onBack && (
            <button onClick={onBack} title="Back to Batch Contacts" aria-label="Go back" className="p-1.5 rounded-md text-fg hover:bg-bg-muted transition-colors">
              <FiArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div>
            <h2 className="font-sans font-bold text-xl sm:text-2xl tracking-tight text-fg">Draft Messages</h2>
            <p className="font-sans font-medium text-sm text-fg-body mt-1">
              {totalContacts} contact(s) in this review batch
            </p>
          </div>
        </div>
        {onGoForward ? (
          <Button variant="outline" className="w-full sm:w-auto h-11 px-6" onClick={onGoForward}>
            Go to {STEP_LABELS.outreached}
            <FiArrowRight className="w-4 h-4" />
          </Button>
        ) : (
          <Button variant="gradient" className="w-full sm:w-auto h-11 px-6" onClick={handleSendAll} isLoading={sendBulk.isPending}>
            Send All ({safeOutreach.length})
            <FiArrowRight className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Generate drafts CTA when empty */}
      {safeOutreach.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-4 py-16 border border-dashed border-border rounded-xl bg-bg-sidebar">
          <p className="font-sans font-medium text-sm text-fg-body text-center">No drafts yet for this batch.</p>
          <p className="font-sans text-xs text-fg-muted text-center max-w-md">Generate personalized outreach drafts for the {selectedContactIds.length} selected contact(s) using your product intelligence and ICP.</p>
          <Button variant="gradient" onClick={handleGenerateDrafts} isLoading={draftMutation.isPending} disabled={selectedContactIds.length === 0} className="h-11 px-6">
            Generate Drafts ({selectedContactIds.length})
            <FiArrowRight className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Account sections */}
      <div className="flex flex-col gap-6">
        {displayGroups.map(group => (
          <AccountDraftSection
            key={group.account.id}
            account={group.account}
            conversations={group.conversations}
            defaultExpanded={true}
            onConversationUpdated={handleConversationUpdated}
          />
        ))}
        {safeOutreach.length > 0 && displayGroups.length === 0 && (
          <div className="flex flex-col items-center justify-center h-64 border border-dashed border-border rounded-xl">
            <p className="text-fg-body font-medium">No draft conversations found.</p>
          </div>
        )}
      </div>
    </div>
  );
};

