import React from 'react';
import { CgDanger } from "react-icons/cg";
import { MdOutlineRestartAlt } from "react-icons/md";

interface AccountStatusBadgeProps {
    status: string | null;
}

export const AccountStatusBadge: React.FC<AccountStatusBadgeProps> = ({ status }) => {
    // Handle null status (Before evaluation)
    if (!status || status === '') {
        return (
            <div className="px-3 py-1 rounded-full text-xs font-medium bg-bg-muted text-fg-medium whitespace-nowrap">
                Pending
            </div>
        );
    }

    const lowerStatus = status.toLowerCase();
    let bgClass = 'bg-bg-muted text-fg-medium';
    let label = status;

    switch (lowerStatus) {
        case 'best fit':
            bgClass = 'bg-info-bg text-info';
            label = 'Best Fit';
            break;
        case 'likely match':
            bgClass = 'bg-success-bg text-success';
            label = 'Likely Match';
            break;
        case 'processing':
            bgClass = 'bg-warning-bg text-warning';
            break;
        case 'error':
            bgClass = 'bg-danger-bg text-danger';
            break;
        case 'poor':
            bgClass = 'bg-orange-bg text-orange';
            label = 'Poor Fit';
            break;
        case 'ignored':
            bgClass = 'bg-bg-muted text-fg-muted';
            label = 'Ignored';
            break;
    }

    // Show ONLY the icon (bigger) for Processing and Error
    if (lowerStatus === 'error' || lowerStatus === 'processing') {
        return (
            <div className={`flex items-center justify-center p-1.5 rounded-full ${bgClass}`}>
                {lowerStatus === 'error' ? (
                    <CgDanger className="w-6 h-6" />
                ) : (
                    <MdOutlineRestartAlt className="w-6 h-6" />
                )}
            </div>
        );
    }

    // Show text for the rest
    return (
        <div className={`px-3 py-1 rounded-full text-xs font-medium ${bgClass} whitespace-nowrap`}>
            {label}
        </div>
    );
};