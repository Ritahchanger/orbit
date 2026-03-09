export const businessTypes = [
  "Retail",
  "Restaurant",
  "Technology",
  "Healthcare",
  "Education",
  "Manufacturing",
  "Wholesale",
  "E-commerce",
  "Services",
  "Other",
];

// Countries for dropdown
export const countries = [
  "Kenya",
  "Uganda",
  "Tanzania",
  "Rwanda",
  "Ethiopia",
  "Nigeria",
  "South Africa",
  "Ghana",
  "Other",
];

// Subscription plans
export const subscriptionPlans = [
  {
    id: "starter",
    name: "Starter",
    price: "KES 5,000",
    features: ["Up to 2 stores", "Basic analytics", "Email support"],
  },
  {
    id: "professional",
    name: "Professional",
    price: "KES 15,000",
    features: [
      "Up to 10 stores",
      "Advanced analytics",
      "Priority support",
      "API access",
    ],
    popular: true,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: "Custom",
    features: [
      "Unlimited stores",
      "Custom analytics",
      "Dedicated support",
      "SLA guarantee",
    ],
  },
];
