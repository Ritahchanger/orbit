import { useRef, useEffect, useState, useCallback, useMemo } from "react";

import { Navigate, useLocation, useNavigate } from "react-router-dom";

import { useAuth } from "../../context/authentication/AuthenticationContext";

import UniversalPreloader from "../components/Preloaders/UniversalPreloader";

import RoleBasedAccessControlMessage from "./RoleBasedAccessControlMessage";

const IDLE_CHECK_INTERVAL = 60000; // 1 minute

const ProtectedRoute = ({
  children,
  roles = [],
  redirectTo = "/admin/login",
  requireAuth = true,
  showLoader = true,
  checkSession = true,
}) => {
  const { isAuthenticated, authLoading, userRole, user, fetchUser, logout } =
    useAuth();

  const location = useLocation();
  const navigate = useNavigate();

  const [isVerifying, setIsVerifying] = useState(true);
  const [sessionExpired, setSessionExpired] = useState(false);
  const verificationAttemptedRef = useRef(false);

  // Memoized path checks
  const isLoginPage = useMemo(
    () => location.pathname === "/admin/login",
    [location.pathname],
  );

  const currentPath = useMemo(
    () => location.pathname + location.search,
    [location.pathname, location.search],
  );

  // Session expiration handler - ADD THIS CODE
  const handleSessionExpiration = useCallback(
    (isManualCheck = false) => {
      if (!checkSession || !isAuthenticated || sessionExpired) {
        return false;
      }
      const lastActivity = localStorage.getItem("last_activity");
      const currentTime = Date.now();
      // ✅ ADD THIS GRACE PERIOD CHECK HERE:
      const loginTime = localStorage.getItem("login_timestamp");
      if (loginTime) {
        const minutesSinceLogin =
          (currentTime - parseInt(loginTime, 10)) / (1000 * 60);
        // Don't check session for first 2 minutes after login
        if (minutesSinceLogin < 2) {
          return false;
        }
      }

      // Set initial activity if none exists - but don't check expiration on first run
      if (!lastActivity) {
        localStorage.setItem("last_activity", currentTime.toString());

        // If this is a manual check right after login, just return without expiration check
        if (isManualCheck) {
          return false;
        }
      }

      // ... rest of your existing code
    },
    [
      checkSession,
      isAuthenticated,
      sessionExpired,
      logout,
      navigate,
      redirectTo,
      currentPath,
      location,
    ],
  );

  // Update activity on user interaction
  useEffect(() => {
    const updateActivity = () => {
      if (isAuthenticated && checkSession) {
        localStorage.setItem("last_activity", Date.now().toString());
      }
    };

    const events = ["click", "keypress", "scroll", "mousemove"];
    events.forEach((event) =>
      window.addEventListener(event, updateActivity, { passive: true }),
    );

    return () => {
      events.forEach((event) =>
        window.removeEventListener(event, updateActivity),
      );
    };
  }, [isAuthenticated, checkSession]);

  // Periodic session check
  useEffect(() => {
    if (!checkSession || !isAuthenticated || sessionExpired) {
      return;
    }

    const intervalId = setInterval(() => {
      handleSessionExpiration(true);
    }, IDLE_CHECK_INTERVAL);

    return () => clearInterval(intervalId);
  }, [checkSession, isAuthenticated, sessionExpired, handleSessionExpiration]);

  // Initial verification on mount and auth changes
  useEffect(() => {
    const verifyAccess = async () => {
      // Skip if already attempted or session expired
      if (verificationAttemptedRef.current || sessionExpired) {
        return;
      }

      try {
        // Initialize session tracking on first load
        if (isAuthenticated && checkSession) {
          const lastActivity = localStorage.getItem("last_activity");
          const loginTime = localStorage.getItem("login_timestamp");

          if (!lastActivity) {
            // Just set initial timestamp without checking expiration
            localStorage.setItem("last_activity", Date.now().toString());
          } else {
            // Check if we're in grace period
            if (loginTime) {
              const minutesSinceLogin =
                (Date.now() - parseInt(loginTime, 10)) / (1000 * 60);

              if (minutesSinceLogin < 5) {
                return;
              }
            }

            // Only check expiration if we have an existing timestamp
            // But use isManualCheck = false to avoid updating timestamp unnecessarily
            if (handleSessionExpiration(false)) {
              return;
            }
          }
        }

        // If authenticated but missing user data, fetch it
        if (isAuthenticated && !user) {
          await fetchUser();
        }
      } catch (error) {
        console.error("Failed to verify user:", error);
        // Don't block UI on fetch errors
      } finally {
        setIsVerifying(false);
        verificationAttemptedRef.current = true;
      }
    };

    verifyAccess();
  }, [
    isAuthenticated,
    user,
    fetchUser,
    sessionExpired,
    handleSessionExpiration,
    checkSession,
  ]);

  // Show preloader during initial verification
  const showPreloader =
    showLoader &&
    (authLoading || isVerifying) &&
    !verificationAttemptedRef.current &&
    !sessionExpired;

  if (showPreloader) {
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

  // If no authentication required, return children immediately
  if (!requireAuth) {
    return children;
  }

  // Handle login page
  if (isLoginPage) {
    // If authenticated and on login page, redirect to appropriate page
    if (isAuthenticated && !authLoading && !isVerifying) {
      // Check for stored redirect path first
      const storedPath =
        localStorage.getItem("preAuthPath") ||
        sessionStorage.getItem("preAuthPath") ||
        location.state?.from?.pathname;

      const targetPath = storedPath || "/admin/dashboard";

      // Clean up stored paths
      localStorage.removeItem("preAuthPath");
      sessionStorage.removeItem("preAuthPath");

      return <Navigate to={targetPath} replace />;
    }
    // Allow access to login page if not authenticated
    return children;
  }

  // If user is NOT authenticated and trying to access protected route
  if (!isAuthenticated && !authLoading && !isVerifying) {
    // Build redirect URL
    const shouldAddRedirect = currentPath !== "/admin/login";
    const redirectParam = shouldAddRedirect
      ? `?redirect=${encodeURIComponent(currentPath)}`
      : "";

    return (
      <Navigate
        to={`${redirectTo}${redirectParam}`}
        replace
        state={{ from: location }}
      />
    );
  }

  // Role-based access control
  if (roles.length > 0 && userRole && !roles.includes(userRole)) {
    return <RoleBasedAccessControlMessage userRole={userRole} roles={roles} />;
  }

  // All checks passed, return children
  return children;
};

// HOCs remain the same
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
  return <ProtectedRoute {...options}>{children}</ProtectedRoute>;
};

export default ProtectedRoute;
