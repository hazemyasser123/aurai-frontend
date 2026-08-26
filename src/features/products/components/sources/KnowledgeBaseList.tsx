import React from 'react';
import { FiFileText, FiTrash2 } from 'react-icons/fi';
import type { ProductSource } from '@/features/products/types/productTypes';

interface Props {
  sources: ProductSource[];
  onDelete: (id: string) => void;
  isDeletingId?: string | null;
}

export const KnowledgeBaseList: React.FC<Props> = ({ sources, onDelete, isDeletingId }) => {
  return (
    <div className="flex flex-col gap-2 w-full">
      <h4 className="font-sans font-medium text-sm text-fg">Attached Knowledge Base ({sources.length})</h4>
      {sources.length === 0 ? (
        <div className="flex items-center justify-center h-14 bg-bg-input border border-border rounded-lg px-4">
          <span className="font-sans font-normal text-xs text-fg-body text-center">
            Your knowledge base is empty. Please upload a file or paste a text source to build the intelligence engine.
          </span>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {sources.map((s) => {
            const isText = s.source_type?.toLowerCase() === 'text' || !!s.content;
            const title = isText ? 'Pasted Textual Content' : s.file_name || 'Document';
            const subtitle = isText ? 'TEXT' : (s.mime_type || 'FILE').toUpperCase();
            return (
              <div key={s.id} className="flex items-center justify-between gap-3 p-4 bg-bg-input border border-border rounded-lg h-14">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-8 h-8 rounded bg-bg-purple-50 flex items-center justify-center shrink-0">
                    <FiFileText className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="font-sans font-medium text-sm text-fg truncate">{title}</span>
                    <span className="font-sans font-normal text-xs text-fg-body">{subtitle}</span>
                  </div>
                </div>
                <button
                  onClick={() => onDelete(s.id)}
                  disabled={isDeletingId === s.id}
                  className="p-2 rounded-md text-fg-body hover:text-danger hover:bg-danger-bg transition-colors disabled:opacity-50"
                  aria-label="Delete source"
                >
                  <FiTrash2 className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
