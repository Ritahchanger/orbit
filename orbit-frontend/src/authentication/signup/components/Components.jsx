import { AlertCircle, ChevronDown } from "lucide-react";

import { authError, authInputIcon } from "../../authStyles";
import { getInputClass, labelClass } from "./fieldStyles";

export const RequiredMark = () => (
  <span className="ml-0.5 text-red-500">*</span>
);

export const FieldError = ({ message }) =>
  message ? (
    <p className={authError}>
      <AlertCircle className="h-3.5 w-3.5 shrink-0" />
      {message}
    </p>
  ) : null;

export const IconInput = ({
  icon: Icon,
  field,
  label,
  required,
  errors,
  formData,
  onChange,
  ...props
}) => (
  <div>
    <label htmlFor={field} className={labelClass}>
      {label}
      {required && <RequiredMark />}
    </label>
    <div className="relative">
      <Icon className={authInputIcon} />
      <input
        id={field}
        name={field}
        value={formData[field]}
        onChange={onChange}
        className={getInputClass(field, errors)}
        {...props}
      />
    </div>
    <FieldError message={errors[field]} />
  </div>
);

export const SelectInput = ({
  icon: Icon,
  field,
  label,
  required,
  errors,
  formData,
  onChange,
  children,
}) => (
  <div>
    <label htmlFor={field} className={labelClass}>
      {label}
      {required && <RequiredMark />}
    </label>
    <div className="relative">
      <Icon className={`${authInputIcon} z-10`} />
      <select
        id={field}
        name={field}
        value={formData[field]}
        onChange={onChange}
        className={getInputClass(field, errors, "appearance-none pr-10 pl-10")}
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute top-1/2 right-3.5 h-4 w-4 -translate-y-1/2 text-gray-400" />
    </div>
    <FieldError message={errors[field]} />
  </div>
);
