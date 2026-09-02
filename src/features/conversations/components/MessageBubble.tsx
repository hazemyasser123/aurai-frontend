import React from 'react';
import type { OutreachMessage } from '@/features/batches/types/batchTypes';

interface Props {
  message: OutreachMessage;
  prospectName: string;
}

export const MessageBubble: React.FC<Props> = ({ message, prospectName }) => {
  const isAgent = (message.direction || '').toLowerCase().includes('out');
  const htmlBodyRaw = (message.body_html as string) || (message.bodyHtml as string) || '';
  const textBody = message.display_text || message.body_text || message.body || '';
  // For mail-like formatting: outbound keeps full HTML signature (icons in one row), inbound strips quoted history (<hr> / divRplyFwdMsg) but keeps formatted signature
  let rawHtml: string;
  let isHtml: boolean;
  if (isAgent) {
    rawHtml = htmlBodyRaw && htmlBodyRaw.includes('<') ? htmlBodyRaw : textBody;
    isHtml = rawHtml.includes('<');
  } else {
    // Inbound: prefer truncated HTML to keep signature table/icons, fallback to plain display_text
    let inboundHtml = htmlBodyRaw;
    if (inboundHtml && inboundHtml.includes('<hr')) inboundHtml = inboundHtml.split('<hr')[0];
    if (inboundHtml && inboundHtml.includes('divRplyFwdMsg')) inboundHtml = inboundHtml.split('<div id="divRplyFwdMsg"')[0];
    if (inboundHtml && inboundHtml.trim().includes('<')) {
      rawHtml = inboundHtml;
      isHtml = true;
    } else {
      rawHtml = textBody;
      isHtml = false;
    }
  }
  const timeRaw = message.occurred_at || message.created_at || message.occurredAt;
  const time = timeRaw
    ? new Date(timeRaw).toLocaleString('en-US', { month: 'numeric', day: 'numeric', year: '2-digit', hour: 'numeric', minute: '2-digit' })
    : '';
  const from = message.from_address || (isAgent ? 'LDC-Sales@sales.linkdatacenter.net' : prospectName);
  const to = (message.to_addresses && message.to_addresses.join(', ')) || (isAgent ? prospectName : 'LDC-Sales@sales.linkdatacenter.net');

  return (
    <div className={`flex flex-col gap-1.5 ${isAgent ? 'items-end' : 'items-start'}`}>
      {/* Mail card — clear start/end per message */}
      <div
        className={`flex flex-col rounded-xl overflow-hidden border shadow-sm max-w-[640px] w-full ${isAgent ? 'bg-white border-primary/15' : 'bg-white border-border'}`}
      >
        {/* Mail header — From / To / Date */}
        <div className={`px-4 py-3 flex flex-col gap-1 border-b ${isAgent ? 'bg-[#F5F0FF] border-primary/10' : 'bg-[#F8FAFC] border-border'}`}>
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${isAgent ? 'bg-primary text-white' : 'bg-slate-200 text-slate-700'}`}>
                {(isAgent ? 'L' : prospectName?.charAt(0) || '?').toUpperCase()}
              </div>
              <div className="flex flex-col min-w-0">
                <span className={`font-sans font-semibold text-sm leading-4 truncate ${isAgent ? 'text-primary' : 'text-fg-strong'}`}>
                  {isAgent ? 'Laila Ahmed' : prospectName}
                </span>
                <span className="font-sans text-xs text-fg-muted truncate">{from}</span>
              </div>
            </div>
            <span className="font-sans text-xs text-fg-muted whitespace-nowrap shrink-0">{time}</span>
          </div>
          <div className="flex flex-wrap gap-x-3 gap-y-1 font-sans text-xs text-fg-body">
            <span className="truncate">
              <span className="font-semibold text-fg-muted">To:</span> {to}
            </span>
            {message.cc_addresses && message.cc_addresses.length > 0 && (
              <span className="truncate">
                <span className="font-semibold text-fg-muted">Cc:</span> {message.cc_addresses.join(', ')}
              </span>
            )}
          </div>
        </div>

        {/* Mail body — HTML with p as new line, icons in one row */}
        <div className="p-4 bg-white">
          {isHtml ? (
            <div
              className="font-sans font-normal text-sm leading-6 tracking-tight text-fg break-words prose prose-sm max-w-none prose-p:my-3 prose-p:block [&_p]:my-3 [&_p]:block [&_a]:text-primary [&_a]:underline [&_img]:inline-block [&_table]:w-full [&_table]:border-collapse"
              dangerouslySetInnerHTML={{ __html: rawHtml }}
            />
          ) : (
            <div className="font-sans font-normal text-sm leading-6 tracking-tight text-fg whitespace-pre-wrap break-words">
              {rawHtml}
            </div>
          )}
        </div>

        {/* Mail footer — direction badge */}
        <div className="px-4 py-2 bg-slate-50/60 border-t border-border/50 flex items-center justify-between">
          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${isAgent ? 'bg-primary/10 text-primary border border-primary/15' : 'bg-slate-100 text-slate-700 border border-slate-200'}`}>
            {isAgent ? 'Outbound' : 'Inbound'} • {from}
          </span>
          <span className="font-sans text-xs text-fg-muted">{time}</span>
        </div>
      </div>
    </div>
  );
};
