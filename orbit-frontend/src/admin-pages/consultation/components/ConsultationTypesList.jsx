import {
  MoreVertical,
  Trash2,
  Copy,
  Edit2,
  EyeOff,
  Eye,
  Clock,
  DollarSign,
  ListChecks,
  Info,
  Check,
  X,
} from "lucide-react";
import { useState } from "react";

const ConsultationTypesList = ({
  filteredAndSortedTypes,
  handleToggleStatus,
  setEditingType,
  handleDeleteType,
  isTogglingConsultationTypeStatus,
  handleDuplicateType,
  isDeletingConsultationType,
  viewMode,
}) => {
  const [selectedType, setSelectedType] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // FIXED: Better active status check
  const getIsActiveStatus = (type) => {
    // Check if isActive is explicitly false
    if (type.isActive === false) {
      return false;
    }
    // Check for string 'false'
    if (
      typeof type.isActive === "string" &&
      type.isActive.toLowerCase() === "false"
    ) {
      return false;
    }
    // Default to true for undefined, null, true, or any other truthy value
    return true;
  };

  // Handle view details
  const handleViewDetails = (type) => {
    setSelectedType(type);
    setShowDetailsModal(true);
  };

  // Close details modal
  const handleCloseDetails = () => {
    setShowDetailsModal(false);
    setSelectedType(null);
  };

  // Format price display
  const formatPriceDisplay = (price) => {
    if (!price) return "FREE";

    if (typeof price === "string") {
      // Handle string price like 'FREE' or 'KSh 1,500'
      if (price.includes("FREE")) return "FREE";
      return price;
    }

    if (typeof price === "object" && price !== null) {
      // Handle price object { amount: 0, currency: 'KES', display: 'FREE' }
      if (price.display) return price.display;
      if (price.amount === 0) return "FREE";
      return `${price.currency} ${price.amount?.toLocaleString() || 0}`;
    }

    if (typeof price === "number") {
      return price === 0 ? "FREE" : `KSh ${price.toLocaleString()}`;
    }

    return "FREE";
  };

  // Helper function to check if price is free
  const isPriceFree = (price) => {
    return formatPriceDisplay(price) === "FREE";
  };

  // Get status display text
  const getStatusDisplay = (type) => {
    const isActive = getIsActiveStatus(type);
    return isActive ? "Active" : "Inactive";
  };

  // Get status color classes
  const getStatusClasses = (isActive) => {
    return isActive
      ? "bg-green-100 dark:bg-green-500/20 text-green-800 dark:text-green-400 border border-green-200 dark:border-green-500/30"
      : "bg-red-100 dark:bg-red-500/20 text-red-800 dark:text-red-400 border border-red-200 dark:border-red-500/30";
  };

  return (
    <>
      {viewMode === "grid" ? (
        // Grid View
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
          {filteredAndSortedTypes.map((type) => {
            const isActive = getIsActiveStatus(type);
            const statusText = getStatusDisplay(type);
            const statusClasses = getStatusClasses(isActive);
            const isFree = isPriceFree(type.price); // ✅ Fixed: use helper function

            return (
              <div
                key={type.id}
                className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-sm p-4 hover:border-gray-400 dark:hover:border-gray-600 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">{type.icon || "🎮"}</div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {type.title}
                      </h3>
                      <div
                        className={`text-xs px-2 py-0.5 rounded-sm ${statusClasses} inline-flex items-center gap-1`}
                      >
                        {isActive ? (
                          <Check className="h-3 w-3" />
                        ) : (
                          <X className="h-3 w-3" />
                        )}
                        {statusText}
                      </div>
                    </div>
                  </div>
                  <div className="relative">
                    <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-sm">
                      <MoreVertical className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                    </button>
                  </div>
                </div>

                <p className="text-sm text-gray-700 dark:text-gray-300 mb-3 line-clamp-2">
                  {type.description}
                </p>

                <div className="grid grid-cols-2 gap-2 mb-4">
                  <div className="text-center p-2 bg-gray-50 dark:bg-gray-900/50 rounded-sm">
                    <div className="text-xs text-gray-600 dark:text-gray-400 flex items-center justify-center gap-1">
                      <Clock className="h-3 w-3" />
                      Duration
                    </div>
                    <div className="text-sm text-gray-900 dark:text-white">
                      {type.duration}
                    </div>
                  </div>
                  <div className="text-center p-2 bg-gray-50 dark:bg-gray-900/50 rounded-sm">
                    <div className="text-xs text-gray-600 dark:text-gray-400 flex items-center justify-center gap-1">
                      <DollarSign className="h-3 w-3" />
                      Price
                    </div>
                    <div
                      className={`text-sm font-medium ${isFree ? "text-green-600 dark:text-green-400" : "text-yellow-600 dark:text-yellow-400"}`}
                    >
                      {formatPriceDisplay(type.price)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-1">
                    <ListChecks className="h-3 w-3" />
                    {type.features?.length || 0} features
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleViewDetails(type)}
                      className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-sm"
                      title="View Details"
                    >
                      <Eye className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </button>
                    <button
                      onClick={() => handleToggleStatus(type.id)}
                      className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-sm"
                      disabled={isTogglingConsultationTypeStatus}
                      title={isActive ? "Deactivate" : "Activate"}
                    >
                      {isActive ? (
                        <EyeOff className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-green-600 dark:text-green-400" />
                      )}
                    </button>
                    <button
                      onClick={() => setEditingType(type)}
                      className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-sm"
                      title="Edit"
                    >
                      <Edit2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </button>
                    <button
                      onClick={() => handleDeleteType(type.id)}
                      className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-sm"
                      disabled={isDeletingConsultationType}
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4 text-red-600 dark:text-red-400" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        // Table View
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-900/50">
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  <input type="checkbox" className="rounded-sm" />
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Duration
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Features
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-300 dark:divide-gray-800">
              {filteredAndSortedTypes.map((type) => {
                const isActive = getIsActiveStatus(type);
                const statusText = getStatusDisplay(type);
                const statusClasses = getStatusClasses(isActive);
                const isFree = isPriceFree(type.price); // ✅ Fixed: use helper function

                return (
                  <tr
                    key={type.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-900/30"
                  >
                    <td className="px-4 py-3">
                      <input type="checkbox" className="rounded-sm" />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-3">
                        <div className="text-xl">{type.icon || "🎮"}</div>
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">
                            {type.title}
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-400 truncate max-w-xs">
                            {type.description}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3 text-gray-500 dark:text-gray-500" />
                        {type.duration}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded-sm text-xs font-medium ${isFree ? "bg-green-100 dark:bg-green-500/20 text-green-800 dark:text-green-400 border border-green-200 dark:border-green-500/30" : "bg-yellow-100 dark:bg-yellow-500/20 text-yellow-800 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-500/30"}`}
                      >
                        {formatPriceDisplay(type.price)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div
                        className={`px-2 py-1 rounded-sm text-xs font-medium ${statusClasses} inline-flex items-center gap-1`}
                      >
                        {isActive ? (
                          <Check className="h-3 w-3" />
                        ) : (
                          <X className="h-3 w-3" />
                        )}
                        {statusText}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                      <div className="flex items-center gap-1">
                        <ListChecks className="h-3 w-3 text-gray-500 dark:text-gray-500" />
                        {type.features?.length || 0}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleViewDetails(type)}
                          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-sm"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        </button>
                        <button
                          onClick={() => handleToggleStatus(type.id)}
                          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-sm"
                          disabled={isTogglingConsultationTypeStatus}
                          title={isActive ? "Deactivate" : "Activate"}
                        >
                          {isActive ? (
                            <EyeOff className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                          ) : (
                            <Eye className="h-4 w-4 text-green-600 dark:text-green-400" />
                          )}
                        </button>
                        <button
                          onClick={() => setEditingType(type)}
                          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-sm"
                          title="Edit"
                        >
                          <Edit2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        </button>
                        <button
                          onClick={() => handleDuplicateType(type)}
                          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-sm"
                          title="Duplicate"
                        >
                          <Copy className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                        </button>
                        <button
                          onClick={() => handleDeleteType(type.id)}
                          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-sm"
                          disabled={isDeletingConsultationType}
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4 text-red-600 dark:text-red-400" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {showDetailsModal && selectedType && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div
            className="fixed inset-0 bg-black/70 dark:bg-black/80 backdrop-blur-sm transition-opacity"
            onClick={handleCloseDetails}
          />

          <div className="flex min-h-screen items-center justify-center p-4">
            <div className="relative w-full max-w-4xl transform transition-all">
              <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-sm shadow-2xl overflow-hidden">
                {/* Modal Header */}
                <div className="border-b border-gray-300 dark:border-gray-700 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-3">
                        <div className="text-4xl">
                          {selectedType.icon || "🎮"}
                        </div>
                        <div>
                          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                            {selectedType.title}
                          </h2>
                          <div className="flex items-center gap-3 mt-2">
                            <div
                              className={`px-3 py-1 rounded-sm text-sm font-medium ${getStatusClasses(getIsActiveStatus(selectedType))} inline-flex items-center gap-1`}
                            >
                              {getIsActiveStatus(selectedType) ? (
                                <Check className="h-3 w-3" />
                              ) : (
                                <X className="h-3 w-3" />
                              )}
                              {getStatusDisplay(selectedType)}
                            </div>
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              ID: {selectedType.id}
                            </span>
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              Order: #{selectedType.order || 0}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={handleCloseDetails}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-sm transition-colors"
                    >
                      <X className="h-5 w-5 text-gray-700 dark:text-gray-400" />
                    </button>
                  </div>
                </div>

                <div className="p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Left Column */}
                    <div>
                      {/* Description */}
                      <div className="mb-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                          Description
                        </h3>
                        <p className="text-gray-700 dark:text-gray-300">
                          {selectedType.description}
                        </p>
                      </div>

                      {/* Features */}
                      {selectedType.features &&
                        selectedType.features.length > 0 && (
                          <div className="mb-6">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                              <ListChecks className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" />
                              Features ({selectedType.features.length})
                            </h3>
                            <ul className="space-y-2">
                              {selectedType.features.map((feature, index) => (
                                <li key={index} className="flex items-start">
                                  <div className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400 mt-2 mr-3"></div>
                                  <span className="text-gray-700 dark:text-gray-300">
                                    {feature}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                    </div>

                    {/* Right Column */}
                    <div>
                      {/* Quick Stats */}
                      <div className="mb-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                          Quick Information
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-gray-50 dark:bg-gray-900/50 border border-gray-300 dark:border-gray-800 rounded-sm p-4">
                            <div className="flex items-center justify-between mb-2">
                              <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                              <span className="text-sm text-gray-600 dark:text-gray-400">
                                Duration
                              </span>
                            </div>
                            <div className="text-xl font-semibold text-gray-900 dark:text-white">
                              {selectedType.duration}
                            </div>
                          </div>

                          <div className="bg-gray-50 dark:bg-gray-900/50 border border-gray-300 dark:border-gray-800 rounded-sm p-4">
                            <div className="flex items-center justify-between mb-2">
                              <DollarSign
                                className={`h-5 w-5 ${isPriceFree(selectedType.price) ? "text-green-600 dark:text-green-400" : "text-yellow-600 dark:text-yellow-400"}`}
                              />
                              <span className="text-sm text-gray-600 dark:text-gray-400">
                                Price
                              </span>
                            </div>
                            <div
                              className={`text-xl font-semibold ${isPriceFree(selectedType.price) ? "text-green-600 dark:text-green-400" : "text-yellow-600 dark:text-yellow-400"}`}
                            >
                              {formatPriceDisplay(selectedType.price)}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Additional Details */}
                      <div className="bg-gray-50 dark:bg-gray-900/30 border border-gray-300 dark:border-gray-800 rounded-sm p-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                          Additional Details
                        </h3>
                        <div className="space-y-3">
                          <div>
                            <div className="text-sm text-gray-600 dark:text-gray-500">
                              Order Position
                            </div>
                            <div className="text-gray-900 dark:text-white font-medium">
                              #{selectedType.order || 0}
                            </div>
                          </div>
                          <div>
                            <div className="text-sm text-gray-600 dark:text-gray-500">
                              Created/Updated
                            </div>
                            <div className="text-gray-600 dark:text-gray-400 text-sm">
                              {selectedType.createdAt && (
                                <div>
                                  Created:{" "}
                                  {new Date(
                                    selectedType.createdAt,
                                  ).toLocaleDateString()}
                                </div>
                              )}
                              {selectedType.updatedAt && (
                                <div>
                                  Updated:{" "}
                                  {new Date(
                                    selectedType.updatedAt,
                                  ).toLocaleDateString()}
                                </div>
                              )}
                            </div>
                          </div>
                          {selectedType.price &&
                            typeof selectedType.price === "object" && (
                              <div>
                                <div className="text-sm text-gray-600 dark:text-gray-500">
                                  Price Breakdown
                                </div>
                                <div className="text-gray-600 dark:text-gray-400 text-sm">
                                  Amount: {selectedType.price.amount}{" "}
                                  {selectedType.price.currency}
                                </div>
                              </div>
                            )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="border-t border-gray-300 dark:border-gray-800 mt-6 pt-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Actions
                    </h3>
                    <div className="flex flex-wrap gap-3">
                      <button
                        onClick={() => {
                          setEditingType(selectedType);
                          handleCloseDetails();
                        }}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-sm transition"
                      >
                        <Edit2 className="h-4 w-4 inline mr-2" />
                        Edit Consultation Type
                      </button>
                      <button
                        onClick={() => {
                          handleDuplicateType(selectedType);
                          handleCloseDetails();
                        }}
                        className="px-4 py-2 bg-gray-600 dark:bg-gray-700 hover:bg-gray-700 dark:hover:bg-gray-600 text-white rounded-sm transition"
                      >
                        <Copy className="h-4 w-4 inline mr-2" />
                        Duplicate
                      </button>
                      <button
                        onClick={() => {
                          handleToggleStatus(selectedType.id);
                          handleCloseDetails();
                        }}
                        className={`px-4 py-2 rounded-sm transition ${getIsActiveStatus(selectedType) === false ? "bg-green-600 hover:bg-green-700" : "bg-yellow-600 hover:bg-yellow-700"} text-white`}
                      >
                        {getIsActiveStatus(selectedType) === false ? (
                          <>
                            <Eye className="h-4 w-4 inline mr-2" />
                            Activate
                          </>
                        ) : (
                          <>
                            <EyeOff className="h-4 w-4 inline mr-2" />
                            Deactivate
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => {
                          handleDeleteType(selectedType.id);
                          handleCloseDetails();
                        }}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-sm transition"
                      >
                        <Trash2 className="h-4 w-4 inline mr-2" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ConsultationTypesList;
