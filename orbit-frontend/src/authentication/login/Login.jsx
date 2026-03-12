import { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-hot-toast";
import { useAuth } from "../../context/authentication/AuthenticationContext";
import otpApi from "../../admin-pages/services/otp-api";

import { useSearchBusinesses } from "../../../../universal-main-frontend/src/globals/hooks/useBusinessQueries";

import ResetPassword from "../reset-password/ResetPassword";

import LoginForm from "./LoginForm";

import ThemeButton from "../../admin-pages/dashboard/layout/ThemeButton";

import { Link } from "react-router-dom";

import { useDebounce } from "../../globals/hooks/useDebounce";

const AdminLogin = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const { login, authLoading, isAuthenticated, loginWithOtp, authError } =
    useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [otpMode, setOtpMode] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpResendCooldown, setOtpResendCooldown] = useState(0);

  // State for business search
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBusiness, setSelectedBusiness] = useState(null);

  // Use the custom debounce hook
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Use the custom search businesses hook
  const {
    data: searchResults,
    isLoading: isSearching,
    refetch: searchBusinesses,
  } = useSearchBusinesses(debouncedSearchQuery, {
    enabled: debouncedSearchQuery.length >= 2,
  });

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    otp: "",
    rememberMe: false,
    businessId: "",
  });

  const [errors, setErrors] = useState({});
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetSent, setResetSent] = useState(false);

  // Check for system theme preference
  const [theme, setTheme] = useState(() => {
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("theme");
      if (savedTheme) return savedTheme;
      if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
        return "dark";
      }
    }
    return "light";
  });

  // Apply theme class
  useEffect(() => {
    const html = document.documentElement;
    if (theme === "dark") {
      html.classList.add("dark");
    } else {
      html.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  };

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      const from = location.state?.from?.pathname || "/admin/dashboard";
      navigate(from, {
        replace: true,
        state: { ...location.state, showStoreSelection: undefined },
      });
    }
  }, [isAuthenticated, authLoading, navigate, location]);

  // Check for remembered email and business on mount
  useEffect(() => {
    const rememberedEmail = localStorage.getItem("rememberedEmail");
    const rememberedBusiness = localStorage.getItem("rememberedBusiness");

    if (rememberedEmail) {
      setFormData((prev) => ({
        ...prev,
        email: rememberedEmail,
        rememberMe: true,
      }));
    }

    if (rememberedBusiness) {
      try {
        const business = JSON.parse(rememberedBusiness);
        setSelectedBusiness(business);
        setFormData((prev) => ({
          ...prev,
          businessId: business._id,
        }));
        setSearchQuery(business.businessName);
      } catch (error) {
        console.error("Failed to parse remembered business:", error);
      }
    }
  }, []);

  // Handle OTP resend cooldown
  useEffect(() => {
    let interval;
    if (otpResendCooldown > 0) {
      interval = setInterval(() => {
        setOtpResendCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [otpResendCooldown]);

  // ❌ REMOVED: The useEffect that was trying to use setBusinesses

  // Form validation
  const validateForm = () => {
    const newErrors = {};

    // Validate business selection
    if (!selectedBusiness) {
      newErrors.business = "Please select your business";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!otpMode) {
      if (!formData.password) {
        newErrors.password = "Password is required";
      } else if (formData.password.length < 6) {
        newErrors.password = "Password must be at least 6 characters";
      }
    } else {
      if (!formData.otp) {
        newErrors.otp = "OTP is required";
      } else if (!/^\d{6}$/.test(formData.otp)) {
        newErrors.otp = "OTP must be 6 digits";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    let processedValue = value;
    if (name === "otp") {
      processedValue = value.replace(/\D/g, "").slice(0, 6);
    }

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : processedValue,
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleBusinessSelect = (business) => {
    setSelectedBusiness(business);
    setFormData((prev) => ({
      ...prev,
      businessId: business?._id || "",
    }));
    setSearchQuery(business?.businessName || "");

    if (errors.business) {
      setErrors((prev) => ({ ...prev, business: "" }));
    }
  };

  // Send login OTP
  const handleSendOTP = async () => {
    if (!selectedBusiness) {
      toast.error("Please select your business first");
      return;
    }

    if (!formData.email.trim()) {
      toast.error("Please enter your email address");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    setLoading(true);
    try {
      await otpApi.sendLoginOTP({
        email: formData.email.trim(),
        businessId: selectedBusiness._id,
      });
      setOtpSent(true);
      setOtpResendCooldown(60);
      toast.success(
        `OTP sent to ${formData.email} for ${selectedBusiness.businessName}!`,
      );
    } catch (error) {
      toast.error(error.message || "Failed to send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResendOTP = async () => {
    if (otpResendCooldown > 0) {
      toast.error(`Please wait ${otpResendCooldown} seconds before resending`);
      return;
    }

    setLoading(true);
    try {
      await otpApi.resendOTP({
        email: formData.email.trim(),
        businessId: selectedBusiness._id,
        purpose: "login",
      });
      setOtpResendCooldown(60);
      toast.success("New OTP sent to your email!");
    } catch (error) {
      toast.error(error.message || "Failed to resend OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Toggle login mode
  const toggleLoginMode = () => {
    setOtpMode(!otpMode);
    setOtpSent(false);
    setFormData((prev) => ({ ...prev, otp: "", password: "" }));
    setErrors({});
  };

  // Handle login submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix form errors");
      return;
    }

    setLoading(true);

    try {
      // Include business context in login
      const loginPayload = {
        email: formData.email.trim(),
        businessId: selectedBusiness._id,
        businessName: selectedBusiness.businessName,
        ...(otpMode ? { otp: formData.otp } : { password: formData.password }),
      };

      if (otpMode) {
        // OTP-based login
        const otpResponse = await otpApi.verifyLoginOTP(loginPayload);
        if (otpResponse.success) {
          await login(loginPayload, otpResponse.token);
          toast.success(`Welcome to ${selectedBusiness.businessName}!`);
        } else {
          throw new Error(otpResponse.message || "OTP verification failed");
        }
      } else {
        // Password-based login
        await login(loginPayload);
        toast.success(`Welcome to ${selectedBusiness.businessName}!`);
      }

      // Handle remember me
      if (formData.rememberMe) {
        localStorage.setItem("rememberedEmail", formData.email);
        localStorage.setItem(
          "rememberedBusiness",
          JSON.stringify(selectedBusiness),
        );
      } else {
        localStorage.removeItem("rememberedEmail");
        localStorage.removeItem("rememberedBusiness");
      }

      setLoginAttempts(0);
    } catch (error) {
      const newAttempts = loginAttempts + 1;
      setLoginAttempts(newAttempts);

      if (newAttempts >= 3 && !otpMode) {
        toast.error("Multiple failed attempts. Try OTP login for security.");
        setOtpMode(true);
      } else if (newAttempts >= 5) {
        setShowResetPassword(true);
        toast.error("Too many failed attempts. Please reset your password.");
      }

      toast.error(
        error.message ||
          authError ||
          `Login failed for ${selectedBusiness?.businessName}. Please check your credentials.`,
      );
    } finally {
      setLoading(false);
    }
  };

  // Handle forgot password
  const handleForgotPassword = async () => {
    if (!selectedBusiness) {
      toast.error("Please select your business first");
      return;
    }

    if (!resetEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(resetEmail)) {
      toast.error("Please enter a valid email address");
      return;
    }

    setLoading(true);
    try {
      await otpApi.sendPasswordResetOTP({
        email: resetEmail,
        businessId: selectedBusiness._id,
      });
      setResetSent(true);
      toast.success(
        `Password reset OTP sent to ${resetEmail} for ${selectedBusiness.businessName}!`,
      );
    } catch (error) {
      toast.error(
        error.message || "Failed to send reset OTP. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 py-12 px-4 sm:px-6 lg:px-8">
        {/* Theme Toggle Button */}
        <div className="absolute top-2 right-2 p-2">
          <ThemeButton />
        </div>

        <div className="max-w-md w-full">
          {/* Logo & Header */}
          <div className="text-center mb-2">
            <div className="flex justify-center mb-2">
              <div className="flex items-center justify-center">
                <div className="flex flex-col mb-[1rem]">
                  <span className="text-3xl md:text-3xl font-heading font-black tracking-wide">
                    <span className="bg-linear-to-r from-primary via-[#00D4FF] to-primary bg-clip-text text-transparent animate-gradient">
                      ORBIT
                    </span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Reset Password Form */}
          {showResetPassword ? (
            <ResetPassword
              resetSent={resetSent}
              resetEmail={resetEmail}
              setShowResetPassword={setShowResetPassword}
              setResetEmail={setResetEmail}
              setResetSent={setResetSent}
              loading={loading}
              authLoading={authLoading}
              handleForgotPassword={handleForgotPassword}
              selectedBusiness={selectedBusiness}
            />
          ) : (
            /* Main Login Form */
            <LoginForm
              handleSubmit={handleSubmit}
              formData={formData}
              handleChange={handleChange}
              errors={errors}
              loading={loading}
              authLoading={authLoading}
              setShowResetPassword={setShowResetPassword}
              showPassword={showPassword}
              setShowPassword={setShowPassword}
              // OTP Props
              otpMode={otpMode}
              otpSent={otpSent}
              otpResendCooldown={otpResendCooldown}
              toggleLoginMode={toggleLoginMode}
              handleSendOTP={handleSendOTP}
              handleResendOTP={handleResendOTP}
              // Business Search Props
              businesses={searchResults?.data || []} // Use searchResults from hook
              searchBusinesses={searchBusinesses} // This will trigger refetch
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              selectedBusiness={selectedBusiness}
              setSelectedBusiness={handleBusinessSelect}
              isSearching={isSearching} // Use loading state from hook
            />
          )}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Don't have a business account?{" "}
              <Link
                to="/admin/signup"
                className="font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors hover:underline"
              >
                Register your business
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminLogin;
