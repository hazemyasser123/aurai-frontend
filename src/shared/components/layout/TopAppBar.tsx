import React from 'react';
import { FiSun, FiMoon, FiMenu } from 'react-icons/fi';
import { useSelector } from 'react-redux';
import type { RootState } from '@/shared/redux/store/store';
import { useTheme } from '@/shared/hooks/useTheme';

const getInitials = (username: string): string => {
    if (!username) return '';
    const parts = username.split(/[ ._-]+/).filter(Boolean);
    if (parts.length === 0) return username.substring(0, 2).toUpperCase();
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
};

interface TopAppBarProps {
    onMenuClick: () => void;
}

export const TopAppBar: React.FC<TopAppBarProps> = ({ onMenuClick }) => {
    const { user } = useSelector((state: RootState) => state.auth);
    const { theme, toggleTheme } = useTheme();

    return (
        <header className="h-16 border-b border-border flex items-center justify-between px-4 sm:px-6 bg-bg-page shrink-0 transition-colors duration-150">
            <div className="flex items-center gap-3">
                {/* Hamburger menu for mobile */}
                <button
                    onClick={onMenuClick}
                    className="lg:hidden p-2 -ml-2 text-fg-body hover:text-fg rounded-md hover:bg-bg-muted"
                >
                    <FiMenu className="w-6 h-6" />
                </button>
                <span className="font-sans font-medium text-sm sm:text-base tracking-tight text-fg-muted hidden sm:block">
                    Platform / Product Intelligence
                </span>
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
                {/* Dark/Light Mode Toggle */}
                <div className="flex items-center gap-1 bg-bg-muted rounded-full p-1">
                    <button
                        onClick={toggleTheme}
                        className={`p-1.5 sm:p-2 rounded-full transition-colors ${theme === 'dark' ? 'bg-bg-card shadow-sm text-primary' : 'text-fg-body hover:text-fg'}`}
                        title="Switch to Dark Mode"
                    >
                        <FiMoon className="w-4 h-4" />
                    </button>
                    <button
                        onClick={toggleTheme}
                        className={`p-1.5 sm:p-2 rounded-full transition-colors ${theme === 'light' ? 'bg-bg-card shadow-sm text-primary' : 'text-fg-body hover:text-fg'}`}
                        title="Switch to Light Mode"
                    >
                        <FiSun className="w-4 h-4" />
                    </button>
                </div>

                {/* Profile Initials (Dynamic) */}
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-bg-purple-soft flex items-center justify-center">
                    <span className="font-sans font-bold text-sm sm:text-base text-primary-accent">
                        {getInitials(user?.username || '')}
                    </span>
                </div>
            </div>
        </header>
    );
};