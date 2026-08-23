import React, { useState, useEffect } from 'react';
import { Modal, InputField, Button } from '@/shared/components/ui';
import { z } from 'zod';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  defaultName?: string;
  onConfirm: (newName: string) => Promise<void> | void;
  isLoading?: boolean;
}

const schema = z.object({
  batch_name: z.string().trim().min(3, 'Batch name must be at least 3 characters').max(100, 'Too long'),
});

export const CloneBatchModal: React.FC<Props> = ({ isOpen, onClose, defaultName = '', onConfirm, isLoading }) => {
  const [name, setName] = useState(defaultName);
  const [error, setError] = useState<string | undefined>();

  useEffect(() => {
    if (isOpen) {
      setName(defaultName ? `${defaultName} (Copy)` : '');
      setError(undefined);
    }
  }, [isOpen, defaultName]);

  const handleSubmit = async () => {
    const parsed = schema.safeParse({ batch_name: name });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message);
      return;
    }
    setError(undefined);
    await onConfirm(parsed.data.batch_name);
  };

  const handleClose = () => {
    if (!isLoading) onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Clone Batch">
      <div className="flex flex-col gap-4">
        <p className="font-sans text-sm text-fg-body">
          Create a copy of this batch with all the same settings. Only the batch name will change.
        </p>
        <InputField
          label="NEW BATCH NAME *"
          placeholder="e.g. My Batch Copy"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (error) setError(undefined);
          }}
          error={error}
          hint="Min 3 characters"
          autoFocus
          disabled={isLoading}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSubmit();
          }}
        />
        <div className="flex justify-end gap-3 mt-2">
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit} isLoading={isLoading} disabled={isLoading}>
            Clone
          </Button>
        </div>
      </div>
    </Modal>
  );
};
