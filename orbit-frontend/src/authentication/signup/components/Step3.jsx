import { labelClass } from "./Components";

import { AlertCircle, Upload, Store } from "lucide-react";

const Step3 = ({logoPreview,handleInputChange,formData,errors}) => {
  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className={labelClass}>Business Logo</label>
          <div className="flex items-center gap-4 p-4 bg-white/5 border border-white/15 rounded-sm">
            <div className="w-16 h-16 bg-white/10 rounded-sm border-2 border-dashed border-white/30 flex items-center justify-center overflow-hidden flex-shrink-0">
              {logoPreview ? (
                <img
                  src={logoPreview}
                  alt="Logo"
                  className="w-full h-full object-cover"
                />
              ) : (
                <Upload className="w-6 h-6 text-blue-300" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <input
                type="file"
                name="businessLogo"
                onChange={handleInputChange}
                accept="image/*"
                className="w-full text-xs text-blue-200 file:mr-3 file:py-2 file:px-3 file:rounded-sm file:border-0 file:text-xs file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"
              />
              <p className="text-xs text-blue-300 mt-1">
                Square image, min 200×200px
              </p>
            </div>
          </div>
        </div>

        <div className="md:col-span-2">
          <label className={labelClass}>
            Business Description <span className="text-red-300">*</span>
          </label>
          <textarea
            name="businessDescription"
            value={formData.businessDescription}
            onChange={handleInputChange}
            rows="4"
            placeholder="Tell us about your business, products, services..."
            className={`w-full px-4 py-2.5 bg-white/10 border ${errors.businessDescription ? "border-red-400" : "border-white/20"} rounded-sm text-white placeholder-blue-300/60 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none text-sm`}
          />
          {errors.businessDescription && (
            <p className="mt-1 text-xs text-red-300 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {errors.businessDescription}
            </p>
          )}
        </div>

        <div>
          <label className={labelClass}>
            Number of Stores <span className="text-red-300">*</span>
          </label>
          <div className="relative">
            <Store className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-300" />
            <input
              type="number"
              name="numberOfStores"
              value={formData.numberOfStores}
              onChange={handleInputChange}
              min="1"
              className={`w-full pl-10 pr-4 py-2.5 bg-white/10 border ${errors.numberOfStores ? "border-red-400" : "border-white/20"} rounded-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm`}
            />
          </div>
          {errors.numberOfStores && (
            <p className="mt-1 text-xs text-red-300 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {errors.numberOfStores}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Step3;
