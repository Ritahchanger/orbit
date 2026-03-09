import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  LogIn,
  Building2,
  ChevronRight,
  AlertCircle,
  Rocket,
  Search,
} from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { useSearchBusinesses } from "../../../globals/hooks/useBusinessQueries";
import businessApi from "../../../globals/services/business-api";

// ── Debounce hook ─────────────────────────────────────────────────────────────
const useDebounce = (value, delay = 400) => {
  const [debounced, setDebounced] = useState(value);
  React.useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
};

const Login = () => {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [showBusinessDropdown, setShowBusinessDropdown] = useState(false);
  const [businessSearch, setBusinessSearch] = useState("");
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    businessId: "",
  });

  // ── Debounced search → React Query ───────────────────────────────────────
  const debouncedSearch = useDebounce(businessSearch, 400);

  const { data: businessData, isLoading: isSearching } =
    useSearchBusinesses(debouncedSearch);

  const businesses = businessData?.data || [];

  // ── Login mutation ────────────────────────────────────────────────────────
  const loginMutation = useMutation({
    mutationFn: (credentials) => businessApi.login(credentials),
    onSuccess: (data) => {
      const storage = rememberMe ? localStorage : sessionStorage;
      if (data.token) storage.setItem("token", data.token);
      if (data.userId) storage.setItem("userId", data.userId);
      if (data.role) storage.setItem("role", data.role);
      if (data.businessId) storage.setItem("businessId", data.businessId);

      toast.success(`Welcome back, ${data.firstName}!`);

      const role = data.role;
      if (role === "superadmin" || role === "admin") {
        navigate("/admin/dashboard");
      } else {
        navigate("/dashboard");
      }
    },
    onError: (error) => {
      const message =
        error?.response?.data?.message ||
        error.message ||
        "Invalid email or password";
      toast.error(message);
      setErrors((prev) => ({ ...prev, submit: message }));
    },
  });

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const handleBusinessSelect = (business) => {
    setSelectedBusiness(business);
    setFormData((prev) => ({ ...prev, businessId: business._id }));
    setBusinessSearch(business.businessName);
    setShowBusinessDropdown(false);
    if (errors.businessId) setErrors((prev) => ({ ...prev, businessId: null }));
  };

  const clearBusiness = (e) => {
    e.stopPropagation();
    setSelectedBusiness(null);
    setFormData((prev) => ({ ...prev, businessId: "" }));
    setBusinessSearch("");
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.email) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Invalid email address";
    if (!formData.password) newErrors.password = "Password is required";
    else if (formData.password.length < 6)
      newErrors.password = "Minimum 6 characters";
    if (!formData.businessId) newErrors.businessId = "Please select a business";
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    loginMutation.mutate({
      email: formData.email,
      password: formData.password,
      businessId: formData.businessId,
    });
  };

  const isLoading = loginMutation.isPending;

  // ── Shared input class ────────────────────────────────────────────────────
  const inputClass = (field) =>
    `w-full pl-10 pr-4 py-3 bg-white/10 border ${
      errors[field] ? "border-red-400" : "border-white/20"
    } rounded-xl text-white placeholder-blue-300/60 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all text-sm`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 flex items-center justify-center p-4">
      {/* Background blobs */}
      <div className="fixed inset-0 opacity-10 pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md my-8">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-3 group">
            <div className="p-3 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 group-hover:bg-white/20 transition-colors">
              <Rocket className="w-8 h-8 text-white" />
            </div>
            <span className="text-3xl font-bold text-white">Orbit</span>
          </Link>
        </div>

        {/* Card */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl">
          <div className="px-8 pt-8 pb-6">
            <h2 className="text-2xl font-bold text-white mb-1">Welcome Back</h2>
            <p className="text-blue-200 text-sm">
              Sign in to access your business dashboard
            </p>
          </div>

          <div className="px-8 pb-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* ── Business selector ── */}
              <div>
                <label className="block text-xs font-semibold text-blue-200 mb-1.5 uppercase tracking-wide">
                  Select Business <span className="text-red-300">*</span>
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-300 z-10" />

                  {/* Trigger */}
                  <div
                    onClick={() =>
                      setShowBusinessDropdown(!showBusinessDropdown)
                    }
                    className={`w-full pl-10 pr-10 py-3 bg-white/10 border ${
                      errors.businessId ? "border-red-400" : "border-white/20"
                    } rounded-xl text-white cursor-pointer flex items-center justify-between hover:bg-white/15 transition-all`}
                  >
                    {selectedBusiness ? (
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <div className="w-7 h-7 bg-blue-600/40 rounded-lg flex items-center justify-center flex-shrink-0">
                          {selectedBusiness.businessLogo ? (
                            <img
                              src={selectedBusiness.businessLogo}
                              alt=""
                              className="w-full h-full object-cover rounded-lg"
                            />
                          ) : (
                            <Building2 className="w-4 h-4 text-blue-300" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="font-medium text-sm truncate">
                            {selectedBusiness.businessName}
                          </div>
                          <div className="text-xs text-blue-300">
                            {selectedBusiness.businessType} ·{" "}
                            {selectedBusiness.city}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <span className="text-blue-300/70 text-sm">
                        Choose a business
                      </span>
                    )}

                    <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                      {selectedBusiness && (
                        <button
                          type="button"
                          onClick={clearBusiness}
                          className="p-0.5 text-blue-300 hover:text-white transition-colors text-lg leading-none"
                        >
                          ×
                        </button>
                      )}
                      <ChevronRight
                        className={`w-4 h-4 text-blue-300 transition-transform duration-200 ${showBusinessDropdown ? "rotate-90" : ""}`}
                      />
                    </div>
                  </div>

                  {/* Dropdown */}
                  {showBusinessDropdown && (
                    <div className="absolute z-50 w-full mt-2 bg-gray-900/95 backdrop-blur-sm rounded-xl border border-white/20 shadow-2xl">
                      {/* Search */}
                      <div className="p-3 border-b border-white/10">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-300" />
                          <input
                            type="text"
                            placeholder="Search by name, type or city..."
                            value={businessSearch}
                            onChange={(e) => setBusinessSearch(e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            autoFocus
                            className="w-full pl-9 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-blue-300/50 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                          />
                        </div>
                      </div>

                      {/* Results */}
                      <div className="max-h-56 overflow-y-auto">
                        {isSearching ? (
                          <div className="p-4 flex items-center justify-center gap-2 text-blue-300 text-sm">
                            <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                            Searching...
                          </div>
                        ) : businesses.length > 0 ? (
                          businesses.map((business) => (
                            <div
                              key={business._id}
                              onClick={() => handleBusinessSelect(business)}
                              className={`p-3 cursor-pointer transition-colors flex items-center gap-3 ${
                                formData.businessId === business._id
                                  ? "bg-blue-600/30 border-l-4 border-blue-500"
                                  : "hover:bg-white/10"
                              }`}
                            >
                              <div className="w-9 h-9 bg-blue-600/30 rounded-xl flex items-center justify-center flex-shrink-0">
                                {business.businessLogo ? (
                                  <img
                                    src={business.businessLogo}
                                    alt=""
                                    className="w-full h-full object-cover rounded-xl"
                                  />
                                ) : (
                                  <Building2 className="w-4 h-4 text-blue-300" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-white text-sm truncate">
                                  {business.businessName}
                                </div>
                                <div className="text-xs text-blue-300">
                                  {business.businessType} · {business.city}
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="p-5 text-center text-blue-300 text-sm">
                            {debouncedSearch
                              ? `No results for "${debouncedSearch}"`
                              : "No active businesses found"}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {errors.businessId && (
                  <p className="mt-1 text-xs text-red-300 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.businessId}
                  </p>
                )}
              </div>

              {/* ── Email ── */}
              <div>
                <label className="block text-xs font-semibold text-blue-200 mb-1.5 uppercase tracking-wide">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-300" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="your@email.com"
                    className={inputClass("email")}
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-xs text-red-300 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.email}
                  </p>
                )}
              </div>

              {/* ── Password ── */}
              <div>
                <label className="block text-xs font-semibold text-blue-200 mb-1.5 uppercase tracking-wide">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-300" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="••••••••"
                    className={`${inputClass("password")} pr-12`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-300 hover:text-white transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-xs text-red-300 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.password}
                  </p>
                )}
              </div>

              {/* ── Remember me + forgot password ── */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-white/20 bg-white/10 text-blue-600"
                  />
                  <span className="text-sm text-blue-200">Remember me</span>
                </label>
                <Link
                  to="/forgot-password"
                  className="text-sm text-blue-200 hover:text-white transition-colors"
                >
                  Forgot Password?
                </Link>
              </div>

              {/* ── Submit error banner ── */}
              {errors.submit && (
                <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-400/20 rounded-xl">
                  <AlertCircle className="w-4 h-4 text-red-300 flex-shrink-0" />
                  <span className="text-sm text-red-300">{errors.submit}</span>
                </div>
              )}

              {/* ── Submit ── */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    <span>Sign In</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        <div className="text-center mt-6">
          <p className="text-blue-200 text-sm">
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="text-white font-semibold hover:underline"
            >
              Register your business
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
