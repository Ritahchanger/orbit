import AdminLayout from "../../dashboard/layout/Layout";
import { useUpdateBusiness } from "../../hooks/business.mutations";
import { useNavigate } from "react-router-dom";
import { useGetMyBusiness } from "../../hooks/business.queries";
import { useState } from "react";
import {
  Building2,
  Mail,
  Phone,
  MapPin,
  Globe,
  Users,
  Package,
  Calendar,
} from "lucide-react";


import { InfoCard } from "../components/InfoCard";


import { SkeletonCard } from "../components/SkeletonCard";


import OwnerInformation from "../components/OwnerInformation";


import SubscriptionDetails from "../components/SubscriptionDetails";

// Types
// Info Card Component
// Skeleton Loader

const AdminBusinessProfile = () => {
  const { data, isLoading } = useGetMyBusiness();
  const { mutate: updateBusiness, isPending } = useUpdateBusiness();

  const [editMode, setEditMode] = useState(false);
  const navigate = useNavigate();

  const [form, setForm] = useState({});

  // Access the nested business data correctly
  const responseData = data;
  const business = responseData?.data?.business;
  const activeSubscription = responseData?.data?.activeSubscription;

  const handleEdit = () => {
    if (business) {
      setForm({
        businessName: business.businessName,
        businessEmail: business.businessEmail,
        businessPhone: business.businessPhone,
        businessAddress: business.businessAddress,
        city: business.city,
        country: business.country,
        website: business.website,
        businessDescription: business.businessDescription,
      });
      setEditMode(true);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (business) {
      updateBusiness(
        { id: business._id, data: form },
        {
          onSuccess: () => setEditMode(false),
        },
      );
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-6">
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-64 mb-2 animate-pulse"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-96 animate-pulse"></div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">
              <div className="lg:col-span-2 space-y-6">
                <SkeletonCard />
                <SkeletonCard />
              </div>
              <div className="space-y-6">
                <SkeletonCard />
                <SkeletonCard />
              </div>
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!business) {
    return (
      <AdminLayout>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6">
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">
              No business data found
            </p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6">
        <div className="mx-auto">
          {/* HEADER */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-3">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Business Profile
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Manage your business information
              </p>
            </div>

            {!editMode ? (
              <div className="flex gap-2">
                <button
                  onClick={() => navigate("/admin/subscriptions")}
                  className="px-4 py-2 bg-maroon-600 text-white rounded-sm text-sm hover:bg-maroon-700 transition duration-200"
                >
                  View Subscriptions
                </button>
                <button
                  onClick={handleEdit}
                  className="px-4 py-2 bg-blue-600 text-white rounded-sm text-sm hover:bg-blue-700 transition duration-200"
                >
                  Edit Profile
                </button>
              </div>
            ) : (
              <button
                onClick={() => setEditMode(false)}
                className="px-4 py-2 bg-gray-500 text-white rounded-sm hover:bg-gray-600 transition duration-200"
              >
                Cancel
              </button>
            )}
          </div>

          {!editMode ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">
              {/* LEFT COLUMN - Business Info */}
              <div className="lg:col-span-2 space-y-2">
                {/* BUSINESS INFORMATION */}
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700  rounded-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-linear-to-r from-maroon-50 to-blue-50 dark:from-maroon-900/20 dark:to-blue-900/20">
                    <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                      <Building2 className="w-5 h-5 text-maroon-600" />
                      Business Information
                    </h2>
                  </div>
                  <div className="p-6 grid md:grid-cols-2 gap-2">
                    <InfoCard
                      icon={Building2}
                      label="Business Name"
                      value={business.businessName}
                    />
                    <InfoCard
                      icon={Mail}
                      label="Email"
                      value={business.businessEmail}
                    />
                    <InfoCard
                      icon={Phone}
                      label="Phone"
                      value={business.businessPhone}
                    />
                    <InfoCard
                      icon={Package}
                      label="Business Type"
                      value={business.businessType}
                    />
                    <InfoCard
                      icon={Building2}
                      label="Registration Number"
                      value={business.registrationNumber}
                    />
                    <InfoCard
                      icon={Building2}
                      label="Tax ID"
                      value={business.taxId}
                    />
                    <InfoCard
                      icon={Users}
                      label="Employee Count"
                      value={business.employeeCount}
                    />
                    <InfoCard
                      icon={Calendar}
                      label="Year Established"
                      value={business.yearEstablished}
                    />
                  </div>
                </div>

                {/* LOCATION */}
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-linear-to-r from-maroon-50 to-blue-50 dark:from-maroon-900/20 dark:to-blue-900/20">
                    <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-maroon-600" />
                      Location
                    </h2>
                  </div>
                  <div className="p-6 grid md:grid-cols-2 gap-2">
                    <InfoCard
                      icon={MapPin}
                      label="Address"
                      value={business.businessAddress}
                    />
                    <InfoCard
                      icon={MapPin}
                      label="City"
                      value={business.city}
                    />
                    <InfoCard
                      icon={MapPin}
                      label="Country"
                      value={business.country}
                    />
                    <InfoCard
                      icon={MapPin}
                      label="Postal Code"
                      value={business.postalCode}
                    />
                    <InfoCard
                      icon={Globe}
                      label="Website"
                      value={business.website}
                    />
                  </div>
                </div>

                {/* DESCRIPTION */}
                {business.businessDescription && (
                  <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700  rounded-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                      <h2 className="font-semibold text-gray-900 dark:text-white">
                        Description
                      </h2>
                    </div>
                    <div className="p-6">
                      <p className="text-gray-700 dark:text-gray-300">
                        {business.businessDescription}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* RIGHT COLUMN - Owner & Subscription */}
              <div className="space-y-2">
                {/* OWNER INFORMATION */}
                <OwnerInformation business={business} />

                {/* SUBSCRIPTION DETAILS */}

                <SubscriptionDetails activeSubscription={activeSubscription} />

                {/* BUSINESS CODE */}
                <div className="bg-linear-to-r from-maroon-50 to-blue-50 dark:from-maroon-900/20 dark:to-blue-900/20 rounded-sm p-4 text-center border border-gray-200 dark:border-gray-700">
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                    Business Code
                  </p>
                  <p className="text-lg font-mono font-bold text-maroon-700 dark:text-maroon-400">
                    {business.businessCode}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            /* EDIT MODE FORM */
            <form
              onSubmit={handleSubmit}
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700  rounded-sm p-6"
            >
              <div className="grid md:grid-cols-2 gap-2">
                {[
                  {
                    name: "businessName",
                    label: "Business Name",
                    type: "text",
                  },
                  {
                    name: "businessEmail",
                    label: "Business Email",
                    type: "email",
                  },
                  {
                    name: "businessPhone",
                    label: "Business Phone",
                    type: "tel",
                  },
                  { name: "businessAddress", label: "Address", type: "text" },
                  { name: "city", label: "City", type: "text" },
                  { name: "country", label: "Country", type: "text" },
                  { name: "website", label: "Website", type: "url" },
                ].map((field) => (
                  <div key={field.name} className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {field.label}
                    </label>
                    <input
                      type={field.type}
                      name={field.name}
                      value={form[field.name] || ""}
                      onChange={handleChange}
                      className="p-2 border rounded-sm bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-maroon-500 focus:border-transparent"
                    />
                  </div>
                ))}

                <div className="md:col-span-2 flex flex-col gap-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Business Description
                  </label>
                  <textarea
                    name="businessDescription"
                    value={form.businessDescription || ""}
                    onChange={handleChange}
                    rows={4}
                    className="p-2 border rounded-sm bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-maroon-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex gap-2 mt-6">
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-4 py-2 rounded-sm text-sm font-medium transition-all whitespace-nowrap flex items-center gap-2 
                              bg-linear-to-r from-blue-600 to-indigo-600 text-white shadow-sm
                              hover:from-blue-700 hover:to-indigo-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  {isPending ? "Saving..." : "Save Changes"}
                </button>
                <button
                  type="button"
                  onClick={() => setEditMode(false)}
                  className="px-6 py-2 bg-gray-500 text-white rounded-sm hover:bg-gray-600 transition duration-200"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminBusinessProfile;
