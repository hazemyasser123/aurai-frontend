import React from 'react';
import type { Account } from '@/features/batches/types/batchTypes';
import type { OutreachConversation } from '@/features/batches/types/batchTypes';
import { OutreachedContactRow } from './OutreachedContactRow';

interface Props {
  account: Account;
  conversations: OutreachConversation[];
  onViewConversation: (c: OutreachConversation) => void;
}

export const OutreachedAccountCard: React.FC<Props> = ({ account, conversations, onViewConversation }) => {
  const accountName = account.name ?? 'Unnamed Account';
  const domain = account.domain ?? '—';
  const initials = (accountName?.charAt(0) ?? '?').toUpperCase();

  return (
    <div className="bg-bg-sidebar border border-border rounded-xl shadow-card p-6 flex flex-col gap-4">
      {/* Account header */}
      <div className="flex items-center gap-3">
        {account.logo_url ? (
          <img src={account.logo_url} alt={accountName} className="w-14 h-14 rounded-xl object-cover bg-bg-purple-50 shrink-0" />
        ) : (
          <div className="w-14 h-14 rounded-xl bg-bg-purple-50 flex items-center justify-center font-bold text-primary text-lg shrink-0">
            {initials}
          </div>
        )}
        <div className="flex flex-col">
          <span className="font-sans font-semibold text-lg leading-6 tracking-tight text-fg">{accountName}</span>
          <span className="font-sans font-medium text-sm text-fg-body">
            {domain} · {conversations.length} contact(s)
          </span>
        </div>
      </div>

      {/* Contacts */}
      <div className="flex flex-col gap-2">
        <h4 className="font-sans font-semibold text-sm text-primary">Contact(s)</h4>
        <div className="bg-bg-card rounded-lg p-4 flex flex-col gap-0 divide-y divide-border/50">
          {conversations.length === 0 ? (
            <p className="font-sans text-sm text-fg-body text-center py-6">No outreached contacts for this account</p>
          ) : (
            conversations.map((c) => (
              <div key={c.id} className="py-3 first:pt-0 last:pb-0">
                <OutreachedContactRow conversation={c} onViewConversation={onViewConversation} />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
