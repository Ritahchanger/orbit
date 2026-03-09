// src/pages/admin/AdminConsultation.jsx
import { useState } from "react";
import { AlertCircle, BarChart3, CalendarDays, Mail } from "lucide-react";

import AdminLayout from "../../dashboard/layout/Layout";

import { setupTypes } from "../data";

import { useQuery } from "@tanstack/react-query";

import bookingApi from "../../services/booking-api";

import { useBookingMutations } from "../../hooks/bookings.mutations";

import toast from "react-hot-toast";

import ConsultationList from "../components/ConsultationList";

import { useNavigate } from "react-router-dom";

import ConsultationPageSkeleton from "../preloaders/ConsultationPreloader";

import CalendarView from "../components/CalendarView";

import StatsCardConsultations from "../components/StatsCardConsultations";

import AdminConsultationHeader from "../components/AdminConsultationHeader";

import AdminFiltersConsultation from "../components/AdminFiltersConsultation";

import ConsultationEmailsPanel from "../../dashboard/components/ConsultationEmailsPanel";

import { statusOptions } from "../data";

import {
  useSimpleRolePermissionCheck,
  usePermissionCheck,
} from "../../../context/RolePermissionContext";

const AdminConsultation = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const [selectedStatus, setSelectedStatus] = useState("all");

  const [selectedSetupType, setSelectedSetupType] = useState("all");

  const [selectedDate, setSelectedDate] = useState("all");

  const [expandedRows, setExpandedRows] = useState([]);

  const [selectedConsultations, setSelectedConsultations] = useState([]);

  const [viewMode, setViewMode] = useState("list");

  const navigate = useNavigate();

  const { hasPermission, hasAnyPermission } = usePermissionCheck();

  const { userRole } = useSimpleRolePermissionCheck();

  const [showEmailsPanel, setShowEmailsPanel] = useState(false);

  const canViewConsultations =
    hasPermission("consultations.view") ||
    hasAnyPermission(["consultations.manage"]);

  const canManageConsultations = hasAnyPermission([
    "consultations.update",
    "consultations.cancel",
    "consultations.manage",
  ]);

  const canExportConsultations =
    hasPermission("consultations.export") ||
    hasAnyPermission(["consultations.manage"]);

  const canChangeConsultationTypes =
    hasPermission("consultation_types.manage") ||
    hasAnyPermission(["consultations.manage"]);

  // Fetch bookings from API
  const {
    data: bookingsData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["adminBookings"],
    queryFn: () => bookingApi.getAllBookings(),
    staleTime: 30000, // 30 seconds
  });

  const { cancelBookingAsync } = useBookingMutations();

  // Transform API data to match your component structure
  const consultations =
    bookingsData?.data?.map((booking) => ({
      id: booking._id || booking.referenceNumber,
      referenceNumber: booking.referenceNumber,
      customerName: booking.user?.name || "N/A",
      responded: booking.responded || false,
      customerPhone: booking.user?.phone || "N/A",
      customerEmail: booking.user?.email || "N/A",
      setupType: booking.consultationType?.id || "unknown",
      setupTypeLabel: booking.consultationType?.title || "Unknown Type",
      duration: booking.consultationType?.duration || "N/A",
      consultationDate: new Date(booking.date).toISOString().split("T")[0],
      consultationTime: booking.timeSlot,
      budgetRange: booking.consultationType?.price?.amount || "N/A",
      status: booking.status,
      notes: booking.user?.notes || "",
      isFirstTime: true,
      hardwareInterests: [],
      referralSource: "Website",
      preferredContact: "Phone",
      followUpRequired: booking.status === "pending",
    })) || [];

  // Calculate statistics
  const stats = {
    total: consultations.length,
    pending: consultations.filter((c) => c.status === "pending").length,
    confirmed: consultations.filter((c) => c.status === "confirmed").length,
    completed: consultations.filter((c) => c.status === "completed").length,
    cancelled: consultations.filter((c) => c.status === "cancelled").length,
    conversionRate:
      consultations.length > 0
        ? Math.round(
            (consultations.filter((c) => c.status === "completed").length /
              consultations.length) *
              100,
          )
        : 0,
  };

  // Filter consultations
  const filteredConsultations = consultations.filter((consultation) => {
    const matchesSearch =
      searchQuery === "" ||
      consultation.customerName
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      consultation.customerPhone.includes(searchQuery) ||
      consultation.customerEmail
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      consultation.referenceNumber
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

    const matchesStatus =
      selectedStatus === "all" || consultation.status === selectedStatus;
    const matchesSetupType =
      selectedSetupType === "all" ||
      consultation.setupType === selectedSetupType;
    const matchesDate =
      selectedDate === "all" || consultation.consultationDate === selectedDate;

    return matchesSearch && matchesStatus && matchesSetupType && matchesDate;
  });

  console.log(filteredConsultations);

  // Get unique dates for filter
  const uniqueDates = [
    ...new Set(consultations.map((c) => c.consultationDate)),
  ].sort();

  // Toggle row expansion
  const toggleRowExpansion = (id) => {
    setExpandedRows((prev) =>
      prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id],
    );
  };

  // Toggle selection
  const toggleSelection = (id) => {
    setSelectedConsultations((prev) =>
      prev.includes(id)
        ? prev.filter((consultationId) => consultationId !== id)
        : [...prev, id],
    );
  };

  // Select all
  const selectAll = () => {
    if (selectedConsultations.length === filteredConsultations.length) {
      setSelectedConsultations([]);
    } else {
      setSelectedConsultations(filteredConsultations.map((c) => c.id));
    }
  };

  // In your AdminConsultation.jsx, update the updateStatus function:
  const updateStatus = async (id, newStatus, reason = "") => {
    try {
      if (newStatus === "cancelled") {
        // Find the booking reference number
        const consultation = consultations.find((c) => c.id === id);
        if (consultation?.referenceNumber) {
          await cancelBookingAsync({
            referenceNumber: consultation.referenceNumber,
            reason: reason || "Cancelled by admin",
          });
          toast.success("Booking cancelled successfully");
          refetch();
        }
      } else {
        // For other status updates
        toast.error("Status update not implemented yet");
      }
    } catch (error) {
      toast.error(error.message || "Failed to update status");
    }
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20";
      case "confirmed":
        return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20";
      case "completed":
        return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20";
      case "cancelled":
        return "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20";
      default:
        return "bg-gray-500/10 text-gray-600 dark:text-gray-400 border border-gray-500/20";
    }
  };

  // Get setup type color
  const getSetupTypeColor = (type) => {
    const setup = setupTypes.find((s) => s.id === type);
    return setup ? setup.color : "from-gray-500 to-gray-600";
  };

  // Export data
  const exportData = () => {
    const dataToExport = filteredConsultations.map((c) => ({
      Reference: c.referenceNumber,
      Customer: c.customerName,
      Phone: c.customerPhone,
      Email: c.customerEmail,
      "Setup Type": c.setupTypeLabel,
      Duration: c.duration,
      Price: c.budgetRange,
      Date: c.consultationDate,
      Time: c.consultationTime,
      Status: c.status.charAt(0).toUpperCase() + c.status.slice(1),
      Notes: c.notes,
    }));

    const csvContent = [
      Object.keys(dataToExport[0]).join(","),
      ...dataToExport.map((row) =>
        Object.values(row)
          .map((value) => `"${value}"`)
          .join(","),
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bookings_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  if (!canViewConsultations && userRole !== "superadmin") {
    return (
      <AdminLayout>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white flex items-center justify-center p-6">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-500 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Access Denied
            </h3>
            <p className="text-gray-600 dark:text-gray-400 max-w-md text-sm">
              You don't have permission to view or manage consultations. Please
              contact your administrator for access.
            </p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <AdminLayout>
        <ConsultationPageSkeleton />
      </AdminLayout>
    );
  }

  // Error state
  if (error) {
    return (
      <AdminLayout>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white flex items-center justify-center p-6">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-rose-600 dark:text-rose-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Error loading consultations
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">
              {error.message || "Failed to fetch data"}
            </p>
            <button
              onClick={() => refetch()}
              className="px-4 py-2.5 bg-blue-600 dark:bg-blue-500 text-white rounded-sm hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors font-medium text-sm"
            >
              Try Again
            </button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white p-4 sm:p-6">
        {/* Header */}
        <div className="mb-2">
          <AdminConsultationHeader
            refetch={refetch}
            exportData={exportData}
            filteredConsultations={filteredConsultations}
            canExportConsultations={canExportConsultations}
          />

          {/* Stats Cards */}
          <StatsCardConsultations stats={stats} />

          {/* View Mode Toggle */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => {
                  setShowEmailsPanel(true);
                  setViewMode("list");
                }}
                className={`px-4 py-2 rounded-sm flex items-center gap-2 transition-colors text-sm font-medium ${
                  viewMode === "list"
                    ? "bg-blue-600 dark:bg-blue-500 text-white"
                    : "bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700"
                }`}
              >
                <BarChart3 className="h-4 w-4" />
                <span>List View</span>
              </button>
              <button
                onClick={() => setViewMode("calendar")}
                className={`px-4 py-2 rounded-sm flex items-center gap-2 transition-colors text-sm font-medium ${
                  viewMode === "calendar"
                    ? "bg-blue-600 dark:bg-blue-500 text-white"
                    : "bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700"
                }`}
              >
                <CalendarDays className="h-4 w-4" />
                <span>Calendar View</span>
              </button>
              <button
                onClick={() => navigate("/admin/consultation/types")}
                className="px-4 py-2 rounded-sm flex items-center gap-2 bg-blue-600 dark:bg-blue-500 text-white hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors text-sm font-medium"
              >
                <span>Consultation Types</span>
              </button>
              <button
                onClick={() => setShowEmailsPanel(true)}
                className="px-4 py-2 rounded-sm flex items-center gap-2 bg-blue-600 dark:bg-blue-500 text-white hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors text-sm font-medium"
              >
                <Mail className="h-4 w-4" />
                <span>Responses</span>
              </button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <AdminFiltersConsultation
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          setSelectedStatus={setSelectedStatus}
          selectedStatus={selectedStatus}
          statusOptions={statusOptions}
          setupTypes={setupTypes}
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          uniqueDates={uniqueDates}
          selectedSetupType={selectedSetupType}
          setSelectedSetupType={setSelectedSetupType}
        />

        {/* Bulk Actions */}
        {selectedConsultations.length > 0 && (
          <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800/30 rounded-sm p-4 mb-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <span className="text-blue-700 dark:text-blue-400 font-medium text-sm">
                  {selectedConsultations.length} consultation(s) selected
                </span>
                <select
                  onChange={(e) => {
                    if (e.target.value === "cancelled") {
                      if (
                        window.confirm(
                          `Cancel ${selectedConsultations.length} booking(s)?`,
                        )
                      ) {
                        selectedConsultations.forEach((id) =>
                          updateStatus(id, "cancelled"),
                        );
                        setSelectedConsultations([]);
                      }
                    }
                  }}
                  className="px-3 py-1.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-sm text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                >
                  <option value="" className="text-gray-500 dark:text-gray-400">
                    Change Status
                  </option>
                  {canManageConsultations && (
                    <option value="cancelled">Cancel Selected</option>
                  )}
                </select>
              </div>
              <button
                onClick={() => setSelectedConsultations([])}
                className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white text-sm transition-colors font-medium"
              >
                Clear Selection
              </button>
            </div>
          </div>
        )}

        <ConsultationList
          selectedConsultations={selectedConsultations}
          filteredConsultations={filteredConsultations}
          selectAll={selectAll}
          expandedRows={expandedRows}
          updateStatus={updateStatus}
          toggleRowExpansion={toggleRowExpansion}
          getSetupTypeColor={getSetupTypeColor}
          getStatusColor={getStatusColor}
          toggleSelection={toggleSelection}
          searchQuery={searchQuery}
          selectedStatus={selectedStatus}
          selectedSetupType={selectedSetupType}
          selectedDate={selectedDate}
          canChangeConsultationTypes={canChangeConsultationTypes}
          canManageConsultations={canManageConsultations}
        />

        {showEmailsPanel && (
          <ConsultationEmailsPanel onClose={() => setShowEmailsPanel(false)} />
        )}

        {/* Calendar View (Simplified) */}
        {viewMode === "calendar" && (
          <>
            <CalendarView consultations={consultations} />
          </>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminConsultation;
