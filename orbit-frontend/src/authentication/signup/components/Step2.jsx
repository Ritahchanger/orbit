import { Lock, Eye, EyeOff } from "lucide-react";

import { IconInput, FieldError, RequiredMark } from "./Components";
import { getInputClass, labelClass } from "./fieldStyles";
import { authInputIcon } from "../../authStyles";

const PasswordInput = ({
  field,
  label,
  value,
  onChange,
  visible,
  setVisible,
  errors,
  autoComplete,
}) => (
  <div>
    <label htmlFor={field} className={labelClass}>
      {label}
      <RequiredMark />
    </label>
    <div className="relative">
      <Lock className={authInputIcon} />
      <input
        id={field}
        type={visible ? "text" : "password"}
        name={field}
        value={value}
        onChange={onChange}
        autoComplete={autoComplete}
        placeholder="At least 8 characters"
        className={getInputClass(field, errors, "pl-10 pr-11")}
      />
      <button
        type="button"
        aria-label={visible ? "Hide password" : "Show password"}
        onClick={() => setVisible(!visible)}
        className="absolute top-1/2 right-2 -translate-y-1/2 rounded-md p-1.5 text-gray-400 transition-colors hover:text-gray-600 dark:hover:text-gray-300"
      >
        {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
    <FieldError message={errors[field]} />
  </div>
);

const Step2 = ({
  fieldProps,
  User,
  Mail,
  Phone,
  showPassword,
  formData,
  handleInputChange,
  errors,
  setShowPassword,
  showConfirmPassword,
  setShowConfirmPassword,
}) => {
  return (
    <div className="grid grid-cols-1 gap-x-5 gap-y-5 md:grid-cols-2">
      <IconInput
        icon={User}
        field="adminFirstName"
        label="First name"
        placeholder="John"
        autoComplete="given-name"
        required
        {...fieldProps}
      />
      <IconInput
        icon={User}
        field="adminLastName"
        label="Last name"
        placeholder="Doe"
        autoComplete="family-name"
        required
        {...fieldProps}
      />
      <IconInput
        icon={Mail}
        field="adminEmail"
        label="Email address"
        type="email"
        placeholder="john@company.com"
        autoComplete="email"
        required
        {...fieldProps}
      />
      <IconInput
        icon={Phone}
        field="adminPhone"
        label="Phone number"
        type="tel"
        placeholder="+254 700 000 000"
        autoComplete="tel"
        required
        {...fieldProps}
      />
      <div className="md:col-span-2">
        <IconInput
          icon={User}
          field="adminUsername"
          label="Username"
          placeholder="johndoe"
          autoComplete="username"
          required
          {...fieldProps}
        />
      </div>

      <PasswordInput
        field="adminPassword"
        label="Password"
        value={formData.adminPassword}
        onChange={handleInputChange}
        visible={showPassword}
        setVisible={setShowPassword}
        errors={errors}
        autoComplete="new-password"
      />
      <PasswordInput
        field="adminConfirmPassword"
        label="Confirm password"
        value={formData.adminConfirmPassword}
        onChange={handleInputChange}
        visible={showConfirmPassword}
        setVisible={setShowConfirmPassword}
        errors={errors}
        autoComplete="new-password"
      />
    </div>
  );
};

export default Step2;
