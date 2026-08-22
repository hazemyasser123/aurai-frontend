import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: 'default' | 'elevated' | 'inner';
}

export const Card: React.FC<CardProps> = ({
    children, variant = 'default', className = '', ...props
}) => {
    const variants = {
        default: 'bg-bg-sidebar border border-solid border-border rounded-xl shadow-[0px_1px_2px_rgba(0,0,0,0.05)] p-6',
        elevated: 'bg-bg-sidebar border border-solid border-border rounded-xl shadow-[0px_4px_12px_rgba(0,0,0,0.04)] p-6',
        inner: 'bg-bg-card rounded-lg p-4',
    };

    return (
        <div className={`${variants[variant]} ${className}`} {...props}>
            {children}
        </div>
    );
};