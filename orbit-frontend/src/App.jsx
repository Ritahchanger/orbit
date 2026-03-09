// App.jsx
import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import ScrollToTop from './globals/hooks/ScrollToTop';
import AdminModalRoot from './admin-pages/modals/modal-root/AdminModalRoot.jsx';
import { ModalProvider } from './context/modal-context/ModalContext.jsx';
import ModalSetup from './config/ModalSetup.jsx';
import ProtectedRoute from './components/auth/ProtectedRoute.jsx';
import { publicRoutes, protectedRoutes } from './config/routes.config.jsx';
import InstallPrompt from './globals/prompts/InstallModal.jsx';
const App = () => {
  return (
    <ModalProvider>
      <ModalSetup />
      <InstallPrompt/>
      <ScrollToTop />
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 1500,
          style: {
            background: '#ffffff',
            color: '#1f2937',
            border: '1px solid #e5e7eb',
            borderRadius: '0.125rem'
          },
          success: {
            style: {
              background: '#f0fdf4',
              color: '#166534',
              border: '1px solid #bbf7d0',
              borderRadius: '0.125rem'
            },
            iconTheme: {
              primary: '#16a34a',
              secondary: '#ffffff',
            },
          },
          error: {
            style: {
              background: '#fef2f2',
              color: '#991b1b',
              border: '1px solid #fecaca',
              borderRadius: '0.125rem'
            },
            iconTheme: {
              primary: '#dc2626',
              secondary: '#ffffff',
            },
          },
          loading: {
            style: {
              background: '#f8fafc',
              color: '#475569',
              border: '1px solid #cbd5e1',
              borderRadius: '0.125rem'
            },
          },
        }}
      />
      
      <Routes>
        {publicRoutes.map((route, index) => (
          <Route
            key={`public-${index}`}
            path={route.path}
            element={route.element}
          />
        ))}

        {protectedRoutes.map((route, index) => (
          <Route
            key={`protected-${index}`}
            path={route.path}
            element={
              <ProtectedRoute roles={route.roles}>
                {route.element}
              </ProtectedRoute>
            }
          />
        ))}
      </Routes>

      <AdminModalRoot />
    </ModalProvider>
  );
};

export default App;