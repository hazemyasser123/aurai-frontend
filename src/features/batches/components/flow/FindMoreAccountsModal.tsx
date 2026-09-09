import React, { useState } from 'react';
import { Button, InputField, Modal } from '@/shared/components/ui';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (count: number) => void;
    isLoading?: boolean;
}

/** Modal asking how many accounts the user wants to find */
export const FindMoreAccountsModal: React.FC<Props> = ({ isOpen, onClose, onConfirm, isLoading = false }) => {
    const [count, setCount] = useState('10');

    const handleClose = () => {
        onClose();
        setCount('10');
    };

    const handleConfirm = () => {
        const parsed = Number(count);
        if (!Number.isFinite(parsed) || parsed < 1) {
            return;
        }
        onConfirm(parsed);
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title="Find More Accounts"
        >
            <div className="flex flex-col gap-4">
                <p className="font-sans font-normal text-sm text-fg-body leading-relaxed">
                    How many more accounts do you want to find for this batch?
                </p>
                <InputField
                    label="NUMBER OF ACCOUNTS"
                    type="number"
                    min={1}
                    placeholder="e.g., 10"
                    value={count}
                    onChange={(e) => setCount(e.target.value)}
                />
                <div className="flex justify-end gap-3 mt-2">
                    <Button variant="outline" onClick={handleClose}>
                        Cancel
                    </Button>
                    <Button
                        variant="primary"
                        isLoading={isLoading}
                        disabled={isLoading}
                        onClick={handleConfirm}
                    >
                        Find Accounts
                    </Button>
                </div>
            </div>
        </Modal>
    );
};
