import React from 'react';

type BadgeVariant = 'flagged' | 'completed' | 'need_action';

interface Props {
  status?: string;
  classification?: string;
  needsHumanAction?: boolean;
  outreachStatus?: string;
}

const normalize = (props: Props): BadgeVariant => {
  const raw = (props.status || props.classification || props.outreachStatus || '').toLowerCase();
  const needs = props.needsHumanAction;
  // Figma has 3 states: Flagged (orange), Completed (green), Need an action (red)
  if (needs === true || raw.includes('need') || raw.includes('action')) return 'need_action';
  if (raw.includes('flag')) return 'flagged';
  if (raw.includes('complete') || raw.includes('sent') || raw.includes('done')) return 'completed';
  // default fallback based on boolean
  if (needs === false) return 'completed';
  return 'flagged';
};

export const OutreachBadge: React.FC<Props> = (props) => {
  const variant = normalize(props);
  const map: Record<BadgeVariant, { label: string; className: string }> = {
    flagged: {
      label: 'Flagged',
      className: 'bg-orange-bg text-orange',
    },
    completed: {
      label: 'Completed',
      className: 'bg-success-bg text-success',
    },
    need_action: {
      label: 'Need an action',
      className: 'bg-danger-bg text-danger',
    },
  };
  const cfg = map[variant];
  return (
    <span className={`inline-flex items-center justify-center px-3 py-1 rounded-full font-sans font-medium text-xs leading-4 tracking-tight whitespace-nowrap ${cfg.className}`}>
      {cfg.label}
    </span>
  );
};
