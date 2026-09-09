import type { ComponentType } from 'react';
import { UITestPage } from '@/features/ui-test/pages/UITestPage';
import { LoginPage } from '@/features/auth/pages/LoginPage';
// import { BatchListPage } from '@/features/batches/pages/BatchListPage';
import BatchListPage from '@/features/batches/pages/BatchListPage';
import CreateBatchPage from '@/features/batches/pages/CreateBatchPage';
import BatchDetailPage from '@/features/batches/pages/BatchDetailPage';
import AccountFocusPage from '@/features/batches/pages/AccountFocusPage';
import ContactDetailsPage from '@/features/batches/pages/ContactDetailsPage';
import { FlowRedirectPage } from '@/features/batches/pages/FlowRedirectPage';
import ProductsPage from '@/features/products/pages/ProductsPage';
import RegisterProductPage from '@/features/products/pages/RegisterProductPage';
import ProductSourcesPage from '@/features/products/pages/ProductSourcesPage';
import ProductTriggerPage from '@/features/products/pages/ProductTriggerPage';
import ProductWorkspacePage from '@/features/products/pages/ProductWorkspacePage';
import ProductAnalyzePlaceholderPage from '@/features/products/pages/ProductAnalyzePlaceholderPage';
import ConversationsPage from '@/features/conversations/pages/ConversationsPage';
import { UsersPage } from '@/features/users/pages/UsersPage';
import PromptLabPage from '@/features/prompt-lab/pages/PromptLabPage';

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
    { path: '/products/register', Component: RegisterProductPage, protected: true },
    { path: '/products/:productId/sources', Component: ProductSourcesPage, protected: true },
    { path: '/products/:productId/trigger', Component: ProductTriggerPage, protected: true },
    { path: '/products/:productId', Component: ProductWorkspacePage, protected: true },
    { path: '/products/:productId/sources/analyze-placeholder', Component: ProductAnalyzePlaceholderPage, protected: true },
    { path: '/products', Component: ProductsPage, protected: true },
    { path: '/', Component: BatchListPage, protected: true },
    { path: '/batches/new', Component: CreateBatchPage, protected: true },
    { path: '/batches/:batchId', Component: BatchDetailPage, protected: true },
    { path: '/batches/:batchId/accounts', Component: FlowRedirectPage, protected: true },
    { path: '/batches/:batchId/accounts/enrich', Component: FlowRedirectPage, protected: true },
    { path: '/batches/:batchId/accounts/:accountId', Component: AccountFocusPage, protected: true },
    { path: '/batches/:batchId/contacts', Component: FlowRedirectPage, protected: true },
    { path: '/batches/:batchId/draft', Component: FlowRedirectPage, protected: true },
    { path: '/contacts/:contactId', Component: ContactDetailsPage, protected: true },
    { path: '/conversations', Component: ConversationsPage, protected: true },
    { path: '/users', Component: UsersPage, protected: true, allowedRoles: ['ADMIN'] },
    { path: '/prompt-lab', Component: PromptLabPage, protected: true },
    // Example protected route:
    // { path: '/users', Component: UsersListPage, protected: true, allowedRoles: ['ADMIN'] }
];