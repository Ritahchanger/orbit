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
import {
  authError,
  authInput,
  authInputIcon,
  authLabel,
  authPrimaryButton,
  authSecondaryButton,
} from "../authStyles";

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
      await otpApi.resendOTP({ email: resetEmail, purpose: "password_reset" });
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
              <label htmlFor="resetEmail" className={authLabel}>
                Email Address
              </label>
              <div className="relative">
                <Mail className={authInputIcon} />
                <input
                  id="resetEmail"
                  type="email"
                  value={resetEmail}
                  onChange={(e) => {
                    setResetEmail(e.target.value);
                    if (errors.email) setErrors({ ...errors, email: "" });
                  }}
                  className={authInput(!!errors.email, "pl-10")}
                  placeholder="Enter your registered email"
                  disabled={loading || authLoading}
                />
              </div>
              {errors.email && (
                <p className={authError}>
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" />{" "}
                  {errors.email}
                </p>
              )}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowResetPassword(false)}
                className={authSecondaryButton}
                disabled={loading || authLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleForgotPasswordSubmit}
                disabled={loading || authLoading || !resetEmail}
                className={authPrimaryButton}
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
              className="mb-4 flex items-center gap-1 text-base text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300"
              disabled={isVerifying}
            >
              <ArrowLeft className="h-4 w-4 mr-1" /> Change Email
            </button>
            <div className="mb-6">
              <div className="text-base text-gray-600 dark:text-gray-400 mb-3">
                Enter the 6-digit OTP sent to
                <span className="text-blue-600 dark:text-blue-400 font-medium ml-1">
                  {resetEmail}
                </span>
              </div>
              <label htmlFor="otp" className={authLabel}>
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
                className={authInput(
                  !!errors.otp,
                  "h-12 text-center text-2xl font-semibold tracking-[0.5em]",
                )}
                placeholder="000000"
                disabled={isVerifying}
              />
              {errors.otp && (
                <p className={authError}>
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" /> {errors.otp}
                </p>
              )}
              <div className="mt-3 flex items-center justify-between">
                <span className="text-base text-gray-500 dark:text-gray-500">
                  Didn't receive the code?
                </span>
                <button
                  onClick={handleResendOTP}
                  disabled={otpResendCooldown > 0 || isVerifying}
                  className="text-base font-medium text-blue-600 transition-colors hover:text-blue-700 disabled:cursor-not-allowed disabled:text-gray-400 dark:text-blue-400"
                >
                  {otpResendCooldown > 0
                    ? `Resend in ${otpResendCooldown}s`
                    : "Resend OTP"}
                </button>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setResetStep("request")}
                className={authSecondaryButton}
                disabled={isVerifying}
              >
                Back
              </button>
              <button
                onClick={handleVerifyOTP}
                disabled={isVerifying || otp.length !== 6}
                className={authPrimaryButton}
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
                <span className="text-base text-green-600 dark:text-green-400">
                  OTP Verified
                </span>
              </div>
              <span className="text-base text-gray-500 dark:text-gray-400">
                Step 2 of 2
              </span>
            </div>
            <div className="space-y-4">
              <div>
                <label htmlFor="newPassword" className={authLabel}>
                  New Password
                </label>
                <div className="relative">
                  <Lock className={authInputIcon} />
                  <input
                    id="newPassword"
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      if (errors.newPassword)
                        setErrors({ ...errors, newPassword: "" });
                    }}
                    className={authInput(false, "pl-10 pr-11")}
                    placeholder="Enter new password"
                    disabled={isResetting}
                  />
                  <button
                    type="button"
                    className="absolute top-1/2 right-2 -translate-y-1/2 rounded-md p-1.5 text-gray-400 transition-colors hover:text-gray-600 dark:hover:text-gray-300"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors.newPassword && (
                  <p className={authError}>
                    <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                    {errors.newPassword}
                  </p>
                )}
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Must be at least 8 characters with uppercase, lowercase, and
                  numbers
                </p>
              </div>
              <div>
                <label htmlFor="confirmPassword" className={authLabel}>
                  Confirm New Password
                </label>
                <div className="relative">
                  <KeyRound className={authInputIcon} />
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (errors.confirmPassword)
                        setErrors({ ...errors, confirmPassword: "" });
                    }}
                    className={authInput(false, "pl-10 pr-11")}
                    placeholder="Confirm new password"
                    disabled={isResetting}
                  />
                  <button
                    type="button"
                    className="absolute top-1/2 right-2 -translate-y-1/2 rounded-md p-1.5 text-gray-400 transition-colors hover:text-gray-600 dark:hover:text-gray-300"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className={authError}>
                    <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                    {errors.confirmPassword}
                  </p>
                )}
              </div>
              {errors.submit && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-900/20">
                  <p className="text-base text-red-600 dark:text-red-400 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-2" /> {errors.submit}
                  </p>
                </div>
              )}
            </div>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setResetStep("verify")}
                className={authSecondaryButton}
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
                className={authPrimaryButton}
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
      <div className="w-full">
        <div className="text-center">
          <span className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-green-600/10 text-green-600 dark:text-green-400">
            <CheckCircle className="h-5 w-5" />
          </span>
          <h4 className="mb-2 text-4xl font-semibold text-gray-900 dark:text-white">
            Check your email
          </h4>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            We've sent a 6-digit OTP to
          </p>
          <p className="text-blue-600 dark:text-blue-400 font-medium text-lg mb-6">
            {resetEmail}
          </p>
          <div className="mb-6 rounded-lg border border-gray-200 bg-gray-50 p-4 text-left dark:border-gray-700 dark:bg-gray-900">
            <p className="text-base text-gray-600 dark:text-gray-400">
              <span className="text-green-600 dark:text-green-400 font-medium">
                Code sent.{" "}
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
            className={`${authPrimaryButton} mb-3`}
          >
            Enter Verification Code
          </button>
          <button
            onClick={() => {
              setShowResetPassword(false);
              setResetEmail("");
              setResetSent(false);
            }}
            className={authSecondaryButton}
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-8 text-center">
        <span className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600/10 text-blue-600 dark:text-blue-400">
          <Lock className="h-5 w-5" />
        </span>
        <h3 className="mb-2 text-4xl font-semibold text-gray-900 dark:text-white">
          {resetStep === "verify"
            ? "Verify OTP"
            : resetStep === "new-password"
              ? "Set New Password"
              : "Reset Password"}
        </h3>
        <p className="mb-0 text-lg text-gray-500 dark:text-gray-400">
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
