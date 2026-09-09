import React, { useState, useEffect } from 'react';
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
import { hasVerifiedStep, rememberVerifiedStep } from '@/features/batches/utils/batchFlow';
import { ContactCard } from '@/features/batches/components/ContactCard';
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

/** Placeholder values from enrichment sources ("n/a", dashes...) count as missing */
const hasValue = (v: unknown): v is string => {
    if (typeof v !== 'string') return false;
    const s = v.trim();
    return s !== '' && !['n/a', 'na', '-', '—', 'null', 'undefined'].includes(s.toLowerCase());
};

/** First string candidate that isn't a placeholder */
const pickValue = (...candidates: unknown[]): string | undefined => {
    for (const c of candidates) {
        if (hasValue(c)) return c;
    }
    return undefined;
};

const AccountFocusPage: React.FC = () => {
    const { batchId, accountId } = useParams<{ batchId: string; accountId: string }>();
    const navigate = useNavigate();

    const { data: accountDetails, isLoading } = useAccountDetails(accountId || '', batchId);
    const { data: contacts } = useAccountContacts(accountId || '', batchId);
    const addContact = useAddManualContact(accountId || '', batchId);
    // Reached from the accounts (explore/executed) pages — backward entry trusts cached status
    const isBackwardEntry = hasVerifiedStep(batchId || '', 'executed');
    const { data: batch } = useBatch(batchId || '', { skipRefetchOnMount: isBackwardEntry });

    // Record the furthest verified step so later pages can skip refetches when navigating back
    useEffect(() => {
        if (batch) rememberVerifiedStep(batchId || '', batch.status);
    }, [batch, batchId]);
    const isExecuted = (batch?.status || '').toLowerCase() === 'executed';

    const [searchQuery, setSearchQuery] = useState('');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false); const [newContact, setNewContact] = useState({ first_name: '', last_name: '', title: '', email: '', phone: '', linkedin_url: '' });
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});

    // View Details opens the full contact details page (GET /contacts/{id})
    const handleViewContactDetails = (contactId: string) => {
        navigate(`/contacts/${contactId}?batchId=${batchId || ''}`);
    };

    const account = accountDetails?.account;
    // New backend shape: enrichment_data duplicated at top level AND inside account;
    // firmographics live at account.global_firmographics (website_url, linkedin_url, phone, logo_url...)
    const enrichmentData = accountDetails?.enrichment_data || (account as unknown as { enrichment_data?: Record<string, unknown> })?.enrichment_data || {};
    const firmographics = ((account as unknown as { global_firmographics?: Record<string, unknown> })?.global_firmographics || (enrichmentData as Record<string, unknown>)?.global_firmographics || {}) as Record<string, any>;
    const socialLinks = ((enrichmentData as Record<string, unknown>)?.social_links || {}) as Record<string, any>;

    const websiteUrl = pickValue(firmographics.website_url, firmographics.website, account?.domain);
    const linkedinUrl = pickValue(firmographics.linkedin_url, socialLinks.linkedin);
    const twitterUrl = pickValue(firmographics.twitter_url, socialLinks.twitter);
    const facebookUrl = pickValue(firmographics.facebook_url, socialLinks.facebook);
    const phoneNumber = pickValue(firmographics.phone, firmographics.primary_phone?.number, firmographics.sanitized_phone);
    const logoUrl = account?.logo_url || firmographics.logo_url;
    const alexaRanking = firmographics.alexa_ranking;

    // New enrichment shapes (arrays of {description,date} / {title,summary,source_url,date}) with legacy fallbacks
    const achievements = (enrichmentData as Record<string, any>)?.latest_achievements ?? (enrichmentData as Record<string, any>)?.achievements ?? [];
    const newsItems = (enrichmentData as Record<string, any>)?.latest_news_and_events ?? (enrichmentData as Record<string, any>)?.news ?? [];
    const techChanges = (enrichmentData as Record<string, any>)?.technology_challenges_and_changes ?? (enrichmentData as Record<string, any>)?.tech_challenges ?? [];
    const hiringSignals = (enrichmentData as Record<string, any>)?.hiring_signals ?? [];
    const painPoints = (enrichmentData as Record<string, any>)?.pain_points ?? [];
    const fundingUpdates = (enrichmentData as Record<string, any>)?.funding_and_budget_updates ?? [];
    const decisionMakerChanges = (enrichmentData as Record<string, any>)?.decision_maker_changes ?? [];
    const consRisks = (enrichmentData as Record<string, any>)?.client_cons_and_risks ?? [];
    const leadSummary = (enrichmentData as Record<string, any>)?.lead_evaluation_summary as string | undefined;

    const renderDescriptionItem = (item: unknown, i: number) => {
        if (typeof item === 'string') {
            return <div key={i} className="text-sm text-fg-medium pb-2 border-b border-border last:border-b-0">{item}</div>;
        }
        const obj = item as { description?: string; date?: string };
        return (
            <div key={i} className="pb-2 border-b border-border last:border-b-0">
                <div className="text-sm text-fg-medium">{obj.description || ''}</div>
                {obj.date && <div className="text-xs text-fg-muted mt-1">{obj.date}</div>}
            </div>
        );
    };

    const filteredContacts = contacts?.filter(c =>
        `${c.first_name} ${c.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.title.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

    // Backend supports MULTIPLE recommended contacts per account (see GET /accounts/:id/contacts),
    // so use filter (plural) like AccountContactsSection — .find would hide all but the first.
    const recommendedContacts = filteredContacts.filter(c => c.is_recommended);
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

    const locationParts = [firmographics.city, firmographics.country].filter(hasValue) as string[];
    const locationString = locationParts.length > 0 ? locationParts.join(', ') : pickValue(firmographics.location);

    return (
        <div className="w-full pb-12 max-w-[1120px] mx-auto">
            {/* Hero Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => {
                            // Go back in history instead of forcing the enrich page;
                            // fall back to enrich only on direct landings with no history.
                            if (window.history.length > 1) navigate(-1);
                            else navigate(`/batches/${batchId}?tab=accounts`);
                        }}
                        title="Go back"
                        className="p-1.5 rounded-md text-fg hover:bg-bg-muted transition-colors"
                    >
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
                    {logoUrl ? (
                        <img src={logoUrl} alt={account?.name || 'Company logo'} className="w-full h-full object-contain p-2" />
                    ) : (
                        <FiHome className="w-10 h-10 text-primary" />
                    )}
                </div>

                {/* Middle: Company Info & Links */}
                <div className="flex flex-col gap-3 flex-1 min-w-0">
                    <h3 className="font-sans font-semibold text-lg text-fg">{account?.name}</h3>

                    <div className="flex flex-wrap gap-x-4 gap-y-2 mt-1">
                        {websiteUrl && <InfoItem icon={<FiGlobe className="w-4 h-4" />} label={websiteUrl} link={websiteUrl} />}
                        {linkedinUrl && <InfoItem icon={<FaLinkedinIn className="w-4 h-4" />} label="Company LinkedIn" link={linkedinUrl} />}
                        {twitterUrl && <InfoItem icon={<FaTwitter className="w-4 h-4" />} label="Company Twitter" link={twitterUrl} />}
                        {facebookUrl && <InfoItem icon={<FaFacebookF className="w-4 h-4" />} label="Company Facebook" link={facebookUrl} />}
                        <InfoItem icon={<FiPhone className="w-4 h-4" />} label={phoneNumber} />
                        <InfoItem icon={<FiMapPin className="w-4 h-4" />} label={locationString} />
                        <InfoItem icon={<FiHome className="w-4 h-4" />} label={firmographics.founded_year ? `Founded, ${firmographics.founded_year}` : undefined} />
                    </div>
                </div>

                {/* Right: Alexa Rank — only when provided by firmographics */}
                {alexaRanking ? (
                    <div className="flex items-center gap-2 bg-bg-muted px-3 py-2 rounded-lg flex-shrink-0">
                        <span className="font-sans font-medium text-xs text-fg">Alexa rank </span>
                        <div className="flex items-center gap-2 bg-orange-bg text-orange px-3 py-1 rounded-md text-sm font-semibold">
                            <FiBarChart2 className="w-4 h-4" />
                            <span>{alexaRanking}</span>
                        </div>
                    </div>
                ) : null}
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

                {recommendedContacts.length > 0 && (
                    <div className="flex flex-col gap-2">
                        <h4 className="font-sans font-semibold text-sm text-primary">Recommended Contact(s)</h4>
                        <div className="bg-bg-page p-4 rounded-lg flex flex-col">
                            {recommendedContacts.map(contact => <ContactCard key={contact.id} contact={contact} accountId={accountId} batchId={batchId} onViewDetails={(contact) => handleViewContactDetails(contact.id)} />)}
                        </div>
                    </div>
                )}

                <div className="flex flex-col gap-2">
                    <h4 className="font-sans font-semibold text-sm text-primary">All Contacts ({otherContacts.length})</h4>
                    <div className="bg-bg-page p-4 rounded-lg flex flex-col">
                        {otherContacts.length > 0 ? (
                            otherContacts.map(contact => <ContactCard key={contact.id} contact={contact} accountId={accountId} batchId={batchId} onViewDetails={(contact) => handleViewContactDetails(contact.id)} />)
                        ) : (
                            <p className="text-sm text-fg-body text-center py-4">No other contacts found.</p>
                        )}
                    </div>
                </div>
            </Card>

            {/* Collapsible Sections — hidden in Executed phase (no enrichment yet).
                Sections without data are not rendered at all. */}
            {!isExecuted && (
                achievements?.length > 0 || newsItems?.length > 0 || techChanges?.length > 0 ||
                hiringSignals?.length > 0 || painPoints?.length > 0 || fundingUpdates?.length > 0 ||
                decisionMakerChanges?.length > 0 || consRisks?.length > 0 || leadSummary
            ) && (
                    <div className="flex flex-col gap-4">
                        {achievements?.length > 0 && (
                            <CollapsibleSection title="Latest Achievements">
                                <div className="flex flex-col gap-3">
                                    {achievements.map((item: unknown, i: number) => renderDescriptionItem(item, i))}
                                </div>
                            </CollapsibleSection>
                        )}

                        {newsItems?.length > 0 && (
                            <CollapsibleSection title="Latest News and Events">
                                <div className="flex flex-col gap-3">
                                    {newsItems.map((item: unknown, i: number) => {
                                        if (typeof item === 'string') {
                                            return <div key={i} className="text-sm text-fg-medium pb-2 border-b border-border last:border-b-0">{item}</div>;
                                        }
                                        const n = item as { title?: string; summary?: string; source_url?: string; date?: string };
                                        return (
                                            <div key={i} className="pb-2 border-b border-border last:border-b-0">
                                                {n.title && <div className="text-sm font-medium text-fg">{n.title}</div>}
                                                {n.summary && <div className="text-sm text-fg-medium mt-1">{n.summary}</div>}
                                                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                                                    {n.date && <span className="text-xs text-fg-muted">{n.date}</span>}
                                                    {n.source_url && <a href={n.source_url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline">Source</a>}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </CollapsibleSection>
                        )}

                        {techChanges?.length > 0 && (
                            <CollapsibleSection title="Technology Challenges and Changes">
                                <div className="flex flex-col gap-3">
                                    {(Array.isArray(techChanges) ? techChanges : [techChanges]).map((item: unknown, i: number) => renderDescriptionItem(item, i))}
                                </div>
                            </CollapsibleSection>
                        )}

                        {hiringSignals?.length > 0 && (
                            <CollapsibleSection title="Hiring Signals">
                                <div className="flex flex-wrap gap-2">
                                    {hiringSignals.map((item: unknown, i: number) => {
                                        if (typeof item === 'string') {
                                            return <span key={i} className="px-3 py-1 bg-bg-muted text-fg-medium text-xs rounded-full w-fit">{item}</span>;
                                        }
                                        return <React.Fragment key={i}>{renderDescriptionItem(item, i)}</React.Fragment>;
                                    })}
                                </div>
                            </CollapsibleSection>
                        )}

                        {painPoints?.length > 0 && (
                            <CollapsibleSection title="Pain Points">
                                <div className="flex flex-col gap-3">
                                    {painPoints.map((item: unknown, i: number) => renderDescriptionItem(item, i))}
                                </div>
                            </CollapsibleSection>
                        )}

                        {fundingUpdates?.length > 0 && (
                            <CollapsibleSection title="Funding & Budget Updates">
                                <div className="flex flex-col gap-3">
                                    {fundingUpdates.map((item: unknown, i: number) => renderDescriptionItem(item, i))}
                                </div>
                            </CollapsibleSection>
                        )}

                        {decisionMakerChanges?.length > 0 && (
                            <CollapsibleSection title="Decision Maker Changes">
                                <div className="flex flex-col gap-3">
                                    {decisionMakerChanges.map((item: unknown, i: number) => renderDescriptionItem(item, i))}
                                </div>
                            </CollapsibleSection>
                        )}

                        {consRisks?.length > 0 && (
                            <CollapsibleSection title="Client Cons & Risks">
                                <div className="flex flex-col gap-3">
                                    {consRisks.map((item: unknown, i: number) => renderDescriptionItem(item, i))}
                                </div>
                            </CollapsibleSection>
                        )}

                        {leadSummary && (
                            <CollapsibleSection title="Lead Evaluation Summary">
                                <p className="text-sm text-fg-body whitespace-pre-wrap">{leadSummary}</p>
                            </CollapsibleSection>
                        )}
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
        </div>
    );
};

export default WithNavbar(AccountFocusPage);