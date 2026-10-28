import { Navigate, Outlet, useLocation } from "react-router-dom";
import { usePlatformAdmin } from "../hooks/use-platform-auth";
import { ErrorState, Skeleton } from "./ui/States";

// Renders the console only for a signed-in platform admin
const PlatformGuard = () => {
  const location = useLocation();
  const { data: admin, isLoading, error, refetch } = usePlatformAdmin();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <Skeleton className="h-4 w-40" />
      </div>
    );
  }
  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 p-4 dark:bg-zinc-950">
        <div className="w-full max-w-md">
          <ErrorState error={error} onRetry={refetch} />
        </div>
      </div>
    );
  }
  if (!admin) {
    return <Navigate to="/platform/login" replace state={{ from: location.pathname }} />;
  }
  return <Outlet />;
};

export default PlatformGuard;
