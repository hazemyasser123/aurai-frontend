import React, { useState, useRef, useEffect } from 'react';
import { FiPlus, FiCheck, FiX } from 'react-icons/fi';

interface TagInputProps {
    label?: string;
    values: string[];
    onChange: (newValues: string[]) => void;
    placeholder?: string;
    hint?: string;
    error?: string;
}

export const TagInput: React.FC<TagInputProps> = ({
    label, values = [], onChange, hint, error
}) => {
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [draftValue, setDraftValue] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);

    // Focus the input when a new tag is added
    useEffect(() => {
        if (editingIndex !== null && inputRef.current) {
            inputRef.current.focus();
        }
    }, [editingIndex]);

    const handleAddClick = () => {
        // Add an empty string temporarily to hold the place in the UI
        const newValues = [...values, ""];
        onChange(newValues);
        setEditingIndex(newValues.length - 1);
        setDraftValue("");
    };

    const commitEdit = (index: number) => {
        const trimmed = draftValue.trim();
        let newValues = [...values];

        if (trimmed) {
            newValues[index] = trimmed;
        } else {
            // If empty, remove it entirely
            newValues.splice(index, 1);
        }
        onChange(newValues);
        setEditingIndex(null);
    };

    const cancelEdit = (index: number) => {
        let newValues = [...values];
        if (newValues[index] === "") {
            newValues.splice(index, 1);
        }
        onChange(newValues);
        setEditingIndex(null);
    };

    const removeTag = (index: number) => {
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

    return (
        <div className="flex flex-col gap-2 w-full">
            {label && (
                <label className="font-sans font-semibold text-xs tracking-tight text-primary">
                    {label}
                </label>
            )}
            <div className={`flex flex-wrap items-center gap-2 bg-bg-input border border-solid rounded-lg p-2 min-h-[44px] transition-[border-color,box-shadow] duration-150 ease-out focus-within:border-border-focus focus-within:shadow-[0_0_0_3px_rgba(127,34,254,0.12)] ${error ? 'border-danger' : 'border-border'}`}>
                {values.map((tag, index) => (
                    <div key={index} className="flex items-center gap-2 bg-bg-page border border-border rounded-md pl-3 py-1.5">
                        {editingIndex === index ? (
                            <>
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={draftValue}
                                    onChange={(e) => setDraftValue(e.target.value)}
                                    onKeyDown={(e) => handleKeyDown(e, index)}
                                    onBlur={() => commitEdit(index)}
                                    placeholder="Type value..."
                                    className="bg-transparent border-none outline-none font-sans font-medium text-xs text-fg-strong w-28"
                                />
                                <button
                                    type="button"
                                    onMouseDown={(e) => e.preventDefault()} // Prevent blur before click
                                    onClick={() => commitEdit(index)}
                                    className="text-success hover:opacity-80 px-1"
                                >
                                    <FiCheck className="w-3.5 h-3.5" />
                                </button>
                            </>
                        ) : (
                            <>
                                <div className="w-2 h-2 rounded-full bg-fg-subtle"></div>
                                <span className="font-sans font-medium text-xs text-fg-medium">{tag}</span>
                                <button
                                    type="button"
                                    onClick={() => removeTag(index)}
                                    className="text-fg-body hover:text-danger transition-colors ml-1"
                                >
                                    <FiX className="w-3.5 h-3.5" />
                                </button>
                            </>
                        )}
                    </div>
                ))}

                {/* The Add Button */}
                <button
                    type="button"
                    onClick={handleAddClick}
                    className="flex items-center gap-1.5 px-2 py-1.5 rounded-md text-primary border border-dashed border-border hover:bg-bg-page hover:border-primary transition-colors"
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