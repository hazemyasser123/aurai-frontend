import React, { useState, useMemo, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Modal, InputField, Button } from '@/shared/components/ui';
import { useSearchContactCandidates } from '@/features/batches/hooks/useSearchContactCandidates';
import { useAddContactCandidates } from '@/features/batches/hooks/useAddContactCandidates';
import { useSeniorityLevels } from '@/features/batches/hooks/useSeniorityLevels';
import type { ContactCandidate } from '@/features/batches/types/batchTypes';
import toast from 'react-hot-toast';
import { getErrorMessage } from '@/shared/utils/errorHandler';
import { FiSearch, FiCheck, FiUser, FiChevronDown, FiX } from 'react-icons/fi';
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

    // Seniority levels — fetched from /batches/seniority-levels, searchable inside dropdown
    const { data: seniorityLevelsData } = useSeniorityLevels();
    const FALLBACK_SENIORITIES = ['c_suite', 'founder_owner', 'partner', 'vp', 'head', 'director', 'manager', 'senior', 'lead', 'junior', 'entry', 'intern'];
    const seniorityLevels = seniorityLevelsData && seniorityLevelsData.length > 0 ? seniorityLevelsData : FALLBACK_SENIORITIES;
    const SENIORITY_LABELS: Record<string, string> = {
        c_suite: 'C-Suite',
        founder_owner: 'Founder / Owner',
        partner: 'Partner',
        vp: 'VP',
        head: 'Head',
        director: 'Director',
        manager: 'Manager',
        senior: 'Senior',
        lead: 'Lead',
        junior: 'Junior',
        entry: 'Entry Level',
        intern: 'Intern',
    };
    const getSeniorityLabel = (v: string) => SENIORITY_LABELS[v] ?? v.split('_').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    const [seniorityOpen, setSeniorityOpen] = useState(false);
    const [dropdownFilter, setDropdownFilter] = useState('');
    const seniorityWrapRef = useRef<HTMLDivElement>(null);
    const seniorityDropdownRef = useRef<HTMLDivElement>(null);
    const [seniorityPos, setSeniorityPos] = useState<{ top: number; left: number; width: number } | null>(null);

    const updateSeniorityPos = () => {
        if (!seniorityWrapRef.current) return;
        const rect = seniorityWrapRef.current.getBoundingClientRect();
        setSeniorityPos({ top: rect.bottom + 4, left: rect.left, width: rect.width });
    };

    useEffect(() => {
        if (!seniorityOpen) return;
        updateSeniorityPos();
        const onReposition = () => updateSeniorityPos();
        window.addEventListener('scroll', onReposition, true);
        window.addEventListener('resize', onReposition);
        return () => {
            window.removeEventListener('scroll', onReposition, true);
            window.removeEventListener('resize', onReposition);
        };
    }, [seniorityOpen]);

    useEffect(() => {
        if (seniorityOpen) setDropdownFilter('');
    }, [seniorityOpen]);

    useEffect(() => {
        const onClickOutside = (e: MouseEvent) => {
            const target = e.target as Node;
            if (seniorityWrapRef.current && seniorityWrapRef.current.contains(target)) return;
            if (seniorityDropdownRef.current && seniorityDropdownRef.current.contains(target)) return;
            setSeniorityOpen(false);
        };
        document.addEventListener('mousedown', onClickOutside);
        return () => document.removeEventListener('mousedown', onClickOutside);
    }, []);

    const filteredSeniorities = useMemo(() => {
        const q = dropdownFilter.trim().toLowerCase();
        if (!q) return seniorityLevels;
        return seniorityLevels.filter((lvl) => lvl.toLowerCase().includes(q) || getSeniorityLabel(lvl).toLowerCase().includes(q));
    }, [seniorityLevels, dropdownFilter]);

    const selectedCount = selected.size;

    const getCandidateId = (c: ContactCandidate, index?: number) =>
        `${c.source}::${c.source_identifier}::${c.email ?? c.first_name + c.last_name}::${index ?? ''}`;

    const selectedCandidates = useMemo(() => {
        if (!Array.isArray(candidates)) return [];
        return candidates.filter((c, idx) => selected.has(getCandidateId(c, idx)));
    }, [candidates, selected]);

    const handleSearch = async () => {
        if (!title.trim() && !seniority.trim()) {
            toast.error('Enter a title or select a seniority level.');
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
        setDropdownFilter('');
        setSeniorityOpen(false);
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

                {/* Filters — Title (free text) + Seniority (searchable dropdown from /batches/seniority-levels) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <InputField
                        label="TITLE"
                        placeholder="e.g. Chief Executive Officer"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        hint="Job title to search for"
                    />
                    <div className="flex flex-col gap-2 w-full" ref={seniorityWrapRef}>
                        <label className="font-sans font-semibold text-xs leading-4 tracking-tight text-primary">
                            SENIORITY LEVEL
                        </label>
                        <button
                            type="button"
                            onClick={() => {
                                updateSeniorityPos();
                                setSeniorityOpen((o) => !o);
                            }}
                            className={`flex items-center justify-between w-full h-11 px-4 py-2.5 bg-bg-input border border-solid rounded-lg font-sans font-normal text-sm leading-5 tracking-tight text-left outline-none transition-[border-color,box-shadow] duration-150 ease-out ${seniorityOpen ? 'border-border-focus shadow-[0_0_0_3px_rgba(127,34,254,0.12)]' : 'border-border hover:border-border-light'} ${seniority ? 'text-fg-strong' : 'text-fg-muted'}`}
                        >
                            <span>{seniority ? getSeniorityLabel(seniority) : 'Select seniority...'}</span>
                            <span className="flex items-center gap-1 shrink-0 ml-2">
                                {seniority && (
                                    <span
                                        role="button"
                                        tabIndex={0}
                                        onMouseDown={(e) => e.preventDefault()}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setSeniority('');
                                            setDropdownFilter('');
                                            setSeniorityOpen(false);
                                        }}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' || e.key === ' ') {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                setSeniority('');
                                                setDropdownFilter('');
                                                setSeniorityOpen(false);
                                            }
                                        }}
                                        className="p-1 rounded hover:bg-bg-muted text-fg-body hover:text-fg transition-colors"
                                        title="Clear"
                                    >
                                        <FiX className="w-3.5 h-3.5" />
                                    </span>
                                )}
                                <FiChevronDown className={`w-4 h-4 text-fg-body transition-transform ${seniorityOpen ? 'rotate-180' : ''}`} />
                            </span>
                        </button>
                        <span className="font-sans font-normal text-xs leading-4 text-fg-muted mt-1">
                            Pick from list only — searchable
                        </span>
                    </div>
                    {seniorityOpen && seniorityPos && createPortal(
                        <div
                            ref={seniorityDropdownRef}
                            style={{ top: seniorityPos.top, left: seniorityPos.left, width: seniorityPos.width, position: 'fixed', zIndex: 60 }}
                            className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl p-2 space-y-1.5 animate-[fadeIn_150ms_ease-out]"
                        >
                            {/* Search inside dropdown — filters allowed values */}
                            <div className="relative">
                                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" />
                                </svg>
                                <input
                                    type="text"
                                    autoFocus
                                    value={dropdownFilter}
                                    onChange={(e) => setDropdownFilter(e.target.value)}
                                    placeholder="Type to filter allowed values..."
                                    className="w-full bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 focus:border-indigo-500/50 outline-none rounded-lg pl-8 pr-3 py-1.5 text-xs font-semibold text-slate-900 dark:text-slate-100 placeholder-slate-400 transition-colors"
                                />
                            </div>
                            <div className="max-h-48 overflow-y-auto space-y-0.5 custom-scrollbar pr-0.5">
                                <button
                                    type="button"
                                    onMouseDown={(e) => e.preventDefault()}
                                    onClick={() => {
                                        setSeniority('');
                                        setDropdownFilter('');
                                        setSeniorityOpen(false);
                                    }}
                                    className={`flex items-center justify-between w-full px-3 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-colors hover:bg-indigo-50 dark:hover:bg-slate-800/80 ${!seniority ? 'bg-indigo-50 dark:bg-slate-800 text-indigo-700 dark:text-indigo-300' : 'text-slate-700 dark:text-slate-200'}`}
                                >
                                    <span>Any seniority</span>
                                    {!seniority && <FiCheck className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />}
                                </button>
                                {filteredSeniorities.length === 0 ? (
                                    <div className="px-3 py-2 text-xs text-slate-400">No matches — try another term</div>
                                ) : (
                                    filteredSeniorities.map((lvl) => {
                                        const selected = seniority === lvl;
                                        return (
                                            <button
                                                key={lvl}
                                                type="button"
                                                onMouseDown={(e) => e.preventDefault()}
                                                onClick={() => {
                                                    setSeniority(lvl);
                                                    setDropdownFilter('');
                                                    setSeniorityOpen(false);
                                                }}
                                                className={`flex items-center justify-between w-full px-3 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-colors hover:bg-indigo-50 dark:hover:bg-slate-800/80 ${selected ? 'bg-indigo-50 dark:bg-slate-800 text-indigo-700 dark:text-indigo-300' : 'text-slate-700 dark:text-slate-200'}`}
                                            >
                                                <span>{getSeniorityLabel(lvl)}</span>
                                                {selected && <FiCheck className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />}
                                            </button>
                                        );
                                    })
                                )}
                            </div>
                        </div>,
                        document.body
                    )}
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
