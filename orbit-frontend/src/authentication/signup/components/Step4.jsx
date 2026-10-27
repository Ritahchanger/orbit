import { useState } from "react";
import { Check, ShieldCheck } from "lucide-react";

import { FieldError } from "./Components";
import { labelClass } from "./fieldStyles";
import TermsModal from "./TermsOfUse";

const selectableCard = (selected) =>
  `relative rounded-lg border p-5 text-left transition-colors ${
    selected
      ? "border-blue-600 bg-blue-50 ring-1 ring-blue-600 dark:border-blue-500 dark:bg-blue-500/10 dark:ring-blue-500"
      : "border-gray-200 bg-white hover:border-gray-300 dark:border-gray-800 dark:bg-gray-900 dark:hover:border-gray-700"
  }`;

const Step4 = ({
  currentStep,
  subscriptionPlans,
  formData,
  setFormData,
  acceptTerms,
  setAcceptTerms,
  errors,
  handleInputChange,
}) => {
  const [showTermsModal, setShowTermsModal] = useState(false);

  return (
    <div>
      {currentStep === 4 && (
        <div className="space-y-8">
          {/* Plans */}
          <div>
            <span className={labelClass}>Plan</span>
            <div className="grid gap-4 md:grid-cols-3">
              {subscriptionPlans.map((plan) => {
                const selected = formData.subscriptionPlan === plan.id;
                return (
                  <button
                    key={plan.id}
                    type="button"
                    aria-pressed={selected}
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        subscriptionPlan: plan.id,
                      }))
                    }
                    className={selectableCard(selected)}
                  >
                    <span className="mb-1 flex items-center justify-between gap-2">
                      <span className="text-lg font-semibold text-gray-900 dark:text-white">
                        {plan.name}
                      </span>
                      {plan.popular && (
                        <span className="rounded-full bg-blue-600/10 px-2 py-0.5 text-xs font-semibold text-blue-700 dark:text-blue-300">
                          Popular
                        </span>
                      )}
                    </span>
                    <span className="mb-4 block text-3xl font-semibold text-gray-900 dark:text-white">
                      {plan.price}
                    </span>
                    <span className="block space-y-2">
                      {plan.features.map((f) => (
                        <span
                          key={f}
                          className="flex items-center gap-2 text-base text-gray-600 dark:text-gray-400"
                        >
                          <Check className="h-3.5 w-3.5 shrink-0 text-blue-600 dark:text-blue-400" />
                          {f}
                        </span>
                      ))}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Billing Cycle */}
          <div>
            <span className={labelClass}>Billing cycle</span>
            <div className="grid gap-3 md:grid-cols-2">
              {[
                {
                  val: "monthly",
                  title: "Monthly",
                  desc: "Pay month to month",
                },
                { val: "annual", title: "Annual", desc: "Save 20%" },
              ].map((opt) => (
                <label
                  key={opt.val}
                  className={`flex cursor-pointer items-center gap-3 ${selectableCard(
                    formData.paymentMethod === opt.val,
                  )} p-4`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={opt.val}
                    checked={formData.paymentMethod === opt.val}
                    onChange={handleInputChange}
                    className="h-4 w-4 accent-blue-600"
                  />
                  <span>
                    <span className="block text-lg font-semibold text-gray-900 dark:text-white">
                      {opt.title}
                    </span>
                    <span className="block text-base text-gray-500 dark:text-gray-400">
                      {opt.desc}
                    </span>
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Terms */}
          <div>
            {acceptTerms ? (
              <div className="flex items-center justify-between gap-4 rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-500/30 dark:bg-green-500/10">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="h-5 w-5 shrink-0 text-green-600 dark:text-green-400" />
                  <div>
                    <p className="mb-0 text-lg font-semibold text-green-800 dark:text-green-300">
                      Terms accepted
                    </p>
                    <p className="mb-0 text-base text-green-700/80 dark:text-green-400/80">
                      You have agreed to the Orbit Terms of Service.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setAcceptTerms(false)}
                  className="text-base font-medium text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  Revoke
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowTermsModal(true)}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-gray-300 p-4 text-lg font-medium text-gray-700 transition-colors hover:border-blue-500 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:border-blue-500 dark:hover:bg-gray-900"
              >
                <ShieldCheck className="h-4 w-4" />
                Read and accept the Terms of Service
              </button>
            )}

            <FieldError message={errors.terms} />
          </div>
        </div>
      )}

      {/* Modal — outside the currentStep guard so it can render on top */}
      <TermsModal
        isOpen={showTermsModal}
        onAccept={() => {
          setAcceptTerms(true);
          setShowTermsModal(false);
        }}
        onDecline={() => setShowTermsModal(false)}
      />
    </div>
  );
};

export default Step4;
