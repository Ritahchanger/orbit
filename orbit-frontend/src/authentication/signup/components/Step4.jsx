import { useState } from "react";
import { labelClass } from "./Components";
import { AlertCircle, CheckCircle, ShieldCheck } from "lucide-react";
import TermsModal from "./TermsOfUse";

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
        <div className="space-y-5">
          {/* Plans */}
          <div className="grid md:grid-cols-3 gap-4">
            {subscriptionPlans.map((plan) => (
              <div
                key={plan.id}
                onClick={() =>
                  setFormData((prev) => ({
                    ...prev,
                    subscriptionPlan: plan.id,
                  }))
                }
                className={`relative p-5 rounded-sm border-2 cursor-pointer transition-all ${
                  formData.subscriptionPlan === plan.id
                    ? "border-blue-500 bg-blue-600/20"
                    : "border-white/20 bg-white/5 hover:bg-white/10"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-blue-600 text-white text-xs px-3 py-1 rounded-full">
                      Popular
                    </span>
                  </div>
                )}
                <h3 className="text-base font-bold text-white mb-1">
                  {plan.name}
                </h3>
                <p className="text-xl font-bold text-white mb-3">
                  {plan.price}
                </p>
                <ul className="space-y-1.5">
                  {plan.features.map((f, i) => (
                    <li
                      key={i}
                      className="text-xs text-blue-200 flex items-center gap-1.5"
                    >
                      <CheckCircle className="w-3 h-3 text-green-400 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <div
                  className={`w-4 h-4 rounded-full border-2 mx-auto mt-4 ${
                    formData.subscriptionPlan === plan.id
                      ? "border-blue-500 bg-blue-500"
                      : "border-white/30"
                  }`}
                />
              </div>
            ))}
          </div>

          {/* Billing Cycle */}
          <div>
            <label className={labelClass}>Billing Cycle</label>
            <div className="grid md:grid-cols-2 gap-3">
              {[
                {
                  val: "monthly",
                  title: "Monthly Billing",
                  desc: "Pay month to month",
                },
                { val: "annual", title: "Annual Billing", desc: "Save 20%" },
              ].map((opt) => (
                <label
                  key={opt.val}
                  className={`flex items-center gap-3 p-4 rounded-sm border-2 cursor-pointer transition-all ${
                    formData.paymentMethod === opt.val
                      ? "border-blue-500 bg-blue-600/20"
                      : "border-white/20 bg-white/5"
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={opt.val}
                    checked={formData.paymentMethod === opt.val}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-blue-600"
                  />
                  <div>
                    <p className="font-semibold text-white text-sm">
                      {opt.title}
                    </p>
                    <p className="text-xs text-blue-200">{opt.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Terms — button + accepted state display */}
          <div>
            {acceptTerms ? (
              <div className="flex items-center justify-between p-4 bg-green-500/10 border border-green-500/30 rounded-sm">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="w-5 h-5 text-green-400 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-green-300">
                      Terms Accepted
                    </p>
                    <p className="text-xs text-green-400/70">
                      You have agreed to the Orbit Terms of Service
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setAcceptTerms(false)}
                  className="text-xs text-white/40 hover:text-white/70 transition-colors"
                >
                  Revoke
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowTermsModal(true)}
                className="w-full flex items-center justify-center gap-2 p-4 bg-white/5 border-2 border-dashed border-white/20 rounded-sm text-blue-200 hover:bg-white/10 hover:border-blue-500/50 transition-all text-sm font-medium"
              >
                <ShieldCheck className="w-4 h-4" />
                Read &amp; Accept Terms of Service
              </button>
            )}

            {errors.terms && (
              <p className="mt-2 text-xs text-red-300 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.terms}
              </p>
            )}
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
