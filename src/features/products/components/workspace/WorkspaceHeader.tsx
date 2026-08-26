import React from 'react';
import { Button } from '@/shared/components/ui';

interface Props {
  productName: string;
  description?: string;
  onExit: () => void;
  onSave: () => void;
  isSaving?: boolean;
}

export const WorkspaceHeader: React.FC<Props> = ({ productName, description, onExit, onSave, isSaving }) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full">
      <div className="flex flex-col gap-1 sm:gap-2 flex-1 min-w-0">
        <span className="font-sans font-medium text-sm text-fg-body">Workspace / Product</span>
        <div className="flex flex-col gap-1">
          <h2 className="font-sans font-bold text-xl sm:text-2xl tracking-tight text-fg truncate">{productName || 'Aurai Sales'}</h2>
          <p className="font-sans font-medium text-sm text-fg-body line-clamp-2">{description || 'An AI tool would help you to find the match you are looking for'}</p>
        </div>
      </div>
      <div className="flex flex-row items-center gap-3 sm:gap-4 w-full sm:w-auto shrink-0">
        <Button variant="outline" className="flex-1 sm:flex-none h-11 min-w-[120px] px-6" onClick={onExit}>
          Exit
        </Button>
        <Button variant="primary" className="flex-1 sm:flex-none h-11 min-w-[120px] px-6" onClick={onSave} isLoading={isSaving}>
          Save & Close
        </Button>
      </div>
    </div>
  );
};
