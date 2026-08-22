import React, { useState } from 'react';
import { Button, Card, Modal, InputField } from '@/shared/components/ui';
import { FiSearch, FiPlus, FiArrowRight } from 'react-icons/fi';
import { ContactCard } from '@/features/batches/components/ContactCard';
import { useAddManualContact } from '@/features/batches/hooks/useAddManualContact';
import type { Account, Contact } from '@/features/batches/types/batchTypes';
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
    const [newContact, setNewContact] = useState({ first_name: '', last_name: '', title: '', email: '', phone: '', linkedin_url: '' });
    const addContact = useAddManualContact(account.id, batchId);

    const handleAddContact = async () => {
        if (!newContact.first_name || !newContact.last_name) {
            toast.error("First name and Last name are required.");
            return;
        }
        try {
            await addContact.mutateAsync({ batch_id: batchId || '', ...newContact });
            toast.success("Contact added successfully!");
            setIsAddModalOpen(false);
            setNewContact({ first_name: '', last_name: '', title: '', email: '', phone: '', linkedin_url: '' });
        } catch (error) {
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
                        <img src={account.logo_url} alt={account.name} className="w-14 h-14 rounded-xl object-cover bg-bg-purple-50" />
                    ) : (
                        <div className="w-14 h-14 rounded-xl bg-bg-purple-50 flex items-center justify-center text-2xl font-bold text-primary">
                            {account.name.charAt(0)}
                        </div>
                    )}
                    <div>
                        <h3 className="font-sans font-semibold text-lg text-fg">{account.name}</h3>
                        <p className="font-sans font-medium text-sm text-fg-body">{account.domain} · {contacts.length} contact(s)</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="py-2 px-3 h-10">
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
            <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Add Manual Contact">
                <div className="flex flex-col gap-4">
                    <div className="grid grid-cols-2 gap-4">
                        <InputField label="FIRST NAME *" value={newContact.first_name} onChange={(e) => setNewContact({ ...newContact, first_name: e.target.value })} />
                        <InputField label="LAST NAME *" value={newContact.last_name} onChange={(e) => setNewContact({ ...newContact, last_name: e.target.value })} />
                    </div>
                    <InputField label="TITLE" value={newContact.title} onChange={(e) => setNewContact({ ...newContact, title: e.target.value })} />
                    <InputField label="EMAIL" value={newContact.email} onChange={(e) => setNewContact({ ...newContact, email: e.target.value })} />
                    <InputField label="PHONE" value={newContact.phone} onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })} />
                    <InputField label="LINKEDIN URL" value={newContact.linkedin_url} onChange={(e) => setNewContact({ ...newContact, linkedin_url: e.target.value })} />
                    <div className="flex justify-end gap-3 mt-4">
                        <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
                        <Button variant="primary" isLoading={addContact.isPending} onClick={handleAddContact}>Add Contact</Button>
                    </div>
                </div>
            </Modal>
        </Card>
    );
};