import { Loader2 } from "lucide-react";
import { useTheme } from "../../../context/theme-context/ThemeContext"; // Adjust path as needed

const ConsultationEdit = ({
  isCreateModalOpen,
  editingType,
  setIsCreateModalOpen,
  setEditingType,
  handleUpdateType,
  handleCreateType,
  isCreatingConsultationType,
  isUpdatingConsultationType,
}) => {
  const { isDarkMode } = useTheme(); // Get theme state

  return (
    <>
      {(isCreateModalOpen || editingType) && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div
            className={`
                        border rounded-sm w-full max-w-2xl max-h-[90vh] overflow-y-auto
                        ${
                          isDarkMode
                            ? "bg-gray-900 border-gray-700"
                            : "bg-white border-gray-200"
                        }
                    `}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3
                  className={`text-xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}
                >
                  {editingType
                    ? "Edit Consultation Type"
                    : "Create New Consultation Type"}
                </h3>
                <button
                  onClick={() => {
                    setIsCreateModalOpen(false);
                    setEditingType(null);
                  }}
                  className={`${isDarkMode ? "text-gray-400 hover:text-white" : "text-gray-500 hover:text-gray-700"}`}
                >
                  ✕
                </button>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.target);
                  const data = Object.fromEntries(formData);

                  // Handle features (convert from textarea to array)
                  if (data.features) {
                    data.features = data.features
                      .split("\n")
                      .map((f) => f.trim())
                      .filter((f) => f !== "");
                  }

                  if (editingType) {
                    handleUpdateType(editingType.id, data);
                  } else {
                    handleCreateType(data);
                  }
                }}
              >
                <div className="space-y-4">
                  <div>
                    <label
                      className={`block text-sm font-medium mb-2 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
                    >
                      Title *
                    </label>
                    <input
                      type="text"
                      name="title"
                      defaultValue={editingType?.title}
                      className={`
                                                w-full px-4 py-2 border rounded-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
                                                ${
                                                  isDarkMode
                                                    ? "bg-gray-800 border-gray-700 text-white"
                                                    : "bg-white border-gray-300 text-gray-900"
                                                }
                                            `}
                      required
                    />
                  </div>

                  <div>
                    <label
                      className={`block text-sm font-medium mb-2 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
                    >
                      Description *
                    </label>
                    <textarea
                      name="description"
                      defaultValue={editingType?.description}
                      rows="3"
                      className={`
                                                w-full px-4 py-2 border rounded-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
                                                ${
                                                  isDarkMode
                                                    ? "bg-gray-800 border-gray-700 text-white"
                                                    : "bg-white border-gray-300 text-gray-900"
                                                }
                                            `}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label
                        className={`block text-sm font-medium mb-2 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
                      >
                        Duration *
                      </label>
                      <input
                        type="text"
                        name="duration"
                        defaultValue={editingType?.duration}
                        placeholder="e.g., 60 minutes"
                        className={`
                                                    w-full px-4 py-2 border rounded-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
                                                    ${
                                                      isDarkMode
                                                        ? "bg-gray-800 border-gray-700 text-white"
                                                        : "bg-white border-gray-300 text-gray-900"
                                                    }
                                                `}
                        required
                      />
                    </div>
                    <div>
                      <label
                        className={`block text-sm font-medium mb-2 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
                      >
                        Price *
                      </label>
                      <input
                        type="text"
                        name="price"
                        defaultValue={editingType?.price}
                        placeholder="e.g., FREE or KSh 1,500"
                        className={`
                                                    w-full px-4 py-2 border rounded-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
                                                    ${
                                                      isDarkMode
                                                        ? "bg-gray-800 border-gray-700 text-white"
                                                        : "bg-white border-gray-300 text-gray-900"
                                                    }
                                                `}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label
                        className={`block text-sm font-medium mb-2 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
                      >
                        Icon
                      </label>
                      <input
                        type="text"
                        name="icon"
                        defaultValue={editingType?.icon || "🎮"}
                        placeholder="e.g., 🎮"
                        className={`
                                                    w-full px-4 py-2 border rounded-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
                                                    ${
                                                      isDarkMode
                                                        ? "bg-gray-800 border-gray-700 text-white"
                                                        : "bg-white border-gray-300 text-gray-900"
                                                    }
                                                `}
                      />
                    </div>
                    <div>
                      <label
                        className={`block text-sm font-medium mb-2 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
                      >
                        Display Order
                      </label>
                      <input
                        type="number"
                        name="order"
                        defaultValue={editingType?.order || 0}
                        className={`
                                                    w-full px-4 py-2 border rounded-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
                                                    ${
                                                      isDarkMode
                                                        ? "bg-gray-800 border-gray-700 text-white"
                                                        : "bg-white border-gray-300 text-gray-900"
                                                    }
                                                `}
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      className={`block text-sm font-medium mb-2 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
                    >
                      Features (one per line)
                    </label>
                    <textarea
                      name="features"
                      defaultValue={editingType?.features?.join("\n")}
                      rows="4"
                      placeholder="Enter each feature on a new line"
                      className={`
                                                w-full px-4 py-2 border rounded-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
                                                ${
                                                  isDarkMode
                                                    ? "bg-gray-800 border-gray-700 text-white"
                                                    : "bg-white border-gray-300 text-gray-900"
                                                }
                                            `}
                    />
                    <p
                      className={`text-xs mt-1 ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}
                    >
                      Each line will become a separate feature with a checkmark
                    </p>
                  </div>

                  {editingType && (
                    <div className="flex items-center space-x-6">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          name="isActive"
                          defaultChecked={editingType.isActive !== false}
                          className="mr-2 rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        <span
                          className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
                        >
                          Active
                        </span>
                      </label>

                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          name="isPopular"
                          defaultChecked={editingType.isPopular || false}
                          className="mr-2 rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        <span
                          className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
                        >
                          Popular / Recommended
                        </span>
                      </label>
                    </div>
                  )}
                </div>

                <div
                  className={`flex items-center justify-end space-x-3 mt-8 pt-6 border-t ${isDarkMode ? "border-gray-800" : "border-gray-200"}`}
                >
                  <button
                    type="button"
                    onClick={() => {
                      setIsCreateModalOpen(false);
                      setEditingType(null);
                    }}
                    className={`
                                            px-4 py-2 rounded-sm transition-colors
                                            ${
                                              isDarkMode
                                                ? "bg-gray-800 text-white hover:bg-gray-700"
                                                : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                                            }
                                        `}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={
                      isCreatingConsultationType || isUpdatingConsultationType
                    }
                    className="px-6 py-2 bg-primary text-white rounded-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isCreatingConsultationType ||
                    isUpdatingConsultationType ? (
                      <span className="flex items-center">
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        {editingType ? "Updating..." : "Creating..."}
                      </span>
                    ) : editingType ? (
                      "Update Type"
                    ) : (
                      "Create Type"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ConsultationEdit;
