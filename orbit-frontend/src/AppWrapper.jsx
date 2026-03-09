import { BrowserRouter as Router } from 'react-router-dom';
import { ErrorBoundary } from 'react-error-boundary';
import { AuthProvider } from './context/authentication/AuthenticationContext';
import ErrorFallback from './ErrrorBoundary';
import App from './App';
import "./globals/styles/HeroSection.css"
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { StoreProvider } from './context/store/StoreContext';
import { StoreRoleProvider } from './context/authentication/RoleContext';
import { Suspense } from 'react';
import { PermissionsProvider } from './context/permissions/permissions-context';
import { RolePermissionProvider } from './context/RolePermissionContext';
import { ThemeProvider } from './context/theme-context/ThemeContext';

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 1000 * 50 * 5,
            gcTime: 1000 * 60 * 10,
            refetchOnWindowFocus: true,
            retry: 1,
        }
    }
})

const AppWrapper = () => {
    const logError = (error, errorInfo) => {
        console.error('Error caught by ErrorBoundary:', error);
        console.error('Error Info:', errorInfo);
    };

    return (
        <ErrorBoundary
            FallbackComponent={ErrorFallback}
            onError={logError}
            onReset={() => {
                console.log('Error boundary reset');
            }}
        >
            <QueryClientProvider client={queryClient}>
                <Router>
                    <StoreProvider>
                        <AuthProvider>
                            <RolePermissionProvider>
                                <PermissionsProvider>
                                    <StoreRoleProvider>
                                        <ThemeProvider>
                                            <Suspense fallback={
                                                <div className="min-h-screen bg-white dark:bg-gray-800 flex items-center justify-center">
                                                    <div className="text-center">
                                                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-500 mx-auto mb-4"></div>
                                                        <p className="text-gray-600 dark:text-gray-400">Loading application...</p>
                                                    </div>
                                                </div>
                                            }>
                                                <App />
                                            </Suspense>
                                        </ThemeProvider>
                                    </StoreRoleProvider>
                                </PermissionsProvider>
                            </RolePermissionProvider>
                        </AuthProvider>
                    </StoreProvider>
                    {/* <ReactQueryDevtools initialIsOpen={false} panelProps={{ style: { display: "none" } }} /> */}
                </Router>
            </QueryClientProvider>
        </ErrorBoundary>
    );
};

export default AppWrapper;