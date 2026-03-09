// ThemeButton.jsx - FIXED VERSION
import { useTheme } from "../../../context/theme-context/ThemeContext";
import { useState, useRef, useEffect } from "react";

const ThemeButton = () => {
  // ✅ ALL HOOKS MUST BE AT THE TOP LEVEL
  const { isDarkMode, toggleTheme, mounted } = useTheme();
  const [showTooltip, setShowTooltip] = useState(false);
  const buttonRef = useRef(null);
  const tooltipRef = useRef(null);

  // ✅ useEffect is now BEFORE any conditional returns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        tooltipRef.current &&
        !tooltipRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        setShowTooltip(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []); // Empty dependency array - runs once on mount

  // ✅ Early return AFTER all hooks
  if (!mounted) {
    return (
      <button
        ref={buttonRef}
        className="p-1 rounded-full opacity-50 relative"
        aria-label="Loading theme"
      >
        <div className="w-12 h-6 bg-gray-300 dark:bg-gray-600 rounded-full" />
      </button>
    );
  }

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      setShowTooltip(false);
    }
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      toggleTheme();
    }
  };

  return (
    <div className="relative inline-block mt-[0.5rem]">
      <button
        ref={buttonRef}
        onClick={toggleTheme}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onFocus={() => setShowTooltip(true)}
        onBlur={() => setShowTooltip(false)}
        onKeyDown={handleKeyDown}
        className="relative inline-flex items-center cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 rounded-full"
        aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
        role="switch"
        aria-checked={isDarkMode}
      >
        {/* Toggle background */}
        <div
          className={`
          w-12 h-6 rounded-full transition-colors duration-300 ease-in-out
          ${isDarkMode ? "bg-blue-600" : "bg-gray-300"}
        `}
        >
          {/* Toggle indicator with icons inside */}
          <div
            className={`
            absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-md 
            transform transition-transform duration-300 ease-in-out
            flex items-center justify-center
            ${isDarkMode ? "translate-x-6" : "translate-x-0"}
          `}
          >
            {/* Inner indicator dot */}
            <div
              className={`
              w-2 h-2 rounded-full
              ${isDarkMode ? "bg-blue-600" : "bg-gray-400"}
            `}
            />
          </div>
        </div>

        {/* Screen reader text */}
        <span className="sr-only">
          {isDarkMode ? "Dark mode active" : "Light mode active"}
        </span>
      </button>

      {/* Tooltip */}
      {showTooltip && (
        <div
          ref={tooltipRef}
          role="tooltip"
          className="absolute bottom-[-2.4rem] transform -translate-x-1/2 mb-2 px-2 py-1 text-xs font-medium text-white bg-gray-900 dark:bg-gray-700 rounded shadow-lg whitespace-nowrap z-50"
          style={{
            animation: "fadeIn 0.2s ease-in-out",
          }}
        >
          {/* Arrow */}
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -mt-1">
            <div className="border-4 border-transparent border-t-gray-900 dark:border-t-gray-700" />
          </div>

          {/* Tooltip text */}
          <span>
            {isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          </span>
        </div>
      )}
    </div>
  );
};

// Add fade-in animation to your global CSS
const style = document.createElement("style");
style.textContent = `
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translate(-50%, 10px);
    }
    to {
      opacity: 1;
      transform: translate(-50%, 0);
    }
  }
`;
document.head.appendChild(style);

export default ThemeButton;
