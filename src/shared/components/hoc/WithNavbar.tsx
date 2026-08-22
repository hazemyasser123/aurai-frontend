import React, { useState } from 'react';
import { Sidebar } from '../layout/Sidebar';
import { TopAppBar } from '../layout/TopAppBar';

export function WithNavbar<P extends object>(WrappedComponent: React.ComponentType<P>) {
    const HOCComponent: React.FC<P> = (props) => {
        const [isSidebarOpen, setIsSidebarOpen] = useState(false);

        return (
            <div className="flex h-screen w-full overflow-hidden bg-bg-page">
                <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
                <div className="flex-1 flex flex-col overflow-hidden">
                    <TopAppBar onMenuClick={() => setIsSidebarOpen(true)} />
                    <main className="flex-1 overflow-y-auto p-4 sm:p-6">
                        <WrappedComponent {...props} />
                    </main>
                </div>
            </div>
        );
    };

    const displayName = WrappedComponent.displayName || WrappedComponent.name || 'Component';
    HOCComponent.displayName = `WithNavbar(${displayName})`;

    return HOCComponent;
}