import React, { useMemo, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { WithNavbar } from '@/shared/components/hoc/WithNavbar';
import { Button } from '@/shared/components/ui';
import { FiArrowLeft, FiArrowRight } from 'react-icons/fi';
import { useBatchAccounts } from '@/features/batches/hooks/useBatchAccounts';
import { useBatchContacts } from '@/features/batches/hooks/useBatchContacts';
import { useBatchOutreach } from '@/features/batches/hooks/useBatchOutreach';
import { useDraftOutreach } from '@/features/batches/hooks/useDraftOutreach';
import { useSendBulkOutreach } from '@/features/batches/hooks/useSendBulkOutreach';
import { useBatch } from '@/features/batches/hooks/useBatch';
import { isStepAtLeast, getStatusRoute } from '@/features/batches/utils/batchFlow';
import { AccountDraftSection } from '@/features/batches/components/draft/AccountDraftSection';
import type { OutreachConversation } from '@/features/batches/types/batchTypes';
import toast from 'react-hot-toast';
import { getErrorMessage } from '@/shared/utils/errorHandler';

const DraftMessagesPage: React.FC = () => {
  const { batchId } = useParams<{ batchId: string }>();
  const navigate = useNavigate();
  const { data: accounts, isLoading: isLoadingAccounts } = useBatchAccounts(batchId || '');
  const { data: contacts, isLoading: isLoadingContacts } = useBatchContacts(batchId || '');
  const { data: outreach, isLoading: isLoadingOutreach } = useBatchOutreach(batchId || '');
  const { data: batch, isLoading: isLoadingBatch } = useBatch(batchId || '');

  // Past viewing allowed: requires at least 'draft' (emails drafted).
  // If still before draft (Draft/Executed/Enriched/contacts), redirect to canonical.
  useEffect(() => {
    if (!batch || !batchId) return;
    if (!isStepAtLeast(batch.status, 'draft')) {
      navigate(getStatusRoute(batchId, batch.status), { replace: true });
    }
  }, [batch, batchId, navigate]);

  const isPastOutreached = isStepAtLeast(batch?.status, 'outreached');

  const draftMutation = useDraftOutreach(batchId || '');
  const sendBulk = useSendBulkOutreach(batchId);
  const [localOutreach, setLocalOutreach] = useState<OutreachConversation[]>([]);

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

  useEffect(() => {
    if (outreach !== undefined) {
      setLocalOutreach(normalizeOutreach(outreach));
    }
  }, [outreach]);

  // Ensure localOutreach is always an array
  const safeOutreach = Array.isArray(localOutreach) ? localOutreach : [];

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
  const isLoading = isLoadingAccounts || isLoadingContacts || isLoadingOutreach || isLoadingBatch;

  const handleGenerateDrafts = async () => {
    if (!contacts || contacts.length === 0) {
      toast.error('No contacts to draft for');
      return;
    }
    const contactIds = contacts.map((c) => c.id);
    try {
      const drafts = await draftMutation.mutateAsync(contactIds);
      const normalized = normalizeOutreach(drafts);
      setLocalOutreach(normalized);
      toast.success(`Generated ${normalized.length} drafts`);
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  };

  const handleSendAll = async () => {
    if (!batchId) return;
    try {
      // POST /outreach/conversations/send-bulk — Option 1: send all unsent emails in the batch
      const res = await sendBulk.mutateAsync({ batch_id: batchId });
      toast.success(`Sent ${res.sent_count} message(s)`);
      // After sending all, take the user to the outreached accounts view
      navigate(`/batches/${batchId}?tab=accounts`);
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  };

  const handleConversationUpdated = (updated: OutreachConversation) => {
    setLocalOutreach((prev) => (Array.isArray(prev) ? prev : []).map((c) => (c.id === updated.id ? updated : c)));
  };

  if (isLoading) {
    return (
      <div className="w-full pb-12 max-w-[1120px] mx-auto">
        <div className="h-12 bg-bg-sidebar rounded-xl animate-pulse mb-8" />
        <div className="h-64 bg-bg-sidebar rounded-xl animate-pulse mb-6" />
        <div className="h-64 bg-bg-sidebar rounded-xl animate-pulse mb-6" />
      </div>
    );
  }

  return (
    <div className="w-full pb-12 max-w-[1120px] mx-auto">
      {/* Hero Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(`/batches/${batchId}/contacts`)} className="p-1.5 rounded-md text-fg hover:bg-bg-muted transition-colors">
              <FiArrowLeft className="w-5 h-5" />
            </button>
            <h2 className="font-sans font-bold text-xl sm:text-2xl tracking-tight text-fg">Draft Messages</h2>
          </div>
          <p className="font-sans font-medium text-sm text-fg-body ml-9">
            {totalContacts} contact(s) in this review batch
          </p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Button variant="outline" className="w-full sm:w-auto h-11 px-6" onClick={() => navigate(`/batches/${batchId}/contacts`)}>
            <FiArrowLeft className="w-4 h-4" />
            Batch Contacts
          </Button>
          {isPastOutreached ? (
            <Button variant="outline" className="w-full sm:w-auto h-11 px-6" onClick={() => navigate(`/batches/${batchId}?tab=accounts`)}>
              View Outreached
              <FiArrowRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button variant="gradient" className="w-full sm:w-auto h-11 px-6" onClick={handleSendAll} isLoading={sendBulk.isPending}>
              Send All ({safeOutreach.length})
              <FiArrowRight className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Generate drafts CTA when empty — disabled when already past this step */}
      {safeOutreach.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-4 py-16 border border-dashed border-border rounded-xl bg-bg-sidebar mb-6">
          <p className="font-sans font-medium text-sm text-fg-body text-center">No drafts yet for this batch.</p>
          <p className="font-sans text-xs text-fg-muted text-center max-w-md">Generate personalized outreach drafts for {contacts?.length ?? 0} contacts using your product intelligence and ICP.</p>
          {isPastOutreached ? (
            <Button variant="outline" onClick={() => navigate(`/batches/${batchId}?tab=accounts`)} className="h-11 px-6">
              View Outreached
              <FiArrowRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button variant="gradient" onClick={handleGenerateDrafts} isLoading={draftMutation.isPending} className="h-11 px-6">
              Generate Drafts ({contacts?.length ?? 0})
              <FiArrowRight className="w-4 h-4" />
            </Button>
          )}
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

export default WithNavbar(DraftMessagesPage);
