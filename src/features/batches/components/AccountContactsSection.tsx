import React, { useState } from 'react';
import { Button, Card, Modal, InputField } from '@/shared/components/ui';
import { FiSearch, FiPlus } from 'react-icons/fi';
import { ContactCard } from '@/features/batches/components/ContactCard';
import { FindContactsModal } from '@/features/batches/components/FindContactsModal';
import { useAddManualContact } from '@/features/batches/hooks/useAddManualContact';
import type { Account, Contact } from '@/features/batches/types/batchTypes';
import { addManualContactSchema } from '@/features/batches/schemas/batchSchemas';
import toast from 'react-hot-toast';
import { getErrorMessage } from '@/shared/utils/errorHandler';

interface AccountContactsSectionProps {
    account: Account;
    contacts: Contact[];
    batchId?: string;
    onViewDetails: (contact: Contact) => void;
}

export const AccountContactsSection: React.FC<AccountContactsSectionProps> = ({ account, contacts, batchId, onViewDetails }) => {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isFindModalOpen, setIsFindModalOpen] = useState(false);
    const [newContact, setNewContact] = useState({ first_name: '', last_name: '', title: '', email: '', phone: '', linkedin_url: '' });
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const addContact = useAddManualContact(account.id, batchId);

    const clearFieldError = (field: string) => {
        setFieldErrors(prev => {
            if (!prev[field]) return prev;
            const next = { ...prev };
            delete next[field];
            return next;
        });
    };

    const handleFieldChange = (field: keyof typeof newContact, value: string) => {
        let nextValue = value;
        if (field === 'phone') {
            // Allow only digits, +, -, (, ), space — strip any other character (letters, etc.)
            nextValue = value.replace(/[^0-9+\-() ]/g, '');
            // Keep '+' only at the very start
            if (nextValue.includes('+')) {
                const hasLeadingPlus = nextValue.startsWith('+');
                nextValue = nextValue.replace(/\+/g, '');
                if (hasLeadingPlus) nextValue = '+' + nextValue;
            }
            // Enforce max length 20 (schema limit)
            if (nextValue.length > 20) nextValue = nextValue.slice(0, 20);
        }
        setNewContact(prev => ({ ...prev, [field]: nextValue }));
        clearFieldError(field);
    };

    const handlePhoneKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        // Allow navigation / editing keys
        const allowedKeys = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Home', 'End', 'Tab'];
        if (allowedKeys.includes(e.key) || e.ctrlKey || e.metaKey) return;
        // Allow digits, +, -, (, ), space
        if (/^[0-9+\-() ]$/.test(e.key)) return;
        e.preventDefault();
    };

    const handlePhonePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        const pasted = e.clipboardData.getData('text');
        if (/[^0-9+\-() ]/.test(pasted)) {
            e.preventDefault();
            let sanitized = pasted.replace(/[^0-9+\-() ]/g, '').slice(0, 20);
            if (sanitized.includes('+')) {
                const hasLeadingPlus = sanitized.startsWith('+');
                sanitized = sanitized.replace(/\+/g, '');
                if (hasLeadingPlus) sanitized = '+' + sanitized;
            }
            const target = e.target as HTMLInputElement;
            const start = target.selectionStart ?? newContact.phone.length;
            const end = target.selectionEnd ?? newContact.phone.length;
            let next = (newContact.phone.slice(0, start) + sanitized + newContact.phone.slice(end)).slice(0, 20);
            if (next.includes('+')) {
                const hasLeadingPlus = next.startsWith('+');
                next = next.replace(/\+/g, '');
                if (hasLeadingPlus) next = '+' + next;
            }
            setNewContact(prev => ({ ...prev, phone: next }));
            clearFieldError('phone');
        }
    };

    const handleCloseAddModal = () => {
        setIsAddModalOpen(false);
        setNewContact({ first_name: '', last_name: '', title: '', email: '', phone: '', linkedin_url: '' });
        setFieldErrors({});
    };

    const handleAddContact = async () => {
        const parsed = addManualContactSchema.safeParse(newContact);
        if (!parsed.success) {
            const errors: Record<string, string> = {};
            parsed.error.issues.forEach(issue => {
                const key = String(issue.path[0]);
                if (!errors[key]) errors[key] = issue.message;
            });
            setFieldErrors(errors);
            return;
        }
        setFieldErrors({});
        try {
            await addContact.mutateAsync({ batch_id: batchId || '', ...parsed.data });
            toast.success("Contact added successfully!");
            handleCloseAddModal();
        } catch (error: unknown) {
            // Map FastAPI 422 field errors to inline fieldErrors when possible
            const axiosErr = error as { isAxiosError?: boolean; response?: { data?: { detail?: unknown } } };
            const detail = axiosErr?.response?.data?.detail;
            if (Array.isArray(detail)) {
                const mapped: Record<string, string> = {};
                (detail as Array<{ loc?: unknown[]; msg?: string }>).forEach(item => {
                    const loc = Array.isArray(item.loc) ? item.loc.map(String) : [];
                    // loc is like ["body","email"] or ["body","linkedin_url"]
                    const field = loc[loc.length - 1];
                    if (field && typeof item.msg === 'string') {
                        // API uses linkedin_url, email, phone, first_name etc.
                        if (!mapped[field]) mapped[field] = item.msg;
                    }
                });
                if (Object.keys(mapped).length > 0) {
                    setFieldErrors(mapped);
                    return;
                }
            }
            toast.error(getErrorMessage(error));
        }
    };

    const recommended = contacts.filter(c => c.is_recommended);
    const others = contacts.filter(c => !c.is_recommended);

    return (
        <Card variant="elevated" className="flex flex-col gap-6 mb-6">
            {/* Account Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    {account.logo_url ? (
                        <img src={account.logo_url} alt={account.name ?? 'Account'} className="w-14 h-14 rounded-xl object-cover bg-bg-purple-50" />
                    ) : (
                        <div className="w-14 h-14 rounded-xl bg-bg-purple-50 flex items-center justify-center text-2xl font-bold text-primary">
                            {(account.name?.charAt(0) ?? '?').toUpperCase()}
                        </div>
                    )}
                    <div>
                        <h3 className="font-sans font-semibold text-lg text-fg">{account.name ?? 'Unnamed Account'}</h3>
                        <p className="font-sans font-medium text-sm text-fg-body">{account.domain ?? '—'} · {contacts.length} contact(s)</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="py-2 px-3 h-10" onClick={() => setIsFindModalOpen(true)}>
                        <FiSearch className="w-4 h-4" />
                        Find Contacts
                    </Button>
                    <Button variant="primary" className="py-2 px-3 h-10" onClick={() => setIsAddModalOpen(true)}>
                        <FiPlus className="w-4 h-4" />
                        Add Contact
                    </Button>
                </div>
            </div>

            {/* Selected Contacts */}
            {recommended.length > 0 && (
                <div className="flex flex-col gap-2">
                    <h4 className="font-sans font-semibold text-sm text-primary">Selected Contact(s)</h4>
                    <div className="bg-bg-page p-4 rounded-lg flex flex-col">
                        {recommended.map(contact => <ContactCard key={contact.id} contact={contact} accountId={account.id} batchId={batchId} onViewDetails={onViewDetails} />)}
                    </div>
                </div>
            )}

            {/* All Contacts */}
            <div className="flex flex-col gap-2">
                <h4 className="font-sans font-semibold text-sm text-primary">All Contacts ({others.length})</h4>
                <div className="bg-bg-page p-4 rounded-lg flex flex-col">
                    {others.length > 0 ? (
                        others.map(contact => <ContactCard key={contact.id} contact={contact} accountId={account.id} batchId={batchId} onViewDetails={onViewDetails} />)
                    ) : (
                        <p className="text-sm text-fg-body text-center py-4">No other contacts found.</p>
                    )}
                </div>
            </div>

            {/* Add Contact Modal */}
            <Modal isOpen={isAddModalOpen} onClose={handleCloseAddModal} title="Add Manual Contact">
                <div className="flex flex-col gap-4">
                    <div className="grid grid-cols-2 gap-4">
                        <InputField
                            label="FIRST NAME *"
                            value={newContact.first_name}
                            onChange={(e) => handleFieldChange('first_name', e.target.value)}
                            error={fieldErrors.first_name}
                        />
                        <InputField
                            label="LAST NAME *"
                            value={newContact.last_name}
                            onChange={(e) => handleFieldChange('last_name', e.target.value)}
                            error={fieldErrors.last_name}
                        />
                    </div>
                    <InputField
                        label="TITLE"
                        value={newContact.title}
                        onChange={(e) => handleFieldChange('title', e.target.value)}
                        error={fieldErrors.title}
                    />
                    <InputField
                        label="EMAIL"
                        type="email"
                        placeholder="name@company.com"
                        value={newContact.email}
                        onChange={(e) => handleFieldChange('email', e.target.value)}
                        error={fieldErrors.email}
                    />
                    <InputField
                        label="PHONE"
                        type="tel"
                        inputMode="tel"
                        placeholder="+1 234 567 890"
                        value={newContact.phone}
                        onChange={(e) => handleFieldChange('phone', e.target.value)}
                        onKeyDown={handlePhoneKeyDown}
                        onPaste={handlePhonePaste}
                        error={fieldErrors.phone}
                    />
                    <InputField
                        label="LINKEDIN URL"
                        placeholder="https://linkedin.com/in/username"
                        value={newContact.linkedin_url}
                        onChange={(e) => handleFieldChange('linkedin_url', e.target.value)}
                        error={fieldErrors.linkedin_url}
                    />
                    <div className="flex justify-end gap-3 mt-4">
                        <Button variant="outline" onClick={handleCloseAddModal}>Cancel</Button>
                        <Button variant="primary" isLoading={addContact.isPending} onClick={handleAddContact}>Add Contact</Button>
                    </div>
                </div>
            </Modal>

            {/* Find Contacts Modal — title + seniority search */}
            <FindContactsModal
                isOpen={isFindModalOpen}
                onClose={() => setIsFindModalOpen(false)}
                accountId={account.id}
                batchId={batchId}
                accountName={account.name}
            />
        </Card>
    );
};