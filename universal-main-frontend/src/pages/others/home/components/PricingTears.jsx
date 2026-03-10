import { Link } from "react-router-dom";
import { CheckCircle } from "lucide-react";

import { usePlans } from "../../../../globals/hooks/useSubscriptionQueries";

const PricingTiers = () => {
  const { data, isLoading, error } = usePlans({ isActive: true });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600 py-12">
        Failed to load pricing plans. Please try again later.
      </div>
    );
  }

  const plans = data?.data || [];

  // Sort and reorder to put popular plan in the middle
  const sortedPlans = [...plans].sort(
    (a, b) => a.monthlyPrice - b.monthlyPrice,
  );

  // Find the popular plan
  const popularIndex = sortedPlans.findIndex((plan) => plan.isPopular);

  // Reorder array to put popular plan in the middle (index 1 for 3 plans)
  let orderedPlans = sortedPlans;
  if (popularIndex !== -1 && sortedPlans.length === 3) {
    const popular = sortedPlans[popularIndex];
    const others = sortedPlans.filter((_, index) => index !== popularIndex);

    // Insert popular at index 1 (middle)
    orderedPlans = [others[0], popular, others[1]];
  }

  const formatPrice = (price) => {
    if (price === 0) return "Custom";
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto px-4">
      {orderedPlans.map((plan, index) => (
        <div
          key={plan._id}
          className={`bg-white rounded-2xl p-8 transition-all duration-300 ${
            plan.isPopular
              ? "ring-2 ring-blue-600 shadow-2xl md:scale-105 relative z-10"
              : "shadow-lg"
          } ${
            // Add different styles for left and right cards when popular is in middle
            !plan.isPopular && orderedPlans.length === 3
              ? index === 0
                ? "md:translate-x-4" // Left card shifted right
                : "md:-translate-x-4" // Right card shifted left
              : ""
          }`}
        >
          {plan.isPopular && (
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-semibold whitespace-nowrap">
                Most Popular
              </div>
            </div>
          )}

          <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>

          <div className="mb-6">
            <span className="text-4xl font-bold text-gray-900">
              {formatPrice(plan.monthlyPrice)}
            </span>
            {plan.monthlyPrice > 0 && (
              <span className="text-gray-600">/month</span>
            )}
          </div>

          {plan.annualPrice > 0 && (
            <div className="mb-4 text-sm">
              <span className="text-gray-500 line-through mr-2">
                {formatPrice(plan.monthlyPrice * 12)}
              </span>
              <span className="text-green-600 font-semibold">
                {formatPrice(plan.annualPrice)}/year
              </span>
              <span className="ml-2 bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                Save {plan.annualDiscountPercent}%
              </span>
            </div>
          )}

          {plan.trialDays > 0 && (
            <div className="mb-4 text-sm text-blue-600 font-medium">
              🎉 {plan.trialDays}-day free trial
            </div>
          )}

          <ul className="space-y-3 mb-8">
            {plan.features.map((feature, idx) => (
              <li key={idx} className="flex items-start gap-2 text-gray-600">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>

          <Link
            to={plan.isPopular ? "/signup" : "/contact"}
            className={`block text-center py-3 px-6 rounded-xl font-semibold transition-all duration-300 ${
              plan.isPopular
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "bg-gray-100 text-gray-900 hover:bg-gray-200"
            }`}
          >
            {plan.name === "Enterprise" ? "Contact Sales" : "Get Started"}
          </Link>
        </div>
      ))}
    </div>
  );
};

export default PricingTiers;
