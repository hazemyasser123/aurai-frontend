import React from 'react';
import { DropZone } from '@/shared/components/ui';

interface Props {
  onFiles: (files: File[]) => void;
  isLoading?: boolean;
}

export const UploadSourceCard: React.FC<Props> = ({ onFiles, isLoading }) => {
  return (
    <div className="flex flex-col gap-3 w-full">
      <div className="flex flex-col gap-1">
        <h3 className="font-sans font-medium text-sm text-fg">Upload Documents</h3>
        <p className="font-sans font-normal text-xs text-fg-body leading-4">Drag and drop files or click to browse. Supports PDF, DOCX, TXT, CSV.</p>
      </div>
      <DropZone
        onFiles={onFiles}
        accept=".pdf,.doc,.docx,.txt,.csv"
        multiple={false}
        isLoading={isLoading}
        title="Drop files here or click to browse"
        subtitle="PDF, DOCX, TXT up to 10MB"
      />
    </div>
  );
};
