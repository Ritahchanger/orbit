import { Users, CreditCard, Store } from "lucide-react";
const SubscriptionDetails = ({activeSubscription}) => {
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700  rounded-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-linear-to-r from-maroon-50 to-blue-50 dark:from-maroon-900/20 dark:to-blue-900/20">
        <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-maroon-600" />
          Active Subscription
        </h2>
      </div>
      <div className="p-6 space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-500 dark:text-gray-400">Plan</span>
          <span className="text-sm font-semibold text-maroon-600 capitalize">
            {activeSubscription?.planSlug || business.subscriptionPlan}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Status
          </span>
          <span
            className={`text-sm font-medium px-2 py-1 rounded-full ${
              activeSubscription?.status === "active"
                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
            }`}
          >
            {activeSubscription?.status || business.status}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Billing Cycle
          </span>
          <span className="text-sm text-gray-900 dark:text-white capitalize">
            {activeSubscription?.billingCycle || business.paymentMethod}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Amount Paid
          </span>
          <span className="text-sm font-medium text-gray-900 dark:text-white">
            {activeSubscription?.currency || "KES"}{" "}
            {activeSubscription?.pricePaid?.toLocaleString() || "—"}
          </span>
        </div>
        <div className="border-t border-gray-200 dark:border-gray-700 pt-3 mt-2">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Stores Limit
            </span>
            <span className="text-sm text-gray-900 dark:text-white flex items-center gap-1">
              <Store className="w-3 h-3" />
              {activeSubscription?.limits?.maxStores ||
                business.numberOfStores ||
                "—"}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Users Limit
            </span>
            <span className="text-sm text-gray-900 dark:text-white">
              <Users className="w-3 h-3 inline mr-1" />
              {activeSubscription?.limits?.maxUsers || "—"}
            </span>
          </div>
        </div>
        <div className="border-t border-gray-200 dark:border-gray-700 pt-3 mt-2">
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Days Until Expiry
            </span>
            <span
              className={`text-sm font-medium ${
                activeSubscription?.daysUntilExpiry &&
                activeSubscription.daysUntilExpiry <= 7
                  ? "text-red-600"
                  : "text-green-600"
              }`}
            >
              {activeSubscription?.daysUntilExpiry || "—"} days
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionDetails;
