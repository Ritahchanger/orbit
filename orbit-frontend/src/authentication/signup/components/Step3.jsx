import { Upload, Store } from "lucide-react";

import { FieldError, RequiredMark } from "./Components";
import { getInputClass, labelClass } from "./fieldStyles";
import { authInputIcon } from "../../authStyles";

const Step3 = ({ logoPreview, handleInputChange, formData, errors }) => {
  return (
    <div className="grid grid-cols-1 gap-x-5 gap-y-5 md:grid-cols-2">
      <div className="md:col-span-2">
        <span className={labelClass}>Business logo</span>
        <label
          htmlFor="businessLogo"
          className="flex cursor-pointer items-center gap-4 rounded-lg border border-dashed border-gray-300 p-4 transition-colors hover:border-blue-500 hover:bg-gray-50 dark:border-gray-700 dark:hover:border-blue-500 dark:hover:bg-gray-900"
        >
          <span className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-900">
            {logoPreview ? (
              <img
                src={logoPreview}
                alt="Logo preview"
                className="h-full w-full object-cover"
              />
            ) : (
              <Upload className="h-5 w-5 text-gray-400" />
            )}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-lg font-medium text-gray-900 dark:text-white">
              {formData.businessLogo
                ? formData.businessLogo.name
                : "Upload your logo"}
            </span>
            <span className="block text-base text-gray-500 dark:text-gray-400">
              Square PNG or JPG, at least 200×200px
            </span>
          </span>
          <span className="shrink-0 rounded-md border border-gray-300 px-3 py-1.5 text-base font-medium text-gray-700 dark:border-gray-700 dark:text-gray-200">
            Browse
          </span>
          <input
            id="businessLogo"
            type="file"
            name="businessLogo"
            onChange={handleInputChange}
            accept="image/*"
            className="sr-only"
          />
        </label>
      </div>

      <div className="md:col-span-2">
        <label htmlFor="businessDescription" className={labelClass}>
          Business description
          <RequiredMark />
        </label>
        <textarea
          id="businessDescription"
          name="businessDescription"
          value={formData.businessDescription}
          onChange={handleInputChange}
          rows="4"
          placeholder="What does your business sell or offer?"
          className={getInputClass(
            "businessDescription",
            errors,
            "h-auto! resize-none py-2.5",
          )}
        />
        <FieldError message={errors.businessDescription} />
      </div>

      <div>
        <label htmlFor="numberOfStores" className={labelClass}>
          Number of stores
          <RequiredMark />
        </label>
        <div className="relative">
          <Store className={authInputIcon} />
          <input
            id="numberOfStores"
            type="number"
            name="numberOfStores"
            value={formData.numberOfStores}
            onChange={handleInputChange}
            min="1"
            className={getInputClass("numberOfStores", errors)}
          />
        </div>
        <FieldError message={errors.numberOfStores} />
      </div>
    </div>
  );
};

export default Step3;
