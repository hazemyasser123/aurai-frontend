import React from 'react';

export type WorkspaceTabKey = 'intelligence' | 'icp';

interface Props {
  active: WorkspaceTabKey;
  onChange: (k: WorkspaceTabKey) => void;
}

export const WorkspaceTabs: React.FC<Props> = ({ active, onChange }) => {
  const tabs: Array<{ key: WorkspaceTabKey; label: string }> = [
    { key: 'intelligence', label: 'Product Intelligence' },
    { key: 'icp', label: 'Ideal Customer Profile (ICP)' },
  ];
  return (
    <div className="w-full border-b border-border flex items-center gap-1 sm:gap-2 overflow-x-auto">
      {tabs.map((t) => (
        <button
          key={t.key}
          onClick={() => onChange(t.key)}
          className={`px-4 sm:px-6 py-4 text-sm font-semibold tracking-tight whitespace-nowrap relative transition-colors ${
            active === t.key ? 'text-primary' : 'text-fg-body hover:text-fg'
          }`}
        >
          {t.label}
          {active === t.key && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
        </button>
      ))}
    </div>
  );
};
