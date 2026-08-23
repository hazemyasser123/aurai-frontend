import React, { useState, useEffect } from 'react';
import { Button, HtmlEditor } from '@/shared/components/ui';
import type { OutreachConversation } from '@/features/batches/types/batchTypes';
import { useUpdateOutreachDraft } from '@/features/batches/hooks/useUpdateOutreachDraft';
import { useSendOutreach } from '@/features/batches/hooks/useSendOutreach';
import toast from 'react-hot-toast';
import { getErrorMessage } from '@/shared/utils/errorHandler';

interface Props {
  conversation: OutreachConversation;
  onUpdated?: (c: OutreachConversation) => void;
}

export const DraftEditor: React.FC<Props> = ({ conversation, onUpdated }) => {
  const [subject, setSubject] = useState(conversation.subject || '');
  const [body, setBody] = useState(conversation.body || '');
  const [isEditing, setIsEditing] = useState(false);
  const updateDraft = useUpdateOutreachDraft();
  const sendOutreach = useSendOutreach();

  useEffect(() => {
    setSubject(conversation.subject || '');
    setBody(conversation.body || '');
  }, [conversation.id, conversation.subject, conversation.body]);

  const handleSave = async () => {
    try {
      const updated = await updateDraft.mutateAsync({
        conversationId: conversation.id,
        payload: { subject, body },
      });
      toast.success('Draft saved');
      onUpdated?.(updated);
      setIsEditing(false);
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  };

  const handleSend = async () => {
    // Save first if dirty
    if (subject !== conversation.subject || body !== conversation.body) {
      try {
        await updateDraft.mutateAsync({
          conversationId: conversation.id,
          payload: { subject, body },
        });
      } catch (e) {
        toast.error(getErrorMessage(e));
        return;
      }
    }
    try {
      await sendOutreach.mutateAsync(conversation.id);
      toast.success(`Sent to ${conversation.recipient_email || conversation.first_name}`);
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  };

  const isDirty = subject !== (conversation.subject || '') || body !== (conversation.body || '');

  return (
    <div className="flex flex-col gap-4 w-full bg-bg-card rounded-lg p-4">
      {/* Contact header inside draft */}
      <div className="flex items-center gap-4 p-2">
        {conversation.photo_url ? (
          <img src={conversation.photo_url} alt={conversation.first_name} className="w-10 h-10 rounded-full object-cover bg-bg-purple-50" />
        ) : (
          <div className="w-10 h-10 rounded-full bg-bg-purple-50 flex items-center justify-center font-semibold text-primary text-sm">
            {(conversation.first_name?.charAt(0) ?? '?').toUpperCase()}
          </div>
        )}
        <div className="flex flex-col">
          <span className="font-sans font-medium text-sm text-fg">{conversation.first_name} {conversation.last_name}</span>
          <span className="font-sans font-normal text-xs text-fg-medium">{conversation.title || '—'}</span>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label className="font-sans font-semibold text-xs text-fg-strong">To</label>
        <div className="flex items-center px-4 py-2.5 bg-bg-input border border-border rounded-lg text-sm text-fg-body h-11">
          {conversation.recipient_email || 'No email'}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label className="font-sans font-semibold text-xs text-fg-strong">Subject</label>
        <input
          value={subject}
          onChange={(e) => { setSubject(e.target.value); setIsEditing(true); }}
          placeholder="24/7 Lead Conversion for Retail Operations"
          className="w-full h-11 px-4 py-2.5 bg-bg-input border border-border rounded-lg font-sans text-sm text-fg-strong outline-none focus:border-border-focus focus:shadow-[0_0_0_3px_rgba(127,34,254,0.12)] transition-[border-color,box-shadow] duration-150 ease-out"
        />
      </div>

      <HtmlEditor
        label="Body"
        value={body}
        onChange={(v) => { setBody(v); setIsEditing(true); }}
        placeholder="Dear Sara, Leading an operations team involves managing the constant influx of digital inquiries..."
        minHeight="320px"
      />

      <div className="flex items-center justify-end gap-3">
        {isDirty && (
          <Button variant="outline" onClick={handleSave} isLoading={updateDraft.isPending} className="h-11">
            Save Draft
          </Button>
        )}
        <Button variant="primary" onClick={handleSend} isLoading={sendOutreach.isPending || updateDraft.isPending} className="h-11 min-w-[140px]">
          Send
        </Button>
      </div>
      {isEditing && isDirty && <p className="font-sans text-xs text-fg-muted text-right">Unsaved changes</p>}
    </div>
  );
};
