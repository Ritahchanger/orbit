import {
  AlertCircle,
} from "lucide-react";
export const labelClass =
  "block text-xs font-semibold text-blue-200 mb-1.5 uppercase tracking-wide";

export const getInputClass = (field, errors) =>
  `w-full pl-10 pr-4 py-2.5 bg-white/10 border ${
    errors[field] ? "border-red-400" : "border-white/20"
  } rounded-sm text-white placeholder-blue-300/60 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm`;

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
    <label className={labelClass}>
      {label}
      {required && <span className="text-red-300 ml-1">*</span>}
    </label>
    <div className="relative">
      <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-300" />
      <input
        name={field}
        value={formData[field]}
        onChange={onChange}
        className={getInputClass(field, errors)}
        {...props}
      />
    </div>
    {errors[field] && (
      <p className="mt-1 text-xs text-red-300 flex items-center gap-1">
        <AlertCircle className="w-3 h-3" />
        {errors[field]}
      </p>
    )}
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
    <label className={labelClass}>
      {label}
      {required && <span className="text-red-300 ml-1">*</span>}
    </label>
    <div className="relative">
      <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-300 z-10" />
      <select
        name={field}
        value={formData[field]}
        onChange={onChange}
        className={`${getInputClass(field, errors)} appearance-none`}
      >
        {children}
      </select>
    </div>
    {errors[field] && (
      <p className="mt-1 text-xs text-red-300 flex items-center gap-1">
        <AlertCircle className="w-3 h-3" />
        {errors[field]}
      </p>
    )}
  </div>
);
