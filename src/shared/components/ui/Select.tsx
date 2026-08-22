import React from 'react';
import { FiChevronDown } from 'react-icons/fi';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    error?: string;
    hint?: string;
}

export const Select: React.FC<SelectProps> = ({
    label, error, hint, className = '', id, children, ...props
}) => {
    return (
        <div className="flex flex-col gap-2 w-full">
            {label && (
                <label htmlFor={id} className="font-sans font-semibold text-xs leading-4 tracking-tight text-primary">
                    {label}
                </label>
            )}
            <div className="relative w-full">
                <select
                    id={id}
                    className={`appearance-none flex items-center w-full h-11 px-4 py-2.5 bg-bg-input border border-solid rounded-lg font-sans font-normal text-sm leading-5 tracking-tight text-fg-strong outline-none transition-[border-color,box-shadow] duration-150 ease-out disabled:bg-bg-muted disabled:text-fg-muted disabled:cursor-not-allowed cursor-pointer ${error
                            ? 'border-danger focus:border-danger focus:shadow-[0_0_0_3px_rgba(231,0,11,0.18)]'
                            : 'border-border focus:border-border-focus focus:shadow-[0_0_0_3px_rgba(127,34,254,0.12)]'
                        } ${className}`}
                    {...props}
                >
                    {children}
                </select>
                <FiChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-fg-body pointer-events-none" />
            </div>
            {error ? (
                <span className="font-sans font-normal text-xs leading-4 text-danger mt-1">{error}</span>
            ) : hint ? (
                <span className="font-sans font-normal text-xs leading-4 text-fg-muted mt-1">{hint}</span>
            ) : null}
        </div>
    );
};