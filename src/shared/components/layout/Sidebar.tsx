import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { FiGrid, FiSliders, FiLogOut, FiX, FiMessageSquare, FiUsers, FiEdit3 } from 'react-icons/fi';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '@/shared/redux/store/store';
import { logout } from '@/shared/redux/slices/authSlice';
import { Modal, Button } from '@/shared/components/ui';
import mainIcon from '@/assets/mainIcon.svg';

const getInitials = (username: string): string => {
    if (!username) return '';
    const parts = username.split(/[ ._-]+/).filter(Boolean);
    if (parts.length === 0) return username.substring(0, 2).toUpperCase();
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
};

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useSelector((state: RootState) => state.auth);
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

    const handleConfirmLogout = () => {
        dispatch(logout());
        setIsLogoutModalOpen(false);
        onClose(); // Close drawer on logout
        navigate('/login');
    };

    const navItems = [
        { name: 'Selling Products', icon: FiGrid, path: '/products' },
        { name: 'Outreach Batches', icon: FiSliders, path: '/' },
        { name: 'Conversations', icon: FiMessageSquare, path: '/conversations' },
    ];
    const isActive = (path: string) => {
        if (path === '/') return location.pathname === '/' || location.pathname.startsWith('/batches');
        if (path === '/conversations') return location.pathname.startsWith('/conversations');
        return location.pathname.startsWith(path);
    };

    const isAdmin = user?.role === 'ADMIN';

    return (
        <>
            {/* Mobile Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={onClose}
                />
            )}

            {/* Sidebar Container */}
            <aside
                className={`fixed lg:static inset-y-0 left-0 z-50 w-sidebar h-screen bg-bg-sidebar border-r border-border flex flex-col transform transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
                    }`}
            >
                {/* Top Section */}
                <div className="flex-1 flex flex-col">
                    <div className="px-6 py-6 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <img src={mainIcon} alt="Aurai Icon" className="w-6 h-6 object-contain" />
                            <h1 className="font-sans font-bold text-lg tracking-tight text-fg">Aurai Sales Copilot</h1>
                        </div>
                        {/* Close button for mobile */}
                        <button onClick={onClose} className="lg:hidden text-fg-body hover:text-fg">
                            <FiX className="w-5 h-5" />
                        </button>
                    </div>

                    <nav className="flex flex-col gap-1 px-0 mt-4">
                        {navItems.map((item) => {
                            const active = isActive(item.path);
                            return (
                                <NavLink
                                    key={item.name}
                                    to={item.path}
                                    onClick={onClose}
                                    className={`flex items-center gap-3 px-6 py-3 font-sans font-medium text-sm tracking-tight transition-colors ${active ? 'bg-bg-purple-soft text-fg' : 'text-fg-body hover:bg-bg-muted/50'
                                        }`}
                                >
                                    <item.icon className="w-4.5 h-4.5" strokeWidth={1.5} />
                                    <span>{item.name}</span>
                                </NavLink>
                            );
                        })}
                        {isAdmin && (
                            <>
                                <NavLink
                                    to="/users"
                                    onClick={onClose}
                                    className={`flex items-center gap-3 px-6 py-3 font-sans font-medium text-sm tracking-tight transition-colors ${isActive('/users') ? 'bg-bg-purple-soft text-fg' : 'text-fg-body hover:bg-bg-muted/50'
                                        }`}
                                >
                                    <FiUsers className="w-4.5 h-4.5" strokeWidth={1.5} />
                                    <span>Users</span>
                                </NavLink>
                                <NavLink
                                    to="/prompt-lab"
                                    onClick={onClose}
                                    className={`flex items-center gap-3 px-6 py-3 font-sans font-medium text-sm tracking-tight transition-colors ${isActive('/prompt-lab') ? 'bg-bg-purple-soft text-fg' : 'text-fg-body hover:bg-bg-muted/50'
                                        }`}
                                >
                                    <FiEdit3 className="w-4.5 h-4.5" strokeWidth={1.5} />
                                    <span>Prompt Lab</span>
                                </NavLink>
                            </>
                        )}
                    </nav>
                </div>

                {/* Bottom Section */}
                <div className="p-4 border-t border-border flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 overflow-hidden">
                        <div className="w-10 h-10 rounded-full bg-bg-purple-soft flex items-center justify-center shrink-0">
                            <span className="font-sans font-bold text-base text-primary-accent">
                                {getInitials(user?.username || '')}
                            </span>
                        </div>
                        <span className="font-sans font-medium text-sm text-fg truncate">
                            {user?.username || 'Guest'}
                        </span>
                    </div>

                    <button
                        onClick={() => setIsLogoutModalOpen(true)}
                        className="p-2 rounded-md text-fg-body hover:text-danger hover:bg-danger-bg transition-colors"
                        title="Logout"
                    >
                        <FiLogOut className="w-5 h-5" />
                    </button>
                </div>
            </aside>

            <Modal isOpen={isLogoutModalOpen} onClose={() => setIsLogoutModalOpen(false)} title="Confirm Logout">
                <div className="flex flex-col gap-6">
                    <p className="text-fg-body">Are you sure you want to log out of your account?</p>
                    <div className="flex justify-end gap-3">
                        <Button variant="ghost" onClick={() => setIsLogoutModalOpen(false)}>Cancel</Button>
                        <Button variant="danger" onClick={handleConfirmLogout}>Logout</Button>
                    </div>
                </div>
            </Modal>
        </>
    );
};