import React, { useState, useRef, useEffect } from 'react';
import { FiMessageCircle, FiX, FiSend, FiCheck } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { getErrorMessage } from '@/shared/utils/errorHandler';

export interface ChatIcpResponse {
  reply: string;
  changed_fields: string[];
  proposed_icp: Record<string, unknown>;
}

interface IcpChatAssistantProps {
  currentIcp: Record<string, unknown>;
  onApply: (proposed: Record<string, unknown>) => void;
  chatFn: (payload: { message: string; current_icp: unknown }) => Promise<ChatIcpResponse>;
  title?: string;
}

type ChatMessage =
  | { id: string; role: 'user'; content: string }
  | {
      id: string;
      role: 'assistant';
      content: string;
      changed_fields: string[];
      proposed_icp: Record<string, unknown>;
      snapshot: Record<string, unknown>;
      appliedFields?: string[];
      declinedFields?: string[];
    };

const FIELD_LABELS: Record<string, string> = {
  name: 'Target Profile Name',
  strategic_summary: 'Strategic Summary',
  industries: 'Target Industries',
  geographies: 'Target Geographies',
  min_employees: 'Min Employees',
  max_employees: 'Max Employees',
  min_revenue: 'Min Revenue',
  max_revenue: 'Max Revenue',
  funding_stages: 'Funding Stages',
  included_technologies: 'Included Technologies',
  excluded_technologies: 'Excluded Technologies',
  hiring_signals: 'Hiring Signals',
  intent_topics: 'Intent Topics',
  decision_maker_roles: 'Decision Maker Personas',
  company_characteristics: 'Target Company Characteristics',
};

function formatFieldLabel(key: string) {
  return FIELD_LABELS[key] ?? key.split('_').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

function normalizeArray(v: unknown): string[] {
  if (Array.isArray(v)) return v.map((x) => String(x));
  if (v == null) return [];
  return [String(v)];
}

const FieldDiffRow: React.FC<{
  field: string;
  snapshot: Record<string, unknown>;
  proposed: Record<string, unknown>;
  status: 'idle' | 'applied' | 'declined';
  onApply: (field: string, value: unknown) => void;
  onDecline: (field: string) => void;
}> = ({ field, snapshot, proposed, status, onApply, onDecline }) => {
  const oldVal = (snapshot as Record<string, unknown>)[field];
  const newVal = (proposed as Record<string, unknown>)[field];
  const isArrayField = Array.isArray(oldVal) || Array.isArray(newVal);

  const [keptRemoved, setKeptRemoved] = useState<Set<string>>(new Set());
  const [acceptedAdded, setAcceptedAdded] = useState<Set<string>>(new Set());

  const oldArr = isArrayField ? normalizeArray(oldVal) : [];
  const newArr = isArrayField ? normalizeArray(newVal) : [];
  const removed = isArrayField ? oldArr.filter((x) => !newArr.includes(x)) : [];
  const added = isArrayField ? newArr.filter((x) => !oldArr.includes(x)) : [];
  const unchanged = isArrayField ? oldArr.filter((x) => newArr.includes(x)) : [];

  // init acceptedAdded to all added on mount / when added changes
  useEffect(() => {
    if (isArrayField) setAcceptedAdded(new Set(added));
  }, [field]); // only on field change; added is derived but we want initial all accepted

  const isIdle = status === 'idle';

  if (isArrayField) {
    // No effective change
    if (removed.length === 0 && added.length === 0) {
      return (
        <div className="flex flex-col gap-2 p-2.5 bg-bg-page border border-border rounded-lg">
          <span className="font-sans font-semibold text-xs text-fg">{formatFieldLabel(field)}</span>
          <span className="font-sans text-xs text-fg-muted">No effective change</span>
          {isIdle && (
            <div className="flex gap-2">
              <span className="font-sans text-xs text-fg-muted italic">Already in sync</span>
            </div>
          )}
          {status !== 'idle' && (
            <span className={`inline-flex self-start px-2 py-1 rounded-full text-xs font-semibold ${status === 'applied' ? 'bg-success-bg text-success' : 'bg-bg-muted text-fg-muted'}`}>
              {status === 'applied' ? 'Applied' : 'Declined'}
            </span>
          )}
        </div>
      );
    }

    const finalPreview = [...unchanged, ...Array.from(keptRemoved), ...Array.from(acceptedAdded)];

    return (
      <div className="flex flex-col gap-2 p-2.5 bg-bg-page border border-border rounded-lg">
        <div className="flex items-center justify-between gap-2">
          <span className="font-sans font-semibold text-xs text-fg">{formatFieldLabel(field)}</span>
          {status !== 'idle' && (
            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${status === 'applied' ? 'bg-success-bg text-success border border-success/20' : 'bg-bg-muted text-fg-muted border border-border'}`}>
              {status === 'applied' ? 'Applied' : 'Declined'}
            </span>
          )}
        </div>

        {/* Unchanged */}
        {unchanged.length > 0 && (
          <div className="flex flex-col gap-1">
            <span className="font-sans text-[10px] tracking-widest text-fg-subtle uppercase">Kept</span>
            <div className="flex flex-wrap gap-1.5">
              {unchanged.map((v) => (
                <span key={`u-${v}`} className="px-2 py-1 rounded-md bg-bg-card border border-border font-sans text-xs text-fg-body">
                  {v}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Removed — red, can keep */}
        {removed.length > 0 && (
          <div className="flex flex-col gap-1">
            <span className="font-sans text-[10px] tracking-widest text-danger uppercase">To be removed — click to keep</span>
            <div className="flex flex-wrap gap-1.5">
              {removed.map((v) => {
                const kept = keptRemoved.has(v);
                return (
                  <button
                    key={`r-${v}`}
                    type="button"
                    disabled={!isIdle}
                    onClick={() => {
                      if (!isIdle) return;
                      setKeptRemoved((prev) => {
                        const next = new Set(prev);
                        if (next.has(v)) next.delete(v);
                        else next.add(v);
                        return next;
                      });
                    }}
                    className={`px-2 py-1 rounded-md border font-sans text-xs transition-colors text-left ${
                      kept
                        ? 'bg-bg-card border-border text-fg-body'
                        : 'bg-danger-bg border-danger/20 text-danger line-through'
                    } ${isIdle ? 'hover:opacity-80 cursor-pointer' : 'cursor-default opacity-70'}`}
                    title={kept ? 'Kept — will not be removed' : 'Will be removed — click to keep'}
                  >
                    {v} {kept ? '✓ keep' : ''}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Added — green, can skip */}
        {added.length > 0 && (
          <div className="flex flex-col gap-1">
            <span className="font-sans text-[10px] tracking-widest text-success uppercase">To be added — click to skip</span>
            <div className="flex flex-wrap gap-1.5">
              {added.map((v) => {
                const accepted = acceptedAdded.has(v);
                return (
                  <button
                    key={`a-${v}`}
                    type="button"
                    disabled={!isIdle}
                    onClick={() => {
                      if (!isIdle) return;
                      setAcceptedAdded((prev) => {
                        const next = new Set(prev);
                        if (next.has(v)) next.delete(v);
                        else next.add(v);
                        return next;
                      });
                    }}
                    className={`px-2 py-1 rounded-md border font-sans text-xs transition-colors text-left ${
                      accepted ? 'bg-success-bg border-success/20 text-success' : 'bg-bg-card border-border text-fg-muted line-through opacity-60'
                    } ${isIdle ? 'hover:opacity-80 cursor-pointer' : 'cursor-default'}`}
                    title={accepted ? 'Will be added — click to skip' : 'Skipped — click to add'}
                  >
                    {v} {accepted ? '' : ' (skipped)'}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Preview of final value if applied */}
        {isIdle && (
          <div className="flex flex-col gap-1 pt-1 border-t border-border/60">
            <span className="font-sans text-[10px] tracking-widest text-fg-subtle uppercase">Final if applied</span>
            <div className="flex flex-wrap gap-1.5">
              {finalPreview.length === 0 ? (
                <span className="font-sans text-xs text-fg-muted">— empty —</span>
              ) : (
                finalPreview.map((v) => (
                  <span key={`f-${v}`} className="px-2 py-1 rounded-md bg-bg-card border border-border font-sans text-xs text-fg">
                    {v}
                  </span>
                ))
              )}
            </div>
          </div>
        )}

        {isIdle && (
          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={() => {
                const final = [...unchanged, ...Array.from(keptRemoved), ...Array.from(acceptedAdded)];
                onApply(field, final);
              }}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-primary text-white border border-primary hover:bg-primary-dark active:scale-[0.97] font-sans font-semibold text-xs transition-colors"
            >
              <FiCheck className="w-3 h-3" /> Apply this field
            </button>
            <button
              type="button"
              onClick={() => onDecline(field)}
              className="inline-flex items-center px-3 py-1.5 rounded-full bg-bg-card border border-border text-fg-body hover:bg-bg-muted font-sans font-semibold text-xs transition-colors"
            >
              Decline
            </button>
          </div>
        )}
      </div>
    );
  }

  // Scalar
  const oldStr = oldVal == null || oldVal === '' ? '—' : String(oldVal);
  const newStr = newVal == null || newVal === '' ? '—' : String(newVal);
  if (oldStr === newStr) {
    return (
      <div className="flex flex-col gap-2 p-2.5 bg-bg-page border border-border rounded-lg">
        <span className="font-sans font-semibold text-xs text-fg">{formatFieldLabel(field)}</span>
        <span className="font-sans text-xs text-fg-body">{newStr}</span>
        {status !== 'idle' && (
          <span className={`inline-flex self-start px-2 py-1 rounded-full text-xs font-semibold ${status === 'applied' ? 'bg-success-bg text-success' : 'bg-bg-muted text-fg-muted'}`}>
            {status === 'applied' ? 'Applied' : 'Declined'}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 p-2.5 bg-bg-page border border-border rounded-lg">
      <div className="flex items-center justify-between gap-2">
        <span className="font-sans font-semibold text-xs text-fg">{formatFieldLabel(field)}</span>
        {status !== 'idle' && (
          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${status === 'applied' ? 'bg-success-bg text-success border border-success/20' : 'bg-bg-muted text-fg-muted border border-border'}`}>
            {status === 'applied' ? 'Applied' : 'Declined'}
          </span>
        )}
      </div>
      <span className="font-sans text-xs px-2 py-1 rounded bg-danger-bg border border-danger/20 text-danger line-through break-words">
        {oldStr}
      </span>
      <span className="font-sans text-xs px-2 py-1 rounded bg-success-bg border border-success/20 text-success break-words">
        {newStr}
      </span>
      {isIdle && (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => onApply(field, newVal)}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-primary text-white border border-primary hover:bg-primary-dark active:scale-[0.97] font-sans font-semibold text-xs transition-colors"
          >
            <FiCheck className="w-3 h-3" /> Apply
          </button>
          <button
            type="button"
            onClick={() => onDecline(field)}
            className="inline-flex items-center px-3 py-1.5 rounded-full bg-bg-card border border-border text-fg-body hover:bg-bg-muted font-sans font-semibold text-xs transition-colors"
          >
            Decline
          </button>
        </div>
      )}
    </div>
  );
};

export const IcpChatAssistant: React.FC<IcpChatAssistantProps> = ({ currentIcp, onApply, chatFn, title = 'ICB Assistant' }) => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages, sending]);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || sending) return;
    const userMsg: ChatMessage = { id: `u-${Date.now()}`, role: 'user', content: trimmed };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setSending(true);
    const snapshot = { ...currentIcp };
    try {
      const res = await chatFn({ message: trimmed, current_icp: snapshot });
      const assistantMsg: ChatMessage = {
        id: `a-${Date.now()}`,
        role: 'assistant',
        content: res.reply,
        changed_fields: res.changed_fields ?? [],
        proposed_icp: res.proposed_icp ?? {},
        snapshot,
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleApplyField = (msgId: string, field: string, value: unknown) => {
    onApply({ [field]: value });
    setMessages((prev) =>
      prev.map((m) => {
        if (m.id !== msgId || m.role !== 'assistant') return m;
        const applied = new Set((m as Extract<ChatMessage, { role: 'assistant' }>).appliedFields ?? []);
        applied.add(field);
        return { ...m, appliedFields: Array.from(applied) };
      }),
    );
    toast.success(`${formatFieldLabel(field)} applied — click Save to persist`);
  };

  const handleDeclineField = (msgId: string, field: string) => {
    setMessages((prev) =>
      prev.map((m) => {
        if (m.id !== msgId || m.role !== 'assistant') return m;
        const declined = new Set((m as Extract<ChatMessage, { role: 'assistant' }>).declinedFields ?? []);
        declined.add(field);
        return { ...m, declinedFields: Array.from(declined) };
      }),
    );
  };

  return (
    <>
      {/* Floating chat icon — bottom right */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? 'Close ICB Assistant' : 'Open ICB Assistant'}
        className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-primary text-white shadow-[0_8px_24px_rgba(127,34,254,0.35)] flex items-center justify-center hover:bg-primary-dark active:scale-[0.97] transition-[transform,background-color] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)]"
      >
        {open ? <FiX className="w-6 h-6" /> : <FiMessageCircle className="w-6 h-6" />}
      </button>

      {open && (
        <div className="fixed bottom-24 right-6 z-40 w-[min(420px,calc(100vw-32px))] h-[min(560px,calc(100vh-140px))] bg-bg-card border border-border rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.14)] flex flex-col overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 border-b border-border flex items-center justify-between bg-bg-sidebar">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                <FiMessageCircle className="w-4 h-4 text-primary" />
              </div>
              <div className="flex flex-col">
                <span className="font-sans font-semibold text-sm text-fg leading-none">{title} & Chat Interface</span>
                <span className="font-sans text-xs text-fg-muted">Per-session · no history saved</span>
              </div>
            </div>
            <button type="button" onClick={() => setOpen(false)} className="p-1.5 rounded-md hover:bg-bg-muted text-fg-body hover:text-fg transition-colors">
              <FiX className="w-4 h-4" />
            </button>
          </div>

          {/* Messages */}
          <div ref={listRef} className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 bg-bg-page">
            {messages.length === 0 && (
              <div className="flex flex-col gap-2 p-3 bg-bg-card border border-dashed border-border rounded-xl">
                <span className="font-sans font-semibold text-xs text-fg">Try asking:</span>
                <span className="font-sans text-xs text-fg-body">“I want to target customer support managers in Egypt”</span>
                <span className="font-sans text-xs text-fg-muted">I’ll suggest field changes with a diff preview — Apply per field, Save persists.</span>
              </div>
            )}
            {messages.map((m) =>
              m.role === 'user' ? (
                <div key={m.id} className="self-end max-w-[85%] px-3 py-2 rounded-2xl rounded-br-md bg-primary text-white font-sans text-sm leading-5 break-words">
                  {m.content}
                </div>
              ) : (
                <div key={m.id} className="self-start max-w-[92%] flex flex-col gap-2">
                  <div className="px-3 py-2 rounded-2xl rounded-bl-md bg-bg-card border border-border font-sans text-sm leading-5 text-fg break-words shadow-sm">
                    {m.content}
                  </div>
                  <div className="flex flex-col gap-2">
                    {m.changed_fields.map((field) => {
                      const status: 'idle' | 'applied' | 'declined' = m.appliedFields?.includes(field)
                        ? 'applied'
                        : m.declinedFields?.includes(field)
                          ? 'declined'
                          : 'idle';
                      return (
                        <FieldDiffRow
                          key={`${m.id}-${field}`}
                          field={field}
                          snapshot={m.snapshot}
                          proposed={m.proposed_icp}
                          status={status}
                          onApply={handleApplyField.bind(null, m.id)}
                          onDecline={handleDeclineField.bind(null, m.id)}
                        />
                      );
                    })}
                    {m.changed_fields.length === 0 && (
                      <span className="font-sans text-xs text-fg-muted px-1">No fields changed</span>
                    )}
                  </div>
                </div>
              ),
            )}
            {sending && (
              <div className="self-start px-3 py-2 rounded-2xl bg-bg-card border border-border font-sans text-sm text-fg-muted">Thinking…</div>
            )}
          </div>

          {/* Input */}
          <div className="p-3 border-t border-border bg-bg-card flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="I want to target customer support managers in Egypt"
              disabled={sending}
              className="flex-1 h-10 px-3 bg-bg-input border border-border rounded-full font-sans text-sm text-fg placeholder:text-fg-muted outline-none focus:border-border-focus focus:shadow-[0_0_0_3px_rgba(127,34,254,0.12)] disabled:opacity-60"
            />
            <button
              type="button"
              onClick={handleSend}
              disabled={sending || !input.trim()}
              className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.97] transition-all shrink-0"
              aria-label="Send"
            >
              <FiSend className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};
