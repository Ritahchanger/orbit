import { useState } from "react";

import { Link, useNavigate } from "react-router-dom";

import {
  ArrowLeft,
  Building2,
  Mail,
  Phone,
  MapPin,
  Globe,
  Users,
  FileText,
  Check,
  CheckCircle,
  ArrowRight,
  Briefcase,
  Calendar,
  Hash,
  User,
} from "lucide-react";

import Step3 from "./components/Step3";

import { businessTypes, countries, subscriptionPlans } from "./data";

import { useRegisterBusiness } from "../../admin-pages/hooks/business.mutations";

import Step2 from "./components/Step2";

import { IconInput, SelectInput } from "./components/Components";
import Step4 from "./components/Step4";

import AuthLayout from "../AuthLayout";
import {
  authLink,
  authPrimaryButton,
  authSecondaryButton,
} from "../authStyles";

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
    {
      num: 1,
      label: "Business info",
      title: "Business information",
      description:
        "Tell us about your business so we can set up your account correctly.",
    },
    {
      num: 2,
      label: "Admin account",
      title: "Admin account",
      description:
        "Create the administrator login you will use to manage Orbit.",
    },
    {
      num: 3,
      label: "Details",
      title: "Business details",
      description: "A few more details to tailor Orbit to your business.",
    },
    {
      num: 4,
      label: "Choose plan",
      title: "Choose your plan",
      description: "Pick the plan that fits your business size and goals.",
    },
  ];
  const activeStep = steps[currentStep - 1];

  // Shared props passed to every IconInput / SelectInput
  const fieldProps = { errors, formData, onChange: handleInputChange };

  const stepper = (
    <>
      <h2 className="mb-4 text-5xl leading-tight font-semibold text-white">
        Set up your business on Orbit.
      </h2>
      <p className="mb-10 text-lg leading-relaxed text-gray-400">
        Four short steps and your stores, stock and team are ready to go.
      </p>
      <ol className="space-y-1">
        {steps.map((step, i) => {
          const done = currentStep > step.num;
          const active = currentStep === step.num;
          return (
            <li key={step.num} className="flex gap-4">
              <div className="flex flex-col items-center">
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-base font-semibold transition-colors ${
                    done
                      ? "border-blue-500 bg-blue-500 text-white"
                      : active
                        ? "border-blue-400 bg-blue-500/15 text-blue-300"
                        : "border-white/15 text-gray-500"
                  }`}
                >
                  {done ? <Check className="h-4 w-4" /> : step.num}
                </span>
                {i < steps.length - 1 && (
                  <span
                    className={`my-1 h-6 w-px ${done ? "bg-blue-500" : "bg-white/15"}`}
                  />
                )}
              </div>
              <span
                className={`pt-1.5 text-lg font-medium ${
                  active
                    ? "text-white"
                    : done
                      ? "text-gray-300"
                      : "text-gray-500"
                }`}
              >
                {step.label}
              </span>
            </li>
          );
        })}
      </ol>
    </>
  );

  return (
    <AuthLayout aside={stepper} contentClassName="items-start lg:pt-6">
      <form
        onSubmit={handleSubmit}
        className="flex w-full max-w-2xl flex-col"
        noValidate
      >
        {/* Step header */}
        <div className="mb-8">
          <p className="mb-3 text-base font-semibold tracking-wide text-blue-600 uppercase dark:text-blue-400">
            Step {currentStep} of {steps.length}
          </p>
          <div className="mb-5 flex gap-1.5 lg:hidden">
            {steps.map((step) => (
              <span
                key={step.num}
                className={`h-1 flex-1 rounded-full ${
                  currentStep >= step.num
                    ? "bg-blue-600"
                    : "bg-gray-200 dark:bg-gray-800"
                }`}
              />
            ))}
          </div>
          <h1 className="mb-2 text-4xl font-semibold text-gray-900 dark:text-white">
            {activeStep.title}
          </h1>
          <p className="mb-0 text-lg text-gray-500 dark:text-gray-400">
            {activeStep.description}
          </p>
        </div>

        {/* ── Step 1: Business Information ── */}
        {currentStep === 1 && (
          <div className="grid grid-cols-1 gap-x-5 gap-y-5 md:grid-cols-2">
            <IconInput
              icon={Building2}
              field="businessName"
              label="Business name"
              placeholder="Orbit Technologies"
              autoComplete="organization"
              required
              {...fieldProps}
            />
            <SelectInput
              icon={Briefcase}
              field="businessType"
              label="Business type"
              required
              {...fieldProps}
            >
              <option value="">Select type</option>
              {businessTypes.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </SelectInput>
            <IconInput
              icon={Hash}
              field="registrationNumber"
              label="Registration number"
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
              label="Business email"
              type="email"
              placeholder="info@business.com"
              required
              {...fieldProps}
            />
            <IconInput
              icon={Phone}
              field="businessPhone"
              label="Business phone"
              type="tel"
              placeholder="+254 700 000 000"
              required
              {...fieldProps}
            />
            <div className="md:col-span-2">
              <IconInput
                icon={MapPin}
                field="businessAddress"
                label="Business address"
                placeholder="Street address, building"
                autoComplete="street-address"
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
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </SelectInput>
            <IconInput
              icon={Hash}
              field="postalCode"
              label="Postal code"
              placeholder="00100"
              autoComplete="postal-code"
              {...fieldProps}
            />
            <IconInput
              icon={Calendar}
              field="yearEstablished"
              label="Year established"
              type="number"
              placeholder="2020"
              min="1900"
              max={new Date().getFullYear()}
              {...fieldProps}
            />
            <IconInput
              icon={Globe}
              field="website"
              label="Website"
              type="url"
              placeholder="https://yourbusiness.com"
              {...fieldProps}
            />
            <SelectInput
              icon={Users}
              field="employeeCount"
              label="Number of employees"
              {...fieldProps}
            >
              <option value="">Select range</option>
              {["1-10", "11-50", "51-200", "201-500", "500+"].map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </SelectInput>
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
          setFormData={setFormData}
          acceptTerms={acceptTerms}
          setAcceptTerms={setAcceptTerms}
          errors={errors}
          handleInputChange={handleInputChange}
        />

        {/* ── Footer Nav ── */}
        <div className="mt-10 flex items-center justify-between gap-3 border-t border-gray-200 pt-6 dark:border-gray-800">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={handlePrevious}
              className={`${authSecondaryButton} w-auto`}
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>
          ) : (
            <p className="mb-0 text-lg text-gray-500 dark:text-gray-400">
              Have an account?{" "}
              <Link to="/admin/login" className={authLink}>
                Sign in
              </Link>
            </p>
          )}

          {currentStep < steps.length ? (
            <button
              type="button"
              onClick={handleNext}
              className={`${authPrimaryButton} w-auto px-6`}
            >
              Continue
              <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={isPending || !acceptTerms}
              className={`${authPrimaryButton} w-auto px-6`}
            >
              {isPending ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Creating account…
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4" />
                  Complete registration
                </>
              )}
            </button>
          )}
        </div>
      </form>
    </AuthLayout>
  );
};

export default AdminSignup;
