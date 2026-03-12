import { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AdminNavbar from "./Navbar";
import { useStoreSelectionModal } from "../../hooks/useStoreSelectionModal";
import { useAuth } from "../../../context/authentication/AuthenticationContext";
import { useStoreContext } from "../../../context/store/StoreContext";
import StoreSelectionModal from "../../modals/StoreSelectionModal";
import CalculatorModal from "../../modals/CalculatorModal";
import AdminGlobalButtons from "./AdminGlobalButtons";
import ShortcutsOverlay from "./ShortcutsOverlay";
import SystemHelperModal from "./SystemHelperModal";

const AdminLayout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { openModal, isOpen: modalIsOpen } = useStoreSelectionModal();
  const { isAuthenticated, user, userRole } = useAuth();

  // Pull currentStore and isLoading from StoreContext so we wait for it to hydrate
  const { currentStore, isLoading: storeLoading } = useStoreContext();

  const [showCalculator, setShowCalculator] = useState(false);
  const [historyState, setHistoryState] = useState({
    canGoBack: false,
    canGoForward: false,
  });

  const hasCheckedRef = useRef(false);

  useEffect(() => {
    // Wait until auth is ready
    if (!isAuthenticated || !user) return;
    if (userRole !== "superadmin" && userRole !== "admin") return;

    const isAdminPage =
      location.pathname.startsWith("/admin") &&
      location.pathname !== "/admin/login";

    if (!isAdminPage) return;

    // Don't open modal if it's already open or we already handled it
    if (modalIsOpen || hasCheckedRef.current) return;

    // Wait for the store context to finish loading/hydrating from sessionStorage.
    // This prevents a false "no store" reading on first render after refresh.
    if (storeLoading) return;

    // At this point StoreContext has finished initializing.
    // If currentStore is set, sessionStorage was restored successfully — do nothing.
    if (currentStore) {
      hasCheckedRef.current = true;
      return;
    }

    // No store found even after context hydration — open the modal
    const timer = setTimeout(() => {
      console.log(
        "Opening store selection modal — no store found after hydration",
      );
      openModal(user);
      hasCheckedRef.current = true;
    }, 500);

    return () => clearTimeout(timer);
  }, [
    isAuthenticated,
    user,
    userRole,
    location.pathname,
    modalIsOpen,
    openModal,
    storeLoading,
    currentStore,
  ]);

  // Reset check ref on logout
  useEffect(() => {
    if (!isAuthenticated) {
      hasCheckedRef.current = false;
    }
  }, [isAuthenticated]);

  // Update history state on navigation
  useEffect(() => {
    setHistoryState({
      canGoBack: window.history.length > 1 && window.history.state?.idx > 0,
      canGoForward:
        window.history.length > 1 &&
        window.history.state?.idx < window.history.length - 2,
    });
  }, [location]);

  const handleCalculatorOpen = () => setShowCalculator(true);
  const handleCalculatorClose = () => setShowCalculator(false);
  const handleBack = () => navigate(-1);
  const handleForward = () => navigate(1);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 relative">
      <AdminGlobalButtons
        handleCalculatorOpen={handleCalculatorOpen}
        historyState={historyState}
        handleForward={handleForward}
        handleBack={handleBack}
      />
      <ShortcutsOverlay />
      <SystemHelperModal />
      <AdminNavbar />
      <div className="mx-auto">
        <main className="pt-27.5 pb-4 container mx-auto">{children}</main>
      </div>
      <StoreSelectionModal />
      {showCalculator && <CalculatorModal onClose={handleCalculatorClose} />}
    </div>
  );
};

export default AdminLayout;
