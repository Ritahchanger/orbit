import {
  Mail,
  AlertCircle,
  LogIn,
  Eye,
  EyeOff,
  Lock,
  Shield,
  Phone,
  KeyRound,
  RefreshCw,
  Building2,
  Search,
  ChevronDown,
} from "lucide-react";
import { useState } from "react";

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

  return (
    <div className="bg-white dark:bg-gray-800 backdrop-blur-sm rounded-sm p-8 border border-gray-200 dark:border-gray-700 shadow-xl">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Business Selection - NEW */}
        <div className="mb-6">
          <label
            htmlFor="businessSearch"
            className="block text-lg font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            Select Your Business
          </label>

          {/* Selected Business Display or Search Input */}
          {selectedBusiness ? (
            <div className="mb-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Building2 className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {selectedBusiness.businessName}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {selectedBusiness.city} • {selectedBusiness.businessType}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedBusiness(null);
                    setSearchQuery("");
                  }}
                  className="text-lg text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                >
                  Change
                </button>
              </div>
            </div>
          ) : (
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400 dark:text-gray-500" />
              </div>
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
                placeholder="Search business by name, city, or type..."
                className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-colors"
                disabled={loading || authLoading}
              />

              {/* Business Search Results Dropdown */}
              {showBusinessDropdown && searchQuery.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-sm shadow-lg max-h-60 overflow-y-auto">
                  {isSearching ? (
                    <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                      <RefreshCw className="h-5 w-5 mx-auto mb-2 animate-spin" />
                      Searching businesses...
                    </div>
                  ) : businesses.length > 0 ? (
                    businesses.map((business) => (
                      <button
                        key={business._id}
                        type="button"
                        className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700 last:border-0 transition-colors"
                        onClick={() => {
                          setSelectedBusiness(business);
                          setShowBusinessDropdown(false);
                          setSearchQuery(business.businessName);
                        }}
                      >
                        <div className="flex items-center">
                          {business.businessLogo ? (
                            <img
                              src={business.businessLogo}
                              alt={business.businessName}
                              className="h-8 w-8 rounded-sm object-cover mr-3"
                            />
                          ) : (
                            <div className="h-8 w-8 rounded-sm bg-gray-100 dark:bg-gray-700 flex items-center justify-center mr-3">
                              <Building2 className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                            </div>
                          )}
                          <div className="flex-1">
                            <p className="font-medium text-gray-900 dark:text-white">
                              {business.businessName}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {business.city} • {business.businessType}
                            </p>
                          </div>
                          <ChevronDown className="h-4 w-4 text-gray-400" />
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                      <Building2 className="h-5 w-5 mx-auto mb-2 opacity-50" />
                      No businesses found matching "{searchQuery}"
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {errors.business && (
            <p className="mt-1 text-lg text-red-600 dark:text-red-400 flex items-center">
              <AlertCircle className="h-4 w-4 mr-1" />
              {errors.business}
            </p>
          )}
        </div>

        {/* Email Input */}
        <div>
          <label
            htmlFor="email"
            className="block text-lg font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            Email Address
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-gray-400 dark:text-gray-500" />
            </div>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={formData.email}
              onChange={handleChange}
              className={`w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-900 border ${errors.email ? "border-red-500" : "border-gray-300 dark:border-gray-600"} rounded-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-colors`}
              placeholder="admin@megagamers.com"
              disabled={loading || authLoading || (otpMode && otpSent)}
            />
          </div>
          {errors.email && (
            <p className="mt-1 text-lg text-red-600 dark:text-red-400 flex items-center">
              <AlertCircle className="h-4 w-4 mr-1" />
              {errors.email}
            </p>
          )}
        </div>

        {/* ... rest of your form remains the same (OTP/Password fields) ... */}

        {/* Conditional Fields based on otpMode */}
        {otpMode ? (
          /* OTP Login Fields */
          <div className="space-y-4">
            {!otpSent ? (
              <button
                type="button"
                onClick={handleSendOTP}
                disabled={loading || authLoading || !selectedBusiness}
                className="w-full py-3 px-4 bg-gradient-to-r from-green-500 to-emerald-500 dark:from-green-600 dark:to-emerald-600 hover:from-green-600 hover:to-emerald-600 dark:hover:from-green-700 dark:hover:to-emerald-700 text-white font-medium rounded-sm transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center shadow-sm"
              >
                <Shield className="h-5 w-5 mr-2" />
                {loading ? "Sending OTP..." : "Send Login OTP"}
              </button>
            ) : (
              <>
                <div>
                  <label
                    htmlFor="otp"
                    className="block text-lg font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    6-Digit Verification Code
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Phone className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                    </div>
                    <input
                      id="otp"
                      name="otp"
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength="6"
                      value={formData.otp}
                      onChange={handleChange}
                      disabled={loading || authLoading}
                      className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-colors text-center tracking-widest text-lg"
                      placeholder="123456"
                    />
                  </div>
                  {errors.otp && (
                    <p className="mt-1 text-lg text-red-600 dark:text-red-400 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.otp}
                    </p>
                  )}

                  {/* Resend OTP Section */}
                  <div className="mt-3 flex items-center justify-between">
                    <div className="text-lg text-gray-600 dark:text-gray-400">
                      Code sent to {formData.email}
                    </div>
                    <button
                      type="button"
                      onClick={handleResendOTP}
                      disabled={otpResendCooldown > 0 || loading || authLoading}
                      className={`text-lg flex items-center ${otpResendCooldown > 0 ? "text-gray-500 dark:text-gray-500" : "text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300"} transition-colors`}
                    >
                      <RefreshCw
                        className={`h-4 w-4 mr-1 ${otpResendCooldown === 0 && "animate-pulse"}`}
                      />
                      {otpResendCooldown > 0
                        ? `Resend in ${otpResendCooldown}s`
                        : "Resend Code"}
                    </button>
                  </div>
                </div>

                {/* OTP Instructions */}
                <div className="p-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-sm">
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    <span className="text-green-600 dark:text-green-400 font-medium">
                      ✓ OTP Sent:
                    </span>{" "}
                    Check your email for the 6-digit verification code. It will
                    expire in 10 minutes.
                  </p>
                </div>
              </>
            )}
          </div>
        ) : (
          /* Password Login Fields */
          <>
            <div>
              <div className="flex items-center justify-between mb-2">
                <label
                  htmlFor="password"
                  className="block text-lg font-medium text-gray-700 dark:text-gray-300"
                >
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowResetPassword(true)}
                  className="text-lg text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
                  disabled={loading || authLoading}
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-10 py-3 bg-white dark:bg-gray-900 border ${errors.password ? "border-red-500" : "border-gray-300 dark:border-gray-600"} rounded-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-colors`}
                  placeholder="••••••••"
                  disabled={loading || authLoading}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading || authLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-lg text-red-600 dark:text-red-400 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.password}
                </p>
              )}
            </div>

            {/* Remember Me */}
            <div className="flex items-center">
              <input
                id="rememberMe"
                name="rememberMe"
                type="checkbox"
                checked={formData.rememberMe}
                onChange={handleChange}
                disabled={loading || authLoading}
                className="h-4 w-4 text-blue-600 dark:text-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400 border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900"
              />
              <label
                htmlFor="rememberMe"
                className="ml-2 block text-lg text-gray-700 dark:text-gray-300"
              >
                Remember me on this device
              </label>
            </div>
          </>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={
            loading || authLoading || (otpMode && !otpSent) || !selectedBusiness
          }
          className={`w-full py-3 px-4 text-white font-medium rounded-sm transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center shadow-sm ${otpMode && otpSent ? "bg-gradient-to-r from-green-500 to-emerald-500 dark:from-green-600 dark:to-emerald-600 hover:from-green-600 hover:to-emerald-600 dark:hover:from-green-700 dark:hover:to-emerald-700" : "bg-gradient-to-r from-blue-500 to-purple-500 dark:from-blue-600 dark:to-purple-600 hover:from-blue-600 hover:to-purple-600 dark:hover:from-blue-700 dark:hover:to-purple-700"}`}
        >
          {loading || authLoading ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              {authLoading ? "Authenticating..." : "Logging in..."}
            </>
          ) : otpMode ? (
            otpSent ? (
              <>
                <Shield className="h-5 w-5 mr-2" />
                Verify & Login
              </>
            ) : (
              "Send OTP First"
            )
          ) : (
            <>
              <LogIn className="h-5 w-5 mr-2" />
              Sign In
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default LoginForm;
