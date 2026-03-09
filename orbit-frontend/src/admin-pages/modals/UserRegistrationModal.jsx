import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import { closeRegistrationModal } from "../slices/userRegistrationSlice";
import { X, User, Mail, Phone, Store, Shield, UserPlus } from "lucide-react";
import { useStores } from "../hooks/store-hook";
import { useRegisterMutation } from "../hooks/users.hook";

const UserRegistrationModal = () => {
  const dispatch = useDispatch();
  const { data: storesData } = useStores();
  const stores = storesData?.data || [];

  // Use the TanStack Query mutation
  const registerMutation = useRegisterMutation();

  const { isModalOpen } = useSelector((state) => state.userRegistration);

  // Form state - NO PASSWORD FIELD
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNo: "",
    role: "staff",
    assignedStore: "",
    newsletter: true,
    storePermissions: {
      canView: true,
      canEdit: false,
      canSell: false,
      canManage: false,
    },
  });

  const [storeRole, setStoreRole] = useState("cashier");

  // Reset form when modal opens
  useEffect(() => {
    if (isModalOpen) {
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phoneNo: "",
        role: "staff",
        assignedStore: stores[0]?._id || "",
        newsletter: true,
        storePermissions: {
          canView: true,
          canEdit: false,
          canSell: false,
          canManage: false,
        },
      });
      setStoreRole("cashier");
    }
  }, [isModalOpen, stores]);

  // Handle mutation success/error
  useEffect(() => {
    if (registerMutation.isSuccess) {
      toast.success(
        "User registered successfully! Password will be emailed to the user.",
      );
      handleClose();
    }

    if (registerMutation.isError) {
      const errorMessage =
        registerMutation.error?.response?.data?.message ||
        registerMutation.error?.message ||
        "Failed to register user";
      toast.error(errorMessage);
    }
  }, [
    registerMutation.isSuccess,
    registerMutation.isError,
    registerMutation.error,
  ]);

  const handleClose = () => {
    dispatch(closeRegistrationModal());
    registerMutation.reset();
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handlePermissionChange = (permission) => {
    setFormData((prev) => ({
      ...prev,
      storePermissions: {
        ...prev.storePermissions,
        [permission]: !prev.storePermissions[permission],
      },
    }));
  };

  const handleStoreRoleChange = (role) => {
    setStoreRole(role);
    // Auto-set permissions based on role
    const permissions = {
      cashier: {
        canView: true,
        canEdit: false,
        canSell: true,
        canManage: false,
      },
      staff: { canView: true, canEdit: false, canSell: true, canManage: false },
      viewer: {
        canView: true,
        canEdit: false,
        canSell: false,
        canManage: false,
      },
      manager: { canView: true, canEdit: true, canSell: true, canManage: true },
    };
    setFormData((prev) => ({
      ...prev,
      storePermissions: permissions[role] || prev.storePermissions,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate required fields (NO PASSWORD VALIDATION)
    if (!formData.firstName || !formData.lastName || !formData.email) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    // Prepare data for API - NO PASSWORD FIELD
    const userData = {
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      email: formData.email.toLowerCase().trim(),
      phoneNo: formData.phoneNo.trim() || undefined,
      role: formData.role,
      newsletter: formData.newsletter,
    };

    // Add store assignment if selected
    if (formData.assignedStore) {
      userData.assignedStore = formData.assignedStore;
      userData.storePermissions = [
        {
          store: formData.assignedStore,
          ...formData.storePermissions,
        },
      ];

      // Add store role if needed
      if (storeRole) {
        userData.storeRoles = [
          {
            store: formData.assignedStore,
            role: storeRole,
          },
        ];
      }
    }

    // Use the TanStack Query mutation
    registerMutation.mutate(userData);
  };

  if (!isModalOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-sm max-w-6xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-300 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-500/10 dark:bg-blue-500/10 rounded-sm">
              <UserPlus
                className="text-blue-600 dark:text-blue-400"
                size={24}
              />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Register New User
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Password will be auto-generated and emailed to the user
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={registerMutation.isPending}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-sm transition-colors disabled:opacity-50 text-gray-700 dark:text-gray-300"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
                <User
                  size={18}
                  className="mr-2 text-gray-600 dark:text-gray-400"
                />
                Personal Information
              </h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  First Name *
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  disabled={registerMutation.isPending}
                  className="w-full px-3 py-2.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-colors disabled:opacity-50"
                  placeholder="Enter first name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Last Name *
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  disabled={registerMutation.isPending}
                  className="w-full px-3 py-2.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-colors disabled:opacity-50"
                  placeholder="Enter last name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400"
                    size={18}
                  />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={registerMutation.isPending}
                    className="w-full pl-10 pr-3 py-2.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-colors disabled:opacity-50"
                    placeholder="user@example.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400"
                    size={18}
                  />
                  <input
                    type="tel"
                    name="phoneNo"
                    value={formData.phoneNo}
                    onChange={handleInputChange}
                    disabled={registerMutation.isPending}
                    className="w-full pl-10 pr-3 py-2.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-colors disabled:opacity-50"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
              </div>
            </div>

            {/* Account & Store Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
                <Shield
                  size={18}
                  className="mr-2 text-gray-600 dark:text-gray-400"
                />
                Account & Store Settings
              </h3>

              {/* Password notice */}
              <div className="p-3 bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 rounded-sm">
                <p className="text-blue-600 dark:text-blue-400 text-sm">
                  <strong>Note:</strong> A random password will be generated and
                  sent to the user's email address.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Global Role
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  disabled={registerMutation.isPending}
                  className="w-full px-3 py-2.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-colors disabled:opacity-50"
                >
                  {/* <option value="normal-user">Normal User</option> */}
                  <option
                    value="staff"
                    className="text-gray-900 dark:text-white"
                  >
                    Staff
                  </option>
                  <option
                    value="cashier"
                    className="text-gray-900 dark:text-white"
                  >
                    Cashier
                  </option>
                  <option
                    value="manager"
                    className="text-gray-900 dark:text-white"
                  >
                    Manager
                  </option>
                  <option
                    value="admin"
                    className="text-gray-900 dark:text-white"
                  >
                    Admin
                  </option>
                  <option
                    value="superadmin"
                    className="text-gray-900 dark:text-white"
                  >
                    Super Admin
                  </option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Assign to Store
                </label>
                <div className="relative">
                  <Store
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400"
                    size={18}
                  />
                  <select
                    name="assignedStore"
                    value={formData.assignedStore}
                    onChange={handleInputChange}
                    disabled={registerMutation.isPending}
                    className="w-full pl-10 pr-3 py-2.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-colors disabled:opacity-50"
                  >
                    <option
                      value=""
                      className="text-gray-500 dark:text-gray-400"
                    >
                      No store assignment
                    </option>
                    {stores.map((store) => (
                      <option
                        key={store._id}
                        value={store._id}
                        className="text-gray-900 dark:text-white"
                      >
                        {store.name} - {store.location}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {formData.assignedStore && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Store Role
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {["cashier", "staff", "viewer", "manager"].map((role) => (
                        <button
                          key={role}
                          type="button"
                          onClick={() => handleStoreRoleChange(role)}
                          disabled={registerMutation.isPending}
                          className={`px-3 py-2 text-sm rounded-sm transition-colors ${
                            storeRole === role
                              ? "bg-blue-600 dark:bg-blue-500 text-white"
                              : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                          } disabled:opacity-50`}
                        >
                          {role.charAt(0).toUpperCase() + role.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Store Permissions
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(formData.storePermissions).map(
                        ([key, value]) => (
                          <label
                            key={key}
                            className={`flex items-center p-2 rounded-sm transition-colors cursor-pointer ${
                              value
                                ? "bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-500/20"
                                : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600"
                            } hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50`}
                          >
                            <input
                              type="checkbox"
                              checked={value}
                              onChange={() => handlePermissionChange(key)}
                              disabled={registerMutation.isPending}
                              className="mr-2 h-4 w-4 text-blue-600 dark:text-blue-400 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500 dark:focus:ring-blue-400"
                            />
                            <span className="text-sm capitalize">
                              {key.replace("can", "").trim()}
                            </span>
                          </label>
                        ),
                      )}
                    </div>
                  </div>
                </>
              )}

              <label className="flex items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-700/50 rounded-sm cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  name="newsletter"
                  checked={formData.newsletter}
                  onChange={handleInputChange}
                  disabled={registerMutation.isPending}
                  className="mr-2 h-4 w-4 text-blue-600 dark:text-blue-400 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500 dark:focus:ring-blue-400"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Subscribe to newsletter
                </span>
              </label>
            </div>
          </div>

          {/* Error Display */}
          {registerMutation.isError && (
            <div className="mt-4 p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-sm">
              <p className="text-red-600 dark:text-red-400 text-sm">
                {registerMutation.error?.response?.data?.message ||
                  registerMutation.error?.message ||
                  "Failed to register user. Please try again."}
              </p>
            </div>
          )}

          {/* Modal Footer */}
          <div className="mt-8 pt-6 border-t border-gray-300 dark:border-gray-700 flex justify-end space-x-3">
            <button
              type="button"
              onClick={handleClose}
              disabled={registerMutation.isPending}
              className="px-4 py-2.5 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-sm transition-colors font-medium disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={registerMutation.isPending}
              className="px-4 py-2.5 bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600 text-white rounded-sm transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {registerMutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Registering...
                </>
              ) : (
                <>
                  <UserPlus size={18} className="mr-2" />
                  Register User
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserRegistrationModal;
