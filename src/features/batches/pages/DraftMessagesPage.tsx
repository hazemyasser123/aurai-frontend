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
import { AccountDraftSection } from '@/features/batches/components/draft/AccountDraftSection';
import type { OutreachConversation } from '@/features/batches/types/batchTypes';
import toast from 'react-hot-toast';
import { getErrorMessage } from '@/shared/utils/errorHandler';

const DraftMessagesPage: React.FC = () => {
  const { batchId } = useParams<{ batchId: string }>();
  const navigate = useNavigate();
  const { data: accounts, isLoading: isLoadingAccounts } = useBatchAccounts(batchId || '');
  const { data: contacts, isLoading: isLoadingContacts } = useBatchContacts(batchId || '');
  const { data: outreach, isLoading: isLoadingOutreach, refetch } = useBatchOutreach(batchId || '');
  const draftMutation = useDraftOutreach(batchId || '');
  const sendBulk = useSendBulkOutreach();
  const [localOutreach, setLocalOutreach] = useState<OutreachConversation[]>([]);

  useEffect(() => {
    if (outreach) setLocalOutreach(outreach);
  }, [outreach]);

  // Group outreach by account_id
  const grouped = useMemo(() => {
    if (!accounts) return [];
    const byAccount = new Map<string, OutreachConversation[]>();
    (localOutreach || []).forEach(c => {
      const arr = byAccount.get(c.account_id) || [];
      arr.push(c);
      byAccount.set(c.account_id, arr);
    });
    return accounts.map(acc => ({
      account: acc,
      conversations: byAccount.get(acc.id) || [],
    })).filter(g => g.conversations.length > 0 || (localOutreach?.length ?? 0) === 0);
    // When no drafts yet, keep accounts to show empty state per account? Instead filter empty later
  }, [accounts, localOutreach]);

  // Accounts with drafts or all accounts if no drafts yet (to show per-account empty)
  const displayGroups = useMemo(() => {
    if (localOutreach && localOutreach.length > 0) {
      return grouped.filter(g => g.conversations.length > 0);
    }
    // No drafts: show accounts with zero conversations so user sees structure, but we will show Generate CTA
    if (accounts) return accounts.map(acc => ({ account: acc, conversations: [] as OutreachConversation[] }));
    return [];
  }, [grouped, localOutreach, accounts]);

  const totalContacts = localOutreach?.length ?? contacts?.length ?? 0;
  const isLoading = isLoadingAccounts || isLoadingContacts || isLoadingOutreach;

  const handleGenerateDrafts = async () => {
    if (!contacts || contacts.length === 0) {
      toast.error('No contacts to draft for');
      return;
    }
    const contactIds = contacts.map(c => c.id);
    try {
      const drafts = await draftMutation.mutateAsync(contactIds);
      setLocalOutreach(drafts);
      toast.success(`Generated ${drafts.length} drafts`);
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  };

  const handleSendAll = async () => {
    const ids = localOutreach.map(c => c.id);
    if (ids.length === 0) {
      toast.error('No drafts to send');
      return;
    }
    try {
      const res = await sendBulk.mutateAsync(ids);
      if (res.failed_count > 0) toast.error(`${res.failed_count} failed, ${res.sent_count} sent`);
      else toast.success(`Sent ${res.sent_count} messages`);
      refetch();
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  };

  const handleConversationUpdated = (updated: OutreachConversation) => {
    setLocalOutreach(prev => prev.map(c => c.id === updated.id ? updated : c));
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
          <Button variant="gradient" className="w-full sm:w-auto h-11 px-6" onClick={handleSendAll} isLoading={sendBulk.isPending}>
            Send All ({localOutreach.length})
            <FiArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Generate drafts CTA when empty */}
      {localOutreach.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-4 py-16 border border-dashed border-border rounded-xl bg-bg-sidebar mb-6">
          <p className="font-sans font-medium text-sm text-fg-body text-center">No drafts yet for this batch.</p>
          <p className="font-sans text-xs text-fg-muted text-center max-w-md">Generate personalized outreach drafts for {contacts?.length ?? 0} contacts using your product intelligence and ICP.</p>
          <Button variant="gradient" onClick={handleGenerateDrafts} isLoading={draftMutation.isPending} className="h-11 px-6">
            Generate Drafts ({contacts?.length ?? 0})
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
        {localOutreach.length > 0 && displayGroups.length === 0 && (
          <div className="flex flex-col items-center justify-center h-64 border border-dashed border-border rounded-xl">
            <p className="text-fg-body font-medium">No draft conversations found.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default WithNavbar(DraftMessagesPage);
