import type { ComponentType } from 'react';
import { UITestPage } from '@/features/ui-test/pages/UITestPage';
import { LoginPage } from '@/features/auth/pages/LoginPage';
// import { BatchListPage } from '@/features/batches/pages/BatchListPage';
import BatchListPage from '@/features/batches/pages/BatchListPage';
import CreateBatchPage from '@/features/batches/pages/CreateBatchPage';
import BatchDetailPage from '@/features/batches/pages/BatchDetailPage';
import ExploreAccountsPage from '@/features/batches/pages/ExploreAccountsPage';
import EnrichAndRankPage from '@/features/batches/pages/EnrichAndRankPage';
import AccountFocusPage from '@/features/batches/pages/AccountFocusPage';
import BatchContactsPage from '@/features/batches/pages/BatchContactsPage';
import DraftMessagesPage from '@/features/batches/pages/DraftMessagesPage';

// Define the shape of our route objects
export interface AppRoute {
    path: string;
    Component: ComponentType;
    protected: boolean;
    allowedRoles?: string[]; // Optional property for role-based access
}

// Explicitly type the array
export const AppRoutes: AppRoute[] = [
    { path: '/login', Component: LoginPage, protected: false },
    { path: '/test', Component: UITestPage, protected: false },
    { path: '/', Component: BatchListPage, protected: true },
    { path: '/batches/new', Component: CreateBatchPage, protected: true },
    { path: '/batches/:batchId', Component: BatchDetailPage, protected: true },
    { path: '/batches/:batchId/accounts', Component: ExploreAccountsPage, protected: true },
    { path: '/batches/:batchId/accounts/enrich', Component: EnrichAndRankPage, protected: true },
    { path: '/batches/:batchId/accounts/:accountId', Component: AccountFocusPage, protected: true },
    { path: '/batches/:batchId/contacts', Component: BatchContactsPage, protected: true },
    { path: '/batches/:batchId/draft', Component: DraftMessagesPage, protected: true },
    // Example protected route:
    // { path: '/users', Component: UsersListPage, protected: true, allowedRoles: ['ADMIN'] }
];