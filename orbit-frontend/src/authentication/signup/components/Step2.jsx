import { IconInput } from "./Components";
import { Lock, AlertCircle, Eye, EyeOff } from "lucide-react";
import { labelClass } from "./Components";
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
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <IconInput
        icon={User}
        field="adminFirstName"
        label="First Name"
        placeholder="John"
        required
        {...fieldProps}
      />
      <IconInput
        icon={User}
        field="adminLastName"
        label="Last Name"
        placeholder="Doe"
        required
        {...fieldProps}
      />
      <IconInput
        icon={Mail}
        field="adminEmail"
        label="Email Address"
        type="email"
        placeholder="john@example.com"
        required
        {...fieldProps}
      />
      <IconInput
        icon={Phone}
        field="adminPhone"
        label="Phone Number"
        type="tel"
        placeholder="+254 700 000 000"
        required
        {...fieldProps}
      />
      <div className="md:col-span-2">
        <IconInput
          icon={User}
          field="adminUsername"
          label="Username"
          placeholder="johndoe"
          required
          {...fieldProps}
        />
      </div>

      {/* Password */}
      <div>
        <label className={labelClass}>
          Password <span className="text-red-300">*</span>
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-300" />
          <input
            type={showPassword ? "text" : "password"}
            name="adminPassword"
            value={formData.adminPassword}
            onChange={handleInputChange}
            placeholder="••••••••"
            className={`w-full pl-10 pr-10 py-2.5 bg-white/10 border ${errors.adminPassword ? "border-red-400" : "border-white/20"} rounded-sm text-white placeholder-blue-300/60 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm`}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-300 hover:text-white"
          >
            {showPassword ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        </div>
        {errors.adminPassword && (
          <p className="mt-1 text-xs text-red-300 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            {errors.adminPassword}
          </p>
        )}
      </div>

      {/* Confirm Password */}
      <div>
        <label className={labelClass}>
          Confirm Password <span className="text-red-300">*</span>
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-300" />
          <input
            type={showConfirmPassword ? "text" : "password"}
            name="adminConfirmPassword"
            value={formData.adminConfirmPassword}
            onChange={handleInputChange}
            placeholder="••••••••"
            className={`w-full pl-10 pr-10 py-2.5 bg-white/10 border ${errors.adminConfirmPassword ? "border-red-400" : "border-white/20"} rounded-sm text-white placeholder-blue-300/60 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm`}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-300 hover:text-white"
          >
            {showConfirmPassword ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        </div>
        {errors.adminConfirmPassword && (
          <p className="mt-1 text-xs text-red-300 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            {errors.adminConfirmPassword}
          </p>
        )}
      </div>
    </div>
  );
};

export default Step2;
