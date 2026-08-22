import React from 'react';
import { Button } from '@/shared/components/ui';
import { FiMail } from 'react-icons/fi';
import { FaLinkedinIn } from 'react-icons/fa';
import type { Contact } from '@/features/batches/types/batchTypes';
import toast from 'react-hot-toast';
import { useToggleContactRecommend } from '@/features/batches/hooks/useToggleContactRecommend';

interface ContactCardProps {
    contact: Contact;
    accountId?: string;
    batchId?: string;
    onViewDetails: (contact: Contact) => void;
}

export const ContactCard: React.FC<ContactCardProps> = ({ contact, accountId, batchId, onViewDetails }) => {
    const toggleRecommend = useToggleContactRecommend(accountId || '', batchId);

    const handleCopyEmail = () => {
        if (contact.primary_email) {
            navigator.clipboard.writeText(contact.primary_email);
            toast.success("Email copied to clipboard!");
        } else {
            toast.error("No email available for this contact.");
        }
    };

    const handleSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        toggleRecommend.mutate({ contactId: contact.id, isRecommended: e.target.checked });
    };

    return (
        <div className="flex items-center justify-between gap-4 py-4 border-b border-border last:border-b-0">
            <div className="flex items-center gap-4 flex-1 min-w-0">
                <input
                    type="checkbox"
                    className="w-4 h-4 accent-primary cursor-pointer"
                    checked={contact.is_recommended}
                    onChange={handleSelect}
                    disabled={toggleRecommend.isPending}
                />

                {contact.photo_url ? (
                    <img src={contact.photo_url} alt={contact.first_name} className="w-10 h-10 rounded-full bg-bg-purple-50" />
                ) : (
                    <div className="w-10 h-10 rounded-full bg-bg-purple-50 flex items-center justify-center font-semibold text-primary text-sm">
                        {contact.first_name.charAt(0)}
                    </div>
                )}
                <div className="flex flex-col gap-0.5 min-w-0">
                    <p className="font-sans font-medium text-sm text-fg truncate">{contact.first_name} {contact.last_name}</p>
                    <p className="font-sans text-xs text-fg-body truncate">{contact.title}</p>
                </div>
            </div>

            <div className="flex items-center gap-3">
                <button
                    className="w-9 h-9 flex items-center justify-center bg-orange-bg text-orange rounded-md hover:opacity-80 transition-opacity cursor-pointer"
                    onClick={handleCopyEmail}
                    title="Copy Email"
                >
                    <FiMail className="w-4 h-4" />
                </button>

                {contact.linkedin_url && (
                    <a
                        href={contact.linkedin_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-9 h-9 flex items-center justify-center bg-info-bg text-info rounded-md hover:opacity-80 transition-opacity"
                        title="Open LinkedIn Profile"
                    >
                        <FaLinkedinIn className="w-4 h-4" />
                    </a>
                )}

                {/* Updated View Details Button */}
                <Button
                    variant="outline"
                    className="py-1 px-2 h-8 text-xs"
                    onClick={() => onViewDetails(contact)}
                >
                    View Details
                </Button>
            </div>
        </div>
    );
};