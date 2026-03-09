// src/components/pos/POSSessionManager.jsx
import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  X,
  Plus,
  Minus,
  Maximize2,
  ShoppingCart,
  Clock,
  CheckCircle,
  PauseCircle,
  AlertCircle,
  Users,
  ChevronUp,
  ChevronDown,
  Building,
  User,
} from "lucide-react";

import { toast } from "react-hot-toast";

import { useAuth } from "../../context/authentication/AuthenticationContext";
import { useStoreContext } from "../../context/store/StoreContext";

import {
  createNewSession,
  switchSession,
  closeSession,
  pauseSession,
  resumeSession,
  toggleMinimizeSession,
} from "./slice/pos-slice";

const POSSessionManager = () => {
  const dispatch = useDispatch();
  const { activeSessions, currentSessionId, sessions, maxSessions } =
    useSelector((state) => state.pos);

  const { user } = useAuth();
  const { currentStore } = useStoreContext();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "n") {
        e.preventDefault();
        handleCreateNewSession();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "m") {
        e.preventDefault();
        setIsMinimized(!isMinimized);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isMinimized]);

  const handleCreateNewSession = () => {
    if (activeSessions.length >= maxSessions) {
      toast.error(`Maximum ${maxSessions} sessions allowed`);
      return;
    }

    if (!currentStore?._id) {
      toast.error("Please select a store first");
      return;
    }

    dispatch(
      createNewSession({
        storeId: currentStore._id,
        userId: user?.id,
        customerName: `Customer ${activeSessions.length + 1}`,
      }),
    );

    toast.success("New POS session created");
  };

  const handleSwitchSession = (sessionId) => {
    dispatch(switchSession(sessionId));
  };

  const handleCloseSession = (sessionId, e) => {
    e.stopPropagation();
    if (window.confirm("Close this session? Unsaved changes will be lost.")) {
      dispatch(closeSession(sessionId));
      toast.success("Session closed");
    }
  };

  const handlePauseSession = (sessionId, e) => {
    e.stopPropagation();
    dispatch(pauseSession(sessionId));
    toast.success("Session paused");
  };

  const handleResumeSession = (sessionId, e) => {
    e.stopPropagation();
    dispatch(resumeSession(sessionId));
    toast.success("Session resumed");
  };

  const handleToggleMinimize = (sessionId, e) => {
    e.stopPropagation();
    dispatch(toggleMinimizeSession(sessionId));
  };

  const getSessionStatusIcon = (status) => {
    switch (status) {
      case "active":
        return (
          <div className="w-2.5 h-2.5 bg-green-500 rounded-sm animate-pulse" />
        );
      case "paused":
        return (
          <PauseCircle className="w-3.5 h-3.5 text-yellow-600 dark:text-yellow-400" />
        );
      case "pending-payment":
        return (
          <Clock className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 animate-spin" />
        );
      case "completed":
        return (
          <CheckCircle className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
        );
      default:
        return (
          <AlertCircle className="w-3.5 h-3.5 text-gray-600 dark:text-gray-400" />
        );
    }
  };

  const getSessionStatusColor = (status, isActive) => {
    const baseClasses = "border-2 rounded-sm";

    if (isActive) {
      switch (status) {
        case "active":
          return `${baseClasses} border-green-500 bg-green-100 dark:bg-green-900/30`;
        case "paused":
          return `${baseClasses} border-yellow-500 bg-yellow-100 dark:bg-yellow-900/30`;
        case "pending-payment":
          return `${baseClasses} border-blue-500 bg-blue-100 dark:bg-blue-900/30`;
        case "completed":
          return `${baseClasses} border-gray-400 dark:border-gray-500 bg-gray-200 dark:bg-gray-800`;
        default:
          return `${baseClasses} border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800`;
      }
    } else {
      switch (status) {
        case "active":
          return `${baseClasses} border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30`;
        case "paused":
          return `${baseClasses} border-yellow-300 dark:border-yellow-700 bg-yellow-50 dark:bg-yellow-900/20 hover:bg-yellow-100 dark:hover:bg-yellow-900/30`;
        case "pending-payment":
          return `${baseClasses} border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30`;
        case "completed":
          return `${baseClasses} border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-800/50 hover:bg-gray-200 dark:hover:bg-gray-700`;
        default:
          return `${baseClasses} border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-700`;
      }
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
      minimumFractionDigits: 0,
    }).format(amount || 0);
  };

  // Calculate totals for footer
  const totalStats = activeSessions.reduce(
    (acc, sessionId) => {
      const session = sessions[sessionId];
      if (session) {
        acc.totalItems += session.cart.length;
        acc.totalAmount += session.total;
      }
      return acc;
    },
    { totalItems: 0, totalAmount: 0 },
  );

  // If fully minimized, show just a small bar
  if (isMinimized) {
    return (
      <div className="fixed  left-0 right-0 z-50">
        <div
          className="bg-linear-to-r from-blue-600 to-blue-700 dark:from-blue-800 dark:to-blue-900 border-t border-blue-500 dark:border-blue-700 p-2 pb-0 cursor-pointer hover:opacity-90 transition-opacity"
          onClick={() => setIsMinimized(false)}
        >
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-3">
              <Users className="w-4 h-4 text-white" />
              <span className="text-white text-sm font-medium">
                {activeSessions.length} Active Session
                {activeSessions.length !== 1 ? "s" : ""}
              </span>
            </div>
            <div className="flex items-center gap-4 text-white/90 text-sm">
              <span>{totalStats.totalItems} items</span>
              <span>{formatCurrency(totalStats.totalAmount)}</span>
              <ChevronUp className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      <div className="bg-linear-to-r from-blue-600 to-blue-700 dark:from-blue-800 dark:to-blue-900 rounded-t-lg shadow-2xl border-t border-x border-blue-500 dark:border-blue-700">
        {/* Collapsible Header */}
        <div
          className="px-4 py-2 cursor-pointer hover:bg-blue-700 dark:hover:bg-blue-800 transition-colors"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-white" />
              <div>
                <h3 className="text-sm font-bold text-white">
                  Active POS Sessions
                </h3>
                <p className="text-blue-50 text-xs">
                  {activeSessions.length}/{maxSessions} sessions •{" "}
                  {totalStats.totalItems} items •{" "}
                  {formatCurrency(totalStats.totalAmount)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsMinimized(true);
                  toast.success("Session manager minimized");
                }}
                className="p-1 hover:bg-white/10 rounded text-white transition-colors"
                title="Minimize (Ctrl+M)"
              >
                <Minus className="w-4 h-4" />
              </button>
              <ChevronDown
                className={`w-4 h-4 text-white transition-transform ${isCollapsed ? "rotate-180" : ""}`}
              />
            </div>
          </div>
        </div>

        {/* Collapsible Content */}
        {!isCollapsed && (
          <div className="px-4 pb-4">
            {/* Quick Actions Bar */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                {/* Store Info */}
                {currentStore && (
                  <div className="text-xs bg-white/20 dark:bg-white/10 px-2 py-1 rounded text-white flex items-center gap-1">
                    <Building size={12} />
                    <span className="font-medium truncate max-w-[120px]">
                      {currentStore.name}
                    </span>
                  </div>
                )}

                {/* Cashier Info */}
                {user && (
                  <div className="text-xs bg-green-500/30 px-2 py-1 rounded border border-green-400/40 text-white flex items-center gap-1">
                    <User size={12} />
                    <span className="truncate max-w-[100px]">
                      {user.name || user.username}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCreateNewSession}
                  disabled={activeSessions.length >= maxSessions}
                  className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-medium rounded transition-all"
                  title="New Session (Ctrl+N)"
                >
                  <Plus className="w-3 h-3" />
                  <span>New Session</span>
                </button>
              </div>
            </div>

            {/* Sessions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
              {activeSessions.map((sessionId) => {
                const session = sessions[sessionId];
                if (!session) return null;

                const isActive = currentSessionId === sessionId;
                const itemCount = session.cart.length;
                const totalAmount = session.total;

                return (
                  <div
                    key={sessionId}
                    onClick={() => handleSwitchSession(sessionId)}
                    className={`p-3 cursor-pointer transition-all hover:shadow-lg ${getSessionStatusColor(
                      session.status,
                      isActive,
                    )} ${isActive ? "ring-2 ring-blue-500 dark:ring-white ring-offset-1" : ""}`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-sm bg-blue-600 dark:bg-white/20 flex items-center justify-center flex-shrink-0">
                          <span className="text-sm font-bold text-white">
                            {session.sessionNumber}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1">
                            {getSessionStatusIcon(session.status)}
                            <span className="text-xs font-medium text-gray-700 dark:text-white/90 px-1.5 py-0.5 rounded bg-gray-200 dark:bg-white/10 truncate max-w-[80px]">
                              {session.status.charAt(0).toUpperCase() +
                                session.status.slice(1)}
                            </span>
                          </div>
                          <h4 className="font-bold text-gray-900 dark:text-white text-sm truncate max-w-[140px] mt-0.5">
                            {session.customerName ||
                              `Customer ${session.sessionNumber}`}
                          </h4>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        {session.status === "paused" ? (
                          <button
                            onClick={(e) => handleResumeSession(sessionId, e)}
                            className="p-1 hover:bg-gray-200 dark:hover:bg-white/20 rounded text-gray-700 dark:text-white transition-colors"
                            title="Resume Session"
                          >
                            <Maximize2 className="w-3 h-3" />
                          </button>
                        ) : (
                          <button
                            onClick={(e) => handlePauseSession(sessionId, e)}
                            className="p-1 hover:bg-gray-200 dark:hover:bg-white/20 rounded text-gray-700 dark:text-white transition-colors"
                            title="Pause Session"
                          >
                            <PauseCircle className="w-3 h-3" />
                          </button>
                        )}

                        <button
                          onClick={(e) => handleToggleMinimize(sessionId, e)}
                          className="p-1 hover:bg-gray-200 dark:hover:bg-white/20 rounded text-gray-700 dark:text-white transition-colors"
                          title={session.isMinimized ? "Maximize" : "Minimize"}
                        >
                          {session.isMinimized ? (
                            <Maximize2 className="w-3 h-3" />
                          ) : (
                            <Minus className="w-3 h-3" />
                          )}
                        </button>

                        <button
                          onClick={(e) => handleCloseSession(sessionId, e)}
                          className="p-1 hover:bg-red-100 dark:hover:bg-red-500/30 rounded text-red-600 dark:text-white transition-colors"
                          title="Close Session"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    {/* Session Details */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1 text-gray-600 dark:text-white/80">
                          <ShoppingCart className="w-3 h-3" />
                          <span>
                            {itemCount} item{itemCount !== 1 ? "s" : ""}
                          </span>
                        </div>
                        <div className="text-sm font-bold text-gray-900 dark:text-white">
                          {formatCurrency(totalAmount)}
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-gray-500 dark:text-white/60">
                        <span>
                          {new Date(session.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                        {session.paymentMethod && (
                          <div className="text-[10px] px-1.5 py-0.5 rounded bg-gray-200 dark:bg-white/10 text-gray-700 dark:text-white truncate max-w-[80px]">
                            {session.paymentMethod.charAt(0).toUpperCase() +
                              session.paymentMethod.slice(1)}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Empty State */}
              {activeSessions.length === 0 && (
                <div className="col-span-full flex flex-col items-center justify-center py-6 text-white/80">
                  <div className="relative mb-3">
                    <div className="w-16 h-16 border-2 border-white/40 rounded-sm flex items-center justify-center">
                      <ShoppingCart className="w-8 h-8 opacity-60" />
                    </div>
                  </div>
                  <p className="text-lg font-medium mb-1">No Active Sessions</p>
                  <p className="text-center text-white/70 text-sm mb-4 max-w-sm">
                    Start serving customers by creating a new POS session
                  </p>
                  <button
                    onClick={handleCreateNewSession}
                    className="px-4 py-2 bg-white text-blue-600 hover:bg-blue-50 font-medium rounded transition-all text-sm"
                  >
                    <Plus className="w-4 h-4 inline mr-1" />
                    Create First Session
                  </button>
                </div>
              )}

              {/* Add Session Card */}
              {activeSessions.length > 0 &&
                activeSessions.length < maxSessions && (
                  <div
                    onClick={handleCreateNewSession}
                    className="p-3 border-2 border-dashed border-white/40 hover:border-white/60 bg-white/10 hover:bg-white/15 rounded-sm cursor-pointer transition-all group"
                  >
                    <div className="flex flex-col items-center justify-center h-full py-4">
                      <div className="w-10 h-10 border-2 border-white/60 rounded-sm flex items-center justify-center mb-2 group-hover:border-white">
                        <Plus className="w-5 h-5 text-white/80 group-hover:text-white" />
                      </div>
                      <p className="text-white font-medium text-sm mb-0.5">
                        Add Session
                      </p>
                      <p className="text-white/70 text-xs text-center">
                        {activeSessions.length + 1} of {maxSessions}
                      </p>
                    </div>
                  </div>
                )}
            </div>

            {/* Footer Stats */}
            {activeSessions.length > 0 && (
              <div className="pt-3 border-t border-white/30">
                <div className="flex flex-wrap items-center justify-between text-xs text-white/90">
                  <div className="flex items-center gap-4 mb-2 sm:mb-0">
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-green-400 rounded-sm animate-pulse"></div>
                      <span>Active</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <PauseCircle className="w-3 h-3 text-yellow-300" />
                      <span>Paused</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-blue-300" />
                      <span>Pending</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-white/80">
                      Total:{" "}
                      <span className="font-bold text-white">
                        {totalStats.totalItems} items
                      </span>
                    </span>
                    <span className="text-white/80">
                      Amount:{" "}
                      <span className="font-bold text-white">
                        {formatCurrency(totalStats.totalAmount)}
                      </span>
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default POSSessionManager;
