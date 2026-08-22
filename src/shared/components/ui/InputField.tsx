import React from 'react';

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    hint?: string;
}

export const InputField: React.FC<InputFieldProps> = ({
    label, error, hint, className = '', id, ...props
}) => {
    return (
        <div className="flex flex-col gap-2 w-full">
            {label && (
                <label htmlFor={id} className="font-sans font-semibold text-xs leading-4 tracking-tight text-primary">
                    {label}
                </label>
            )}
            <input
                id={id}
                // Transition specific properties (border-color, box-shadow) instead of 'all'
                className={`flex items-center gap-3 w-full h-11 px-4 py-2.5 bg-bg-input border border-solid border-border rounded-lg font-sans font-normal text-sm leading-5 tracking-tight text-fg-strong outline-none transition-[border-color,box-shadow] duration-150 ease-out placeholder:text-fg-body focus:border-border-focus focus:shadow-[0_0_0_3px_rgba(127,34,254,0.12)] disabled:bg-bg-muted disabled:text-fg-muted disabled:cursor-not-allowed ${error ? 'border-danger focus:border-danger focus:shadow-[0_0_0_3px_rgba(231,0,11,0.18)]' : ''
                    } ${className}`}
                {...props}
            />
            {error ? (
                <span className="font-sans font-normal text-xs leading-4 text-danger mt-1">{error}</span>
            ) : hint ? (
                <span className="font-sans font-normal text-xs leading-4 text-fg-muted mt-1">{hint}</span>
            ) : null}
        </div>
    );
};