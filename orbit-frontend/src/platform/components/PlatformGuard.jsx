import { Navigate, Outlet, useLocation } from "react-router-dom";
import { usePlatformAdmin } from "../hooks/use-platform-auth";
import { ErrorState, LoadingState } from "./PageState";

// Renders the platform pages only for a signed-in platform admin
const PlatformGuard = () => {
  const location = useLocation();
  const { data: admin, isLoading, error, refetch } = usePlatformAdmin();

  if (isLoading) return <LoadingState label="Checking your session…" />;
  if (error) return <ErrorState error={error} onRetry={refetch} />;
  if (!admin) {
    return <Navigate to="/platform/login" replace state={{ from: location.pathname }} />;
  }
  return <Outlet />;
};

export default PlatformGuard;
