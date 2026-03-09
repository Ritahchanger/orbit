import { useRef, useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/authentication/AuthenticationContext";
import UniversalPreloader from "../components/Preloaders/UniversalPreloader";
import { toast } from "react-hot-toast";
import SessionExpiredMessage from "./SessionExpiredMessage";
import RoleBasedAccessControlMessage from "./RoleBasedAccessControlMessage";
const ProtectedRoute = ({
    children,
    roles = [],
    redirectTo = "/admin/login",
    requireAuth = true,
    showLoader = true,
    checkSession = true
}) => {
    const {
        isAuthenticated,
        authLoading,
        userRole,
        user,
        fetchUser,
        logout
    } = useAuth();
    const location = useLocation();
    const [verifying, setVerifying] = useState(true);
    const hasInitialized = useRef(false);
    const [sessionExpired, setSessionExpired] = useState(false);

    useEffect(() => {
        if (checkSession && isAuthenticated) {
            const lastActivity = localStorage.getItem('last_activity');
            if (lastActivity) {
                const lastActivityTime = parseInt(lastActivity);
                const currentTime = Date.now();
                const minutesSinceLastActivity = (currentTime - lastActivityTime) / (1000 * 60);

                // If session expired (more than 60 minutes)
                if (minutesSinceLastActivity > 60) {
                    setSessionExpired(true);
                    toast.error('Your session has expired. Please log in again.');
                    logout();
                } else {
                    // Update last activity
                    localStorage.setItem('last_activity', Date.now().toString());
                }
            }
        }
    }, [checkSession, isAuthenticated, logout]);

    // Update activity on route change
    useEffect(() => {
        if (isAuthenticated) {
            localStorage.setItem('last_activity', Date.now().toString());
        }
    }, [location.pathname, isAuthenticated]);

    // Verify authentication and permissions
    useEffect(() => {
        const verifyAccess = async () => {
            setVerifying(true);

            try {
                // Refresh user data if needed
                if (isAuthenticated && !user) {
                    await fetchUser();
                }
            } catch (error) {
                console.error('Failed to verify user:', error);
            } finally {
                setVerifying(false);
                if (!hasInitialized.current) {
                    hasInitialized.current = true;
                }
            }
        };

        verifyAccess();
    }, [isAuthenticated, user, fetchUser]);

    // Only show preloader during first authentication check
    if ((authLoading || verifying) && showLoader && !hasInitialized.current) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-dark">
                <UniversalPreloader
                    type="shield"
                    size="large"
                    fullScreen={false}
                    message="Securing your access..."
                    theme="dark"
                />
            </div>
        );
    }

    // If session expired, show special message
    if (sessionExpired) {
        return (
            <SessionExpiredMessage />
        );
    }

    // If no authentication required, return children
    if (!requireAuth) {
        return children;
    }

    // **SIMPLE LOGIC: Handle login page separately**
    // If we're on the login page and authenticated, redirect to dashboard
    if (location.pathname === '/admin/login') {
        if (isAuthenticated && !authLoading && !verifying) {
            console.log('User authenticated on login page, redirecting to dashboard');
            const from = location.state?.from?.pathname || '/admin/dashboard';
            return <Navigate to={from} replace />;
        }

        // If not authenticated, show login page
        return children;
    }

    // CHECK 1: If user is NOT authenticated and trying to access protected route
    if (!isAuthenticated && !authLoading && !verifying) {
        console.log('User not authenticated, redirecting to login');

        // Only add redirect param if we're not already going to login
        const redirectPath = location.pathname + location.search;
        const shouldAddRedirect = redirectPath !== '/admin/login';
        const redirectParam = shouldAddRedirect ? `?redirect=${encodeURIComponent(redirectPath)}` : '';

        return (
            <Navigate
                to={`${redirectTo}${redirectParam}`}
                replace
                state={{ from: location }}
            />
        );
    }

    // CHECK 2: Role-based access control
    if (roles.length > 0 && userRole && !roles.includes(userRole)) {
        return (
            <RoleBasedAccessControlMessage userRole={userRole} roles={roles} />
        );
    }

    // All checks passed, return children
    return children;
};

export const withProtectedRoute = (Component, options = {}) => {
    return function WrappedComponent(props) {
        return (
            <ProtectedRoute {...options}>
                <Component {...props} />
            </ProtectedRoute>
        );
    };
};

export const ProtectedRoutes = ({ children, options = {} }) => {
    return (
        <ProtectedRoute {...options}>
            {children}
        </ProtectedRoute>
    );
};

export default ProtectedRoute;