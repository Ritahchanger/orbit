import { useState, useEffect } from "react";
import AdminLayout from "../../dashboard/layout/Layout";
import { useAuth } from "../../../context/authentication/AuthenticationContext";
import { useUserMutations } from "../../hooks/users.hook";
import { useGetMyStores } from "../../hooks/users.hook";
import { toast } from "react-hot-toast";
import {
  User,
  Shield,
  Calendar,
  Edit,
  Save,
  X,
  Lock,
  Store,
  Clock,
  Upload,
  Eye,
  EyeOff,
  Users,
} from "lucide-react";

import StoresSection from "../component/StoresSection";

import SkeletonPreloader from "../component/SkeletonPreloader";

import QuickActionsCard from "../component/QuickActionsCard";

const AdminProfile = () => {
  const { user: currentUser, userRole, updateUserData } = useAuth();

  console.log(currentUser);

  const { data: storesData } = useGetMyStores();
  const {
    updateProfileMutation,
    changeMyPasswordMutation,
    setMyPrimaryStoreMutation,
  } = useUserMutations();

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNo: "", // Change from 'phone' to 'phoneNo'
    profileImage: "",
  });

  // States for password change
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // States for stores
  const [userStores, setUserStores] = useState([]);
  const [selectedStoreId, setSelectedStoreId] = useState("");

  // Update useEffect
  useEffect(() => {
    if (currentUser) {
      setFormData({
        firstName: currentUser.firstName || "",
        lastName: currentUser.lastName || "",
        email: currentUser.email || "",
        phoneNo: currentUser.phoneNo || "", // Change here too
        profileImage: currentUser.profileImage || "",
      });
    }
  }, [currentUser]);

  // Initialize stores
  useEffect(() => {
    if (storesData?.data) {
      setUserStores(storesData.data);
      const primaryStore = storesData.data.find((store) => store.isPrimary);
      if (primaryStore) {
        setSelectedStoreId(primaryStore.storeId?._id || primaryStore._id);
      }
    }
  }, [storesData]);

  // Handle profile update
  const handleProfileUpdate = async () => {
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      toast.error("First name and last name are required");
      return;
    }

    if (!formData.email.trim()) {
      toast.error("Email is required");
      return;
    }

    try {
      setLoading(true);
      updateProfileMutation.mutate(formData, {
        onSuccess: (response) => {
          if (response.success) {
            // Update local user state
            updateUserData(response.data);
            setIsEditing(false);
            toast.success("Profile updated successfully");
          }
        },
        onError: (error) => {
          toast.error(
            error.response?.data?.message || "Failed to update profile",
          );
        },
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle password change
  const handlePasswordChange = async () => {
    if (!passwordData.currentPassword.trim()) {
      toast.error("Current password is required");
      return;
    }

    if (!passwordData.newPassword.trim()) {
      toast.error("New password is required");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error("New password must be at least 6 characters");
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    changeMyPasswordMutation.mutate(
      {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      },
      {
        onSuccess: (response) => {
          if (response.success) {
            toast.success("Password changed successfully");
            setPasswordData({
              currentPassword: "",
              newPassword: "",
              confirmPassword: "",
            });
            setShowPasswordForm(false);
          }
        },
        onError: (error) => {
          toast.error(
            error.response?.data?.message || "Failed to change password",
          );
        },
      },
    );
  };

  // Handle primary store change
  const handlePrimaryStoreChange = async (storeId) => {
    setSelectedStoreId(storeId);
    setMyPrimaryStoreMutation.mutate(storeId, {
      onSuccess: (response) => {
        if (response.success) {
          toast.success("Primary store updated");
          updateUserData(response.data);
        }
      },
      onError: (error) => {
        toast.error(
          error.response?.data?.message || "Failed to update primary store",
        );
      },
    });
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Get user initials
  const getUserInitials = () => {
    if (currentUser?.firstName && currentUser?.lastName) {
      return `${currentUser.firstName[0]}${currentUser.lastName[0]}`.toUpperCase();
    }
    if (currentUser?.firstName) {
      return currentUser.firstName[0].toUpperCase();
    }
    if (currentUser?.email) {
      return currentUser.email[0].toUpperCase();
    }
    return "U";
  };

  // Role badge component
  const RoleBadge = ({ role }) => {
    const roleConfig = {
      superadmin: {
        color:
          "bg-purple-100 dark:bg-purple-500/20 text-purple-800 dark:text-purple-300 border-purple-200 dark:border-purple-500/30",
        label: "Super Admin",
        icon: "👑",
      },
      admin: {
        color:
          "bg-blue-100 dark:bg-blue-500/20 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-500/30",
        label: "Admin",
        icon: "🛡️",
      },
      user: {
        color:
          "bg-gray-100 dark:bg-gray-500/20 text-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-500/30",
        label: "User",
        icon: "👤",
      },
    };

    const config = roleConfig[role] || roleConfig.user;

    return (
      <span
        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${config.color}`}
      >
        {config.icon} {config.label}
      </span>
    );
  };

  // Stats cards
  const StatCard = ({ icon: Icon, label, value, color }) => (
    <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-sm p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400">{label}</p>
          <p className={`text-2xl font-bold ${color}`}>{value}</p>
        </div>
        <div
          className={`p-2 rounded-sm ${color.replace("text-", "bg-").replace("400", "100 dark:bg-opacity-20")}`}
        >
          <Icon className={`w-5 h-5 ${color}`} />
        </div>
      </div>
    </div>
  );

  if (!currentUser) {
    return (
      <AdminLayout>
        <SkeletonPreloader />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-8xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-2">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            My Profile
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your account information and preferences
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 mb-2">
          <StatCard
            icon={Users}
            label="Account Type"
            value={userRole.toUpperCase()}
            color="text-blue-600 dark:text-blue-400"
          />
          <StatCard
            icon={Calendar}
            label="Member Since"
            value={formatDate(currentUser.createdAt).split(" ")[0]}
            color="text-green-600 dark:text-green-400"
          />
          <StatCard
            icon={Store}
            label="Active Stores"
            value={userStores.length}
            color="text-yellow-600 dark:text-yellow-400"
          />
          <StatCard
            icon={Shield}
            label="Security Status"
            value="Active"
            color="text-green-600 dark:text-green-400"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">
          {/* Left Column - Profile Card */}
          <div className="lg:col-span-2 space-y-2">
            {/* Profile Card */}
            <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-sm">
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center space-x-4">
                    {currentUser.profileImage ? (
                      <img
                        src={currentUser.profileImage}
                        alt={currentUser.firstName}
                        className="w-20 h-20 rounded-full object-cover border-2 border-blue-600 dark:border-blue-500"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-full bg-linear-to-r from-blue-600 to-cyan-600 dark:from-blue-500 dark:to-cyan-500 flex items-center justify-center text-white text-2xl font-bold">
                        {getUserInitials()}
                      </div>
                    )}
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {currentUser.firstName} {currentUser.lastName}
                      </h2>
                      <div className="flex items-center space-x-2 mt-2">
                        <RoleBadge role={userRole} />
                        <span className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          Joined {formatDate(currentUser.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>

                 
                </div>

             
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-2">
                      First Name *
                    </label>
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) =>
                        setFormData({ ...formData, firstName: e.target.value })
                      }
                      disabled={!isEditing}
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-sm text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:text-gray-500 dark:disabled:text-gray-400"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-2">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) =>
                        setFormData({ ...formData, lastName: e.target.value })
                      }
                      disabled={!isEditing}
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-sm text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:text-gray-500 dark:disabled:text-gray-400"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      disabled={!isEditing}
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-sm text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:text-gray-500 dark:disabled:text-gray-400"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={formData.phoneNo}
                      onChange={(e) =>
                        setFormData({ ...formData, phoneNo: e.target.value })
                      }
                      disabled={!isEditing}
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-sm text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:text-gray-500 dark:disabled:text-gray-400"
                      placeholder="0712345678"
                    />
                  </div>
                </div>

                {/* Profile Image Upload */}
                {isEditing && (
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-2">
                      Profile Image URL
                    </label>
                    <div className="flex items-center space-x-4">
                      <input
                        type="url"
                        value={formData.profileImage}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            profileImage: e.target.value,
                          })
                        }
                        className="flex-1 px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-sm text-gray-900 dark:text-white"
                        placeholder="https://example.com/image.jpg"
                      />
                      <button className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-sm hover:bg-gray-300 dark:hover:bg-gray-600 flex items-center space-x-2">
                        <Upload className="w-4 h-4" />
                        <span>Upload</span>
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                      Enter a valid image URL or upload from your device
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Stores Section */}
            <StoresSection
              userRole={userRole}
              userStores={userStores}
              handlePrimaryStoreChange={handlePrimaryStoreChange}
              selectedStoreId={selectedStoreId}
            />
          </div>

          {/* Right Column - Security & Actions */}
          <div className="space-y-2">
            {/* Security Card */}
            <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-sm">
              <div className="p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <Shield className="w-5 h-5 text-green-600 dark:text-green-400" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Security
                  </h3>
                </div>

                {!showPasswordForm ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/50 rounded-sm">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-green-100 dark:bg-green-500/20 rounded-sm">
                          <Lock className="w-4 h-4 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            Password
                          </p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            Last changed recently
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => setShowPasswordForm(true)}
                        className="px-3 py-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 text-sm rounded-sm transition"
                      >
                        Change
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-2">
                        Current Password
                      </label>
                      <div className="relative">
                        <input
                          type={showCurrentPassword ? "text" : "password"}
                          value={passwordData.currentPassword}
                          onChange={(e) =>
                            setPasswordData({
                              ...passwordData,
                              currentPassword: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-sm text-gray-900 dark:text-white pr-10"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowCurrentPassword(!showCurrentPassword)
                          }
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400"
                        >
                          {showCurrentPassword ? (
                            <EyeOff size={18} />
                          ) : (
                            <Eye size={18} />
                          )}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-2">
                        New Password
                      </label>
                      <div className="relative">
                        <input
                          type={showNewPassword ? "text" : "password"}
                          value={passwordData.newPassword}
                          onChange={(e) =>
                            setPasswordData({
                              ...passwordData,
                              newPassword: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-sm text-gray-900 dark:text-white pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400"
                        >
                          {showNewPassword ? (
                            <EyeOff size={18} />
                          ) : (
                            <Eye size={18} />
                          )}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-2">
                        Confirm New Password
                      </label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          value={passwordData.confirmPassword}
                          onChange={(e) =>
                            setPasswordData({
                              ...passwordData,
                              confirmPassword: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-sm text-gray-900 dark:text-white pr-10"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400"
                        >
                          {showConfirmPassword ? (
                            <EyeOff size={18} />
                          ) : (
                            <Eye size={18} />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="flex space-x-2 pt-2">
                      <button
                        onClick={handlePasswordChange}
                        disabled={changeMyPasswordMutation.isPending}
                        className="flex-1 px-4 py-2 bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600 text-white rounded-sm transition disabled:opacity-50"
                      >
                        {changeMyPasswordMutation.isPending ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white inline-block mr-2"></div>
                            Updating...
                          </>
                        ) : (
                          "Update Password"
                        )}
                      </button>
                      <button
                        onClick={() => setShowPasswordForm(false)}
                        className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-sm transition"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Account Info Card */}
            <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-sm">
              <div className="p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Account Information
                  </h3>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-gray-300 dark:border-gray-700">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      User ID
                    </span>
                    <span className="text-sm text-gray-900 dark:text-white font-mono">
                      {currentUser._id?.slice(-8)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-2 border-b border-gray-300 dark:border-gray-700">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Email
                    </span>
                    <span className="text-sm text-gray-900 dark:text-white truncate max-w-[200px]">
                      {currentUser.email}
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-2 border-b border-gray-300 dark:border-gray-700">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Phone Number
                    </span>
                    <span className="text-sm text-gray-900 dark:text-white">
                      {currentUser.phoneNo || "Not provided"}
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-2 border-b border-gray-300 dark:border-gray-700">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Account Status
                    </span>
                    <span className="text-sm text-green-600 dark:text-green-400">
                      Active
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-2 border-b border-gray-300 dark:border-gray-700">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Newsletter
                    </span>
                    <span
                      className={`text-sm ${currentUser.newsletter ? "text-green-600 dark:text-green-400" : "text-gray-600 dark:text-gray-400"}`}
                    >
                      {currentUser.newsletter ? "Subscribed" : "Not subscribed"}
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-2 border-b border-gray-300 dark:border-gray-700">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Store Access
                    </span>
                    <span className="text-sm text-yellow-600 dark:text-yellow-400">
                      {currentUser.canAccessAllStores
                        ? "All Stores"
                        : "Limited Access"}
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Last Updated
                    </span>
                    <span className="text-sm text-gray-900 dark:text-white">
                      {formatDate(currentUser.updatedAt)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions Card */}
            <QuickActionsCard />
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminProfile;
