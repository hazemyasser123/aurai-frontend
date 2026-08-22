import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from '@/shared/redux/store/store';
import { AppRoutes } from '@/shared/routing/Routes';
import { ProtectedRoute } from '@/shared/routing/ProtectedRoutes';

function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <Toaster position="top-right" />
        <Routes>
          {AppRoutes.map(({ path, Component, protected: isProtected, allowedRoles }) => {
            const RouteElement = <Component />;
            return (
              <Route
                key={path}
                path={path}
                element={isProtected ? <ProtectedRoute allowedRoles={allowedRoles}>{RouteElement}</ProtectedRoute> : RouteElement}
              />
            );
          })}
        </Routes>
      </PersistGate>
    </Provider>
  );
}

export default App;