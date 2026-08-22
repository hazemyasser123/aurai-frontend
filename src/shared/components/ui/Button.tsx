import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'gradient' | 'outline' | 'ghost' | 'inactive' | 'danger';
    isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
    children, variant = 'primary', isLoading, className = '', disabled, ...props
}) => {
    const baseClasses = 'inline-flex justify-center items-center gap-3 px-4 py-2 min-w-[120px] max-w-[320px] h-11 font-sans font-semibold text-xs leading-4 tracking-tight rounded-md cursor-pointer transition-[transform,background-color,color,border-color] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] active:scale-[0.97] disabled:opacity-70 disabled:cursor-not-allowed disabled:active:scale-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2';

    const isInteractive = !disabled && !isLoading;

    const variantClasses = {
        primary: `border border-solid border-transparent bg-primary text-bg-muted ${isInteractive ? 'hover:bg-bg-card hover:text-primary hover:border-primary' : ''}`,
        gradient: `border border-solid border-transparent bg-gradient-brand text-bg-muted ${isInteractive ? 'hover:brightness-110' : ''}`,
        outline: `border border-solid border-primary bg-transparent text-primary ${isInteractive ? 'hover:bg-primary hover:text-bg-muted' : ''}`,
        ghost: `border-none bg-transparent text-primary ${isInteractive ? 'hover:text-primary-dark hover:underline' : ''}`,
        inactive: `border border-solid border-transparent bg-bg-muted text-fg-medium cursor-not-allowed`,
        // Added Danger variant
        danger: `border border-solid border-transparent bg-danger text-fg-white ${isInteractive ? 'hover:bg-danger/90 hover:brightness-110' : ''}`,
    };

    return (
        <button
            className={`${baseClasses} ${variantClasses[variant]} ${className}`}
            disabled={disabled || isLoading}
            {...props}
        >
            {isLoading ? 'Loading...' : children}
        </button>
    );
};