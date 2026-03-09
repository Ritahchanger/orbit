import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AdminNavbar from "./Navbar";
import { useStoreSelectionModal } from "../../hooks/useStoreSelectionModal";
import { useAuth } from "../../../context/authentication/AuthenticationContext";
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
  const [shouldCheckStore, setShouldCheckStore] = useState(true);
  const [showCalculator, setShowCalculator] = useState(false);
  const [historyState, setHistoryState] = useState({
    canGoBack: false,
    canGoForward: false,
  });

  useEffect(() => {
    let timer; // Declare timer variable outside the condition

    if (isAuthenticated && user) {
      const isAdminPage =
        location.pathname.startsWith("/admin") &&
        location.pathname !== "/admin/login";

      if (isAdminPage) {
        if (
          (userRole === "superadmin" || userRole === "admin") &&
          shouldCheckStore
        ) {
          const selectedStoreId = sessionStorage.getItem("current_store_id");
          const hasStoreSelected =
            !!selectedStoreId &&
            selectedStoreId !== "null" &&
            selectedStoreId !== "undefined";

          console.log("Store selection check for admin:", {
            userRole,
            selectedStoreId,
            hasStoreSelected,
            modalIsOpen,
            pathname: location.pathname,
          });

          if (!hasStoreSelected && !modalIsOpen) {
            timer = setTimeout(() => {
              // Assign to outer timer variable
              console.log("Opening store selection modal for admin");
              openModal(user);
              setShouldCheckStore(false);
            }, 1000);
          } else {
            setShouldCheckStore(false);
          }
        } else {
          setShouldCheckStore(false);
        }
      } else {
        setShouldCheckStore(false);
      }
    } else {
      setShouldCheckStore(false);
    }

    // Cleanup function - only clear if timer exists
    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [
    isAuthenticated,
    user,
    userRole,
    location.pathname,
    modalIsOpen,
    openModal,
    shouldCheckStore,
  ]);

  // Update history state whenever location changes
  useEffect(() => {
    setHistoryState({
      canGoBack: window.history.length > 1 && window.history.state?.idx > 0,
      canGoForward:
        window.history.length > 1 &&
        window.history.state?.idx < window.history.length - 2,
    });
  }, [location]);

  const handleCalculatorOpen = () => {
    setShowCalculator(true);
    console.log(showCalculator);
  };

  const handleCalculatorClose = () => {
    setShowCalculator(false);
  };
  const handleBack = () => {
    navigate(-1);
  };
  const handleForward = () => {
    navigate(1);
  };
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
        <main className="pt-[110px] pb-4 container mx-auto">{children}</main>
      </div>
      <StoreSelectionModal />
      {showCalculator && <CalculatorModal onClose={handleCalculatorClose} />}
    </div>
  );
};

export default AdminLayout;
