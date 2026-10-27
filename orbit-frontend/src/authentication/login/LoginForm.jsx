import {
  Mail,
  AlertCircle,
  LogIn,
  Eye,
  EyeOff,
  Lock,
  Shield,
  KeyRound,
  RefreshCw,
  Building2,
  Search,
  X,
} from "lucide-react";
import { useState } from "react";
import {
  authError,
  authInput,
  authInputIcon,
  authLabel,
  authLabelText,
  authPrimaryButton,
} from "../authStyles";

const FieldError = ({ message }) =>
  message ? (
    <p className={authError}>
      <AlertCircle className="h-3.5 w-3.5 shrink-0" />
      {message}
    </p>
  ) : null;

const LoginForm = ({
  handleSubmit,
  formData,
  handleChange,
  errors,
  loading,
  authLoading,
  setShowResetPassword,
  showPassword,
  setShowPassword,
  otpMode,
  otpSent,
  otpResendCooldown,
  toggleLoginMode,
  handleSendOTP,
  handleResendOTP,
  // New props for business search
  businesses = [],
  searchBusinesses,
  searchQuery,
  setSearchQuery,
  selectedBusiness,
  setSelectedBusiness,
  isSearching,
}) => {
  const [showBusinessDropdown, setShowBusinessDropdown] = useState(false);
  const busy = loading || authLoading;

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Sign-in method */}
      <div
        role="tablist"
        aria-label="Sign-in method"
        className="grid grid-cols-2 gap-1 rounded-lg bg-gray-100 p-1 dark:bg-gray-900"
      >
        {[
          {
            key: "password",
            label: "Password",
            icon: <Lock className="h-4 w-4" />,
            active: !otpMode,
          },
          {
            key: "otp",
            label: "Email code",
            icon: <Mail className="h-4 w-4" />,
            active: otpMode,
          },
        ].map(({ key, label, icon, active }) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => !active && toggleLoginMode()}
            disabled={busy}
            className={`inline-flex h-9 items-center justify-center gap-2 rounded-md text-base font-semibold transition-colors disabled:cursor-not-allowed ${
              active
                ? "bg-white text-gray-900 shadow-sm dark:bg-gray-800 dark:text-white"
                : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            }`}
          >
            {icon}
            {label}
          </button>
        ))}
      </div>

      {/* Business */}
      <div>
        <label htmlFor="businessSearch" className={authLabel}>
          Business
        </label>

        {selectedBusiness ? (
          <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 px-3.5 py-2.5 dark:border-gray-700 dark:bg-gray-900">
            {selectedBusiness.businessLogo ? (
              <img
                src={selectedBusiness.businessLogo}
                alt=""
                className="h-9 w-9 shrink-0 rounded-md object-cover"
              />
            ) : (
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-blue-600/10 text-blue-600 dark:text-blue-400">
                <Building2 className="h-4 w-4" />
              </span>
            )}
            <div className="min-w-0 flex-1">
              <p className="mb-0 truncate text-lg font-medium text-gray-900 dark:text-white">
                {selectedBusiness.businessName}
              </p>
              <p className="mb-0 truncate text-base text-gray-500 dark:text-gray-400">
                {[selectedBusiness.city, selectedBusiness.businessType]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setSelectedBusiness(null);
                setSearchQuery("");
              }}
              disabled={busy}
              className="shrink-0 rounded-md px-2 py-1 text-base font-medium text-blue-600 transition-colors hover:bg-blue-600/10 dark:text-blue-400"
            >
              Change
            </button>
          </div>
        ) : (
          <div className="relative">
            <Search className={authInputIcon} />
            <input
              type="text"
              id="businessSearch"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                searchBusinesses(e.target.value);
                setShowBusinessDropdown(true);
              }}
              onFocus={() => setShowBusinessDropdown(true)}
              placeholder="Search by business name"
              autoComplete="off"
              className={authInput(!!errors.business, "pl-10")}
              disabled={busy}
            />
            {searchQuery.length > 0 && (
              <button
                type="button"
                aria-label="Clear search"
                onClick={() => setSearchQuery("")}
                className="absolute top-1/2 right-3 -translate-y-1/2 rounded-md p-1 text-gray-400 transition-colors hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="h-4 w-4" />
              </button>
            )}

            {showBusinessDropdown && searchQuery.length > 0 && (
              <div className="absolute z-20 mt-2 max-h-64 w-full overflow-y-auto rounded-lg border border-gray-200 bg-white p-1 shadow-lg dark:border-gray-700 dark:bg-gray-900">
                {isSearching ? (
                  <div className="flex items-center justify-center gap-2 px-3 py-6 text-base text-gray-500 dark:text-gray-400">
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Searching businesses…
                  </div>
                ) : businesses.length > 0 ? (
                  businesses.map((business) => (
                    <button
                      key={business._id}
                      type="button"
                      className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
                      onClick={() => {
                        setSelectedBusiness(business);
                        setShowBusinessDropdown(false);
                        setSearchQuery(business.businessName);
                      }}
                    >
                      {business.businessLogo ? (
                        <img
                          src={business.businessLogo}
                          alt=""
                          className="h-8 w-8 shrink-0 rounded-md object-cover"
                        />
                      ) : (
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-gray-100 dark:bg-gray-800">
                          <Building2 className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                        </span>
                      )}
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-lg font-medium text-gray-900 dark:text-white">
                          {business.businessName}
                        </span>
                        <span className="block truncate text-base text-gray-500 dark:text-gray-400">
                          {[business.city, business.businessType]
                            .filter(Boolean)
                            .join(" · ")}
                        </span>
                      </span>
                    </button>
                  ))
                ) : (
                  <div className="px-3 py-6 text-center text-base text-gray-500 dark:text-gray-400">
                    No businesses match “{searchQuery}”
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        <FieldError message={errors.business} />
      </div>

      {/* Email */}
      <div>
        <label htmlFor="email" className={authLabel}>
          Email address
        </label>
        <div className="relative">
          <Mail className={authInputIcon} />
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={formData.email}
            onChange={handleChange}
            className={authInput(!!errors.email, "pl-10")}
            placeholder="you@company.com"
            disabled={busy || (otpMode && otpSent)}
          />
        </div>
        <FieldError message={errors.email} />
      </div>

      {otpMode ? (
        /* OTP login */
        !otpSent ? (
          <button
            type="button"
            onClick={handleSendOTP}
            disabled={busy || !selectedBusiness}
            className={authPrimaryButton}
          >
            <Shield className="h-4 w-4" />
            {loading ? "Sending code…" : "Email me a login code"}
          </button>
        ) : (
          <div>
            <label htmlFor="otp" className={authLabel}>
              Verification code
            </label>
            <div className="relative">
              <KeyRound className={authInputIcon} />
              <input
                id="otp"
                name="otp"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength="6"
                autoComplete="one-time-code"
                value={formData.otp}
                onChange={handleChange}
                disabled={busy}
                className={authInput(!!errors.otp, "pl-10 tracking-[0.4em]")}
                placeholder="000000"
              />
            </div>
            <FieldError message={errors.otp} />

            <div className="mt-2 flex items-center justify-between gap-3">
              <p className="mb-0 truncate text-base text-gray-500 dark:text-gray-400">
                Sent to {formData.email}. Expires in 10 minutes.
              </p>
              <button
                type="button"
                onClick={handleResendOTP}
                disabled={otpResendCooldown > 0 || busy}
                className="shrink-0 text-base font-medium text-blue-600 transition-colors hover:text-blue-700 disabled:cursor-not-allowed disabled:text-gray-400 dark:text-blue-400"
              >
                {otpResendCooldown > 0
                  ? `Resend in ${otpResendCooldown}s`
                  : "Resend code"}
              </button>
            </div>
          </div>
        )
      ) : (
        /* Password login */
        <>
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label htmlFor="password" className={authLabelText}>
                Password
              </label>
              <button
                type="button"
                onClick={() => setShowResetPassword(true)}
                className="text-base font-medium text-blue-600 transition-colors hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                disabled={busy}
              >
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <Lock className={authInputIcon} />
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                value={formData.password}
                onChange={handleChange}
                className={authInput(!!errors.password, "pl-10 pr-11")}
                placeholder="Enter your password"
                disabled={busy}
              />
              <button
                type="button"
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute top-1/2 right-2 -translate-y-1/2 rounded-md p-1.5 text-gray-400 transition-colors hover:text-gray-600 dark:hover:text-gray-300"
                onClick={() => setShowPassword(!showPassword)}
                disabled={busy}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            <FieldError message={errors.password} />
          </div>

          <label
            htmlFor="rememberMe"
            className="flex cursor-pointer items-center gap-2.5 text-lg text-gray-600 select-none dark:text-gray-400"
          >
            <input
              id="rememberMe"
              name="rememberMe"
              type="checkbox"
              checked={formData.rememberMe}
              onChange={handleChange}
              disabled={busy}
              className="h-4 w-4 rounded border-gray-300 accent-blue-600 dark:border-gray-600"
            />
            Remember me on this device
          </label>
        </>
      )}

      {(!otpMode || otpSent) && (
        <button
          type="submit"
          disabled={busy || !selectedBusiness}
          className={`${authPrimaryButton} mt-2`}
        >
          {busy ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin" />
              {authLoading ? "Authenticating…" : "Signing in…"}
            </>
          ) : otpMode ? (
            <>
              <Shield className="h-4 w-4" />
              Verify and sign in
            </>
          ) : (
            <>
              <LogIn className="h-4 w-4" />
              Sign in
            </>
          )}
        </button>
      )}
    </form>
  );
};

export default LoginForm;
