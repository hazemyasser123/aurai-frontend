import React, { useState, useMemo } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { WithNavbar } from '@/shared/components/hoc/WithNavbar';
import { Button, CollapsibleSection } from '@/shared/components/ui';
import { FiArrowLeft, FiMail, FiPhone, FiMapPin, FiCopy, FiZap } from 'react-icons/fi';
import { FaLinkedinIn } from 'react-icons/fa';
import { useContactDetails } from '@/features/batches/hooks/useContactDetails';
import { useEnrichContact } from '@/features/batches/hooks/useEnrichContact';
import { openMailApp } from '@/features/batches/utils/openMailApp';
import { AccountCardSkeleton } from '@/features/batches/components/AccountCardSkeleton';
import toast from 'react-hot-toast';
import { getErrorMessage } from '@/shared/utils/errorHandler';

const InfoItem: React.FC<{ icon: React.ReactNode; label: string; value?: string | null; href?: string }> = ({ icon, label, value, href }) => {
    if (!value) return null;
    const isMail = href?.startsWith('mailto:');
    const content = (
        <>
            {icon}
            <span className="font-sans font-medium text-sm text-fg truncate">{value}</span>
        </>
    );
    const linkClass = "flex items-center gap-2 min-w-0 text-primary hover:underline";
    return (
        <div className="flex items-center gap-3 min-w-0">
            <span className="font-sans text-xs text-fg-muted w-20 shrink-0">{label}</span>
            {href ? (
                isMail ? (
                    <button onClick={() => openMailApp(value)} title={`Email ${value}`} className={linkClass}>
                        {content}
                    </button>
                ) : (
                    <a
                        href={href}
                        target={href.startsWith('http') ? '_blank' : undefined}
                        rel="noopener noreferrer"
                        className={linkClass}
                    >
                        {content}
                    </a>
                )
            ) : (
                <div className="flex items-center gap-2 min-w-0 text-fg">{content}</div>
            )}
        </div>
    );
};

const ContactDetailsPage: React.FC = () => {
    const { contactId } = useParams<{ contactId: string }>();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const batchId = searchParams.get('batchId');
    const { data: contact, isLoading, isError } = useContactDetails(contactId || '');
    const enrich = useEnrichContact(contactId || '');

    // Photo chain: top-level photo_url first → raw_source_metadata photo → initial letter.
    // Each URL that fails to load is recorded so the chain falls through.
    const [failedPhotoSrc, setFailedPhotoSrc] = useState<string[]>([]);
    const rawPhotoUrl = contact?.raw_source_metadata?.candidate?.photo?.url || null;
    const canTry = (url?: string | null) => !!url && !failedPhotoSrc.includes(url);
    const photoUrl = canTry(contact?.photo_url)
        ? contact?.photo_url
        : canTry(rawPhotoUrl)
            ? rawPhotoUrl
            : null;

    const rawJson = useMemo(() => (contact ? JSON.stringify(contact, null, 2) : ''), [contact]);
    const location = contact?.raw_source_metadata?.candidate?.locations?.[0]?.name || null;
    const fullName = contact ? `${contact.first_name} ${contact.last_name}`.trim() : '';
    const headline = contact?.raw_source_metadata?.candidate?.headLine || null;

    const handleCopyRaw = async () => {
        try {
            await navigator.clipboard.writeText(rawJson);
            toast.success('Raw source metadata copied to clipboard!');
        } catch {
            toast.error('Failed to copy to clipboard.');
        }
    };

    const handleEnrich = async () => {
        try {
            await enrich.mutateAsync();
        } catch (error) {
            toast.error(getErrorMessage(error));
        }
    };

    if (isLoading) {
        return (
            <div className="w-full pb-12 max-w-[1120px] mx-auto">
                <AccountCardSkeleton />
                <AccountCardSkeleton />
            </div>
        );
    }

    if (isError || !contact) {
        return (
            <div className="w-full pb-12 max-w-[1120px] mx-auto">
                <div className="flex flex-col items-center justify-center gap-3 py-16 bg-bg-sidebar border border-border rounded-xl">
                    <p className="font-sans font-medium text-sm text-danger">Failed to load contact details</p>
                    <Button variant="outline" onClick={() => navigate(-1)}>Go Back</Button>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full pb-12 max-w-[1120px] mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
                <div className="flex items-center gap-3 min-w-0">
                    <button
                        onClick={() => {
                            if (window.history.length > 1) navigate(-1);
                            else if (batchId) navigate(`/batches/${batchId}?tab=accounts`);
                            else navigate('/');
                        }}
                        title="Go back"
                        className="p-1.5 rounded-md text-fg hover:bg-bg-muted transition-colors shrink-0"
                    >
                        <FiArrowLeft className="w-5 h-5" />
                    </button>
                    <div className="min-w-0">
                        <h2 className="font-sans font-bold text-xl sm:text-2xl tracking-tight text-fg truncate">{fullName}</h2>
                        <p className="font-sans font-medium text-sm text-fg-body mt-1 truncate">
                            {contact.title || headline || 'Contact Details'}
                        </p>
                    </div>
                </div>
                <Button
                    variant="primary"
                    className="w-full sm:w-auto"
                    isLoading={enrich.isPending}
                    disabled={enrich.isPending}
                    onClick={handleEnrich}
                >
                    <FiZap className="w-4 h-4" />
                    Enrich Data
                </Button>
            </div>

            <div className="flex flex-col gap-6">
                {/* Basic Info */}
                <div className="bg-bg-sidebar border border-border rounded-xl p-6 flex flex-col sm:flex-row gap-6">
                    {photoUrl ? (
                        <img
                            key={photoUrl}
                            src={photoUrl}
                            alt={fullName}
                            onError={() => setFailedPhotoSrc((prev) => [...prev, photoUrl])}
                            className="w-24 h-24 rounded-xl object-cover bg-bg-purple-50 shrink-0"
                        />
                    ) : (
                        <div className="w-24 h-24 rounded-xl bg-bg-purple-50 flex items-center justify-center font-sans font-bold text-4xl text-primary shrink-0">
                            {(contact.first_name?.charAt(0) ?? '?').toUpperCase()}
                        </div>
                    )}
                    <div className="flex flex-col gap-1 min-w-0">
                        <h3 className="font-sans font-bold text-lg text-fg truncate">{fullName}</h3>
                        {contact.title && (
                            <p className="font-sans font-medium text-sm text-fg-body">{contact.title}</p>
                        )}
                        {headline && headline !== contact.title && (
                            <p className="font-sans text-sm text-fg-body">{headline}</p>
                        )}
                        {contact.seniority_level && (
                            <p className="font-sans text-xs text-fg-muted">Seniority: {contact.seniority_level}</p>
                        )}
                    </div>
                </div>

                {/* Contact Info */}
                <div className="bg-bg-sidebar border border-border rounded-xl p-6 flex flex-col gap-4">
                    <h3 className="font-sans font-semibold text-lg tracking-tight text-fg">Contact Info</h3>
                    <InfoItem icon={<FiMail className="w-4 h-4 text-orange shrink-0" />} label="Email" value={contact.primary_email} href={contact.primary_email ? `mailto:${contact.primary_email}` : undefined} />
                    <InfoItem icon={<FiPhone className="w-4 h-4 text-primary shrink-0" />} label="Phone" value={contact.primary_phone} href={contact.primary_phone ? `tel:${contact.primary_phone}` : undefined} />
                    <InfoItem icon={<FaLinkedinIn className="w-4 h-4 text-info shrink-0" />} label="LinkedIn" value={contact.linkedin_url} href={contact.linkedin_url ?? undefined} />
                    <InfoItem icon={<FiMapPin className="w-4 h-4 text-fg-body shrink-0" />} label="Location" value={location} />
                </div>

                {/* Raw Source Metadata — accordion with the full API response */}
                <CollapsibleSection title="Raw Source Metadata">
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center justify-between gap-3">
                            <p className="font-sans text-xs text-fg-muted">
                                The full API response for this contact, exactly as received from the source.
                            </p>
                            <Button variant="outline" className="h-9 px-3 text-xs shrink-0" onClick={handleCopyRaw}>
                                <FiCopy className="w-4 h-4" />
                                Copy JSON
                            </Button>
                        </div>
                        <pre className="bg-bg-page border border-border rounded-xl p-4 text-xs font-mono text-fg-body max-h-[50vh] overflow-auto whitespace-pre-wrap break-words">
                            {rawJson}
                        </pre>
                    </div>
                </CollapsibleSection>
            </div>
        </div>
    );
};

export default WithNavbar(ContactDetailsPage);
