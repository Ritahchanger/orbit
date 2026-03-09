import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-hot-toast";

import { useAuth } from "../../src/context/authentication/AuthenticationContext";
import otpApi from "../../src/admin-pages/services/otp-api";
import ResetPassword from "../reset-password/ResetPassword";
import LoginForm from "./LoginForm";
import ThemeButton from "../../src/admin-pages/dashboard/layout/ThemeButton";
const AdminLogin = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const { login, authLoading, isAuthenticated, loginWithOtp, authError } =
    useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [otpMode, setOtpMode] = useState(false); // Toggle between password and OTP login
  const [otpSent, setOtpSent] = useState(false);
  const [otpResendCooldown, setOtpResendCooldown] = useState(0);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    otp: "",
    rememberMe: false,
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

      // Check system preference
      if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
        return "dark";
      }
    }
    return "light";
  });

  // Apply theme class to html element
  useEffect(() => {
    const html = document.documentElement;
    if (theme === "dark") {
      html.classList.add("dark");
    } else {
      html.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  // Toggle theme function
  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  };

  // Redirect if already authenticated
  useEffect(() => {
    console.log("AdminLogin useEffect - Debug:", {
      isAuthenticated,
      authLoading,
      locationState: location.state,
      path: location.pathname,
    });

    if (isAuthenticated && !authLoading) {
      console.log(
        "✅ AdminLogin: User is authenticated, proceeding to redirect...",
      );
      const from = location.state?.from?.pathname || "/admin/dashboard";

      console.log("📍 Redirecting to:", from);
      setTimeout(() => {
        navigate(from, {
          replace: true,
          state: { ...location.state, showStoreSelection: undefined },
        });
      }, 0);
    }
  }, [isAuthenticated, authLoading, navigate, location]);

  // Check for remembered email on mount
  useEffect(() => {
    const rememberedEmail = localStorage.getItem("rememberedEmail");
    if (rememberedEmail) {
      setFormData((prev) => ({
        ...prev,
        email: rememberedEmail,
        rememberMe: true,
      }));
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

  // Form validation
  const validateForm = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!otpMode) {
      // Password validation for normal login
      if (!formData.password) {
        newErrors.password = "Password is required";
      } else if (formData.password.length < 6) {
        newErrors.password = "Password must be at least 6 characters";
      }
    } else {
      // OTP validation for OTP login
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

    // Auto format OTP - allow only digits and limit to 6
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

  // Send login OTP
  const handleSendOTP = async () => {
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
      await otpApi.sendLoginOTP({ email: formData.email.trim() });
      setOtpSent(true);
      setOtpResendCooldown(60); // 60 seconds cooldown
      toast.success("OTP sent to your email!");
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

  // Toggle between password and OTP login
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
      if (otpMode) {
        // OTP-based login
        const loginData = {
          email: formData.email.trim(),
          otp: formData.otp,
        };

        // Verify OTP
        const otpResponse = await otpApi.verifyLoginOTP(loginData);

        if (otpResponse.success) {
          // Use the token from OTP response to login
          await login({ email: formData.email.trim() }, otpResponse.token);

          toast.success("Login successful with OTP!");
        } else {
          throw new Error(otpResponse.message || "OTP verification failed");
        }
      } else {
        // Password-based login
        const credentials = {
          email: formData.email.trim(),
          password: formData.password,
        };
        await login(credentials);
        toast.success("Login successful!");
      }

      // Handle remember me
      if (formData.rememberMe) {
        localStorage.setItem("rememberedEmail", formData.email);
      } else {
        localStorage.removeItem("rememberedEmail");
      }

      // Reset login attempts on success
      setLoginAttempts(0);
    } catch (error) {
      // Handle failed login attempts
      const newAttempts = loginAttempts + 1;
      setLoginAttempts(newAttempts);

      if (newAttempts >= 3) {
        // Suggest OTP login after multiple failures
        if (!otpMode) {
          toast.error("Multiple failed attempts. Try OTP login for security.");
          setOtpMode(true);
        } else {
          setShowResetPassword(true);
          toast.error(
            "Multiple failed attempts. Consider resetting your password.",
          );
        }
      }
      toast.error(
        error.message ||
          authError ||
          "Login failed. Please check your credentials.",
      );
    } finally {
      setLoading(false);
    }
  };

  // Handle forgot password with OTP
  const handleForgotPassword = async () => {
    if (!resetEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(resetEmail)) {
      toast.error("Please enter a valid email address");
      return;
    }

    setLoading(true);
    try {
      // Use OTP API to send password reset
      await otpApi.sendPasswordResetOTP(resetEmail);
      setResetSent(true);
      toast.success("Password reset OTP sent to your email!");
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
            />
          )}
        </div>
      </div>
    </>
  );
};

export default AdminLogin;
