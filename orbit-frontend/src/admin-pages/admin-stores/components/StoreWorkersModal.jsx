// ./StoreWorkersModal.jsx
import { useState, useEffect } from "react";
import {
  X,
  Users,
  UserCircle,
  Briefcase,
  Shield,
  Edit,
  Search,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Mail,
  Phone,
  Star
} from "lucide-react";

import { useStoreWorkers } from "../../hooks/store-hook";

const StoreWorkersModal = ({ isOpen, onClose, store }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [workerFilter, setWorkerFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Fetch store workers
  const {
    data: workersData,
    isLoading: workersLoading,
    error: workersError,
    refetch: refetchWorkers,
  } = useStoreWorkers(store?._id, {
    role: workerFilter !== "all" ? workerFilter : undefined,
  });

  const workers = workersData?.data?.workers || [];
  const workersStats = workersData?.data?.stats || {
    total: 0,
    managers: 0,
    cashiers: 0,
    staff: 0,
  };

  // Filter workers based on search
  const filteredWorkers = workers.filter((worker) => {
    if (!searchQuery) return true;
    const searchLower = searchQuery.toLowerCase();
    return (
      worker.fullName?.toLowerCase().includes(searchLower) ||
      worker.email?.toLowerCase().includes(searchLower) ||
      worker.phoneNo?.toLowerCase().includes(searchLower) ||
      worker.role?.toLowerCase().includes(searchLower)
    );
  });

  // Pagination
  const totalPages = Math.ceil(filteredWorkers.length / itemsPerPage);
  const paginatedWorkers = filteredWorkers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  // Handle animation
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => setIsVisible(true), 10);
      setCurrentPage(1);
      setSearchQuery("");
    } else {
      setIsVisible(false);
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  // Prevent background scrolling
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen || !store) return null;

  // Get role badge color
  const getRoleBadge = (role) => {
    switch (role) {
      case "manager":
        return "bg-purple-100 dark:bg-purple-500/20 text-purple-800 dark:text-purple-400 border border-purple-200 dark:border-purple-500/30";
      case "cashier":
        return "bg-blue-100 dark:bg-blue-500/20 text-blue-800 dark:text-blue-400 border border-blue-200 dark:border-blue-500/30";
      case "staff":
        return "bg-green-100 dark:bg-green-500/20 text-green-800 dark:text-green-400 border border-green-200 dark:border-green-500/30";
      default:
        return "bg-gray-100 dark:bg-gray-500/20 text-gray-800 dark:text-gray-400 border border-gray-200 dark:border-gray-500/30";
    }
  };

  return (
    <>
      {/* Background overlay */}
      <div
        className={`fixed inset-0 z-[60] transition-opacity duration-300 ${
          isVisible ? "opacity-100" : "opacity-0"
        } ${isOpen ? "visible" : "invisible"}`}
        onClick={onClose}
      >
        <div className="absolute inset-0 bg-black/40 dark:bg-black/50 " />
      </div>

      {/* Modal */}
      <div className="fixed inset-0 z-[60] overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <div
            className={`relative w-full max-w-4xl bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-sm shadow-2xl transform transition-all duration-300 ${
              isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-300 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-sm bg-blue-100 dark:bg-blue-500/20">
                  <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Store Workers - {store.name}
                  </h2>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {workersStats.total} total workers
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-sm transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-3 gap-3 p-4 border-b border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
              <div className="text-center p-2 bg-purple-100 dark:bg-purple-500/10 rounded-sm">
                <span className="text-xs text-purple-600 dark:text-purple-400 block">
                  Managers
                </span>
                <span className="text-xl font-bold text-purple-700 dark:text-purple-300">
                  {workersStats.managers}
                </span>
              </div>
              <div className="text-center p-2 bg-blue-100 dark:bg-blue-500/10 rounded-sm">
                <span className="text-xs text-blue-600 dark:text-blue-400 block">
                  Cashiers
                </span>
                <span className="text-xl font-bold text-blue-700 dark:text-blue-300">
                  {workersStats.cashiers}
                </span>
              </div>
              <div className="text-center p-2 bg-green-100 dark:bg-green-500/10 rounded-sm">
                <span className="text-xs text-green-600 dark:text-green-400 block">
                  Staff
                </span>
                <span className="text-xl font-bold text-green-700 dark:text-green-300">
                  {workersStats.staff}
                </span>
              </div>
            </div>

            {/* Search and Filter */}
            <div className="p-4 border-b border-gray-300 dark:border-gray-700">
              <div className="flex flex-col sm:flex-row gap-3">
                {/* Search */}
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search workers by name, email, phone..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full pl-9 pr-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-sm text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Filter Dropdown */}
                <select
                  value={workerFilter}
                  onChange={(e) => {
                    setWorkerFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-sm text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Roles</option>
                  <option value="manager">Managers</option>
                  <option value="cashier">Cashiers</option>
                  <option value="staff">Staff</option>
                </select>

                {/* Refresh Button */}
                <button
                  onClick={() => refetchWorkers()}
                  className="px-3 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-sm transition-colors"
                  title="Refresh"
                >
                  <RefreshCw
                    size={18}
                    className={workersLoading ? "animate-spin" : ""}
                  />
                </button>
              </div>
            </div>

            {/* Workers List */}
            <div className="p-4 max-h-96 overflow-y-auto">
              {workersLoading ? (
                <div className="space-y-3">
                  {Array(5)
                    .fill(0)
                    .map((_, i) => (
                      <div
                        key={i}
                        className="animate-pulse bg-gray-200 dark:bg-gray-700 h-20 rounded-sm"
                      ></div>
                    ))}
                </div>
              ) : workersError ? (
                <div className="text-center py-8 text-red-600 dark:text-red-400">
                  Failed to load workers
                </div>
              ) : filteredWorkers.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  {searchQuery
                    ? "No workers match your search"
                    : "No workers found for this store"}
                </div>
              ) : (
                <div className="space-y-3">
                  {paginatedWorkers.map((worker) => (
                    <div
                      key={worker._id}
                      className="p-4 bg-white dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-sm hover:shadow-md transition-all"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          {worker.profileImage ? (
                            <img
                              src={worker.profileImage}
                              alt={worker.fullName}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                              <UserCircle className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                            </div>
                          )}
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-gray-900 dark:text-white">
                                {worker.fullName}
                              </span>
                              <span
                                className={`px-2 py-0.5 rounded-full text-xs font-medium ${getRoleBadge(worker.role)}`}
                              >
                                {worker.role}
                              </span>
                              {worker.isPrimaryStore && (
                                <span className="text-xs bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 px-1.5 py-0.5 rounded-sm flex items-center gap-1">
                                  <Star size={10} />
                                  Primary
                                </span>
                              )}
                            </div>
                            <div className="flex flex-wrap items-center gap-3 text-xs">
                              <span className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                                <Mail size={12} />
                                {worker.email}
                              </span>
                              {worker.phoneNo && (
                                <>
                                  <span className="text-gray-400 dark:text-gray-500">
                                    •
                                  </span>
                                  <span className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                                    <Phone size={12} />
                                    {worker.phoneNo}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Permissions */}
                        {/* <div className="flex items-center gap-1">
                          {worker.permissions?.canManage && (
                            <span
                              className="p-1.5 bg-purple-100 dark:bg-purple-500/20 rounded-sm"
                              title="Can Manage"
                            >
                              <Shield
                                size={14}
                                className="text-purple-600 dark:text-purple-400"
                              />
                            </span>
                          )}
                          {worker.permissions?.canEdit && (
                            <span
                              className="p-1.5 bg-blue-100 dark:bg-blue-500/20 rounded-sm"
                              title="Can Edit"
                            >
                              <Edit
                                size={14}
                                className="text-blue-600 dark:text-blue-400"
                              />
                            </span>
                          )}
                          {worker.permissions?.canSell && (
                            <span
                              className="p-1.5 bg-green-100 dark:bg-green-500/20 rounded-sm"
                              title="Can Sell"
                            >
                              <Briefcase
                                size={14}
                                className="text-green-600 dark:text-green-400"
                              />
                            </span>
                          )}
                        </div> */}
                      </div>

                      {/* Store-specific role */}
                      {worker.storeRole && worker.storeRole !== worker.role && (
                        <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-600 flex items-center gap-2">
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            Store role:
                          </span>
                          <span
                            className={`text-xs px-2 py-0.5 rounded-sm ${getRoleBadge(worker.storeRole)}`}
                          >
                            {worker.storeRole}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Pagination */}
            {filteredWorkers.length > 0 && (
              <div className="flex items-center justify-between p-4 border-t border-gray-300 dark:border-gray-700">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Showing {(currentPage - 1) * itemsPerPage + 1} -{" "}
                  {Math.min(currentPage * itemsPerPage, filteredWorkers.length)}{" "}
                  of {filteredWorkers.length}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(1, prev - 1))
                    }
                    disabled={currentPage === 1}
                    className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                    }
                    disabled={currentPage === totalPages}
                    className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="flex justify-end p-4 border-t border-gray-300 dark:border-gray-700">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm bg-blue-600 dark:bg-blue-500 text-white hover:bg-blue-700 dark:hover:bg-blue-600 rounded-sm transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default StoreWorkersModal;
