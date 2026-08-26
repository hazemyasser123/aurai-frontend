// Shared status/classification → badge styling for conversations
export interface BadgeStyle {
  label: string;
  className: string;
}

export function getStatusBadge(status?: string): BadgeStyle | null {
  const s = (status || '').toLowerCase();
  if (s.includes('flag')) return { label: 'Flagged', className: 'bg-[#FEF9C2] text-[#D08700]' };
  if (s.includes('complet') || s.includes('sent') || s.includes('done')) return { label: 'Completed', className: 'bg-[#DCFCE7] text-[#00A63E]' };
  if (s.includes('draft')) return { label: 'Draft', className: 'bg-[#FEF9C2] text-[#D08700]' };
  if (s.includes('action') || s.includes('need')) return { label: 'Need an action', className: 'bg-[#FFE2E2] text-[#E7000B]' };
  return null;
}

export function getClassificationBadge(classification?: string): BadgeStyle | null {
  const c = (classification || '').toLowerCase().replace(/[_-]/g, ' ');
  if (!c) return null;
  if (c.includes('meeting') || c.includes('interested'))
    return { label: 'Meeting Requested', className: 'bg-[#DBEAFE] text-[#155DFC]' };
  if (c.includes('follow'))
    return { label: 'Needs Follow-up', className: 'bg-[#FEF3C6] text-[#D08700]' };
  if (c.includes('conversation'))
    return { label: 'In Conversation', className: 'bg-[#DBEAFE] text-[#155DFC]' };
  if (c.includes('not interested'))
    return { label: 'Not Interested', className: 'bg-[#FFE2E2] text-[#E7000B]' };
  if (c.includes('office'))
    return { label: 'Out of Office', className: 'bg-bg-muted text-fg-body' };
  // Fallback: prettify raw value
  const label = c.replace(/\b\w/g, (ch) => ch.toUpperCase());
  return { label, className: 'bg-[#DBEAFE] text-[#155DFC]' };
}
