import React from 'react';
import { CgDanger } from "react-icons/cg";
import { MdOutlineRestartAlt } from "react-icons/md";

interface AccountStatusBadgeProps {
    status: string;
}

export const AccountStatusBadge: React.FC<AccountStatusBadgeProps> = ({ status }) => {
    const lowerStatus = status.toLowerCase();
    let bgClass = 'bg-bg-muted text-fg-medium';
    let label = status.charAt(0) + status.slice(1).toLowerCase();

    switch (lowerStatus) {
        case 'best':
            bgClass = 'bg-info-bg text-info';
            label = 'Best Fit';
            break;
        case 'good':
            bgClass = 'bg-success-bg text-success';
            label = 'Good Fit';
            break;
        case 'researching':
            bgClass = 'bg-warning-bg text-warning';
            break;
        case 'error':
            bgClass = 'bg-danger-bg text-danger';
            break;
        case 'poor':
            bgClass = 'bg-orange-bg text-orange';
            label = 'Poor Fit';
            break;
    }

    // Show ONLY the icon (bigger) for Error and Researching
    if (lowerStatus === 'error' || lowerStatus === 'researching') {
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