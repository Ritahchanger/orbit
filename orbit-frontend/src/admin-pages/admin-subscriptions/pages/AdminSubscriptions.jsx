import { useState } from "react";
import AdminLayout from "../../dashboard/layout/Layout";
import {
  CreditCard,
  Calendar,
  Building2,
  Users,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Download,
  RefreshCw,
  Mail,
  Phone,
  MapPin,
  Globe,
  Package,
  TrendingUp,
  Crown,
  Shield,
  Receipt,
  FileText,
  Smartphone,
  Landmark,
  Wallet,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { format, formatDistanceToNow } from "date-fns";

// Mock data - replace with actual API call to get logged-in business subscription
const mockBusinessSubscription = {
  id: "1",
  businessName: "Orbit Technologies",
  businessEmail: "info@orbittech.com",
  businessPhone: "+254 700 123 456",
  registrationNumber: "BRN-2024-001",
  taxId: "PIN-12345678",
  businessAddress: "123 Business Park, Westlands",
  city: "Nairobi",
  country: "Kenya",
  postalCode: "00100",
  website: "https://orbittech.com",

  // Subscription details
  subscriptionPlan: "enterprise",
  planDetails: {
    name: "Enterprise",
    price: 299,
    currency: "USD",
    interval: "monthly",
    features: [
      "Unlimited users",
      "Advanced analytics",
      "Priority support 24/7",
      "Custom integrations",
      "API access",
      "Dedicated account manager",
      "SLA guarantee",
      "Advanced security features",
    ],
  },
  paymentMethod: "monthly",
  status: "active",

  // Dates
  startDate: "2024-01-15T10:00:00Z",
  expiryDate: "2025-01-15T10:00:00Z",
  lastPaymentDate: "2024-12-15T10:00:00Z",
  nextBillingDate: "2025-01-15T10:00:00Z",
  trialEndsAt: null,

  // Financial
  totalPaid: 3588,
  nextPaymentAmount: 299,
  currency: "USD",

  // Payment history
  paymentHistory: [
    {
      id: "pay_1",
      date: "2024-12-15T10:00:00Z",
      amount: 299,
      status: "paid",
      method: "Credit Card",
      receipt: "https://example.com/receipt/1",
    },
    {
      id: "pay_2",
      date: "2024-11-15T10:00:00Z",
      amount: 299,
      status: "paid",
      method: "Credit Card",
      receipt: "https://example.com/receipt/2",
    },
    {
      id: "pay_3",
      date: "2024-10-15T10:00:00Z",
      amount: 299,
      status: "paid",
      method: "Bank Transfer",
      receipt: "https://example.com/receipt/3",
    },
  ],

  // Admin info
  adminName: "John Doe",
  adminEmail: "john@orbittech.com",
  adminPhone: "+254 700 123 457",

  // Business stats
  employeeCount: "51-200",
  numberOfStores: 3,
  totalUsers: 45,
  activeUsers: 38,

  createdAt: "2024-01-15T10:00:00Z",
  updatedAt: "2024-12-15T10:00:00Z",
};

// Plan configuration
const planConfig = {
  basic: {
    name: "Basic",
    color: "bg-gray-500/10 text-gray-400 border-gray-500/20",
    icon: Package,
    bgGradient: "from-gray-500/20 to-gray-600/20",
  },
  professional: {
    name: "Professional",
    color: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    icon: TrendingUp,
    bgGradient: "from-blue-500/20 to-blue-600/20",
  },
  enterprise: {
    name: "Enterprise",
    color: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    icon: Crown,
    bgGradient: "from-purple-500/20 to-purple-600/20",
  },
};

// Status configuration
const statusConfig = {
  active: {
    label: "Active",
    color: "bg-green-500/10 text-green-400 border-green-500/20",
    icon: CheckCircle,
    bgColor: "bg-green-500/5",
  },
  expired: {
    label: "Expired",
    color: "bg-red-500/10 text-red-400 border-red-500/20",
    icon: XCircle,
    bgColor: "bg-red-500/5",
  },
  past_due: {
    label: "Past Due",
    color: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    icon: AlertCircle,
    bgColor: "bg-yellow-500/5",
  },
  trial: {
    label: "Trial",
    color: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    icon: Clock,
    bgColor: "bg-blue-500/5",
  },
  cancelled: {
    label: "Cancelled",
    color: "bg-gray-500/10 text-gray-400 border-gray-500/20",
    icon: XCircle,
    bgColor: "bg-gray-500/5",
  },
};

// Info Card Component
const InfoCard = ({ icon: Icon, label, value, color = "text-gray-400" }) => (
  <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-sm p-4">
    <div className="flex items-start gap-2">
      <div className={`p-2 rounded-sm ${color} bg-opacity-10`}>
        <Icon className={`w-5 h-5 ${color}`} />
      </div>
      <div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{label}</p>
        <p className="text-sm font-medium text-gray-900 dark:text-white">
          {value}
        </p>
      </div>
    </div>
  </div>
);

// Stat Card Component
const StatCard = ({ icon: Icon, label, value, sublabel, color }) => (
  <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-sm p-4">
    <div className="flex items-center justify-between mb-2">
      <div className={`p-2 rounded-sm ${color}`}>
        <Icon className="w-4 h-4" />
      </div>
      <span className="text-xs text-gray-500 dark:text-gray-400">
        {sublabel}
      </span>
    </div>
    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{label}</p>
    <p className="text-lg font-bold text-gray-900 dark:text-white">{value}</p>
  </div>
);

// Feature Pill Component
const FeaturePill = ({ feature }) => (
  <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-700/50 rounded-sm text-sm text-gray-700 dark:text-gray-300">
    <CheckCircle className="w-4 h-4 text-green-500" />
    {feature}
  </div>
);

const AdminSubscriptionProfile = () => {
  const [loading, setLoading] = useState(false);
  const [subscription, setSubscription] = useState(mockBusinessSubscription);
  const [activeTab, setActiveTab] = useState("overview");

  const StatusIcon = statusConfig[subscription.status]?.icon || AlertCircle;
  const PlanIcon = planConfig[subscription.subscriptionPlan]?.icon || Package;

  const handleRefresh = () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setSubscription(mockBusinessSubscription);
      setLoading(false);
      toast.success("Subscription data refreshed");
    }, 1000);
  };

  const handleDownloadInvoice = (paymentId) => {
    toast.success(`Downloading invoice...`);
  };

  const handleUpdatePaymentMethod = () => {
    toast.success("Opening payment method update...");
  };

  const handleContactSupport = () => {
    toast.success("Opening support chat...");
  };

  const handleCancelSubscription = () => {
    if (window.confirm("Are you sure you want to cancel your subscription?")) {
      toast.success("Subscription cancellation requested");
    }
  };

  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), "MMMM dd, yyyy");
    } catch {
      return "Invalid date";
    }
  };

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white p-4 sm:p-6">
        {/* Header with Refresh */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
          <div>
            <h1 className="text-2xl font-bold text-black dark:text-white">
              Subscription Profile
            </h1>
            <p className="text-sm text-black dark:text-gray-400 mt-1">
              Manage your subscription and billing information
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-sm transition-colors disabled:opacity-50"
              title="Refresh"
            >
              <RefreshCw
                className={`w-5 h-5 ${loading ? "animate-spin" : ""}`}
              />
            </button>
            <button
              onClick={handleContactSupport}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Contact Support
            </button>
          </div>
        </div>

        {/* Status Banner */}
        <div
          className={`mb-2 p-4 rounded-sm border ${statusConfig[subscription.status]?.bgColor} ${statusConfig[subscription.status]?.color.split(" ")[1]}`}
        >
          <div className="flex items-center gap-2">
            <StatusIcon className="w-6 h-6" />
            <div>
              <h3 className="font-semibold text-neutral-700 dark:text-white">
                Subscription {statusConfig[subscription.status]?.label}
              </h3>
              <p className="text-sm opacity-90 text-neutral-700 dark:text-white">
                {subscription.status === "active" &&
                  "Your subscription is active and in good standing"}
                {subscription.status === "trial" &&
                  `Your trial ends on ${formatDate(subscription.expiryDate)}`}
                {subscription.status === "past_due" &&
                  "Your payment is past due. Please update your payment method."}
                {subscription.status === "expired" &&
                  "Your subscription has expired. Renew now to continue using our services."}
              </p>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">
          {/* Left Column - Business Info & Plan */}
          <div className="lg:col-span-2 space-y-2">
            {/* Business Information Card */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-sm overflow-hidden">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  Business Information
                </h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <InfoCard
                    icon={Building2}
                    label="Business Name"
                    value={subscription.businessName}
                    color="text-blue-500"
                  />
                  <InfoCard
                    icon={FileText}
                    label="Registration Number"
                    value={subscription.registrationNumber}
                    color="text-purple-500"
                  />
                  <InfoCard
                    icon={Mail}
                    label="Business Email"
                    value={subscription.businessEmail}
                    color="text-green-500"
                  />
                  <InfoCard
                    icon={Phone}
                    label="Business Phone"
                    value={subscription.businessPhone}
                    color="text-yellow-500"
                  />
                  <InfoCard
                    icon={MapPin}
                    label="Address"
                    value={`${subscription.businessAddress}, ${subscription.city}`}
                    color="text-red-500"
                  />
                  <InfoCard
                    icon={Globe}
                    label="Website"
                    value={subscription.website || "Not provided"}
                    color="text-indigo-500"
                  />
                </div>
              </div>
            </div>

            {/* Current Plan Card */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-sm overflow-hidden">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Current Plan
                </h2>
              </div>
              <div className="p-6">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <div
                        className={`p-2 rounded-sm ${planConfig[subscription.subscriptionPlan]?.color}`}
                      >
                        <PlanIcon className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                          {subscription.planDetails.name} Plan
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          ${subscription.planDetails.price}/
                          {subscription.paymentMethod === "annual"
                            ? "year"
                            : "month"}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div
                    className={`px-3 py-1 rounded-full border ${statusConfig[subscription.status]?.color}`}
                  >
                    <span className="text-sm font-medium">
                      {statusConfig[subscription.status]?.label}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-2">
                  <StatCard
                    icon={Calendar}
                    label="Start Date"
                    value={formatDate(subscription.startDate)}
                    sublabel="Started"
                    color="bg-green-500/10 text-green-500"
                  />
                  <StatCard
                    icon={Clock}
                    label="Expiry Date"
                    value={formatDate(subscription.expiryDate)}
                    sublabel={formatDistanceToNow(
                      new Date(subscription.expiryDate),
                      { addSuffix: true },
                    )}
                    color="bg-yellow-500/10 text-yellow-500"
                  />
                  <StatCard
                    icon={CreditCard}
                    label="Next Payment"
                    value={`$${subscription.nextPaymentAmount}`}
                    sublabel={formatDate(subscription.nextBillingDate)}
                    color="bg-blue-500/10 text-blue-500"
                  />
                </div>

                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Plan Features
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {subscription.planDetails.features.map((feature, index) => (
                    <FeaturePill key={index} feature={feature} />
                  ))}
                </div>
              </div>
            </div>

            {/* Payment History */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-sm overflow-hidden">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <Receipt className="w-5 h-5" />
                  Payment History
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Method
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Invoice
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {subscription.paymentHistory.map((payment) => (
                      <tr
                        key={payment.id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
                      >
                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                          {formatDate(payment.date)}
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                          ${payment.amount}
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                            {payment.method === "Credit Card" ? (
                              <CreditCard className="w-4 h-4" />
                            ) : payment.method === "Bank Transfer" ? (
                              <Landmark className="w-4 h-4" />
                            ) : (
                              <Wallet className="w-4 h-4" />
                            )}
                            {payment.method}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2 py-1 rounded-sm text-xs bg-green-500/10 text-green-400 border border-green-500/20">
                            {payment.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => handleDownloadInvoice(payment.id)}
                            className="p-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                            title="Download Invoice"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right Column - Stats & Actions */}
          <div className="space-y-2">
            {/* Admin Info Card */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-sm overflow-hidden">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Administrator
                </h3>
              </div>
              <div className="p-4 space-y-3">
                <InfoCard
                  icon={Users}
                  label="Name"
                  value={subscription.adminName}
                  color="text-purple-500"
                />
                <InfoCard
                  icon={Mail}
                  label="Email"
                  value={subscription.adminEmail}
                  color="text-green-500"
                />
                <InfoCard
                  icon={Phone}
                  label="Phone"
                  value={subscription.adminPhone}
                  color="text-yellow-500"
                />
              </div>
            </div>

            {/* Usage Stats Card */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-sm overflow-hidden">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Usage Statistics
                </h3>
              </div>
              <div className="p-4 space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-500 dark:text-gray-400">
                      Users
                    </span>
                    <span className="text-gray-900 dark:text-white font-medium">
                      {subscription.activeUsers}/{subscription.totalUsers}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{
                        width: `${(subscription.activeUsers / subscription.totalUsers) * 100}%`,
                      }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-500 dark:text-gray-400">
                      Stores
                    </span>
                    <span className="text-gray-900 dark:text-white font-medium">
                      {subscription.numberOfStores} active
                    </span>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-500 dark:text-gray-400">
                      Employees
                    </span>
                    <span className="text-gray-900 dark:text-white font-medium">
                      {subscription.employeeCount}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions Card */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-sm overflow-hidden">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Quick Actions
                </h3>
              </div>
              <div className="p-4 space-y-2">
                <button
                  onClick={handleUpdatePaymentMethod}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-sm transition-colors"
                >
                  <CreditCard className="w-4 h-4 text-blue-500" />
                  Update Payment Method
                </button>
                <button
                  onClick={() => setActiveTab("billing")}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-sm transition-colors"
                >
                  <Receipt className="w-4 h-4 text-green-500" />
                  View Billing History
                </button>
                <button
                  onClick={handleContactSupport}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-sm transition-colors"
                >
                  <Mail className="w-4 h-4 text-purple-500" />
                  Contact Support
                </button>
                {subscription.status === "active" && (
                  <button
                    onClick={handleCancelSubscription}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-left text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-sm transition-colors"
                  >
                    <XCircle className="w-4 h-4" />
                    Cancel Subscription
                  </button>
                )}
              </div>
            </div>

            {/* Support Card */}
            <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-sm p-4">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                Need Help?
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Our support team is available 24/7 to assist you with any
                questions.
              </p>
              <button
                onClick={handleContactSupport}
                className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-sm transition-colors text-sm font-medium"
              >
                Contact Support
              </button>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminSubscriptionProfile;
