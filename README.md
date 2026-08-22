
```
aurai-frontend
├─ .env
├─ eslint.config.js
├─ figmacss.txt
├─ index.html
├─ opencode.json
├─ package-lock.json
├─ package.json
├─ public
│  ├─ favicon.svg
│  └─ icons.svg
├─ README.md
├─ src
│  ├─ App.tsx
│  ├─ assets
│  │  └─ mainIcon.svg
│  ├─ features
│  │  ├─ accounts
│  │  │  ├─ components
│  │  │  └─ pages
│  │  ├─ admin
│  │  │  ├─ components
│  │  │  └─ pages
│  │  ├─ auth
│  │  │  ├─ hooks
│  │  │  │  └─ useLogin.ts
│  │  │  ├─ pages
│  │  │  │  └─ LoginPage.tsx
│  │  │  ├─ schemas
│  │  │  │  └─ authSchemas.ts
│  │  │  └─ types
│  │  │     └─ authTypes.ts
│  │  ├─ batches
│  │  │  ├─ components
│  │  │  │  ├─ BatchCard.tsx
│  │  │  │  ├─ BatchCardSkeleton.tsx
│  │  │  │  └─ tabs
│  │  │  │     ├─ AccountsTab.tsx
│  │  │  │     ├─ BatchOverviewTab.tsx
│  │  │  │     ├─ IcpTab.tsx
│  │  │  │     └─ ProductIntelligenceTab.tsx
│  │  │  ├─ data
│  │  │  │  └─ accountsData.json
│  │  │  ├─ hooks
│  │  │  │  ├─ useBatch.ts
│  │  │  │  ├─ useBatches.ts
│  │  │  │  ├─ useCreateBatch.ts
│  │  │  │  └─ useFindAccounts.ts
│  │  │  ├─ pages
│  │  │  │  ├─ BatchDetailPage.tsx
│  │  │  │  ├─ BatchListPage.tsx
│  │  │  │  ├─ CreateBatchPage.tsx
│  │  │  │  └─ ExploreAccountsPage.tsx
│  │  │  ├─ schemas
│  │  │  │  └─ batchSchemas.ts
│  │  │  └─ types
│  │  │     └─ batchTypes.ts
│  │  ├─ contacts
│  │  │  ├─ components
│  │  │  └─ pages
│  │  ├─ outreach
│  │  │  ├─ components
│  │  │  └─ pages
│  │  ├─ products
│  │  │  ├─ components
│  │  │  ├─ hooks
│  │  │  │  └─ useProducts.ts
│  │  │  ├─ pages
│  │  │  └─ types
│  │  │     └─ productTypes.ts
│  │  ├─ ui-test
│  │  │  └─ pages
│  │  │     └─ UITestPage.tsx
│  │  └─ users
│  │     ├─ components
│  │     └─ pages
│  ├─ index.css
│  ├─ main.tsx
│  └─ shared
│     ├─ components
│     │  ├─ animations
│     │  ├─ hoc
│     │  │  └─ WithNavbar.tsx
│     │  ├─ layout
│     │  │  ├─ DashboardLayout.tsx
│     │  │  ├─ Sidebar.tsx
│     │  │  └─ TopAppBar.tsx
│     │  ├─ table
│     │  └─ ui
│     │     ├─ Badge.tsx
│     │     ├─ Button.tsx
│     │     ├─ Card.tsx
│     │     ├─ index.ts
│     │     ├─ InputField.tsx
│     │     ├─ Modal.tsx
│     │     ├─ Select.tsx
│     │     ├─ Skeleton.tsx
│     │     ├─ TagInput.tsx
│     │     └─ Textarea.tsx
│     ├─ hooks
│     │  └─ useTheme.ts
│     ├─ queries
│     │  ├─ accounts
│     │  ├─ admin
│     │  ├─ auth
│     │  │  └─ authApi.ts
│     │  ├─ axiosInstance.ts
│     │  ├─ batches
│     │  │  ├─ batchApi.ts
│     │  │  └─ batchQueries.ts
│     │  ├─ contacts
│     │  ├─ outreach
│     │  ├─ products
│     │  │  ├─ productApi.ts
│     │  │  └─ productQueries.ts
│     │  └─ users
│     ├─ redux
│     │  ├─ slices
│     │  │  └─ authSlice.ts
│     │  └─ store
│     │     └─ store.ts
│     ├─ routing
│     │  ├─ ProtectedRoutes.tsx
│     │  └─ Routes.tsx
│     ├─ types
│     └─ utils
│        ├─ errorHandler.ts
│        └─ simulateApi.ts
├─ tsconfig.app.json
├─ tsconfig.json
├─ tsconfig.node.json
└─ vite.config.ts

```