import React from "react";
import { User, Phone, Mail } from "lucide-react";
import UnexpandedRows from "./UnexpandedRows";
import { toast } from "react-hot-toast";

const ConsultationListTable = ({
  selectedConsultations,
  filteredConsultations,
  selectAll,
  expandedRows,
  toggleRowExpansion,
  getSetupTypeColor,
  getStatusColor,
  toggleSelection,
  openCancelModal,
}) => {
  return (
    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
      <thead>
        <tr className="bg-gray-50 dark:bg-gray-700/50">
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 dark:text-gray-300 uppercase tracking-wider">
            <input
              type="checkbox"
              checked={
                selectedConsultations.length === filteredConsultations.length &&
                filteredConsultations.length > 0
              }
              onChange={selectAll}
              className="rounded-sm border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-blue-600 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
            />
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 dark:text-gray-300 uppercase tracking-wider">
            Customer
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 dark:text-gray-300 uppercase tracking-wider">
            Setup Type
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 dark:text-gray-300 uppercase tracking-wider">
            Date & Time
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 dark:text-gray-300 uppercase tracking-wider">
            Price
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 dark:text-gray-300 uppercase tracking-wider">
            Status
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 dark:text-gray-300 uppercase tracking-wider">
            Responded
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 dark:text-gray-300 uppercase tracking-wider">
            Actions
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 dark:text-gray-300 uppercase tracking-wider">
            Contact
          </th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
        {filteredConsultations.map((consultation) => (
          <React.Fragment key={consultation.id}>
            <UnexpandedRows
              selectedConsultations={selectedConsultations}
              consultation={consultation}
              expandedRows={expandedRows}
              toggleRowExpansion={toggleRowExpansion}
              getSetupTypeColor={getSetupTypeColor}
              getStatusColor={getStatusColor}
              toggleSelection={toggleSelection}
            />
            {expandedRows.includes(consultation.id) && (
              <tr className="bg-gray-50 dark:bg-gray-700/30">
                <td colSpan="8" className="px-6 py-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Customer Details */}
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                        Customer Details
                      </h4>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-700 dark:text-gray-400" />
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {consultation.customerName}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-gray-700 dark:text-gray-400" />
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {consultation.customerPhone}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-gray-700 dark:text-gray-400" />
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {consultation.customerEmail}
                          </span>
                        </div>
                        <div className="text-sm">
                          <span className="text-gray-700 dark:text-gray-500">
                            Reference:{" "}
                          </span>
                          <span className="text-gray-900 dark:text-white font-mono font-medium">
                            {consultation.referenceNumber}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Booking Details */}
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                        Booking Details
                      </h4>
                      <div className="space-y-2">
                        <div className="text-sm">
                          <span className="text-gray-700 dark:text-gray-500">
                            Type:{" "}
                          </span>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {consultation.setupTypeLabel}
                          </span>
                        </div>
                        <div className="text-sm">
                          <span className="text-gray-700 dark:text-gray-500">
                            Duration:{" "}
                          </span>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {consultation.duration}
                          </span>
                        </div>
                        <div className="text-sm">
                          <span className="text-gray-700 dark:text-gray-500">
                            Price:{" "}
                          </span>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {consultation.budgetRange}
                          </span>
                        </div>
                        <div className="text-sm">
                          <span className="text-gray-700 dark:text-gray-500">
                            Status:{" "}
                          </span>
                          <span
                            className={`px-2 py-1 rounded-sm text-xs font-medium ${getStatusColor(consultation.status)}`}
                          >
                            {consultation.status}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Notes & Actions */}
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                        Notes & Actions
                      </h4>
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm text-gray-800 dark:text-gray-300 bg-gray-100 dark:bg-gray-700/50 p-3 rounded-sm">
                            {consultation.notes || "No notes provided"}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(
                                consultation.referenceNumber,
                              );
                              toast.success("Reference copied to clipboard");
                            }}
                            className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 text-sm rounded-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-medium border border-gray-300 dark:border-gray-600"
                          >
                            Copy Reference
                          </button>
                          {consultation.status === "pending" && (
                            <button
                              onClick={() => openCancelModal(consultation)}
                              className="px-3 py-1.5 bg-gradient-to-r from-red-600 to-red-700 dark:from-red-500 dark:to-red-600 text-white text-sm rounded-sm hover:from-red-700 hover:to-red-800 dark:hover:from-red-600 dark:hover:to-red-700 transition-colors font-medium"
                            >
                              Cancel Booking
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </td>
              </tr>
            )}
          </React.Fragment>
        ))}
      </tbody>
    </table>
  );
};

export default ConsultationListTable;
