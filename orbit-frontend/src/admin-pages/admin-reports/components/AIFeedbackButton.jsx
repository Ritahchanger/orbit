import { Sparkles } from "lucide-react";
import { useState } from "react";

const AiFeedbackButton = ({
  onClick,
  isLoading = false,
  loadingText = "Analyzing...",
  defaultText = "AI Feedback",
  icon: Icon = Sparkles,
  variant = "primary", // primary, secondary, outline
  size = "md", // sm, md, lg
  className = "",
  disabled = false,
  showIcon = true,
  ...props
}) => {
  const [internalLoading, setInternalLoading] = useState(false);

  const handleClick = async (e) => {
    if (onClick) {
      if (!isLoading) {
        setInternalLoading(true);
        try {
          await onClick(e);
        } finally {
          setInternalLoading(false);
        }
      }
    }
  };

  const isLoadingState = isLoading || internalLoading;

  // Variant styles
  const variants = {
    primary: "bg-linear-to-r from-purple-600 to-pink-600 text-white hover:shadow-lg hover:shadow-purple-500/25",
    secondary: "bg-linear-to-r from-blue-600 to-indigo-600 text-white hover:shadow-lg hover:shadow-blue-500/25",
    outline: "border-2 border-purple-600 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20",
    ghost: "text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20",
    success: "bg-linear-to-r from-green-600 to-emerald-600 text-white hover:shadow-lg hover:shadow-green-500/25",
    warning: "bg-linear-to-r from-yellow-500 to-orange-500 text-white hover:shadow-lg hover:shadow-yellow-500/25"
  };

  // Size styles
  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2.5 text-sm",
    lg: "px-6 py-3 text-base",
    xl: "px-8 py-4 text-lg"
  };

  // Icon sizes
  const iconSizes = {
    sm: "h-3.5 w-3.5",
    md: "h-4 w-4",
    lg: "h-5 w-5",
    xl: "h-6 w-6"
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled || isLoadingState}
      className={`
        ${variants[variant] || variants.primary}
        ${sizes[size] || sizes.md}
        rounded-sm font-semibold
        flex items-center justify-center space-x-2
        transition-all duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
      {...props}
    >
      {showIcon && isLoadingState ? (
        <svg className={`${iconSizes[size]} animate-spin`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : (
        showIcon && <Icon className={iconSizes[size]} />
      )}
      <span>{isLoadingState ? loadingText : defaultText}</span>
    </button>
  );
};

// Pre-configured variants for different use cases
export const DashboardAiButton = (props) => (
  <AiFeedbackButton 
    variant="primary" 
    defaultText="Dashboard Insights" 
    loadingText="Generating insights..." 
    {...props} 
  />
);

export const ProductsAiButton = (props) => (
  <AiFeedbackButton 
    variant="secondary" 
    defaultText="Product Analysis" 
    loadingText="Analyzing products..." 
    {...props} 
  />
);

export const TransactionsAiButton = (props) => (
  <AiFeedbackButton 
    variant="success" 
    defaultText="Transaction Insights" 
    loadingText="Analyzing transactions..." 
    {...props} 
  />
);

export const InventoryAiButton = (props) => (
  <AiFeedbackButton 
    variant="warning" 
    defaultText="Inventory Check" 
    loadingText="Checking inventory..." 
    {...props} 
  />
);

export const ReportAiButton = (props) => (
  <AiFeedbackButton 
    variant="outline" 
    defaultText="Generate Report" 
    loadingText="Generating report..." 
    {...props} 
  />
);

export default AiFeedbackButton;