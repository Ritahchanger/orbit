import { useState } from "react";
import { AlertTriangle, X, Lock, Unlock, User } from "lucide-react";
import { toast } from "react-hot-toast";

const SuspendUserModal = ({
  user,
  onClose,
  onConfirm,
  isSuspending = true,
  isLoading = false,
}) => {
  const [reason, setReason] = useState("");
  const [duration, setDuration] = useState("permanent");
  const [customDate, setCustomDate] = useState("");
  const [notifyUser, setNotifyUser] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isSuspending && !reason.trim()) {
      toast.error("Please provide a reason for suspension");
      return;
    }
    if (isSuspending && duration === "custom" && !customDate) {
      toast.error("Please select a custom suspension end date");
      return;
    }
    const suspensionData = {
      userId: user._id,
      reason: reason.trim(),
      duration: duration === "custom" ? customDate : duration,
      notifyUser,
      isSuspending,
    };
    onConfirm(suspensionData);
  };

  if (!user) return null;

  return (
    // Full-screen backdrop
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/60"
        onClick={!isLoading ? onClose : undefined}
      />

      {/* Modal panel */}
      <div className="relative w-full max-w-lg bg-white dark:bg-gray-800 rounded-sm shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div
          className={`flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 ${
            isSuspending
              ? "bg-red-50 dark:bg-red-500/10"
              : "bg-green-50 dark:bg-green-500/10"
          }`}
        >
          <div className="flex items-center gap-2">
            <div
              className={`p-2 rounded-full ${
                isSuspending
                  ? "bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400"
                  : "bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400"
              }`}
            >
              {isSuspending ? <Lock size={18} /> : <Unlock size={18} />}
            </div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {isSuspending ? "Suspend User" : "Unsuspend User"}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="p-1.5 rounded-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-40"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable body */}
        <form
          onSubmit={handleSubmit}
          className="flex flex-col flex-1 overflow-y-auto"
        >
          <div className="px-6 py-5 space-y-5">
            {/* User Info Card */}
            <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-sm">
              <div className="flex-shrink-0 w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                <User size={18} className="text-gray-500 dark:text-gray-400" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {user.email}
                  {user.role && (
                    <span className="ml-1.5 px-1.5 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-gray-600 dark:text-gray-300 font-medium capitalize">
                      {user.role}
                    </span>
                  )}
                </p>
              </div>
            </div>

            {isSuspending ? (
              <>
                {/* Warning Alert */}
                <div className="flex gap-2 p-4 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-sm">
                  <AlertTriangle
                    size={18}
                    className="flex-shrink-0 text-amber-500 mt-0.5"
                  />
                  <div>
                    <p className="text-sm font-semibold text-amber-800 dark:text-amber-300 mb-1">
                      Warning: Suspending this user will:
                    </p>
                    <ul className="text-sm text-amber-700 dark:text-amber-400 space-y-0.5 list-disc list-inside">
                      <li>Prevent them from logging in</li>
                      <li>Revoke all store access</li>
                      <li>Cancel any pending actions</li>
                    </ul>
                  </div>
                </div>

                {/* Suspension Reason */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Reason for suspension{" "}
                  </label>
                  <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-sm text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    placeholder="Enter reason for suspension..."
                    required
                  />
                </div>

                {/* Suspension Duration */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Suspension Duration
                  </label>
                  <div className="space-y-2">
                    {[
                      { value: "temporary", label: "Temporary (7 days)" },
                      { value: "permanent", label: "Permanent" },
                      { value: "custom", label: "Custom date" },
                    ].map((option) => (
                      <label
                        key={option.value}
                        className="flex items-center gap-2.5 cursor-pointer"
                      >
                        <input
                          type="radio"
                          value={option.value}
                          checked={duration === option.value}
                          onChange={(e) => setDuration(e.target.value)}
                          className="accent-blue-600 w-4 h-4"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {option.label}
                        </span>
                      </label>
                    ))}

                    {duration === "custom" && (
                      <div className="pl-6 pt-1">
                        <input
                          type="date"
                          value={customDate}
                          onChange={(e) => setCustomDate(e.target.value)}
                          min={new Date().toISOString().split("T")[0]}
                          className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-sm text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Notify User */}
                <div className="p-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-sm">
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notifyUser}
                      onChange={(e) => setNotifyUser(e.target.checked)}
                      className="accent-blue-600 w-4 h-4 rounded"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Send notification email to user
                    </span>
                  </label>
                </div>
              </>
            ) : (
              /* Unsuspend Confirmation */
              <div className="p-4 bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 rounded-sm">
                <p className="text-sm text-green-800 dark:text-green-300">
                  Are you sure you want to unsuspend this user? They will regain
                  access to their account and assigned stores.
                </p>
                {user.suspensionReason && (
                  <div className="mt-3 p-3 bg-white dark:bg-gray-800 rounded-sm border border-green-100 dark:border-green-500/10">
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Original suspension reason:
                    </p>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {user.suspensionReason}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-2 mt-auto">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-40"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className={`px-4 py-2 text-sm font-medium text-white rounded-sm transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                isSuspending
                  ? "bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600"
                  : "bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600"
              }`}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  {isSuspending ? "Suspending..." : "Unsuspending..."}
                </>
              ) : (
                <>
                  {isSuspending ? <Lock size={16} /> : <Unlock size={16} />}
                  {isSuspending ? "Confirm Suspension" : "Confirm Unsuspension"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SuspendUserModal;
