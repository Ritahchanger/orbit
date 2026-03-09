import { useState } from "react";
import { Calendar, XCircle, AlertTriangle, X } from "lucide-react";
import { toast } from "react-hot-toast";
import ConsultationListTable from "./ConsultationListTable";

const ConsultationList = ({
  filteredConsultations,
  updateStatus,
  searchQuery,
  selectedStatus,
  selectedSetupType,
  selectedConsultations,
  selectAll,
  expandedRows,
  toggleRowExpansion,
  getSetupTypeColor,
  getStatusColor,
  toggleSelection,
  selectedDate,
  canManageConsultations,
}) => {
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState(null);
  const [cancellationReason, setCancellationReason] = useState("");
  const [isCancelling, setIsCancelling] = useState(false);

  // Open cancel confirmation modal
  const openCancelModal = (consultation) => {
    setBookingToCancel(consultation);
    setCancellationReason("");
    setCancelModalOpen(true);
  };

  // Close cancel modal
  const closeCancelModal = () => {
    setCancelModalOpen(false);
    setBookingToCancel(null);
    setCancellationReason("");
    setIsCancelling(false);
  };

  // Handle cancellation
  const handleCancelBooking = async () => {
    if (!bookingToCancel || !cancellationReason.trim()) {
      toast.error("Please provide a cancellation reason");
      return;
    }

    setIsCancelling(true);
    try {c
      await updateStatus(bookingToCancel.id, "cancelled", cancellationReason);
      toast.success(
        `Booking ${bookingToCancel.referenceNumber} cancelled successfully`,
      );
      closeCancelModal();
    } catch (error) {
      toast.error(error.message || "Failed to cancel booking");
      setIsCancelling(false);
    }
  };

  return (
    <>
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-sm overflow-hidden">
        <div className="overflow-x-auto">
          <ConsultationListTable
            selectedConsultations={selectedConsultations}
            filteredConsultations={filteredConsultations}
            selectAll={selectAll}
            expandedRows={expandedRows}
            toggleRowExpansion={toggleRowExpansion}
            getSetupTypeColor={getSetupTypeColor}
            getStatusColor={getStatusColor}
            toggleSelection={toggleSelection}
            openCancelModal={openCancelModal}
          />
        </div>

        {/* Empty State */}
        {filteredConsultations.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-50 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-2">
              <Calendar className="h-8 w-8 text-gray-400 dark:text-gray-500" />
            </div>
            <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
              No bookings found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto text-sm">
              {searchQuery ||
              selectedStatus !== "all" ||
              selectedSetupType !== "all" ||
              selectedDate !== "all"
                ? "Try adjusting your filters to find what you are looking for."
                : "No bookings have been made yet."}
            </p>
          </div>
        )}
      </div>

      {/* Cancel Confirmation Modal */}
      {canManageConsultations && cancelModalOpen && bookingToCancel && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 dark:bg-black/70 transition-opacity"
            onClick={closeCancelModal}
          />

          {/* Modal */}
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative w-full max-w-[500px] bg-white dark:bg-gray-800 rounded-sm border border-gray-200 dark:border-gray-700 shadow-xl">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-100 dark:bg-amber-900/20 rounded-sm">
                    <AlertTriangle
                      className="text-amber-600 dark:text-amber-400"
                      size={20}
                    />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Cancel Booking
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Confirm booking cancellation
                    </p>
                  </div>
                </div>
                <button
                  onClick={closeCancelModal}
                  className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-sm transition-colors"
                  disabled={isCancelling}
                >
                  <X size={18} className="text-gray-500 dark:text-gray-400" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="mb-2">
                  <p className="text-gray-700 dark:text-gray-300 mb-4 text-sm">
                    Are you sure you want to cancel this booking?
                  </p>

                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-sm p-4 mb-4 border border-gray-200 dark:border-gray-600">
                    <div className="flex items-center mb-3">
                      <div className="shrink-0 h-8 w-8 bg-linear-to-br from-blue-500 to-blue-600 dark:from-blue-400 dark:to-blue-500 rounded-full flex items-center justify-center text-white font-medium text-sm">
                        {bookingToCancel.customerName.charAt(0)}
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {bookingToCancel.customerName}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Ref: {bookingToCancel.referenceNumber}
                        </div>
                      </div>
                    </div>

                    <div className="text-sm text-gray-700 dark:text-gray-300 space-y-1.5">
                      <div>
                        <span className="text-gray-600 dark:text-gray-500 text-sm">
                          Date:{" "}
                        </span>
                        {new Date(
                          bookingToCancel.consultationDate,
                        ).toLocaleDateString("en-KE", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                        })}
                      </div>
                      <div>
                        <span className="text-gray-600 dark:text-gray-500 text-sm">
                          Time:{" "}
                        </span>
                        {bookingToCancel.consultationTime}
                      </div>
                      <div>
                        <span className="text-gray-600 dark:text-gray-500 text-sm">
                          Type:{" "}
                        </span>
                        <span
                          className={`px-2 py-0.5 text-xs rounded-sm ${getSetupTypeColor(bookingToCancel.setupType)}`}
                        >
                          {bookingToCancel.setupTypeLabel}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Cancellation Reason *
                    </label>
                    <textarea
                      value={cancellationReason}
                      onChange={(e) => setCancellationReason(e.target.value)}
                      placeholder="Please provide a reason for cancellation..."
                      rows="3"
                      className="w-full px-3 py-2.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors text-sm resize-none"
                      required
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      This reason will be recorded and may be shared with the
                      customer.
                    </p>
                  </div>
                </div>

                {/* Warning Message */}
                <div className="mb-6 p-3 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/30 rounded-sm">
                  <div className="flex items-start gap-2">
                    <AlertTriangle
                      className="text-amber-600 dark:text-amber-400 mt-0.5"
                      size={14}
                    />
                    <p className="text-sm text-amber-700 dark:text-amber-400">
                      Cancelling will mark this time slot as available for other
                      bookings.
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3">
                  <button
                    onClick={closeCancelModal}
                    disabled={isCancelling}
                    className="px-4 py-2.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-sm transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Go Back
                  </button>
                  <button
                    onClick={handleCancelBooking}
                    disabled={isCancelling || !cancellationReason.trim()}
                    className="px-4 py-2.5 bg-linear-to-r from-red-600 to-red-700 dark:from-red-500 dark:to-red-600 hover:from-red-700 hover:to-red-800 dark:hover:from-red-600 dark:hover:to-red-700 text-white rounded-sm transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isCancelling ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Cancelling...
                      </>
                    ) : (
                      "Confirm Cancellation"
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ConsultationList;
