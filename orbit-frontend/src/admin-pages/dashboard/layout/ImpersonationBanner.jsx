import { ShieldAlert, CornerUpLeft } from "lucide-react";
import { useAuth } from "../../../context/authentication/AuthenticationContext";
import { toast } from "react-hot-toast";

const ImpersonationBanner = () => {
  const { isImpersonating, impersonatingAs, stopImpersonating } = useAuth();

  if (!isImpersonating || !impersonatingAs) return null;

  const handleReturn = () => {
    stopImpersonating();
    toast.success("Returned to superadmin session");
  };

  const roleBadgeColor = {
    admin: "bg-blue-500/20 text-blue-200",
    manager: "bg-green-500/20 text-green-200",
    cashier: "bg-yellow-500/20 text-yellow-200",
    staff: "bg-gray-500/20 text-gray-200",
  }[impersonatingAs.role] || "bg-gray-500/20 text-gray-200";

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] bg-amber-600 dark:bg-amber-700 text-white shadow-lg">
      <div className="container mx-auto px-4 py-2 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <ShieldAlert size={18} className="shrink-0" />
          <span className="text-sm font-medium truncate">
            Viewing as{" "}
            <strong>
              {impersonatingAs.firstName} {impersonatingAs.lastName}
            </strong>{" "}
            &mdash; {impersonatingAs.email}
          </span>
          <span className={`hidden sm:inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${roleBadgeColor}`}>
            {impersonatingAs.role}
          </span>
        </div>

        <button
          onClick={handleReturn}
          className="shrink-0 flex items-center gap-2 px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded text-sm font-semibold transition-colors"
        >
          <CornerUpLeft size={15} />
          Return as Superadmin
        </button>
      </div>
    </div>
  );
};

export default ImpersonationBanner;
