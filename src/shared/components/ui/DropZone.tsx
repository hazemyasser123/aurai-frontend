import React, { useState, useRef, useCallback } from 'react';
import { FiUploadCloud } from 'react-icons/fi';

interface DropZoneProps {
  onFiles: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  maxSizeMb?: number;
  isLoading?: boolean;
  title?: string;
  subtitle?: string;
  hint?: string;
  error?: string;
}

export const DropZone: React.FC<DropZoneProps> = ({
  onFiles,
  accept,
  multiple = false,
  maxSizeMb,
  isLoading,
  title = 'Drop files here or click to browse',
  subtitle = 'Supports PDF, DOCX, TXT, CSV',
  hint,
  error,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const validateAndEmit = useCallback(
    (files: File[]) => {
      if (maxSizeMb) {
        const oversized = files.find((f) => f.size > maxSizeMb * 1024 * 1024);
        if (oversized) {
          // let parent handle via onFiles or show error; for generic we just pass through
        }
      }
      onFiles(files);
    },
    [onFiles, maxSizeMb],
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length) validateAndEmit(multiple ? files : [files[0]]);
  };
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    if (files.length) validateAndEmit(multiple ? files : [files[0]]);
    // reset input to allow same file re-select
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className="flex flex-col gap-2 w-full">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !isLoading && inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        aria-disabled={isLoading}
        className={`flex flex-col items-center justify-center gap-3 sm:gap-4 p-6 sm:p-8 w-full min-h-[168px] border-2 border-dashed rounded-xl cursor-pointer transition-colors duration-150 ease-out
          ${isDragOver ? 'border-primary bg-bg-purple-50' : error ? 'border-danger bg-danger-bg/30' : 'border-border bg-transparent hover:border-primary/50 hover:bg-bg-page'}
          ${isLoading ? 'opacity-60 pointer-events-none' : ''}`}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleInputChange}
          className="hidden"
          disabled={isLoading}
        />
        <div className="w-10 h-10 rounded-lg bg-bg-muted flex items-center justify-center shrink-0">
          <FiUploadCloud className={`w-6 h-6 ${isDragOver ? 'text-primary' : 'text-primary'}`} />
        </div>
        <div className="flex flex-col items-center gap-1 text-center">
          <span className="font-sans font-medium text-sm text-fg">{title}</span>
          <span className="font-sans font-normal text-xs text-fg-body">{subtitle}</span>
          {hint && <span className="font-sans font-normal text-xs text-fg-muted">{hint}</span>}
        </div>
        {error && <span className="font-sans font-medium text-xs text-danger">{error}</span>}
        {isLoading && <span className="font-sans text-xs text-fg-body animate-pulse">Uploading...</span>}
      </div>
    </div>
  );
};
