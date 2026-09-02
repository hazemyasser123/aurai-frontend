import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { WithNavbar } from '@/shared/components/hoc/WithNavbar';
import { Button, InputField, Card, CollapsibleSection, Modal } from '@/shared/components/ui';
import { FiArrowLeft, FiSearch, FiEdit2, FiPlus, FiGlobe, FiPhone, FiMapPin, FiHome, FiBarChart2 } from 'react-icons/fi';
import { FaLinkedinIn, FaTwitter, FaFacebookF } from 'react-icons/fa';
import { useAccountDetails } from '@/features/batches/hooks/useAccountDetails';
import { useAccountContacts } from '@/features/batches/hooks/useAccountContacts';
import { useAddManualContact } from '@/features/batches/hooks/useAddManualContact';
import { useBatch } from '@/features/batches/hooks/useBatch';
import { ContactCard } from '@/features/batches/components/ContactCard';
import type { Contact } from '@/features/batches/types/batchTypes';
import toast from 'react-hot-toast';
import { getErrorMessage } from '@/shared/utils/errorHandler';
import { AccountFocusPageSkeleton } from '../components/AccountFocusPageSkeleton';

// Zod schema for Add Contact validation
const contactSchema = z.object({
    first_name: z.string().min(1, "First name is required"),
    last_name: z.string().min(1, "Last name is required"),
    title: z.string().optional(),
    email: z.string().email("Invalid email address").optional().or(z.literal('')),
    phone: z.string().regex(/^\+?[0-9\s-]+$/, "Invalid phone number").optional().or(z.literal('')),
    linkedin_url: z.string().url("Must be a valid URL").optional().or(z.literal('')),
});

// Helper component for info items
const InfoItem: React.FC<{ icon: React.ReactNode; label?: string; link?: string }> = ({ icon, label, link }) => {
    if (!label) return null;
    return (
        <div className="flex items-center gap-1.5 text-xs text-fg-medium">
            {icon}
            {link ? (
                <a href={link.startsWith('http') ? link : `https://${link}`} target="_blank" rel="noopener noreferrer" className="hover:underline cursor-pointer">
                    {label}
                </a>
            ) : (
                <span>{label}</span>
            )}
        </div>
    );
};

const AccountFocusPage: React.FC = () => {
    const { batchId, accountId } = useParams<{ batchId: string; accountId: string }>();
    const navigate = useNavigate();

    const { data: accountDetails, isLoading } = useAccountDetails(accountId || '', batchId);
    const { data: contacts } = useAccountContacts(accountId || '', batchId);
    const addContact = useAddManualContact(accountId || '', batchId);
    const { data: batch } = useBatch(batchId || '');
    const isExecuted = (batch?.status || '').toLowerCase() === 'executed';

    const [searchQuery, setSearchQuery] = useState('');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [newContact, setNewContact] = useState({ first_name: '', last_name: '', title: '', email: '', phone: '', linkedin_url: '' });
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});

    const [contactToView, setContactToView] = useState<Contact | null>(null);

    const account = accountDetails?.account;
    const enrichmentData = accountDetails?.enrichment_data || {};
    const firmographics = enrichmentData?.global_firmographics || {};
    const socialLinks = enrichmentData?.social_links || {};

    const filteredContacts = contacts?.filter(c =>
        `${c.first_name} ${c.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.title.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

    const recommendedContact = filteredContacts.find(c => c.is_recommended);
    const otherContacts = filteredContacts.filter(c => !c.is_recommended);

    const handleAddContact = async () => {
        setFormErrors({});

        const validation = contactSchema.safeParse(newContact);
        if (!validation.success) {
            const mappedErrors: Record<string, string> = {};
            validation.error.issues.forEach(issue => {
                mappedErrors[issue.path[0] as string] = issue.message;
            });
            setFormErrors(mappedErrors);
            return;
        }

        try {
            await addContact.mutateAsync({
                batch_id: batchId || '',
                ...newContact
            });
            toast.success("Contact added successfully!");
            setIsAddModalOpen(false);
            setNewContact({ first_name: '', last_name: '', title: '', email: '', phone: '', linkedin_url: '' });
        } catch (error) {
            toast.error(getErrorMessage(error));
        }
    };

    if (isLoading) {
        return (
            <div className="w-full">
                <AccountFocusPageSkeleton />
            </div>
        );
    }

    const locationParts = [firmographics.city, firmographics.country].filter(Boolean);
    const locationString = locationParts.length > 0 ? locationParts.join(', ') : firmographics.location;

    return (
        <div className="w-full pb-12 max-w-[1120px] mx-auto">
            {/* Hero Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
                <div className="flex items-center gap-3">
                    <button onClick={() => navigate(`/batches/${batchId}/accounts/enrich`)} className="p-1.5 rounded-md text-fg hover:bg-bg-muted transition-colors">
                        <FiArrowLeft className="w-5 h-5" />
                    </button>
                    <h2 className="font-sans font-bold text-xl sm:text-2xl tracking-tight text-fg">{account?.name}</h2>
                </div>
                <Button variant="primary" className="w-full sm:w-auto">
                    <FiEdit2 className="w-4 h-4" />
                    Initiate Outreach
                </Button>
            </div>

            {/* Hero Section (Company Info) - Matches Figma Layout */}
            <Card variant="elevated" className="flex flex-col md:flex-row items-center gap-6 mb-6 p-6">
                {/* Left: Company Logo */}
                <div className="w-24 h-24 rounded-lg bg-bg-purple-50 border border-border flex items-center justify-center flex-shrink-0">
                    {account?.logo_url ? (
                        <img src={account.logo_url} alt={account.name} className="w-full h-full object-contain p-2" />
                    ) : (
                        <FiHome className="w-10 h-10 text-primary" />
                    )}
                </div>

                {/* Middle: Company Info & Links */}
                <div className="flex flex-col gap-3 flex-1 min-w-0">
                    <h3 className="font-sans font-semibold text-lg text-fg">{account?.name}</h3>

                    <div className="flex flex-wrap gap-x-4 gap-y-2 mt-1">
                        <InfoItem icon={<FiGlobe className="w-4 h-4" />} label={firmographics.website || account?.domain} link={firmographics.website || account?.domain} />
                        <InfoItem icon={<FaLinkedinIn className="w-4 h-4" />} label="Company LinkedIn" link={socialLinks.linkedin} />
                        <InfoItem icon={<FaTwitter className="w-4 h-4" />} label="Company Twitter" link={socialLinks.twitter} />
                        <InfoItem icon={<FaFacebookF className="w-4 h-4" />} label="Company Facebook" link={socialLinks.facebook} />
                        <InfoItem icon={<FiPhone className="w-4 h-4" />} label={firmographics.phone} />
                        <InfoItem icon={<FiMapPin className="w-4 h-4" />} label={locationString} />
                        <InfoItem icon={<FiHome className="w-4 h-4" />} label={firmographics.founded_year ? `Founded, ${firmographics.founded_year}` : undefined} />
                    </div>
                </div>

                {/* Right: Alexa Rank (Static Data for now) */}
                <div className="flex items-center gap-2 bg-bg-muted px-3 py-2 rounded-lg flex-shrink-0">
                    <span className="font-sans font-medium text-xs text-fg">Alexa rank </span>
                    <div className="flex items-center gap-2 bg-orange-bg text-orange px-3 py-1 rounded-md text-sm font-semibold">
                        <FiBarChart2 className="w-4 h-4" />
                        <span>123,456</span>
                    </div>
                </div>
            </Card>

            {/* Executed phase notice — company details not available until enrich */}
            {isExecuted && (
                <Card variant="elevated" className="flex flex-col gap-3 mb-6 border-amber-200 bg-amber-50">
                    <h3 className="font-sans font-semibold text-sm text-amber-800">Company details unavailable</h3>
                    <p className="font-sans text-sm text-amber-700">Accounts have been found but not yet enriched. Company details (firmographics, achievements, news, pain points) will be available after <span className="font-semibold">Enrich & Rank</span>.</p>
                </Card>
            )}

            {/* Contacts Section */}
            <Card variant="elevated" className="flex flex-col gap-6 mb-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <h3 className="font-sans font-semibold text-lg text-fg">Key Contacts</h3>
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <div className="relative flex-1 sm:w-64">
                            <InputField placeholder="Search contacts" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10 rounded-full" />
                            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-fg-body" />
                        </div>
                        <Button variant="primary" className="flex-shrink-0" onClick={() => setIsAddModalOpen(true)}>
                            <FiPlus className="w-4 h-4" /> Add Contact
                        </Button>
                    </div>
                </div>

                {recommendedContact && (
                    <div className="flex flex-col gap-2">
                        <h4 className="font-sans font-semibold text-sm text-primary">Recommended Contact</h4>
                        <div className="bg-bg-page p-4 rounded-lg">
                            <ContactCard contact={recommendedContact} accountId={accountId} batchId={batchId} onViewDetails={setContactToView} />
                        </div>
                    </div>
                )}

                <div className="flex flex-col gap-2">
                    <h4 className="font-sans font-semibold text-sm text-primary">All Contacts ({otherContacts.length})</h4>
                    <div className="bg-bg-page p-4 rounded-lg flex flex-col">
                        {otherContacts.length > 0 ? (
                            otherContacts.map(contact => <ContactCard key={contact.id} contact={contact} accountId={accountId} batchId={batchId} onViewDetails={setContactToView} />)
                        ) : (
                            <p className="text-sm text-fg-body text-center py-4">No other contacts found.</p>
                        )}
                    </div>
                </div>
            </Card>

            {/* Collapsible Sections — hidden in Executed phase (no enrichment yet) */}
            {!isExecuted && (
                <div className="flex flex-col gap-4">
                    <CollapsibleSection title="Latest Achievements">
                    <div className="flex flex-col gap-3">
                        {enrichmentData?.achievements?.length > 0 ? (
                            enrichmentData.achievements.map((item: string, i: number) => (
                                <div key={i} className="text-sm text-fg-medium pb-2 border-b border-border last:border-b-0">{item}</div>
                            ))
                        ) : <p className="text-sm text-fg-body">No data available.</p>}
                    </div>
                </CollapsibleSection>

                <CollapsibleSection title="Latest News and Events">
                    <div className="flex flex-col gap-3">
                        {enrichmentData?.news?.length > 0 ? (
                            enrichmentData.news.map((item: string, i: number) => (
                                <div key={i} className="text-sm text-fg-medium pb-2 border-b border-border last:border-b-0">{item}</div>
                            ))
                        ) : <p className="text-sm text-fg-body">No data available.</p>}
                    </div>
                </CollapsibleSection>

                <CollapsibleSection title="Technology Challenges and Changes">
                    <p className="text-sm text-fg-body">{enrichmentData?.tech_challenges || "No data available."}</p>
                </CollapsibleSection>

                <CollapsibleSection title="Hiring Signals">
                    <div className="flex flex-wrap gap-2">
                        {enrichmentData?.hiring_signals?.length > 0 ? (
                            enrichmentData.hiring_signals.map((signal: string, i: number) => (
                                <span key={i} className="px-3 py-1 bg-bg-muted text-fg-medium text-xs rounded-full">{signal}</span>
                            ))
                        ) : <p className="text-sm text-fg-body">No data available.</p>}
                    </div>
                </CollapsibleSection>

                <CollapsibleSection title="Pain Points">
                    <div className="flex flex-col gap-3">
                        {enrichmentData?.pain_points?.length > 0 ? (
                            enrichmentData.pain_points.map((item: string, i: number) => (
                                <div key={i} className="text-sm text-fg-medium pb-2 border-b border-border last:border-b-0">{item}</div>
                            ))
                        ) : <p className="text-sm text-fg-body">No data available.</p>}
                    </div>
                </CollapsibleSection>
                </div>
            )}

            {/* Add Contact Modal */}
            <Modal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                title="Add Manual Contact"
            >
                <div className="flex flex-col gap-4">
                    <div className="grid grid-cols-2 gap-4">
                        <InputField
                            label="FIRST NAME *"
                            value={newContact.first_name}
                            onChange={(e) => setNewContact({ ...newContact, first_name: e.target.value })}
                            error={formErrors.first_name}
                        />
                        <InputField
                            label="LAST NAME *"
                            value={newContact.last_name}
                            onChange={(e) => setNewContact({ ...newContact, last_name: e.target.value })}
                            error={formErrors.last_name}
                        />
                    </div>
                    <InputField
                        label="TITLE"
                        value={newContact.title}
                        onChange={(e) => setNewContact({ ...newContact, title: e.target.value })}
                    />
                    <InputField
                        label="EMAIL"
                        type="email"
                        value={newContact.email}
                        onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                        error={formErrors.email}
                    />
                    <InputField
                        label="PHONE"
                        value={newContact.phone}
                        onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                        error={formErrors.phone}
                    />
                    <InputField
                        label="LINKEDIN URL"
                        value={newContact.linkedin_url}
                        onChange={(e) => setNewContact({ ...newContact, linkedin_url: e.target.value })}
                        error={formErrors.linkedin_url}
                    />

                    <div className="flex justify-end gap-3 mt-4">
                        <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
                        <Button
                            variant="primary"
                            isLoading={addContact.isPending}
                            onClick={handleAddContact}
                        >
                            Add Contact
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* View Details Modal */}
            <Modal
                isOpen={!!contactToView}
                onClose={() => setContactToView(null)}
                title="Contact Details"
            >
                <div className="flex flex-col gap-4">
                    <div className="grid grid-cols-2 gap-4">
                        <InputField label="First Name" value={contactToView?.first_name || ''} readOnly />
                        <InputField label="Last Name" value={contactToView?.last_name || ''} readOnly />
                    </div>
                    <InputField label="Title" value={contactToView?.title || ''} readOnly />
                    <InputField label="Email" value={contactToView?.primary_email || 'N/A'} readOnly />
                    <InputField label="Phone" value={contactToView?.primary_phone || 'N/A'} readOnly />
                    <InputField label="LinkedIn URL" value={contactToView?.linkedin_url || 'N/A'} readOnly />

                    <div className="flex justify-end mt-4">
                        <Button variant="outline" onClick={() => setContactToView(null)}>Close</Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default WithNavbar(AccountFocusPage);