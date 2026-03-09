// src/pages/admin/components/ConsultationEmailsPanel.jsx
import { useState } from "react";
import {
  Mail,
  Trash2,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Download,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  RefreshCw,
  Inbox,
  User,
  Calendar,
} from "lucide-react";
import { format } from "date-fns";
import {
  useGetAllConsultationEmails,
  useDeleteConsultationEmail,
  useDeleteMultipleConsultationEmails,
} from "../../hooks/consultation-emails.hook";

import toast from "react-hot-toast";

const ConsultationEmailsPanel = ({ onClose }) => {
  const [selectedEmails, setSelectedEmails] = useState([]);
  const [expandedEmail, setExpandedEmail] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterTemplate, setFilterTemplate] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [emailToDelete, setEmailToDelete] = useState(null);

  // Fetch emails
  const {
    data: emailsData,
    isLoading,
    error,
    refetch,
    isFetching,
  } = useGetAllConsultationEmails();

  // Delete mutations
  const deleteEmailMutation = useDeleteConsultationEmail();
  const deleteMultipleEmailsMutation = useDeleteMultipleConsultationEmails();

  const emails = emailsData?.data || [];

  // Get unique templates for filter
  const templates = [
    ...new Set(emails.map((e) => e.templateUsed).filter(Boolean)),
  ];

  // Filter emails
  const filteredEmails = emails.filter((email) => {
    const matchesSearch =
      searchQuery === "" ||
      email.to?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      email.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      email.templateUsed?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      email._id?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      filterStatus === "all" || email.deliveryStatus === filterStatus;

    const matchesTemplate =
      filterTemplate === "all" || email.templateUsed === filterTemplate;

    return matchesSearch && matchesStatus && matchesTemplate;
  });

  // Toggle email selection
  const toggleEmailSelection = (emailId) => {
    setSelectedEmails((prev) =>
      prev.includes(emailId)
        ? prev.filter((id) => id !== emailId)
        : [...prev, emailId],
    );
  };

  // Select all emails
  const selectAllEmails = () => {
    if (selectedEmails.length === filteredEmails.length) {
      setSelectedEmails([]);
    } else {
      setSelectedEmails(filteredEmails.map((e) => e._id));
    }
  };

  // Handle single delete
  const handleDeleteEmail = async (emailId) => {
    try {
      await deleteEmailMutation.mutateAsync(emailId);
      setEmailToDelete(null);
      setShowDeleteConfirm(false);
      toast.success("Email deleted successfully");
    } catch (error) {
      toast.error("Failed to delete email");
    }
  };

  // Handle bulk delete
  const handleBulkDelete = async () => {
    if (selectedEmails.length === 0) return;

    try {
      await deleteMultipleEmailsMutation.mutateAsync(selectedEmails);
      setSelectedEmails([]);
      toast.success(`${selectedEmails.length} email(s) deleted successfully`);
    } catch (error) {
      toast.error("Failed to delete emails");
    }
  };

  // Download email content as HTML
  const downloadEmail = (email) => {
    const blob = new Blob([email.content], { type: "text/html" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `email-${email.templateUsed || "template"}-${format(new Date(email.sentAt), "yyyy-MM-dd-HHmm")}.html`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success("Email downloaded");
  };

  // Get status badge
  const getStatusBadge = (status) => {
    switch (status) {
      case "sent":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-sm text-xs font-medium">
            <CheckCircle className="h-3 w-3" />
            Sent
          </span>
        );
      case "pending":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-sm text-xs font-medium">
            <Clock className="h-3 w-3" />
            Pending
          </span>
        );
      case "failed":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-sm text-xs font-medium">
            <XCircle className="h-3 w-3" />
            Failed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-500/10 text-gray-600 dark:text-gray-400 rounded-sm text-xs font-medium">
            <Mail className="h-3 w-3" />
            {status || "Unknown"}
          </span>
        );
    }
  };

  // Get template badge
  const getTemplateBadge = (template) => {
    const colors = {
      accept: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
      reject: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
      pending: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
      info: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
    };

    const color =
      colors[template] || "bg-gray-500/10 text-gray-600 dark:text-gray-400";

    return (
      <span
        className={`inline-flex items-center px-2 py-1 rounded-sm text-xs font-medium ${color}`}
      >
        {template || "custom"}
      </span>
    );
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-sm w-full max-w-6xl max-h-[90vh] overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="h-6 w-48 bg-gray-200 dark:bg-gray-700 animate-pulse rounded"></div>
          </div>
          <div className="p-6 space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-16 bg-gray-100 dark:bg-gray-700 animate-pulse rounded"
              ></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-sm w-full max-w-md p-6 text-center">
          <AlertCircle className="h-12 w-12 text-rose-600 dark:text-rose-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Error Loading Emails
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
            {error.message || "Failed to fetch consultation emails"}
          </p>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-blue-600 text-white rounded-sm hover:bg-blue-700 text-sm font-medium"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-sm w-full max-w-6xl max-h-[90vh] flex flex-col shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <Mail className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Consultation Email Responses
            </h2>
            <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-sm text-xs font-medium">
              {filteredEmails.length} total
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => refetch()}
              disabled={isFetching}
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-sm transition-colors disabled:opacity-50"
            >
              <RefreshCw
                className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`}
              />
            </button>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl font-light leading-none"
            >
              ×
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by email, subject, template..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-sm text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-sm text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="sent">Sent</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>

            {/* Template Filter */}
            <select
              value={filterTemplate}
              onChange={(e) => setFilterTemplate(e.target.value)}
              className="px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-sm text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Templates</option>
              {templates.map((template) => (
                <option key={template} value={template}>
                  {template}
                </option>
              ))}
            </select>
          </div>

          {/* Bulk Actions */}
          {selectedEmails.length > 0 && (
            <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800/30 rounded-sm">
              <span className="text-blue-700 dark:text-blue-400 text-sm font-medium">
                {selectedEmails.length} email(s) selected
              </span>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSelectedEmails([])}
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                >
                  Clear
                </button>
                <button
                  onClick={() => {
                    if (
                      window.confirm(
                        `Delete ${selectedEmails.length} selected email(s)?`,
                      )
                    ) {
                      handleBulkDelete();
                    }
                  }}
                  className="flex items-center gap-1 px-3 py-1 bg-rose-600 text-white rounded-sm hover:bg-rose-700 text-sm font-medium"
                >
                  <Trash2 className="h-3 w-3" />
                  Delete Selected
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Email List */}
        <div className="flex-1 overflow-y-auto p-4">
          {filteredEmails.length === 0 ? (
            <div className="text-center py-12">
              <Inbox className="h-12 w-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                No consultation emails found
              </p>
              {(searchQuery ||
                filterStatus !== "all" ||
                filterTemplate !== "all") && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setFilterStatus("all");
                    setFilterTemplate("all");
                  }}
                  className="mt-4 text-blue-600 dark:text-blue-400 text-sm hover:underline"
                >
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {/* Select All Header */}
              <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-sm text-sm font-medium text-gray-700 dark:text-gray-300">
                <input
                  type="checkbox"
                  checked={
                    selectedEmails.length === filteredEmails.length &&
                    filteredEmails.length > 0
                  }
                  onChange={selectAllEmails}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="flex-1">
                  Select All ({filteredEmails.length})
                </span>
              </div>

              {filteredEmails.map((email) => (
                <div
                  key={email._id}
                  className="border border-gray-200 dark:border-gray-700 rounded-sm overflow-hidden"
                >
                  {/* Email Header */}
                  <div className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800">
                    <input
                      type="checkbox"
                      checked={selectedEmails.includes(email._id)}
                      onChange={() => toggleEmailSelection(email._id)}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />

                    <button
                      onClick={() =>
                        setExpandedEmail(
                          expandedEmail === email._id ? null : email._id,
                        )
                      }
                      className="flex-1 flex items-center gap-4 text-left"
                    >
                      <div className="flex-shrink-0">
                        {getStatusBadge(email.deliveryStatus)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {email.to}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            <User className="h-3 w-3 inline mr-1" />
                            {email.sentBy?.name || "System"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                          <span className="truncate max-w-md">
                            {email.subject}
                          </span>
                          <span>•</span>
                          {getTemplateBadge(email.templateUsed)}
                        </div>
                      </div>

                      <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(email.sentAt), "MMM d, yyyy HH:mm")}
                        </span>
                        {expandedEmail === email._id ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </div>
                    </button>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => downloadEmail(email)}
                        className="p-1.5 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-sm transition-colors"
                        title="Download email"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => {
                          setEmailToDelete(email._id);
                          setShowDeleteConfirm(true);
                        }}
                        className="p-1.5 text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-sm transition-colors"
                        title="Delete email"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Expanded Content */}
                  {expandedEmail === email._id && (
                    <div className="p-4 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-700">
                      <div className="space-y-3">
                        {/* Email Details */}
                        <div className="grid grid-cols-2 gap-3 text-xs">
                          <div className="space-y-1">
                            <p className="text-gray-500 dark:text-gray-400">
                              Message ID:
                            </p>
                            <p className="text-gray-900 dark:text-white font-mono break-all">
                              {email.messageId || "N/A"}
                            </p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-gray-500 dark:text-gray-400">
                              CC:
                            </p>
                            <p className="text-gray-900 dark:text-white">
                              {email.cc?.length ? email.cc.join(", ") : "None"}
                            </p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-gray-500 dark:text-gray-400">
                              BCC:
                            </p>
                            <p className="text-gray-900 dark:text-white">
                              {email.bcc?.length
                                ? email.bcc.join(", ")
                                : "None"}
                            </p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-gray-500 dark:text-gray-400">
                              Sent By:
                            </p>
                            <p className="text-gray-900 dark:text-white">
                              {email.sentBy?.name || "System"} (
                              {email.sentBy?.email || "N/A"})
                            </p>
                          </div>
                        </div>

                        {/* Email Content Preview */}
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                            Content:
                          </p>
                          <div
                            className="p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-sm max-h-60 overflow-y-auto text-sm prose dark:prose-invert max-w-none"
                            dangerouslySetInnerHTML={{ __html: email.content }}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
          <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
            <span>
              Showing {filteredEmails.length} of {emails.length} emails
            </span>
            <span>
              Last updated:{" "}
              {emails.length > 0
                ? format(
                    new Date(
                      Math.max(...emails.map((e) => new Date(e.updatedAt))),
                    ),
                    "MMM d, yyyy HH:mm",
                  )
                : "N/A"}
            </span>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && emailToDelete && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-[60] p-4">
          <div className="bg-white dark:bg-gray-800 rounded-sm w-full max-w-md p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-rose-100 dark:bg-rose-900/20 rounded-full">
                <Trash2 className="h-5 w-5 text-rose-600 dark:text-rose-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Delete Email
              </h3>
            </div>

            <p className="text-gray-600 dark:text-gray-400 text-sm mb-6">
              Are you sure you want to delete this email? This action cannot be
              undone.
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setEmailToDelete(null);
                }}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-sm text-sm font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteEmail(emailToDelete)}
                disabled={deleteEmailMutation.isPending}
                className="px-4 py-2 bg-rose-600 text-white rounded-sm hover:bg-rose-700 text-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {deleteEmailMutation.isPending ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  "Delete"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConsultationEmailsPanel;
