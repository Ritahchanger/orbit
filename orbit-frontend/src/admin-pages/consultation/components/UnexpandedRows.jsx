import { useState } from "react";
import {
  Calendar,
  Clock,
  Phone,
  Mail as MailIcon,
  Phone as PhoneIcon,
  XCircle,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  Clock as ClockIcon,
} from "lucide-react";

import ConsultationEmailModal from "../modals/ConsultationEmailModal";
import CustomerAvatar from "../../customers/CustomerAvatar";

const UnexpandedRows = ({
  selectedConsultations,
  expandedRows,
  toggleRowExpansion,
  getSetupTypeColor,
  getStatusColor,
  consultation,
  toggleSelection,
  openCancelModal,
}) => {
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [selectedConsultation, setSelectedConsultation] = useState(null);

  const handleSendEmail = async (emailData) => {
    console.log("Sending email:", emailData);
  };

  console.log(consultation);

  // Helper function to get responded status color
  const getRespondedColor = (responded) => {
    return responded
      ? "bg-green-100 dark:bg-green-500/20 text-green-800 dark:text-green-400 border border-green-200 dark:border-green-500/30"
      : "bg-yellow-100 dark:bg-yellow-500/20 text-yellow-800 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-500/30";
  };

  return (
    <>
      <tr
        className={`hover:bg-gray-50 dark:hover:bg-gray-700/30 ${expandedRows.includes(consultation.id) ? "bg-blue-50 dark:bg-gray-800/50" : ""}`}
      >
        <td className="px-6 py-4">
          <input
            type="checkbox"
            checked={selectedConsultations.includes(consultation.id)}
            onChange={() => toggleSelection(consultation.id)}
            className="rounded-sm border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
          />
        </td>
        <td className="px-6 py-4">
          <div className="flex items-center">
            <CustomerAvatar name={consultation.customerName.charAt(0)} />
            <div className="ml-4">
              <div className="text-sm font-medium text-gray-900 dark:text-white">
                {consultation.customerName}
                <span className="ml-2 px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded-sm">
                  {consultation.referenceNumber}
                </span>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2 mt-1">
                <Phone className="h-3 w-3" />
                {consultation.customerPhone}
              </div>
            </div>
          </div>
        </td>
        <td className="px-6 py-4">
          <div className="flex items-center">
            <div
              className={`w-8 h-8 bg-linear-to-br ${getSetupTypeColor(consultation.setupType)} rounded-sm flex items-center justify-center mr-2`}
            >
              <Calendar className="h-4 w-4 text-white" />
            </div>
            <div>
              <div className="text-sm font-medium text-gray-900 dark:text-white">
                {consultation.setupTypeLabel}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {consultation.duration}
              </div>
            </div>
          </div>
        </td>
        <td className="px-6 py-4">
          <div className="text-sm text-gray-900 dark:text-white">
            {new Date(consultation.consultationDate).toLocaleDateString(
              "en-KE",
              {
                weekday: "short",
                month: "short",
                day: "numeric",
              },
            )}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {consultation.consultationTime}
          </div>
        </td>
        <td className="px-6 py-4">
          <div className="text-sm text-gray-900 dark:text-white">
            {consultation.budgetRange}
          </div>
        </td>
        <td className="px-6 py-4">
          <span
            className={`px-3 py-1 rounded-sm text-xs font-medium ${getStatusColor(consultation.status)}`}
          >
            {consultation.status.charAt(0).toUpperCase() +
              consultation.status.slice(1)}
          </span>
        </td>
        {/* NEW: Responded Column */}
        <td className="px-6 py-4">
          <div className="flex items-center">
            <span
              className={`inline-flex items-center gap-1 px-3 py-1 rounded-sm text-xs font-medium ${getRespondedColor(consultation.responded)}`}
            >
              {consultation.responded ? (
                <>
                  <CheckCircle className="h-3 w-3" />
                  Yes
                </>
              ) : (
                <>
                  <ClockIcon className="h-3 w-3" />
                  No
                </>
              )}
            </span>
          </div>
        </td>
        <td className="px-6 py-4">
          <div className="flex items-center space-x-2">
            {consultation.status === "pending" && openCancelModal && (
              <button
                onClick={() => openCancelModal(consultation)}
                className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-sm transition-colors"
                title="Cancel Booking"
              >
                <XCircle className="h-4 w-4 text-red-600 dark:text-red-500" />
              </button>
            )}
            <button
              onClick={() => toggleRowExpansion(consultation.id)}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-sm transition-colors"
              title={
                expandedRows.includes(consultation.id)
                  ? "Collapse Details"
                  : "Expand Details"
              }
            >
              {expandedRows.includes(consultation.id) ? (
                <ChevronUp className="h-4 w-4 text-gray-600 dark:text-gray-400" />
              ) : (
                <ChevronDown className="h-4 w-4 text-gray-600 dark:text-gray-400" />
              )}
            </button>
          </div>
        </td>
        <td className="px-6 py-4">
          <div className="flex items-center space-x-3">
            <a
              href={`tel:${consultation.customerPhone}`}
              className="p-1 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-sm transition-colors"
              title={`Call ${consultation.customerPhone}`}
            >
              <PhoneIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </a>
            <button
              className="p-1 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-sm transition-colors"
              title={`Email ${consultation.customerEmail}`}
              onClick={() => {
                setSelectedConsultation(consultation);
                setShowEmailModal(true);
              }}
            >
              <MailIcon className="h-4 w-4 text-green-600 dark:text-green-400" />
            </button>
          </div>
        </td>
      </tr>
      <ConsultationEmailModal
        isOpen={showEmailModal}
        onClose={() => setShowEmailModal(false)}
        consultation={selectedConsultation}
        onSendEmail={handleSendEmail}
      />
    </>
  );
};

export default UnexpandedRows;
