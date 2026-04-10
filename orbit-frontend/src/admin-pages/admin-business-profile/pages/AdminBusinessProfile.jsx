import AdminLayout from "../../dashboard/layout/Layout";
import { useUpdateBusiness } from "../../hooks/business.mutations";
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
} from "lucide-react";

// ── Info Card
const InfoCard = ({ icon: Icon, label, value }) => (
  <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm rounded-lg p-4">
    <div className="flex items-start gap-3">
      <div className="p-2 rounded-md bg-gray-100 dark:bg-gray-700">
        <Icon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
      </div>
      <div>
        <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
        <p className="text-sm font-medium text-gray-900 dark:text-white">
          {value || "—"}
        </p>
      </div>
    </div>
  </div>
);

// ── Skeleton Loader
const SkeletonCard = () => (
  <div className="animate-pulse bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm rounded-lg p-4 space-y-3">
    <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/3"></div>
    <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-2/3"></div>
    <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-1/2"></div>
  </div>
);

const AdminBusinessProfile = () => {
  const { data, isLoading } = useGetMyBusiness();
  const { mutate: updateBusiness, isPending } = useUpdateBusiness();

  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({});

  const business = data?.data;

  const handleEdit = () => {
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
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    updateBusiness(
      { id: business._id, data: form },
      {
        onSuccess: () => setEditMode(false),
      },
    );
  };

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white p-4 sm:p-6">
        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Business Profile
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Manage your business information
            </p>
          </div>

          {!editMode ? (
            <button
              onClick={handleEdit}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
            >
              Edit Profile
            </button>
          ) : (
            <button
              onClick={() => setEditMode(false)}
              className="px-4 py-2 bg-gray-600 text-white rounded-md"
            >
              Cancel
            </button>
          )}
        </div>

        {/* LOADING */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : !editMode ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* LEFT */}
            <div className="lg:col-span-2 space-y-4">
              {/* BUSINESS INFO */}
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm rounded-lg">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <Building2 className="w-5 h-5" />
                    Business Information
                  </h2>
                </div>

                <div className="p-4 grid md:grid-cols-2 gap-4">
                  <InfoCard
                    icon={Building2}
                    label="Name"
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
                    label="Type"
                    value={business.businessType}
                  />
                </div>
              </div>

              {/* LOCATION */}
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm rounded-lg">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    Location
                  </h2>
                </div>

                <div className="p-4 grid md:grid-cols-2 gap-4">
                  <InfoCard
                    icon={MapPin}
                    label="Address"
                    value={business.businessAddress}
                  />
                  <InfoCard icon={MapPin} label="City" value={business.city} />
                  <InfoCard
                    icon={MapPin}
                    label="Country"
                    value={business.country}
                  />
                  <InfoCard
                    icon={Globe}
                    label="Website"
                    value={business.website}
                  />
                </div>
              </div>
            </div>

            {/* RIGHT */}
            <div className="space-y-4">
              {/* OWNER */}
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm rounded-lg p-4">
                <h2 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Owner
                </h2>

                <p className="text-gray-900 dark:text-white font-medium">
                  {business.owner.fullName}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {business.owner.email}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {business.owner.phoneNo}
                </p>
              </div>

              {/* SUBSCRIPTION */}
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm rounded-lg p-4">
                <h2 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Subscription
                </h2>

                <div className="space-y-1 text-sm">
                  <p>
                    <span className="text-gray-600 dark:text-gray-400">
                      Plan:
                    </span>{" "}
                    <span className="text-gray-900 dark:text-white">
                      {business.subscription.planSlug}
                    </span>
                  </p>
                  <p>
                    <span className="text-gray-600 dark:text-gray-400">
                      Status:
                    </span>{" "}
                    <span className="text-green-600 font-medium">
                      {business.subscription.status}
                    </span>
                  </p>
                  <p>
                    <span className="text-gray-600 dark:text-gray-400">
                      Stores:
                    </span>{" "}
                    {business.subscription.limits.maxStores}
                  </p>
                  <p>
                    <span className="text-gray-600 dark:text-gray-400">
                      Users:
                    </span>{" "}
                    {business.subscription.limits.maxUsers}
                  </p>
                  <p>
                    <span className="text-gray-600 dark:text-gray-400">
                      Days Left:
                    </span>{" "}
                    {business.subscription.daysUntilExpiry}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* EDIT MODE */
          <form
            onSubmit={handleSubmit}
            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm rounded-lg p-6 grid md:grid-cols-2 gap-4"
          >
            {[
              "businessName",
              "businessEmail",
              "businessPhone",
              "businessAddress",
              "city",
              "country",
              "website",
              "businessDescription",
            ].map((field) => (
              <input
                key={field}
                name={field}
                value={form[field] || ""}
                onChange={handleChange}
                placeholder={field}
                className="p-2 border rounded-md bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white"
              />
            ))}

            <div className="col-span-2 flex gap-2 mt-2">
              <button
                type="submit"
                disabled={isPending}
                className="px-4 py-2 bg-green-600 text-white rounded-md"
              >
                {isPending ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminBusinessProfile;
