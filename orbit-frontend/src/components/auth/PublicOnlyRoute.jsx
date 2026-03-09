// components/auth/PublicOnlyRoute.jsx
import { Navigate } from 'react-router-dom';


import { useAuth } from '../../context/authentication/AuthenticationContext';


import UniversalPreloader from '../components/Preloaders/UniversalPreloader';

const PublicOnlyRoute = ({ children, redirectTo = '/admin/dashboard' }) => {
    const { isAuthenticated, authLoading } = useAuth();

    // Show loading state while checking auth
    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-dark">
                <UniversalPreloader
                    type="spinner"
                    size="medium"
                    message="Checking authentication..."
                />
            </div>
        );
    }

    // If already authenticated, redirect away from login page
    if (isAuthenticated) {
        return <Navigate to={redirectTo} replace />;
    }

    // If not authenticated, show the public content (login page)
    return children;
};

export default PublicOnlyRoute;