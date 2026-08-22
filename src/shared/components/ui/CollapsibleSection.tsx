import React, { useState } from 'react';
import { FiChevronDown } from 'react-icons/fi';

interface CollapsibleSectionProps {
    title: string;
    children: React.ReactNode;
}

export const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({ title, children }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="bg-bg-sidebar border border-border rounded-xl shadow-sm">
            <button
                className="flex items-center justify-between w-full p-6"
                onClick={() => setIsOpen(!isOpen)}
            >
                <h3 className="font-sans font-semibold text-lg tracking-tight text-fg">{title}</h3>
                <FiChevronDown className={`w-5 h-5 text-fg-body transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && (
                <div className="px-6 pb-6 border-t border-border pt-4">
                    {children}
                </div>
            )}
        </div>
    );
};