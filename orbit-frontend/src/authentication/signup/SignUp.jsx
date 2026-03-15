import { useState } from "react";

import { Link, useNavigate } from "react-router-dom";

import {
  Rocket,
  Building2,
  Mail,
  Phone,
  MapPin,
  Globe,
  Users,
  FileText,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Briefcase,
  Calendar,
  Hash,
  User,
  ArrowLeft,
} from "lucide-react";

import Step3 from "./components/Step3";

import { businessTypes, countries, subscriptionPlans } from "./data";

import { useRegisterBusiness } from "../../admin-pages/hooks/business.mutations";

import Step2 from "./components/Step2";

import { IconInput, SelectInput, labelClass } from "./components/Components";
import Step4 from "./components/Step4";

// ─────────────────────────────────────────────────────────────────────────────

const AdminSignup = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [logoPreview, setLogoPreview] = useState(null);

  const { mutate: registerBusiness, isPending } = useRegisterBusiness();

  const [formData, setFormData] = useState({
    businessName: "",
    businessType: "",
    registrationNumber: "",
    taxId: "",
    businessEmail: "",
    businessPhone: "",
    businessAddress: "",
    city: "",
    country: "Kenya",
    postalCode: "",
    website: "",
    employeeCount: "",
    yearEstablished: "",
    adminFirstName: "",
    adminLastName: "",
    adminEmail: "",
    adminPhone: "",
    adminUsername: "",
    adminPassword: "",
    adminConfirmPassword: "",
    businessDescription: "",
    numberOfStores: "1",
    businessLogo: null,
    paymentMethod: "monthly",
    subscriptionPlan: "professional",
  });

  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === "file") {
      const file = files[0];
      if (file) {
        setFormData((prev) => ({ ...prev, businessLogo: file }));
        const reader = new FileReader();
        reader.onloadend = () => setLogoPreview(reader.result);
        reader.readAsDataURL(file);
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const validateStep = () => {
    const newErrors = {};
    if (currentStep === 1) {
      if (!formData.businessName) newErrors.businessName = "Required";
      if (!formData.businessType) newErrors.businessType = "Required";
      if (!formData.registrationNumber)
        newErrors.registrationNumber = "Required";
      if (!formData.businessEmail) newErrors.businessEmail = "Required";
      else if (!/\S+@\S+\.\S+/.test(formData.businessEmail))
        newErrors.businessEmail = "Invalid email";
      if (!formData.businessPhone) newErrors.businessPhone = "Required";
      if (!formData.businessAddress) newErrors.businessAddress = "Required";
      if (!formData.city) newErrors.city = "Required";
      if (!formData.country) newErrors.country = "Required";
    }
    if (currentStep === 2) {
      if (!formData.adminFirstName) newErrors.adminFirstName = "Required";
      if (!formData.adminLastName) newErrors.adminLastName = "Required";
      if (!formData.adminEmail) newErrors.adminEmail = "Required";
      else if (!/\S+@\S+\.\S+/.test(formData.adminEmail))
        newErrors.adminEmail = "Invalid email";
      if (!formData.adminPhone) newErrors.adminPhone = "Required";
      if (!formData.adminUsername) newErrors.adminUsername = "Required";
      if (!formData.adminPassword) newErrors.adminPassword = "Required";
      else if (formData.adminPassword.length < 8)
        newErrors.adminPassword = "Min 8 characters";
      if (formData.adminPassword !== formData.adminConfirmPassword)
        newErrors.adminConfirmPassword = "Passwords don't match";
    }
    if (currentStep === 3) {
      if (!formData.businessDescription)
        newErrors.businessDescription = "Required";
      if (!formData.numberOfStores) newErrors.numberOfStores = "Required";
    }
    return newErrors;
  };

  const handleNext = () => {
    const stepErrors = validateStep();
    if (Object.keys(stepErrors).length === 0)
      setCurrentStep((prev) => prev + 1);
    else setErrors(stepErrors);
  };

  const handlePrevious = () => {
    setCurrentStep((prev) => prev - 1);
    setErrors({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const finalErrors = validateStep();
    if (Object.keys(finalErrors).length > 0) {
      setErrors(finalErrors);
      return;
    }

    if (!acceptTerms) {
      setErrors((prev) => ({
        ...prev,
        terms: "You must accept the terms and conditions",
      }));
      return;
    }

    // Build payload — map formData fields to what your API expects
    const payload = new FormData();

    // Business info
    payload.append("businessName", formData.businessName);
    payload.append("businessType", formData.businessType);
    payload.append("registrationNumber", formData.registrationNumber);
    payload.append("taxId", formData.taxId);
    payload.append("businessEmail", formData.businessEmail);
    payload.append("businessPhone", formData.businessPhone);
    payload.append("businessAddress", formData.businessAddress);
    payload.append("city", formData.city);
    payload.append("country", formData.country);
    payload.append("postalCode", formData.postalCode);
    payload.append("website", formData.website);
    payload.append("employeeCount", formData.employeeCount);
    payload.append("yearEstablished", formData.yearEstablished);

    // Admin account
    payload.append("adminFirstName", formData.adminFirstName);
    payload.append("adminLastName", formData.adminLastName);
    payload.append("adminEmail", formData.adminEmail);
    payload.append("adminPhone", formData.adminPhone);
    payload.append("adminUsername", formData.adminUsername);
    payload.append("adminPassword", formData.adminPassword);

    // Details
    payload.append("businessDescription", formData.businessDescription);
    payload.append("numberOfStores", formData.numberOfStores);
    if (formData.businessLogo) {
      payload.append("businessLogo", formData.businessLogo);
    }

    // Plan
    payload.append("subscriptionPlan", formData.subscriptionPlan);
    payload.append("paymentMethod", formData.paymentMethod);

    registerBusiness(payload, {
      onSuccess: () => {
        navigate("/admin/login");
      },
    });
  };

  const steps = [
    { num: 1, label: "Business Info" },
    { num: 2, label: "Admin Account" },
    { num: 3, label: "Details" },
    { num: 4, label: "Choose Plan" },
  ];

  // Shared props passed to every IconInput / SelectInput
  const fieldProps = { errors, formData, onChange: handleInputChange };

  return (
    <div
      className="h-screen overflow-hidden grid grid-rows-[auto_1fr] relative"
      style={{
        background:
          "linear-gradient(135deg, #1e1040 0%, #2d1b69 40%, #1a0533 100%)",
      }}
    >
      {/* Background blobs */}
      <div className="fixed inset-0 opacity-15 pointer-events-none">
        <div
          className="absolute -top-40 -right-40 w-80 h-80 rounded-full blur-3xl"
          style={{ background: "#a855f7" }}
        />
        <div
          className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full blur-3xl"
          style={{ background: "#ec4899" }}
        />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full blur-3xl opacity-20"
          style={{ background: "#7c3aed" }}
        />
      </div>

      {/* Top Bar */}
      <div
        className="relative z-10 flex items-center justify-between px-8 py-4 border-b"
        style={{
          borderColor: "rgba(168,85,247,0.2)",
          background: "rgba(255,255,255,0.03)",
          backdropFilter: "blur(12px)",
        }}
      >
        <Link to="/" className="inline-flex items-center gap-2.5 group">
          <div
            className="p-2 rounded-sm border transition-colors"
            style={{
              background: "rgba(168,85,247,0.15)",
              borderColor: "rgba(168,85,247,0.3)",
            }}
          >
            <Rocket className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-white">Orbit</span>
        </Link>

        {/* Step Indicators */}
        <div className="flex items-center gap-2">
          {steps.map((step, i) => (
            <div key={step.num} className="flex items-center gap-2">
              <div className="flex items-center gap-2">
                <div
                  className={`flex items-center justify-center w-7 h-7 rounded-full border-2 text-xs font-bold transition-all`}
                  style={
                    currentStep >= step.num
                      ? {
                          background:
                            "linear-gradient(135deg, #a855f7, #ec4899)",
                          borderColor: "#a855f7",
                          color: "white",
                        }
                      : {
                          borderColor: "rgba(168,85,247,0.35)",
                          color: "#c084fc",
                        }
                  }
                >
                  {currentStep > step.num ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    step.num
                  )}
                </div>
                <span
                  className="text-xs font-medium hidden sm:block"
                  style={{
                    color: currentStep >= step.num ? "white" : "#c084fc",
                  }}
                >
                  {step.label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div
                  className="w-8 h-0.5 mx-1"
                  style={{
                    background:
                      currentStep > step.num
                        ? "linear-gradient(90deg, #a855f7, #ec4899)"
                        : "rgba(168,85,247,0.2)",
                  }}
                />
              )}
            </div>
          ))}
        </div>

        <p className="text-sm hidden md:block" style={{ color: "#c084fc" }}>
          Have an account?{" "}
          <Link
            to="/admin/login"
            className="font-semibold hover:underline"
            style={{ color: "#e879f9" }}
          >
            Sign in
          </Link>
        </p>
      </div>

      {/* Main Content */}
      <div className="relative z-10 overflow-hidden grid grid-cols-1 lg:grid-cols-[1fr_2fr] h-full">
        {/* Left Panel */}
        <div
          className="hidden lg:flex flex-col justify-center px-10 py-8 border-r"
          style={{ borderColor: "rgba(168,85,247,0.15)" }}
        >
          <div className="mb-8">
            <div
              className="text-xs font-bold uppercase tracking-widest mb-3"
              style={{ color: "#c084fc" }}
            >
              Step {currentStep} of 4
            </div>
            <h2 className="text-3xl font-extrabold text-white mb-3 leading-tight">
              {currentStep === 1 && (
                <>
                  <span>Business</span>
                  <br />
                  <span>Information</span>
                </>
              )}
              {currentStep === 2 && (
                <>
                  <span>Admin</span>
                  <br />
                  <span>Account Setup</span>
                </>
              )}
              {currentStep === 3 && (
                <>
                  <span>Business</span>
                  <br />
                  <span>Details</span>
                </>
              )}
              {currentStep === 4 && (
                <>
                  <span>Choose</span>
                  <br />
                  <span>Your Plan</span>
                </>
              )}
            </h2>
            <p className="text-sm leading-relaxed" style={{ color: "#c084fc" }}>
              {currentStep === 1 &&
                "Tell us about your business. This helps us set up your account correctly."}
              {currentStep === 2 &&
                "Create your administrator credentials to access the Orbit platform."}
              {currentStep === 3 &&
                "Additional details to help us tailor Orbit to your needs."}
              {currentStep === 4 &&
                "Choose a subscription plan that fits your business size and goals."}
            </p>
          </div>

          <div className="space-y-3">
            {steps.map((step) => (
              <div
                key={step.num}
                className="flex items-center gap-3 p-3 rounded-sm transition-all"
                style={
                  currentStep === step.num
                    ? {
                        background: "rgba(168,85,247,0.15)",
                        border: "1px solid rgba(168,85,247,0.35)",
                      }
                    : { opacity: 0.45 }
                }
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                  style={
                    currentStep > step.num
                      ? {
                          background:
                            "linear-gradient(135deg, #a855f7, #ec4899)",
                        }
                      : currentStep === step.num
                        ? {
                            background:
                              "linear-gradient(135deg, #7c3aed, #a855f7)",
                          }
                        : { background: "rgba(255,255,255,0.08)" }
                  }
                >
                  {currentStep > step.num ? (
                    <CheckCircle className="w-4 h-4 text-white" />
                  ) : (
                    <span className="text-white">{step.num}</span>
                  )}
                </div>
                <span className="text-sm font-medium text-white">
                  {step.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Panel — Form */}
        <div className="flex flex-col h-full overflow-hidden">
          <form onSubmit={handleSubmit} className="flex flex-col h-full">
            {/* Scrollable form body */}
            <div className="flex-1 overflow-y-auto px-6 lg:px-10 py-6">
              {/* ── Step 1: Business Information ── */}
              {currentStep === 1 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <IconInput
                    icon={Building2}
                    field="businessName"
                    label="Business Name"
                    placeholder="Orbit Technologies"
                    required
                    {...fieldProps}
                  />
                  <SelectInput
                    icon={Briefcase}
                    field="businessType"
                    label="Business Type"
                    required
                    {...fieldProps}
                  >
                    <option value="" className="bg-gray-900">
                      Select type
                    </option>
                    {businessTypes.map((t) => (
                      <option key={t} value={t} className="bg-gray-900">
                        {t}
                      </option>
                    ))}
                  </SelectInput>
                  <IconInput
                    icon={Hash}
                    field="registrationNumber"
                    label="Registration Number"
                    placeholder="BRN-2024-001"
                    required
                    {...fieldProps}
                  />
                  <IconInput
                    icon={FileText}
                    field="taxId"
                    label="Tax ID / PIN"
                    placeholder="PIN-12345678"
                    {...fieldProps}
                  />
                  <IconInput
                    icon={Mail}
                    field="businessEmail"
                    label="Business Email"
                    type="email"
                    placeholder="info@business.com"
                    required
                    {...fieldProps}
                  />
                  <IconInput
                    icon={Phone}
                    field="businessPhone"
                    label="Business Phone"
                    type="tel"
                    placeholder="+254 700 000 000"
                    required
                    {...fieldProps}
                  />
                  <div className="md:col-span-2">
                    <IconInput
                      icon={MapPin}
                      field="businessAddress"
                      label="Business Address"
                      placeholder="Street address, building"
                      required
                      {...fieldProps}
                    />
                  </div>
                  <IconInput
                    icon={MapPin}
                    field="city"
                    label="City"
                    placeholder="Nairobi"
                    required
                    {...fieldProps}
                  />
                  <SelectInput
                    icon={Globe}
                    field="country"
                    label="Country"
                    required
                    {...fieldProps}
                  >
                    {countries.map((c) => (
                      <option key={c} value={c} className="bg-gray-900">
                        {c}
                      </option>
                    ))}
                  </SelectInput>
                  <div>
                    <label className={labelClass}>Postal Code</label>
                    <input
                      name="postalCode"
                      value={formData.postalCode}
                      onChange={handleInputChange}
                      placeholder="00100"
                      className="w-full px-4 py-2.5 rounded-sm text-white text-sm focus:outline-none focus:ring-2"
                      style={{
                        background: "rgba(168,85,247,0.08)",
                        border: "1px solid rgba(168,85,247,0.25)",
                        "--tw-ring-color": "#a855f7",
                        "::placeholder": { color: "#c084fc" },
                      }}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Website</label>
                    <div className="relative">
                      <Globe
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                        style={{ color: "#c084fc" }}
                      />
                      <input
                        name="website"
                        value={formData.website}
                        onChange={handleInputChange}
                        type="url"
                        placeholder="https://yourbusiness.com"
                        className="w-full pl-10 pr-4 py-2.5 rounded-sm text-white text-sm focus:outline-none focus:ring-2"
                        style={{
                          background: "rgba(168,85,247,0.08)",
                          border: "1px solid rgba(168,85,247,0.25)",
                        }}
                      />
                    </div>
                  </div>
                  <SelectInput
                    icon={Users}
                    field="employeeCount"
                    label="Number of Employees"
                    {...fieldProps}
                  >
                    <option value="" className="bg-gray-900">
                      Select range
                    </option>
                    {["1-10", "11-50", "51-200", "201-500", "500+"].map((v) => (
                      <option key={v} value={v} className="bg-gray-900">
                        {v}
                      </option>
                    ))}
                  </SelectInput>
                  <IconInput
                    icon={Calendar}
                    field="yearEstablished"
                    label="Year Established"
                    type="number"
                    placeholder="2020"
                    min="1900"
                    max={new Date().getFullYear()}
                    {...fieldProps}
                  />
                </div>
              )}

              {/* ── Step 2: Admin Account ── */}
              {currentStep === 2 && (
                <Step2
                  fieldProps={fieldProps}
                  User={User}
                  Mail={Mail}
                  Phone={Phone}
                  showPassword={showPassword}
                  formData={formData}
                  handleInputChange={handleInputChange}
                  errors={errors}
                  setShowPassword={setShowPassword}
                  showConfirmPassword={showConfirmPassword}
                  setShowConfirmPassword={setShowConfirmPassword}
                />
              )}

              {/* ── Step 3: Business Details ── */}
              {currentStep === 3 && (
                <Step3
                  logoPreview={logoPreview}
                  handleInputChange={handleInputChange}
                  formData={formData}
                  errors={errors}
                />
              )}

              {/* ── Step 4: Choose Plan ── */}
              <Step4
                currentStep={currentStep}
                subscriptionPlans={subscriptionPlans}
                formData={formData}
                acceptTerms={acceptTerms}
                setAcceptTerms={setAcceptTerms}
                errors={errors}
                handleInputChange={handleInputChange}
              />
            </div>

            {/* ── Footer Nav ── */}
            <div
              className="flex-shrink-0 flex items-center justify-between px-6 lg:px-10 py-4 border-t"
              style={{
                borderColor: "rgba(168,85,247,0.2)",
                background: "rgba(168,85,247,0.05)",
                backdropFilter: "blur(12px)",
              }}
            >
              {/* <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-6 py-2.5 text-white rounded-sm font-semibold transition-all flex items-center gap-2 text-sm"
                style={{
                  background: "rgba(168,85,247,0.2)",
                  border: "1px solid rgba(168,85,247,0.3)",
                }}
              >
                Sign In <ArrowLeft className="w-4 h-4" />
              </button> */}
              <div>
                {currentStep > 1 && (
                  <button
                    type="button"
                    onClick={handlePrevious}
                    className="px-5 py-2.5 text-white rounded-sm font-semibold transition-all text-sm"
                    style={{
                      background: "rgba(255,255,255,0.08)",
                      border: "1px solid rgba(168,85,247,0.25)",
                    }}
                  >
                    ← Previous
                  </button>
                )}
              </div>
              <div className="flex items-center gap-3">
                <span
                  className="text-xs hidden sm:block"
                  style={{ color: "#c084fc" }}
                >
                  Step {currentStep} of 4
                </span>
                {currentStep < 4 ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="px-6 py-2.5 text-white rounded-sm font-semibold transition-all flex items-center gap-2 text-sm"
                    style={{
                      background: "linear-gradient(135deg, #a855f7, #ec4899)",
                      boxShadow: "0 4px 15px rgba(168,85,247,0.3)",
                    }}
                  >
                    Next Step <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={isPending || !acceptTerms}
                    className="px-6 py-2.5 text-white rounded-sm font-semibold transition-all flex items-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    style={
                      isPending || !acceptTerms
                        ? { background: "rgba(255,255,255,0.1)" }
                        : {
                            background:
                              "linear-gradient(135deg, #7c3aed, #a855f7, #ec4899)",
                            boxShadow: "0 4px 15px rgba(168,85,247,0.4)",
                          }
                    }
                  >
                    {isPending ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        <span>Complete Registration</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminSignup;
