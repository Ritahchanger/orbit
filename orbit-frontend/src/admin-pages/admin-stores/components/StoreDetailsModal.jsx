import { useState, useEffect } from "react";
import {
  X,
  Store,
  MapPin,
  Phone,
  Mail,
  Clock,
  Users,
  Calendar,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  AlertCircle,
  Building2,
  Navigation,
  Copy,
  User,
  UserCircle,
  Briefcase,
  Shield,
  ChevronRight,
  RefreshCw,
} from "lucide-react";

import { toast } from "react-hot-toast";

import { useStoreContext } from "../../../context/store/StoreContext";

import { useNavigate } from "react-router-dom";

import { useStoreWorkers } from "../../hooks/store-hook";

import StoreWorkersModal from "./StoreWorkersModal";

const StoreDetailsModal = ({ isOpen, onClose, store, onEdit, onDelete }) => {
  const navigate = useNavigate();
  const { switchStore } = useStoreContext();
  const [copiedField, setCopiedField] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [workerFilter, setWorkerFilter] = useState("all"); // all, manager, cashier, staff

  const [showWorkersModal, setShowWorkersModal] = useState(false);

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

  // Handle animation
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => setIsVisible(true), 10);
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

  // Prevent background scrolling when modal is open
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

  // Copy to clipboard function
  const copyToClipboard = (text, field) => {
    if (!text) {
      toast.error("Nothing to copy");
      return;
    }
    navigator.clipboard
      .writeText(text)
      .then(() => {
        setCopiedField(field);
        toast.success("Copied to clipboard");
        setTimeout(() => setCopiedField(null), 2000);
      })
      .catch(() => {
        toast.error("Failed to copy");
      });
  };

  // Format address
  const formatAddress = () => {
    const { street, building, floor, city, county } = store.address || {};
    const parts = [];

    if (street) parts.push(street);
    if (building) parts.push(`Building ${building}`);
    if (floor) parts.push(`Floor ${floor}`);
    if (city) parts.push(city);
    if (county) parts.push(county);

    return parts.join(", ") || "Address not specified";
  };

  // Get status icon and color
  const getStatusInfo = () => {
    switch (store.status) {
      case "active":
        return {
          icon: (
            <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-500" />
          ),
          color: "text-green-600 dark:text-green-500",
          bgColor: "bg-green-100 dark:bg-green-500/10",
          label: "Active",
        };
      case "inactive":
        return {
          icon: <XCircle className="h-5 w-5 text-red-600 dark:text-red-500" />,
          color: "text-red-600 dark:text-red-500",
          bgColor: "bg-red-100 dark:bg-red-500/10",
          label: "Inactive",
        };
      case "maintenance":
        return {
          icon: (
            <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-500" />
          ),
          color: "text-yellow-600 dark:text-yellow-500",
          bgColor: "bg-yellow-100 dark:bg-yellow-500/10",
          label: "Maintenance",
        };
      default:
        return {
          icon: (
            <AlertCircle className="h-5 w-5 text-gray-600 dark:text-gray-500" />
          ),
          color: "text-gray-600 dark:text-gray-500",
          bgColor: "bg-gray-100 dark:bg-gray-500/10",
          label: "Unknown",
        };
    }
  };

  // Format opening hours for display
  const formatOpeningHours = () => {
    const days = [
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
      "sunday",
    ];
    const dayNames = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ];

    const currentDay = new Date().getDay(); // 0 = Sunday
    const todayIndex = currentDay === 0 ? 6 : currentDay - 1;

    return days.map((day, index) => {
      const hours = store.openingHours?.[day];
      const isToday = index === todayIndex;

      return {
        day: dayNames[index],
        open: hours?.open || "Closed",
        close: hours?.close || "Closed",
        isClosed: !hours || hours.open === "Closed",
        isToday,
      };
    });
  };

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

  // Get permission icons
  const getPermissionIcon = (permission) => {
    if (permission.canManage)
      return <Shield className="h-3 w-3 text-purple-500" />;
    if (permission.canEdit) return <Edit className="h-3 w-3 text-blue-500" />;
    if (permission.canSell)
      return <Briefcase className="h-3 w-3 text-green-500" />;
    return <User className="h-3 w-3 text-gray-500" />;
  };

  const statusInfo = getStatusInfo();
  const openingHours = formatOpeningHours();

  return (
    <>
      {/* Background overlay with animation */}
      <div
        className={`fixed inset-0 z-50 transition-opacity duration-300 ${
          isVisible ? "opacity-100" : "opacity-0"
        } ${isOpen ? "visible" : "invisible"}`}
        onClick={onClose}
      >
        <div className="absolute inset-0 bg-black/70 dark:bg-black/80 backdrop-blur-sm" />
      </div>

      {/* Modal container - centered */}
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4 text-center">
          {/* Modal panel with animation */}
          <div
            className={`relative w-full max-w-8xl bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-sm shadow-2xl transform transition-all duration-300 ${
              isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-300 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-sm bg-blue-100 dark:bg-blue-500/20">
                  <Store className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    {store.name}
                  </h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="font-mono text-sm text-gray-600 dark:text-gray-400">
                      {store.code}
                    </span>
                    <div
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-sm text-xs ${statusInfo.bgColor} ${statusInfo.color}`}
                    >
                      {statusInfo.icon}
                      <span>{statusInfo.label}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={onEdit}
                  className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-100 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-500/20 rounded-sm transition-colors"
                >
                  <Edit size={16} />
                  Edit
                </button>
                <button
                  onClick={() => {
                    switchStore(store._id);
                    navigate("/admin/inventory");
                  }}
                  className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-100 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-500/20 rounded-sm transition-colors"
                >
                  <Store size={16} />
                  View Store Items
                </button>
                <button
                  onClick={onClose}
                  className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-sm transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">
                {/* Left Column - Store Info */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Contact Information */}
                  <div className="bg-gray-50 dark:bg-gray-800/50 border border-gray-300 dark:border-gray-700 rounded-sm p-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      <Building2 size={18} />
                      Store Information
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {/* Address */}
                      <div className="space-y-3">
                        <div className="flex items-start gap-2">
                          <MapPin className="h-5 w-5 text-gray-500 dark:text-gray-400 mt-0.5 flex-shrink-0" />
                          <div className="flex-1">
                            <label className="text-xs text-gray-600 dark:text-gray-500 uppercase tracking-wider">
                              Address
                            </label>
                            <p className="text-gray-900 dark:text-white">
                              {formatAddress()}
                            </p>
                            {store.address?.coordinates && (
                              <button className="mt-2 flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors">
                                <Navigation size={14} />
                                View on Map
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Contact Info */}
                        {store.phone && (
                          <div className="flex items-center justify-between group">
                            <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                              <div>
                                <label className="text-xs text-gray-600 dark:text-gray-500 uppercase tracking-wider">
                                  Phone
                                </label>
                                <p className="text-gray-900 dark:text-white">
                                  {store.phone}
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={() =>
                                copyToClipboard(store.phone, "phone")
                              }
                              className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white opacity-0 group-hover:opacity-100 transition-all rounded hover:bg-gray-200 dark:hover:bg-gray-700"
                              title="Copy phone number"
                            >
                              <Copy size={14} />
                            </button>
                          </div>
                        )}

                        {store.email && (
                          <div className="flex items-center justify-between group">
                            <div className="flex items-center gap-2">
                              <Mail className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                              <div>
                                <label className="text-xs text-gray-600 dark:text-gray-500 uppercase tracking-wider">
                                  Email
                                </label>
                                <p className="text-gray-900 dark:text-white">
                                  {store.email}
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={() =>
                                copyToClipboard(store.email, "email")
                              }
                              className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white opacity-0 group-hover:opacity-100 transition-all rounded hover:bg-gray-200 dark:hover:bg-gray-700"
                              title="Copy email"
                            >
                              <Copy size={14} />
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Store Details */}
                      <div className="space-y-3">
                        {/* Manager */}
                        {store.manager && (
                          <div className="flex items-center gap-2">
                            <Users className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                            <div>
                              <label className="text-xs text-gray-600 dark:text-gray-500 uppercase tracking-wider">
                                Manager
                              </label>
                              <p className="text-gray-900 dark:text-white">
                                {typeof store.manager === "object"
                                  ? `${store.manager.firstName} ${store.manager.lastName}`
                                  : store.manager}
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Created Date */}
                        {store.createdAt && (
                          <div className="flex items-center gap-2">
                            <Calendar className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                            <div>
                              <label className="text-xs text-gray-600 dark:text-gray-500 uppercase tracking-wider">
                                Created
                              </label>
                              <p className="text-gray-900 dark:text-white">
                                {new Date(store.createdAt).toLocaleDateString(
                                  "en-US",
                                  {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                  },
                                )}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Opening Hours */}
                  <div className="bg-gray-50 dark:bg-gray-800/50 border border-gray-300 dark:border-gray-700 rounded-sm p-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      <Clock size={18} />
                      Opening Hours
                    </h3>

                    <div className="space-y-2">
                      {openingHours.map((day, index) => (
                        <div
                          key={index}
                          className={`flex items-center justify-between p-3 rounded-sm ${
                            day.isToday
                              ? "bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20"
                              : "bg-gray-100 dark:bg-gray-700/30"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span
                              className={`font-medium ${day.isToday ? "text-blue-600 dark:text-blue-400" : "text-gray-900 dark:text-white"}`}
                            >
                              {day.day}
                              {day.isToday && (
                                <span className="ml-2 text-xs bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded">
                                  Today
                                </span>
                              )}
                            </span>
                          </div>
                          <span
                            className={
                              day.isClosed
                                ? "text-red-600 dark:text-red-400"
                                : day.isToday
                                  ? "text-blue-600 dark:text-blue-400"
                                  : "text-gray-700 dark:text-gray-300"
                            }
                          >
                            {day.isClosed
                              ? "Closed"
                              : `${day.open} - ${day.close}`}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right Column - Actions & Store Workers */}
                <div className="space-y-6">
                  {/* Quick Actions */}
                  <div className="bg-gray-50 dark:bg-gray-800/50 border border-gray-300 dark:border-gray-700 rounded-sm p-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Quick Actions
                    </h3>

                    <div className="space-y-3">
                      <button
                        onClick={onEdit}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-100 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-500/20 border border-blue-200 dark:border-blue-500/30 rounded-sm transition-colors"
                      >
                        <Edit size={18} />
                        Edit Store Details
                      </button>

                      <button
                        onClick={() => {
                          // Handle toggle status
                          console.log("Toggle status:", store._id);
                        }}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-yellow-100 dark:bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 hover:bg-yellow-200 dark:hover:bg-yellow-500/20 border border-yellow-200 dark:border-yellow-500/30 rounded-sm transition-colors"
                      >
                        {store.status === "active" ? (
                          <>
                            <XCircle size={18} />
                            Deactivate Store
                          </>
                        ) : (
                          <>
                            <CheckCircle size={18} />
                            Activate Store
                          </>
                        )}
                      </button>

                      <button
                        onClick={onDelete}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-500/20 border border-red-200 dark:border-red-500/30 rounded-sm transition-colors"
                      >
                        <Trash2 size={18} />
                        Delete Store
                      </button>
                    </div>
                  </div>

                  {/* Store Workers Section */}
                  <div className="bg-gray-50 dark:bg-gray-800/50 border border-gray-300 dark:border-gray-700 rounded-sm p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                        <Users size={18} />
                        Store Workers ({workersStats.total})
                      </h3>
                      <button
                        onClick={() => refetchWorkers()}
                        className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-700 rounded-sm transition-colors"
                        title="Refresh workers"
                      >
                        <RefreshCw
                          size={14}
                          className={workersLoading ? "animate-spin" : ""}
                        />
                      </button>
                    </div>

                    {/* Worker Stats Summary */}
                    <div className="grid grid-cols-3 gap-2 mb-4">
                      <div className="text-center p-2 bg-purple-100 dark:bg-purple-500/10 rounded-sm">
                        <span className="text-xs text-purple-600 dark:text-purple-400 block">
                          Managers
                        </span>
                        <span className="text-lg font-bold text-purple-700 dark:text-purple-300">
                          {workersStats.managers}
                        </span>
                      </div>
                      <div className="text-center p-2 bg-blue-100 dark:bg-blue-500/10 rounded-sm">
                        <span className="text-xs text-blue-600 dark:text-blue-400 block">
                          Cashiers
                        </span>
                        <span className="text-lg font-bold text-blue-700 dark:text-blue-300">
                          {workersStats.cashiers}
                        </span>
                      </div>
                      <div className="text-center p-2 bg-green-100 dark:bg-green-500/10 rounded-sm">
                        <span className="text-xs text-green-600 dark:text-green-400 block">
                          Staff
                        </span>
                        <span className="text-lg font-bold text-green-700 dark:text-green-300">
                          {workersStats.staff}
                        </span>
                      </div>
                    </div>

                    {/* Worker Filter Tabs */}
                    <div className="flex gap-1 mb-3">
                      {["all", "manager", "cashier", "staff"].map((filter) => (
                        <button
                          key={filter}
                          onClick={() => setWorkerFilter(filter)}
                          className={`px-3 py-1.5 text-xs font-medium rounded-sm transition-colors capitalize ${
                            workerFilter === filter
                              ? "bg-blue-600 dark:bg-blue-500 text-white"
                              : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                          }`}
                        >
                          {filter}
                        </button>
                      ))}
                    </div>

                    {/* Workers List */}
                    <div className="space-y-2 max-h-80 overflow-y-auto pr-1 custom-scrollbar">
                      {workersLoading ? (
                        // Loading skeletons
                        Array(3)
                          .fill(0)
                          .map((_, i) => (
                            <div
                              key={i}
                              className="animate-pulse bg-gray-200 dark:bg-gray-700 h-16 rounded-sm"
                            ></div>
                          ))
                      ) : workersError ? (
                        <div className="text-center py-4 text-red-600 dark:text-red-400 text-sm">
                          Failed to load workers
                        </div>
                      ) : workers.length === 0 ? (
                        <div className="text-center py-6 text-gray-500 dark:text-gray-400 text-sm">
                          No workers found for this store
                        </div>
                      ) : (
                        workers.map((worker) => (
                          <div
                            key={worker._id}
                            className="p-3 bg-white dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-sm hover:shadow-sm transition-all group"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex items-start gap-2">
                                {worker.profileImage ? (
                                  <img
                                    src={worker.profileImage}
                                    alt={worker.fullName}
                                    className="w-8 h-8 rounded-full object-cover"
                                  />
                                ) : (
                                  <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                                    <UserCircle className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                                  </div>
                                )}
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium text-gray-900 dark:text-white text-sm">
                                      {worker.fullName}
                                    </span>
                                    <span
                                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${getRoleBadge(worker.role)}`}
                                    >
                                      {worker.role}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2 mt-1 text-xs">
                                    <span className="text-gray-600 dark:text-gray-400">
                                      {worker.email}
                                    </span>
                                    {worker.phoneNo && (
                                      <>
                                        <span className="text-gray-400 dark:text-gray-500">
                                          •
                                        </span>
                                        <span className="text-gray-600 dark:text-gray-400">
                                          {worker.phoneNo}
                                        </span>
                                      </>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-1">
                                {worker.permissions && (
                                  <div className="flex items-center gap-1 mr-2">
                                    {worker.permissions.canManage && (
                                      <span
                                        className="p-1 bg-purple-100 dark:bg-purple-500/20 rounded-sm"
                                        title="Can Manage"
                                      >
                                        <Shield className="h-3 w-3 text-purple-600 dark:text-purple-400" />
                                      </span>
                                    )}
                                    {worker.permissions.canEdit && (
                                      <span
                                        className="p-1 bg-blue-100 dark:bg-blue-500/20 rounded-sm"
                                        title="Can Edit"
                                      >
                                        <Edit className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                                      </span>
                                    )}
                                    {worker.permissions.canSell && (
                                      <span
                                        className="p-1 bg-green-100 dark:bg-green-500/20 rounded-sm"
                                        title="Can Sell"
                                      >
                                        <Briefcase className="h-3 w-3 text-green-600 dark:text-green-400" />
                                      </span>
                                    )}
                                  </div>
                                )}
                                {worker.isPrimaryStore && (
                                  <span className="text-xs bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 px-1.5 py-0.5 rounded-sm">
                                    Primary
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Store-specific role if different from global role */}
                            {worker.storeRole &&
                              worker.storeRole !== worker.role && (
                                <div className="mt-2 pt-2 border-t border-gray-100 dark:border-gray-600 flex items-center gap-1">
                                  <span className="text-xs text-gray-500 dark:text-gray-400">
                                    Store role:
                                  </span>
                                  <span
                                    className={`text-xs px-1.5 py-0.5 rounded-sm ${getRoleBadge(worker.storeRole)}`}
                                  >
                                    {worker.storeRole}
                                  </span>
                                </div>
                              )}
                          </div>
                        ))
                      )}
                    </div>

                    {/* View All Link */}
                    {workers.length > 0 && (
                      <button
                        onClick={() => setShowWorkersModal(true)} // Changed from navigation
                        className="mt-4 w-full flex items-center justify-between px-3 py-2 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-sm transition-colors"
                      >
                        <span>View all workers</span>
                        <ChevronRight size={16} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between p-6 border-t border-gray-300 dark:border-gray-700">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Store ID: {store._id}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-sm transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    copyToClipboard(store._id, "id");
                  }}
                  className="px-4 py-2 text-sm bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-sm transition-colors flex items-center gap-2"
                >
                  <Copy size={14} />
                  Copy Store ID
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Store Workers Modal */}
      <StoreWorkersModal
        isOpen={showWorkersModal}
        onClose={() => setShowWorkersModal(false)}
        store={store}
      />
      {/* Custom Scrollbar Styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #888;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #555;
        }
        .dark .custom-scrollbar::-webkit-scrollbar-track {
          background: #374151;
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #4b5563;
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #6b7280;
        }
      `}</style>
    </>
  );
};

export default StoreDetailsModal;
