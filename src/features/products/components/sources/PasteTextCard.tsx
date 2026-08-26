import React, { useState } from 'react';
import { Textarea, Button } from '@/shared/components/ui';

interface Props {
  onAttach: (content: string) => Promise<void> | void;
  isLoading?: boolean;
}

export const PasteTextCard: React.FC<Props> = ({ onAttach, isLoading }) => {
  const [text, setText] = useState('');
  const canAttach = text.trim().length > 10;

  const handleAttach = async () => {
    if (!canAttach) return;
    await onAttach(text.trim());
    setText('');
  };

  return (
    <div className="flex flex-col gap-3 w-full">
      <div className="flex flex-col gap-1">
        <h3 className="font-sans font-medium text-sm text-fg">Paste Textual Description</h3>
        <p className="font-sans font-normal text-xs text-fg-body leading-4">Don't have documents? Copy and paste marketing text, features list, website copy, or pitch descriptions here.</p>
      </div>
      <Textarea
        placeholder="AI assistant that finds, enriches, qualifies, and engages leads to help sales teams generate and convert more opportunities."
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={5}
        className="min-h-[112px]"
      />
      <Button
        variant={canAttach ? 'primary' : 'inactive'}
        onClick={handleAttach}
        isLoading={isLoading}
        disabled={!canAttach || isLoading}
        className="w-full h-11"
      >
        Attach Text Source
      </Button>
    </div>
  );
};
