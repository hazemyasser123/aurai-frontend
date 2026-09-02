import React, { useState, useRef, useEffect } from 'react';
import { FiPlus, FiCheck, FiX } from 'react-icons/fi';

interface TagInputProps {
    label?: string;
    values: string[];
    onChange: (newValues: string[]) => void;
    placeholder?: string;
    hint?: string;
    error?: string;
    /** When true, draft must be a valid email before the check button commits */
    validateAsEmail?: boolean;
    disabled?: boolean;
}

const isValidEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

export const TagInput: React.FC<TagInputProps> = ({
    label, values = [], onChange, hint, error, validateAsEmail = false, disabled = false,
}) => {
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [draftValue, setDraftValue] = useState("");
    const [draftError, setDraftError] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Focus the input when a new tag is added
    useEffect(() => {
        if (editingIndex !== null && inputRef.current) {
            inputRef.current.focus();
        }
    }, [editingIndex]);

    const handleAddClick = () => {
        if (disabled) return;
        // Add an empty string temporarily to hold the place in the UI
        const newValues = [...values, ""];
        onChange(newValues);
        setEditingIndex(newValues.length - 1);
        setDraftValue("");
        setDraftError(null);
    };

    const commitEdit = (index: number) => {
        const trimmed = draftValue.trim();

        // Email validation — block the green check until it passes
        if (validateAsEmail && trimmed && !isValidEmail(trimmed)) {
            setDraftError("Please enter a valid email address");
            inputRef.current?.focus();
            return;
        }

        let newValues = [...values];

        if (trimmed) {
            newValues[index] = trimmed;
        } else {
            // If empty, remove it entirely
            newValues.splice(index, 1);
        }
        onChange(newValues);
        setEditingIndex(null);
        setDraftError(null);
    };

    const cancelEdit = (index: number) => {
        let newValues = [...values];
        if (newValues[index] === "") {
            newValues.splice(index, 1);
        }
        onChange(newValues);
        setEditingIndex(null);
        setDraftError(null);
    };

    const removeTag = (index: number) => {
        if (disabled) return;
        onChange(values.filter((_, i) => i !== index));
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            commitEdit(index);
        } else if (e.key === 'Escape') {
            e.preventDefault();
            cancelEdit(index);
        }
    };

    const draftTrimmed = draftValue.trim();
    const isDraftValid = !validateAsEmail || !draftTrimmed || isValidEmail(draftTrimmed);
    const canCommit = draftTrimmed.length === 0 || isDraftValid;

    return (
        <div className="flex flex-col gap-2 w-full">
            {label && (
                <label className="font-sans font-semibold text-xs tracking-tight text-primary">
                    {label}
                </label>
            )}
            <div className={`flex flex-wrap items-center gap-2 border border-solid rounded-lg p-2 min-h-[44px] transition-[border-color,box-shadow] duration-150 ease-out ${disabled ? 'bg-bg-muted opacity-60 cursor-not-allowed' : 'bg-bg-input focus-within:border-border-focus focus-within:shadow-[0_0_0_3px_rgba(127,34,254,0.12)]'} ${error ? 'border-danger' : 'border-border'}`}>
                {values.map((tag, index) => {
                    const isEditingThis = editingIndex === index;
                    const showInvalid = isEditingThis && !isDraftValid;
                    return (
                    <div key={index} className={`flex items-center gap-2 bg-bg-page border rounded-md pl-3 py-1.5 ${showInvalid ? 'border-danger bg-danger-bg/30' : 'border-border'}`}>
                        {editingIndex === index ? (
                            <>
                                <div className="flex flex-col">
                                    <div className="flex items-center gap-1">
                                        <input
                                            ref={inputRef}
                                            type="text"
                                            value={draftValue}
                                            onChange={(e) => {
                                                setDraftValue(e.target.value);
                                                if (draftError) setDraftError(null);
                                            }}
                                            onKeyDown={(e) => handleKeyDown(e, index)}
                                            onBlur={() => {
                                                // Only auto-commit on blur if valid; otherwise keep editing and show error
                                                if (isDraftValid || draftTrimmed.length === 0) commitEdit(index);
                                                else if (validateAsEmail && draftTrimmed && !isValidEmail(draftTrimmed)) {
                                                    setDraftError("Please enter a valid email address");
                                                }
                                            }}
                                            placeholder={validateAsEmail ? "name@company.com" : "Type value..."}
                                            className={`bg-transparent border-none outline-none font-sans font-medium text-xs w-28 ${!isDraftValid ? 'text-danger' : 'text-fg-strong'}`}
                                        />
                                        <button
                                            type="button"
                                            onMouseDown={(e) => e.preventDefault()} // Prevent blur before click
                                            onClick={() => commitEdit(index)}
                                            disabled={!canCommit}
                                            title={!canCommit ? "Please enter a valid email" : "Add"}
                                            className={`px-1 transition-opacity ${canCommit ? 'text-success hover:opacity-80' : 'text-fg-muted opacity-40 cursor-not-allowed'}`}
                                        >
                                            <FiCheck className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                    {draftError && (
                                        <span className="font-sans font-normal text-[10px] leading-3 text-danger mt-0.5">{draftError}</span>
                                    )}
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="w-2 h-2 rounded-full bg-fg-subtle"></div>
                                <span className="font-sans font-medium text-xs text-fg-medium">{tag}</span>
                                <button
                                    type="button"
                                    onClick={() => removeTag(index)}
                                    disabled={disabled}
                                    className={`ml-1 transition-colors ${disabled ? 'text-fg-muted cursor-not-allowed opacity-40' : 'text-fg-body hover:text-danger'}`}
                                >
                                    <FiX className="w-3.5 h-3.5" />
                                </button>
                            </>
                        )}
                    </div>
                    );
                })}

                {/* The Add Button */}
                <button
                    type="button"
                    onClick={handleAddClick}
                    disabled={disabled}
                    className={`flex items-center gap-1.5 px-2 py-1.5 rounded-md border border-dashed transition-colors ${disabled ? 'text-fg-muted border-border opacity-40 cursor-not-allowed' : 'text-primary border-border hover:bg-bg-page hover:border-primary'}`}
                >
                    <FiPlus className="w-3.5 h-3.5" />
                    <span className="font-sans font-semibold text-xs">Add</span>
                </button>
            </div>
            {error ? (
                <span className="font-sans font-normal text-xs leading-4 text-danger mt-1">{error}</span>
            ) : hint ? (
                <span className="font-sans font-normal text-xs leading-4 text-fg-muted mt-1">{hint}</span>
            ) : null}
        </div>
    );
};