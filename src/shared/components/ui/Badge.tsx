import React from 'react';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
    variant?: 'success' | 'warning' | 'info' | 'danger' | 'orange' | 'primary' | 'ghost';
}

export const Badge: React.FC<BadgeProps> = ({
    children, variant = 'success', className = '', ...props
}) => {
    const baseClasses = 'inline-flex justify-center items-center px-3 py-1.5 rounded-full font-sans font-medium text-xs leading-4';

    const variantClasses = {
        success: 'bg-success-bg text-success',
        warning: 'bg-warning-bg text-warning',
        info: 'bg-info-bg text-info',
        danger: 'bg-danger-bg text-danger',
        orange: 'bg-orange-bg text-orange',
        primary: 'bg-primary/10 text-primary border border-primary/20',
        ghost: 'bg-bg-muted text-fg-body border border-border',
    };

    return (
        <span className={`${baseClasses} ${variantClasses[variant]} ${className}`} {...props}>
            {children}
        </span>
    );
};