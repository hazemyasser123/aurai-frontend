import React from 'react';
import { Button } from '@/shared/components/ui';
import type { Contact } from '@/features/batches/types/batchTypes';

interface RemainingAccount {
  id: string;
  name: string;
  domain: string;
  logo_url: string | null;
}

interface Props {
  account: RemainingAccount;
  contacts: Contact[];
  onDraft: (contactIds: string[]) => void;
  isDrafting: boolean;
  selectedIds: Set<string>;
  onToggleSelect: (contactId: string) => void;
}

export const RemainingAccountCard: React.FC<Props> = ({ account, contacts, onDraft, isDrafting, selectedIds, onToggleSelect }) => {
  const accountName = account.name || 'Unnamed Account';
  const domain = account.domain || '—';
  const initials = (accountName?.charAt(0) ?? '?').toUpperCase();

  return (
    <div className="bg-bg-card border border-border rounded-xl p-6 flex flex-col gap-4">
      {/* Account header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          {account.logo_url ? (
            <img src={account.logo_url} alt={accountName} className="w-12 h-12 rounded-xl object-cover bg-bg-purple-50 shrink-0" />
          ) : (
            <div className="w-12 h-12 rounded-xl bg-bg-purple-50 flex items-center justify-center font-bold text-primary text-lg shrink-0">
              {initials}
            </div>
          )}
          <div className="flex flex-col min-w-0">
            <span className="font-sans font-semibold text-base leading-6 tracking-tight text-fg truncate">{accountName}</span>
            <span className="font-sans font-medium text-sm text-fg-body truncate">
              {domain} · {contacts.length} contact(s) not outreached
            </span>
          </div>
        </div>
        <Button
          variant="outline"
          className="h-10 px-4 py-2 min-w-0 text-xs w-full sm:w-auto"
          onClick={() => onDraft(contacts.map((c) => c.id))}
          isLoading={isDrafting}
          disabled={isDrafting || contacts.length === 0}
        >
          Draft messages
        </Button>
      </div>

      {/* Contacts — check who to draft for */}
      <div className="flex flex-col gap-0 divide-y divide-border/50">
        {contacts.map((contact) => {
          const name = `${contact.first_name || ''} ${contact.last_name || ''}`.trim() || '—';
          const contactInitials = (contact.first_name?.charAt(0) ?? '?').toUpperCase();
          const isChecked = selectedIds.has(contact.id);
          return (
            <label key={contact.id} className="flex items-center gap-4 py-3 first:pt-0 last:pb-0 cursor-pointer">
              <input
                type="checkbox"
                checked={isChecked}
                onChange={() => onToggleSelect(contact.id)}
                disabled={isDrafting}
                className="w-4 h-4 accent-primary cursor-pointer shrink-0"
                aria-label={`Select ${name}`}
              />
              {contact.photo_url ? (
                <img src={contact.photo_url} alt={contact.first_name} className="w-10 h-10 rounded-full object-cover bg-bg-purple-50 shrink-0" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-bg-purple-50 flex items-center justify-center font-semibold text-primary text-sm shrink-0">
                  {contactInitials}
                </div>
              )}
              <div className="flex flex-col min-w-0">
                <span className="font-sans font-medium text-sm text-fg truncate">{name}</span>
                <span className="font-sans font-normal text-xs text-fg-medium truncate">{contact.title || '—'}</span>
                {contact.primary_email && (
                  <span className="font-sans font-normal text-xs text-fg-muted truncate">{contact.primary_email}</span>
                )}
              </div>
            </label>
          );
        })}
      </div>
    </div>
  );
};
