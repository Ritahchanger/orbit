import { useState, useEffect } from "react";
import {
  CheckCircle,
  Mail,
  Lock,
  KeyRound,
  AlertCircle,
  ArrowLeft,
  Eye,
  EyeOff,
} from "lucide-react";
import { toast } from "react-hot-toast";
import otpApi from "../../admin-pages/services/otp-api";

const ResetPassword = ({
  resetSent,
  resetEmail,
  setShowResetPassword,
  setResetEmail,
  setResetSent,
  loading,
  authLoading,
  handleForgotPassword,
}) => {
  const [resetStep, setResetStep] = useState("request");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [otpResendCooldown, setOtpResendCooldown] = useState(0);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  // Fixed: useEffect-based cooldown (no interval leak)
  useEffect(() => {
    if (otpResendCooldown <= 0) return;
    const timer = setTimeout(() => setOtpResendCooldown((p) => p - 1), 1000);
    return () => clearTimeout(timer);
  }, [otpResendCooldown]);

  const validateOTP = () => {
    const newErrors = {};
    if (!otp.trim()) newErrors.otp = "OTP is required";
    else if (!/^\d{6}$/.test(otp)) newErrors.otp = "OTP must be 6 digits";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateNewPassword = () => {
    const newErrors = {};
    if (!newPassword) {
      newErrors.newPassword = "New password is required";
    } else if (newPassword.length < 8) {
      newErrors.newPassword = "Password must be at least 8 characters";
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(newPassword)) {
      newErrors.newPassword =
        "Password must contain uppercase, lowercase and numbers";
    }
    if (!confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleVerifyOTP = async () => {
    if (!validateOTP()) return;
    setIsVerifying(true);
    setErrors({});
    try {
      const response = await otpApi.verifyPasswordResetOTP({
        email: resetEmail,
        otp,
      });
      if (response.success) {
        setResetStep("new-password");
        toast.success("OTP verified successfully!");
      } else {
        throw new Error(response.message || "OTP verification failed");
      }
    } catch (error) {
      setErrors({ otp: error.message });
      toast.error(error.message || "OTP verification failed");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendOTP = async () => {
    if (otpResendCooldown > 0) return;
    try {
      await otpApi.resendOTP({ email: resetEmail, purpose: "password-reset" });
      setOtpResendCooldown(60);
      toast.success("New OTP sent to your email!");
    } catch (error) {
      toast.error(error.message || "Failed to resend OTP");
    }
  };

  const handleNewPasswordSubmit = async () => {
    if (!validateNewPassword()) return;
    setIsResetting(true);
    setErrors({});
    try {
      // Send otp directly — no resetToken needed
      const response = await otpApi.resetPassword({
        email: resetEmail,
        otp,
        newPassword,
        confirmPassword,
      });

      if (response.success) {
        toast.success("Password reset successful! Please login.");
        setTimeout(() => {
          setShowResetPassword(false);
          setResetEmail("");
          setResetSent(false);
          setResetStep("request");
          setOtp("");
          setNewPassword("");
          setConfirmPassword("");
          setErrors({});
        }, 1500);
      } else {
        throw new Error(response.message || "Password reset failed");
      }
    } catch (error) {
      setErrors({ submit: error.message });
      toast.error(error.message || "Password reset failed");
    } finally {
      setIsResetting(false);
    }
  };

  const handleForgotPasswordSubmit = async () => {
    if (!resetEmail) {
      setErrors({ email: "Email is required" });
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(resetEmail)) {
      setErrors({ email: "Please enter a valid email address" });
      return;
    }
    await handleForgotPassword();
  };

  const renderStep = () => {
    switch (resetStep) {
      case "request":
        return (
          <>
            <div className="mb-6">
              <label
                htmlFor="resetEmail"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                </div>
                <input
                  id="resetEmail"
                  type="email"
                  value={resetEmail}
                  onChange={(e) => {
                    setResetEmail(e.target.value);
                    if (errors.email) setErrors({ ...errors, email: "" });
                  }}
                  className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
                  placeholder="Enter your registered email"
                  disabled={loading || authLoading}
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" /> {errors.email}
                </p>
              )}
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowResetPassword(false)}
                className="flex-1 py-3 px-4 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-medium rounded-sm transition-colors shadow-sm"
                disabled={loading || authLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleForgotPasswordSubmit}
                disabled={loading || authLoading || !resetEmail}
                className="flex-1 py-3 px-4 bg-gradient-to-r from-blue-500 to-purple-500 dark:from-blue-600 dark:to-purple-600 hover:from-blue-600 hover:to-purple-600 dark:hover:from-blue-700 dark:hover:to-purple-700 text-white font-medium rounded-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >
                {loading || authLoading ? "Sending..." : "Send Reset OTP"}
              </button>
            </div>
          </>
        );

      case "verify":
        return (
          <>
            <button
              onClick={() => setResetStep("request")}
              className="flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300 mb-4"
              disabled={isVerifying}
            >
              <ArrowLeft className="h-4 w-4 mr-1" /> Change Email
            </button>
            <div className="mb-6">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                Enter the 6-digit OTP sent to
                <span className="text-blue-600 dark:text-blue-400 font-medium ml-1">
                  {resetEmail}
                </span>
              </div>
              <label
                htmlFor="otp"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Verification Code
              </label>
              <input
                id="otp"
                type="text"
                inputMode="numeric"
                maxLength="6"
                value={otp}
                onChange={(e) => {
                  setOtp(e.target.value.replace(/\D/g, "").slice(0, 6));
                  if (errors.otp) setErrors({ ...errors, otp: "" });
                }}
                className="w-full py-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-sm font-semibold text-3xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 focus:border-transparent text-center tracking-widest"
                placeholder="123456"
                disabled={isVerifying}
              />
              {errors.otp && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" /> {errors.otp}
                </p>
              )}
              <div className="mt-3 flex items-center justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-500">
                  Didn't receive the code?
                </span>
                <button
                  onClick={handleResendOTP}
                  disabled={otpResendCooldown > 0 || isVerifying}
                  className={`text-sm ${otpResendCooldown > 0 ? "text-gray-400 dark:text-gray-500 cursor-not-allowed" : "text-green-600 dark:text-green-400 hover:text-green-700"} transition-colors`}
                >
                  {otpResendCooldown > 0
                    ? `Resend in ${otpResendCooldown}s`
                    : "Resend OTP"}
                </button>
              </div>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setResetStep("request")}
                className="flex-1 py-3 px-4 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-medium rounded-sm transition-colors shadow-sm"
                disabled={isVerifying}
              >
                Back
              </button>
              <button
                onClick={handleVerifyOTP}
                disabled={isVerifying || otp.length !== 6}
                className="flex-1 py-3 px-4 bg-gradient-to-r from-green-500 to-emerald-500 dark:from-green-600 dark:to-emerald-600 hover:from-green-600 hover:to-emerald-600 text-white font-medium rounded-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >
                {isVerifying ? "Verifying..." : "Verify OTP"}
              </button>
            </div>
          </>
        );

      case "new-password":
        return (
          <>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-500 dark:text-green-400 mr-2" />
                <span className="text-sm text-green-600 dark:text-green-400">
                  OTP Verified
                </span>
              </div>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Step 2 of 2
              </span>
            </div>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="newPassword"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                  </div>
                  <input
                    id="newPassword"
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      if (errors.newPassword)
                        setErrors({ ...errors, newPassword: "" });
                    }}
                    className="w-full pl-10 pr-10 py-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
                    placeholder="Enter new password"
                    disabled={isResetting}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-500" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-500" />
                    )}
                  </button>
                </div>
                {errors.newPassword && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />{" "}
                    {errors.newPassword}
                  </p>
                )}
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Must be at least 8 characters with uppercase, lowercase, and
                  numbers
                </p>
              </div>
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Confirm New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <KeyRound className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                  </div>
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (errors.confirmPassword)
                        setErrors({ ...errors, confirmPassword: "" });
                    }}
                    className="w-full pl-10 pr-10 py-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
                    placeholder="Confirm new password"
                    disabled={isResetting}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-500" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-500" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />{" "}
                    {errors.confirmPassword}
                  </p>
                )}
              </div>
              {errors.submit && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-sm">
                  <p className="text-sm text-red-600 dark:text-red-400 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-2" /> {errors.submit}
                  </p>
                </div>
              )}
            </div>
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setResetStep("verify")}
                className="flex-1 py-3 px-4 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-medium rounded-sm transition-colors shadow-sm"
                disabled={isResetting}
              >
                Back
              </button>
              <button
                onClick={handleNewPasswordSubmit}
                disabled={
                  isResetting ||
                  !newPassword ||
                  !confirmPassword ||
                  newPassword !== confirmPassword
                }
                className="flex-1 py-3 px-4 bg-gradient-to-r from-blue-500 to-purple-500 dark:from-blue-600 dark:to-purple-600 hover:from-blue-600 hover:to-purple-600 text-white font-medium rounded-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >
                {isResetting ? "Resetting..." : "Reset Password"}
              </button>
            </div>
          </>
        );

      default:
        return null;
    }
  };

  if (resetSent && resetStep === "request") {
    return (
      <div className="bg-white dark:bg-gray-800 backdrop-blur-sm rounded-lg p-8 border border-gray-200 dark:border-gray-700 shadow-xl">
        <div className="text-center">
          <CheckCircle className="h-16 w-16 text-green-500 dark:text-green-400 mx-auto mb-4" />
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Check Your Email!
          </h4>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            We've sent a 6-digit OTP to
          </p>
          <p className="text-blue-600 dark:text-blue-400 font-medium text-lg mb-6">
            {resetEmail}
          </p>
          <div className="p-4 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-sm mb-6">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <span className="text-green-600 dark:text-green-400 font-medium">
                📧 OTP Sent:{" "}
              </span>
              Enter the verification code in the next step. The code expires in
              10 minutes.
            </p>
          </div>
          <button
            onClick={() => {
              setResetStep("verify");
              setResetSent(false);
            }}
            className="w-full py-3 px-4 bg-gradient-to-r from-green-500 to-emerald-500 dark:from-green-600 dark:to-emerald-600 text-white font-medium rounded-sm transition-all mb-3 shadow-sm"
          >
            Enter Verification Code
          </button>
          <button
            onClick={() => {
              setShowResetPassword(false);
              setResetEmail("");
              setResetSent(false);
            }}
            className="w-full py-3 px-4 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-medium rounded-sm transition-colors shadow-sm"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 backdrop-blur-sm rounded-lg p-8 border border-gray-200 dark:border-gray-700 shadow-xl">
      <div className="text-center mb-6">
        <Lock className="h-12 w-12 text-blue-500 dark:text-blue-400 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          {resetStep === "verify"
            ? "Verify OTP"
            : resetStep === "new-password"
              ? "Set New Password"
              : "Reset Password"}
        </h3>
        <p className="text-gray-600 dark:text-gray-400 text-sm">
          {resetStep === "verify"
            ? "Enter the 6-digit code from your email"
            : resetStep === "new-password"
              ? "Create a strong new password"
              : "Enter your email to receive a verification code"}
        </p>
      </div>
      {renderStep()}
    </div>
  );
};

export default ResetPassword;
