import {
  X,
  Copy,
  Calendar
} from "lucide-react";

const LogDetailsModal = ({
  log,
  isOpen,
  onClose,
  formatDate,
  formatCurrency,
  onCopy,
}) => {
  if (!isOpen || !log) return null;

  const getLevelColor = (level) => {
    const colors = {
      info: "text-blue-600 dark:text-blue-400",
      warn: "text-yellow-600 dark:text-yellow-400",
      error: "text-red-600 dark:text-red-400",
      debug: "text-gray-600 dark:text-gray-400",
    };
    return colors[level] || colors.info;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Log Details
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Log Level
              </label>
              <p
                className={`text-sm font-semibold ${getLevelColor(log.level)}`}
              >
                {log.level?.toUpperCase()}
              </p>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Timestamp
              </label>
              <p className="text-sm text-gray-900 dark:text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                {formatDate(log.createdAt)}
              </p>
            </div>
          </div>

          {/* Message */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Message
            </label>
            <p className="text-sm text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-900/50 p-3 rounded border border-gray-200 dark:border-gray-700">
              {log.message}
            </p>
          </div>

          {/* Request Info */}
          {log.request && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                Request
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-500 dark:text-gray-400">
                    Method
                  </label>
                  <p className="text-sm font-mono text-gray-900 dark:text-white">
                    {log.request.method}
                  </p>
                </div>
                <div>
                  <label className="text-xs text-gray-500 dark:text-gray-400">
                    Path
                  </label>
                  <p className="text-sm font-mono text-gray-900 dark:text-white break-all">
                    {log.request.path}
                  </p>
                </div>
                <div className="col-span-2">
                  <label className="text-xs text-gray-500 dark:text-gray-400">
                    URL
                  </label>
                  <p className="text-sm font-mono text-gray-900 dark:text-white break-all">
                    {log.request.url}
                  </p>
                </div>
                <div>
                  <label className="text-xs text-gray-500 dark:text-gray-400">
                    Response Time
                  </label>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {log.request.responseTime}ms
                  </p>
                </div>
                <div>
                  <label className="text-xs text-gray-500 dark:text-gray-400">
                    IP Address
                  </label>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {log.request.ip}
                  </p>
                </div>
                <div className="col-span-2">
                  <label className="text-xs text-gray-500 dark:text-gray-400">
                    User Agent
                  </label>
                  <p className="text-sm text-gray-900 dark:text-white break-all">
                    {log.request.userAgent}
                  </p>
                </div>
              </div>

              {/* Query Params */}
              {log.request.query &&
                Object.keys(log.request.query).length > 0 && (
                  <div className="mt-3">
                    <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">
                      Query Parameters
                    </label>
                    <div className="bg-gray-50 dark:bg-gray-900/50 p-3 rounded border border-gray-200 dark:border-gray-700">
                      <pre className="text-xs text-gray-900 dark:text-white overflow-x-auto">
                        {JSON.stringify(log.request.query, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}

              {/* Request Body */}
              {log.request.body && Object.keys(log.request.body).length > 0 && (
                <div className="mt-3">
                  <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">
                    Request Body
                  </label>
                  <div className="bg-gray-50 dark:bg-gray-900/50 p-3 rounded border border-gray-200 dark:border-gray-700 max-h-60 overflow-y-auto">
                    <pre className="text-xs text-gray-900 dark:text-white">
                      {JSON.stringify(log.request.body, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Response Info */}
          {log.response && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                Response
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-500 dark:text-gray-400">
                    Status Code
                  </label>
                  <p
                    className={`text-sm font-semibold ${
                      log.response.statusCode >= 200 &&
                      log.response.statusCode < 300
                        ? "text-green-600 dark:text-green-400"
                        : log.response.statusCode >= 400 &&
                            log.response.statusCode < 500
                          ? "text-yellow-600 dark:text-yellow-400"
                          : log.response.statusCode >= 500
                            ? "text-red-600 dark:text-red-400"
                            : "text-gray-600 dark:text-gray-400"
                    }`}
                  >
                    {log.response.statusCode}
                  </p>
                </div>
                {log.response.statusMessage && (
                  <div>
                    <label className="text-xs text-gray-500 dark:text-gray-400">
                      Status Message
                    </label>
                    <p className="text-sm text-gray-900 dark:text-white">
                      {log.response.statusMessage}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* User Info */}
          {log.user && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                User
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs text-gray-500 dark:text-gray-400">
                    User ID
                  </label>
                  <p className="text-sm font-mono text-gray-900 dark:text-white break-all">
                    {log.user.userId}
                  </p>
                </div>
                <div>
                  <label className="text-xs text-gray-500 dark:text-gray-400">
                    Email
                  </label>
                  <p className="text-sm text-gray-900 dark:text-white flex items-center gap-2">
                    {log.user.email}
                    <button
                      onClick={() => onCopy(log.user.email, "Email")}
                      className="p-0.5 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                    >
                      <Copy className="h-3 w-3" />
                    </button>
                  </p>
                </div>
                <div>
                  <label className="text-xs text-gray-500 dark:text-gray-400">
                    Role
                  </label>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {log.user.role}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Error Info */}
          {log.error && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-red-600 dark:text-red-400">
                Error
              </h3>
              <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded border border-red-200 dark:border-red-800">
                <div className="grid grid-cols-1 gap-3">
                  {log.error.message && (
                    <div>
                      <label className="text-xs text-red-600 dark:text-red-400">
                        Message
                      </label>
                      <p className="text-sm text-red-700 dark:text-red-300 font-mono">
                        {log.error.message}
                      </p>
                    </div>
                  )}
                  {log.error.name && (
                    <div>
                      <label className="text-xs text-red-600 dark:text-red-400">
                        Name
                      </label>
                      <p className="text-sm text-red-700 dark:text-red-300">
                        {log.error.name}
                      </p>
                    </div>
                  )}
                  {log.error.code && (
                    <div>
                      <label className="text-xs text-red-600 dark:text-red-400">
                        Code
                      </label>
                      <p className="text-sm text-red-700 dark:text-red-300">
                        {log.error.code}
                      </p>
                    </div>
                  )}
                  {log.error.stack && (
                    <div>
                      <label className="text-xs text-red-600 dark:text-red-400">
                        Stack Trace
                      </label>
                      <pre className="text-xs text-red-700 dark:text-red-300 mt-1 overflow-x-auto whitespace-pre-wrap">
                        {log.error.stack}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Metadata */}
          {log.metadata && Object.keys(log.metadata).length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                Metadata
              </h3>
              <div className="bg-gray-50 dark:bg-gray-900/50 p-3 rounded border border-gray-200 dark:border-gray-700">
                <pre className="text-xs text-gray-900 dark:text-white overflow-x-auto">
                  {JSON.stringify(log.metadata, null, 2)}
                </pre>
              </div>
            </div>
          )}

          {/* Tags */}
          {log.tags && log.tags.length > 0 && (
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Tags
              </label>
              <div className="flex flex-wrap gap-2">
                {log.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Source */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Source
            </label>
            <p className="text-sm text-gray-900 dark:text-white">
              {log.source || "N/A"}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default LogDetailsModal;
