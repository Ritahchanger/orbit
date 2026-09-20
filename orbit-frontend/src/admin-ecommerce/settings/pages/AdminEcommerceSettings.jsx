import { useEffect, useState } from "react";
import {
  Store,
  Palette,
  CreditCard,
  Truck,
  Globe,
  Save,
} from "lucide-react";
import AdminEcommerceLayout from "../../layout/Layout";
import {
  useEcommerceSettings,
  useUpdateEcommerceSettings,
} from "../../../admin-pages/hooks/ecommerce-settings.hooks";

const inputClass =
  "w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-sm text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent";

const PAYMENT_METHOD_OPTIONS = ["cash", "mpesa", "card", "paybill", "other"];

const DEFAULT_SETTINGS = {
  enabled: false,
  isPublished: false,
  storeSlug: "",
  storeName: "",
  tagline: "",
  theme: { primaryColor: "#2563eb", logoUrl: "", bannerUrl: "" },
  currency: "KES",
  shippingFee: 0,
  freeShippingThreshold: null,
  taxRate: 0,
  paymentMethods: [],
  contactEmail: "",
  contactPhone: "",
};

const Field = ({ label, hint, children }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
      {label}
    </label>
    {children}
    {hint && (
      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{hint}</p>
    )}
  </div>
);

const SectionCard = ({ icon: Icon, title, description, children }) => (
  <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-sm p-6">
    <div className="flex items-center gap-3">
      <div className="p-2 bg-blue-50 dark:bg-blue-500/10 rounded-sm">
        <Icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
      </div>
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
        {title}
      </h2>
    </div>
    {description && (
      <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 mb-4">
        {description}
      </p>
    )}
    <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${description ? "" : "mt-4"}`}>
      {children}
    </div>
  </div>
);

const ToggleSwitch = ({ checked, onChange, disabled, label }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    aria-label={label}
    disabled={disabled}
    onClick={() => onChange(!checked)}
    className={`relative inline-flex items-center h-6 w-12 rounded-full transition-colors duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed ${
      checked ? "bg-blue-600" : "bg-gray-300 dark:bg-gray-600"
    }`}
  >
    <span
      className={`inline-block w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-300 ease-in-out ${
        checked ? "translate-x-6" : "translate-x-0.5"
      }`}
    />
  </button>
);

const GeneralSection = ({ values, onFieldChange }) => {
  const host = typeof window !== "undefined" ? window.location.host : "yourapp.com";
  const slugPreview = values.storeSlug || "your-slug";

  const handleSlugChange = (e) => {
    const sanitized = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "");
    onFieldChange("storeSlug", sanitized);
  };

  return (
    <SectionCard
      icon={Store}
      title="General"
      description="Basic identity and contact details for your storefront."
    >
      <Field label="Store Name">
        <input
          type="text"
          className={inputClass}
          value={values.storeName}
          onChange={(e) => onFieldChange("storeName", e.target.value)}
          placeholder="e.g., Acme Electronics"
        />
      </Field>

      <Field label="Tagline">
        <input
          type="text"
          className={inputClass}
          value={values.tagline}
          onChange={(e) => onFieldChange("tagline", e.target.value)}
          placeholder="A short line describing your store"
        />
      </Field>

      <Field
        label="Store Slug"
        hint={`Public URL: ${host}/store/${slugPreview}`}
      >
        <input
          type="text"
          className={inputClass}
          value={values.storeSlug}
          onChange={handleSlugChange}
          placeholder="e.g., acme-electronics"
        />
      </Field>

      <Field label="Contact Email">
        <input
          type="email"
          className={inputClass}
          value={values.contactEmail}
          onChange={(e) => onFieldChange("contactEmail", e.target.value)}
          placeholder="store@example.com"
        />
      </Field>

      <Field label="Contact Phone">
        <input
          type="tel"
          className={inputClass}
          value={values.contactPhone}
          onChange={(e) => onFieldChange("contactPhone", e.target.value)}
          placeholder="+2547XXXXXXXX"
        />
      </Field>
    </SectionCard>
  );
};

const BrandingSection = ({ theme, onThemeChange }) => (
  <SectionCard
    icon={Palette}
    title="Branding"
    description="Colors and imagery shown to customers on the public storefront."
  >
    <Field label="Primary Color">
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={theme.primaryColor || "#2563eb"}
          onChange={(e) => onThemeChange("primaryColor", e.target.value)}
          className="h-10 w-12 border border-gray-300 dark:border-gray-700 rounded-sm bg-gray-50 dark:bg-gray-900 cursor-pointer"
        />
        <input
          type="text"
          className={inputClass}
          value={theme.primaryColor || ""}
          onChange={(e) => onThemeChange("primaryColor", e.target.value)}
          placeholder="#2563eb"
        />
      </div>
    </Field>

    <Field label="Logo URL">
      <input
        type="text"
        className={inputClass}
        value={theme.logoUrl || ""}
        onChange={(e) => onThemeChange("logoUrl", e.target.value)}
        placeholder="https://example.com/logo.png"
      />
    </Field>

    <Field label="Banner URL">
      <input
        type="text"
        className={inputClass}
        value={theme.bannerUrl || ""}
        onChange={(e) => onThemeChange("bannerUrl", e.target.value)}
        placeholder="https://example.com/banner.png"
      />
    </Field>
  </SectionCard>
);

const CommerceSection = ({ values, onFieldChange }) => (
  <SectionCard
    icon={Truck}
    title="Commerce"
    description="Currency, shipping, and tax defaults applied to customer orders."
  >
    <Field label="Currency">
      <input
        type="text"
        className={inputClass}
        value={values.currency}
        onChange={(e) => onFieldChange("currency", e.target.value)}
        placeholder="KES"
      />
    </Field>

    <Field label="Shipping Fee">
      <input
        type="number"
        min="0"
        step="0.01"
        className={inputClass}
        value={values.shippingFee}
        onChange={(e) => onFieldChange("shippingFee", e.target.value === "" ? 0 : parseFloat(e.target.value))}
      />
    </Field>

    <Field label="Free Shipping Threshold" hint="Leave blank for no free-shipping threshold">
      <input
        type="number"
        min="0"
        step="0.01"
        className={inputClass}
        value={values.freeShippingThreshold ?? ""}
        onChange={(e) =>
          onFieldChange(
            "freeShippingThreshold",
            e.target.value === "" ? null : parseFloat(e.target.value),
          )
        }
      />
    </Field>

    <Field label="Tax Rate (%)">
      <input
        type="number"
        min="0"
        max="100"
        step="0.01"
        className={inputClass}
        value={values.taxRate}
        onChange={(e) => onFieldChange("taxRate", e.target.value === "" ? 0 : parseFloat(e.target.value))}
      />
    </Field>
  </SectionCard>
);

const PaymentMethodsSection = ({ paymentMethods, onToggleMethod }) => (
  <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-sm p-6">
    <div className="flex items-center gap-3">
      <div className="p-2 bg-blue-50 dark:bg-blue-500/10 rounded-sm">
        <CreditCard className="w-5 h-5 text-blue-600 dark:text-blue-400" />
      </div>
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
        Payment Methods
      </h2>
    </div>
    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 mb-4">
      Choose which payment methods customers can use at checkout.
    </p>

    <div className="flex flex-wrap gap-3">
      {PAYMENT_METHOD_OPTIONS.map((method) => {
        const checked = paymentMethods.includes(method);
        return (
          <label
            key={method}
            className={`flex items-center gap-2 px-3 py-2 border rounded-sm cursor-pointer text-sm capitalize transition-colors ${
              checked
                ? "border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400"
                : "border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300"
            }`}
          >
            <input
              type="checkbox"
              className="accent-blue-600"
              checked={checked}
              onChange={() => onToggleMethod(method)}
            />
            {method}
          </label>
        );
      })}
    </div>
  </div>
);

const StatusSection = ({ values, slugError, onToggleEnabled, onTogglePublished }) => (
  <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-sm p-6">
    <div className="flex items-center gap-3">
      <div className="p-2 bg-blue-50 dark:bg-blue-500/10 rounded-sm">
        <Globe className="w-5 h-5 text-blue-600 dark:text-blue-400" />
      </div>
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
        Status
      </h2>
    </div>

    <div className="mt-4 space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-gray-900 dark:text-white">Enabled</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Master switch for the storefront. Requires a store slug to be set first.
          </p>
          {slugError && (
            <p className="text-xs text-red-600 dark:text-red-400 mt-1">{slugError}</p>
          )}
        </div>
        <ToggleSwitch checked={values.enabled} onChange={onToggleEnabled} label="Enabled" />
      </div>

      <div className="flex items-start justify-between gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div>
          <p className="text-sm font-medium text-gray-900 dark:text-white">Published</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Makes the storefront visible and orderable to the public. Only takes effect once a slug is set and Enabled is on.
          </p>
        </div>
        <ToggleSwitch checked={values.isPublished} onChange={onTogglePublished} label="Published" />
      </div>
    </div>
  </div>
);

const SettingsSkeleton = () => (
  <div className="space-y-6 animate-pulse">
    {[1, 2, 3, 4].map((i) => (
      <div
        key={i}
        className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-sm p-6"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 bg-gray-200 dark:bg-gray-700 rounded-sm" />
          <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="h-10 bg-gray-100 dark:bg-gray-900 rounded-sm" />
          <div className="h-10 bg-gray-100 dark:bg-gray-900 rounded-sm" />
        </div>
      </div>
    ))}
  </div>
);

const SettingsError = ({ message, onRetry }) => (
  <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-sm p-4">
    <p className="text-red-600 dark:text-red-400">Error: {message}</p>
    <button
      onClick={onRetry}
      className="mt-2 px-4 py-2 bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-500/30 rounded-sm transition-colors"
    >
      Retry
    </button>
  </div>
);

const AdminEcommerceSettings = () => {
  const { data, isLoading, isError, error, refetch } = useEcommerceSettings();
  const updateSettingsMutation = useUpdateEcommerceSettings();

  const [formValues, setFormValues] = useState(null);
  const [slugError, setSlugError] = useState("");

  useEffect(() => {
    if (formValues === null && data?.data) {
      setFormValues({ ...DEFAULT_SETTINGS, ...data.data, theme: { ...DEFAULT_SETTINGS.theme, ...data.data.theme } });
    }
  }, [data, formValues]);

  const setField = (field, value) => {
    setFormValues((prev) => ({ ...prev, [field]: value }));
  };

  const setThemeField = (field, value) => {
    setFormValues((prev) => ({ ...prev, theme: { ...prev.theme, [field]: value } }));
  };

  const toggleMethod = (method) => {
    setFormValues((prev) => {
      const exists = prev.paymentMethods.includes(method);
      return {
        ...prev,
        paymentMethods: exists
          ? prev.paymentMethods.filter((m) => m !== method)
          : [...prev.paymentMethods, method],
      };
    });
  };

  const handleToggleEnabled = (next) => {
    if (next && !formValues.storeSlug?.trim()) {
      setSlugError("Set a store slug in the General section before enabling the storefront.");
      return;
    }
    setSlugError("");
    setField("enabled", next);
  };

  const handleTogglePublished = (next) => {
    setField("isPublished", next);
  };

  const handleSave = () => {
    if (formValues.enabled && !formValues.storeSlug?.trim()) {
      setSlugError("Set a store slug in the General section before enabling the storefront.");
      return;
    }
    updateSettingsMutation.mutate(formValues);
  };

  return (
    <AdminEcommerceLayout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white p-4 sm:p-6">
        <div className="flex items-start flex-col md:flex-row justify-between md:items-center mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-heading font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-500 dark:to-indigo-500 bg-clip-text text-transparent">
              Storefront Settings
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Configure how your ecommerce storefront looks and behaves for customers
            </p>
          </div>

          {!isLoading && !isError && formValues && (
            <button
              onClick={handleSave}
              disabled={updateSettingsMutation.isPending}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600 text-white font-medium rounded-sm transition disabled:opacity-50 disabled:cursor-not-allowed mt-4 md:mt-0"
            >
              <Save size={16} />
              {updateSettingsMutation.isPending ? "Saving..." : "Save Changes"}
            </button>
          )}
        </div>

        {isLoading && <SettingsSkeleton />}

        {isError && !isLoading && (
          <SettingsError message={error?.message || "Failed to load storefront settings"} onRetry={refetch} />
        )}

        {!isLoading && !isError && formValues && (
          <div className="space-y-6">
            <GeneralSection values={formValues} onFieldChange={setField} />

            <BrandingSection theme={formValues.theme} onThemeChange={setThemeField} />

            <CommerceSection values={formValues} onFieldChange={setField} />

            <PaymentMethodsSection
              paymentMethods={formValues.paymentMethods}
              onToggleMethod={toggleMethod}
            />

            <StatusSection
              values={formValues}
              slugError={slugError}
              onToggleEnabled={handleToggleEnabled}
              onTogglePublished={handleTogglePublished}
            />
          </div>
        )}
      </div>
    </AdminEcommerceLayout>
  );
};

export default AdminEcommerceSettings;
