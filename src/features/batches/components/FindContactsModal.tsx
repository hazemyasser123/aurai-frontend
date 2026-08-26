import React, { useState, useMemo } from 'react';
import { Modal, InputField, Button } from '@/shared/components/ui';
import { useSearchContactCandidates } from '@/features/batches/hooks/useSearchContactCandidates';
import { useAddContactCandidates } from '@/features/batches/hooks/useAddContactCandidates';
import type { ContactCandidate } from '@/features/batches/types/batchTypes';
import toast from 'react-hot-toast';
import { getErrorMessage } from '@/shared/utils/errorHandler';
import { FiSearch, FiCheck, FiUser } from 'react-icons/fi';
import { FaLinkedinIn } from 'react-icons/fa';

interface FindContactsModalProps {
    isOpen: boolean;
    onClose: () => void;
    accountId: string;
    batchId?: string;
    accountName?: string;
}

export const FindContactsModal: React.FC<FindContactsModalProps> = ({
    isOpen,
    onClose,
    accountId,
    batchId,
    accountName,
}) => {
    const [title, setTitle] = useState('');
    const [seniority, setSeniority] = useState('');
    const [candidates, setCandidates] = useState<ContactCandidate[]>([]);
    const [selected, setSelected] = useState<Set<string>>(new Set());
    const [hasSearched, setHasSearched] = useState(false);

    const searchMutation = useSearchContactCandidates(accountId);
    const addMutation = useAddContactCandidates(accountId, batchId);

    const selectedCount = selected.size;

    const getCandidateId = (c: ContactCandidate, index?: number) =>
        `${c.source}::${c.source_identifier}::${c.email ?? c.first_name + c.last_name}::${index ?? ''}`;

    const selectedCandidates = useMemo(() => {
        if (!Array.isArray(candidates)) return [];
        return candidates.filter((c, idx) => selected.has(getCandidateId(c, idx)));
    }, [candidates, selected]);

    const handleSearch = async () => {
        if (!title.trim() && !seniority.trim()) {
            toast.error('Enter a title or seniority level.');
            return;
        }
        try {
            const result = await searchMutation.mutateAsync({
                title: title.trim() || undefined,
                seniority_level: seniority.trim() || undefined,
                max_results: 10,
            });
            // Defensive: API may return array or {candidates: []} or {data: []}
            const normalized: ContactCandidate[] = Array.isArray(result)
                ? result
                : Array.isArray((result as unknown as { candidates: ContactCandidate[] })?.candidates)
                    ? (result as unknown as { candidates: ContactCandidate[] }).candidates
                    : Array.isArray((result as unknown as { data: ContactCandidate[] })?.data)
                        ? (result as unknown as { data: ContactCandidate[] }).data
                        : [];
            setCandidates(normalized);
            setSelected(new Set());
            setHasSearched(true);
            if (normalized.length === 0) {
                toast('No candidates found for the given criteria.', { icon: '🔍' });
            }
        } catch (error) {
            toast.error(getErrorMessage(error));
        }
    };

    const handleToggle = (candidateId: string) => {
        setSelected((prev) => {
            const next = new Set(prev);
            if (next.has(candidateId)) next.delete(candidateId);
            else next.add(candidateId);
            return next;
        });
    };

    const handleToggleAll = () => {
        if (!Array.isArray(candidates) || candidates.length === 0) return;
        if (selected.size === candidates.length) {
            setSelected(new Set());
        } else {
            setSelected(new Set(candidates.map((c, idx) => getCandidateId(c, idx))));
        }
    };

    const handleAdd = async () => {
        if (!batchId) {
            toast.error('Batch context is missing.');
            return;
        }
        if (selectedCount === 0) {
            toast.error('Select at least one contact to add.');
            return;
        }
        try {
            await addMutation.mutateAsync({
                batch_id: batchId,
                candidates: selectedCandidates.map((c) => ({
                    source: c.source,
                    source_identifier: c.source_identifier,
                    first_name: c.first_name,
                    last_name: c.last_name,
                    title: c.title,
                    linkedin_url: c.linkedin_url || undefined,
                    email: c.email || undefined,
                    raw_source_metadata: null,
                })),
            });
            toast.success(`${selectedCount} contact(s) added successfully!`);
            handleClose();
        } catch (error) {
            toast.error(getErrorMessage(error));
        }
    };

    const handleClose = () => {
        // Reset local state on close for next open
        setTitle('');
        setSeniority('');
        setCandidates([]);
        setSelected(new Set());
        setHasSearched(false);
        onClose();
    };

    const isSearching = searchMutation.isPending;
    const isAdding = addMutation.isPending;

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="Find Contacts">
            <div className="flex flex-col gap-5">
                {accountName && (
                    <p className="font-sans text-sm text-fg-body">
                        Searching contacts for <span className="font-semibold text-fg">{accountName}</span>
                    </p>
                )}

                {/* Filters — Title + Seniority Level as text inputs per spec */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <InputField
                        label="TITLE"
                        placeholder="e.g. Chief Executive Officer"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        hint="Job title to search for"
                    />
                    <InputField
                        label="SENIORITY LEVEL"
                        placeholder="e.g. c_suite, director, manager"
                        value={seniority}
                        onChange={(e) => setSeniority(e.target.value)}
                        hint="Seniority level (e.g. c_suite, vp, director)"
                    />
                </div>

                {/* Results */}
                {hasSearched && (
                    <div className="flex flex-col gap-3">
                        <div className="flex items-center justify-between">
                            <h4 className="font-sans font-semibold text-sm text-primary">
                                Candidates ({Array.isArray(candidates) ? candidates.length : 0})
                            </h4>
                            {Array.isArray(candidates) && candidates.length > 0 && (
                                <button
                                    type="button"
                                    onClick={handleToggleAll}
                                    className="font-sans font-medium text-xs text-primary hover:text-primary-dark transition-colors cursor-pointer"
                                >
                                    {selected.size === candidates.length ? 'Deselect all' : 'Select all'}
                                </button>
                            )}
                        </div>

                        {!Array.isArray(candidates) || candidates.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-10 border border-dashed border-border rounded-lg bg-bg-page">
                                <div className="w-10 h-10 rounded-full bg-bg-muted flex items-center justify-center mb-2">
                                    <FiUser className="w-5 h-5 text-fg-body" />
                                </div>
                                <p className="font-sans font-medium text-sm text-fg-body text-center px-4">
                                    No candidates matched your filters. Try a different title or seniority.
                                </p>
                            </div>
                        ) : (
                            <>
                                <div className="flex flex-col gap-2 max-h-[320px] overflow-y-auto pr-1">
                                    {candidates.map((candidate, idx) => {
                                        const uid = getCandidateId(candidate, idx);
                                        const isSelected = selected.has(uid);
                                        return (
                                            <label
                                                key={uid}
                                                className={`flex items-center gap-3 p-3 rounded-lg border border-solid cursor-pointer transition-[border-color,background-color] duration-150 ease-out ${isSelected ? 'bg-bg-purple-50 border-border-light' : 'bg-bg-card border-border hover:border-border-light'}`}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={isSelected}
                                                    onChange={() => handleToggle(uid)}
                                                    className="w-4 h-4 accent-primary cursor-pointer shrink-0"
                                                />
                                                {candidate.photo_url ? (
                                                    <img
                                                        src={candidate.photo_url}
                                                        alt={candidate.first_name}
                                                        className="w-9 h-9 rounded-full object-cover bg-bg-purple-50 shrink-0"
                                                    />
                                                ) : (
                                                    <div className="w-9 h-9 rounded-full bg-bg-purple-50 flex items-center justify-center font-semibold text-primary text-xs shrink-0">
                                                        {(candidate.first_name?.charAt(0) ?? '?').toUpperCase()}
                                                        {(candidate.last_name?.charAt(0) ?? '').toUpperCase()}
                                                    </div>
                                                )}
                                                <div className="flex flex-col min-w-0 flex-1">
                                                    <span className="font-sans font-medium text-sm text-fg truncate">
                                                        {candidate.first_name} {candidate.last_name}
                                                    </span>
                                                    <span className="font-sans text-xs text-fg-body truncate">
                                                        {candidate.title || '—'}
                                                    </span>
                                                    {candidate.email && (
                                                        <span className="font-sans text-xs text-fg-muted truncate">
                                                            {candidate.email}
                                                        </span>
                                                    )}
                                                </div>
                                                {candidate.linkedin_url && (
                                                    <a
                                                        href={candidate.linkedin_url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        onClick={(e) => e.stopPropagation()}
                                                        className="w-7 h-7 flex items-center justify-center bg-info-bg text-info rounded-md hover:opacity-80 transition-opacity shrink-0"
                                                        title="LinkedIn"
                                                    >
                                                        <FaLinkedinIn className="w-3.5 h-3.5" />
                                                    </a>
                                                )}
                                                {isSelected && (
                                                    <FiCheck className="w-4 h-4 text-primary shrink-0" />
                                                )}
                                            </label>
                                        );
                                    })}
                                </div>
                                {/* Inline add action when candidates are selected */}
                                {selectedCount > 0 && (
                                    <Button
                                        variant="primary"
                                        onClick={handleAdd}
                                        isLoading={isAdding}
                                        disabled={isAdding}
                                        className="w-full"
                                    >
                                        Add {selectedCount} Selected to Batch
                                    </Button>
                                )}
                            </>
                        )}
                    </div>
                )}

                {/* Footer — Search Candidates replaces previous Add to Batch primary action per spec */}
                <div className="flex justify-end gap-3 pt-2 border-t border-border mt-1">
                    <Button variant="outline" onClick={handleClose} disabled={isAdding || isSearching}>
                        Cancel
                    </Button>
                    <Button
                        variant="primary"
                        onClick={handleSearch}
                        isLoading={isSearching}
                        disabled={isSearching}
                    >
                        <FiSearch className="w-4 h-4" />
                        Search Candidates
                    </Button>
                </div>
            </div>
        </Modal>
    );
};
