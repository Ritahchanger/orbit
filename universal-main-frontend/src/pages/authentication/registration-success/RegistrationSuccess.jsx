import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Rocket,
  CheckCircle,
  Mail,
  ArrowRight,
  Building2,
  Calendar,
  Users,
  Store,
  Download,
  Home,
} from "lucide-react";

const RegistrationSuccess = () => {
  const navigate = useNavigate();
  const [registrationData, setRegistrationData] = useState(null);
  const [countdown, setCountdown] = useState(15);
  const [animateIn, setAnimateIn] = useState(false);

  useEffect(() => {
    const data = localStorage.getItem("orbit_registration");
    if (data) setRegistrationData(JSON.parse(data));
    setTimeout(() => setAnimateIn(true), 100);
  }, []);

  useEffect(() => {
    if (countdown === 0) {
      navigate("/login");
      return;
    }
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown, navigate]);

  const steps = [
    {
      icon: Mail,
      title: "Check Your Email",
      description:
        "We've sent a verification link to your business email address.",
    },
    {
      icon: CheckCircle,
      title: "Verify Your Account",
      description:
        "Click the link in your email to activate your Orbit account.",
    },
    {
      icon: Rocket,
      title: "Start Managing",
      description: "Log in and start streamlining your business operations.",
    },
  ];

  const formatDate = (iso) => {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString("en-KE", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Background blobs */}
      <div className="fixed inset-0 opacity-10 pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-white rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-white rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-blue-300 rounded-full blur-3xl" />
      </div>

      <div
        className={`relative z-10 w-full max-w-2xl transition-all duration-700 ${animateIn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2.5 group">
            <div className="p-2 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 group-hover:bg-white/20 transition-colors">
              <Rocket className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">Orbit</span>
          </Link>
        </div>

        {/* Main Card */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl overflow-hidden">
          {/* Success Header */}
          <div className="px-8 pt-10 pb-8 text-center border-b border-white/10">
            {/* Animated checkmark */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center border-2 border-green-400/40">
                  <div className="w-16 h-16 bg-green-500/30 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-10 h-10 text-green-400" />
                  </div>
                </div>
                {/* Pulse rings */}
                <div className="absolute inset-0 rounded-full border-2 border-green-400/20 animate-ping" />
              </div>
            </div>

            <h1 className="text-3xl font-extrabold text-white mb-3">
              Registration Successful! 🎉
            </h1>
            <p className="text-blue-200 text-base max-w-md mx-auto leading-relaxed">
              Welcome to Orbit! Your business account has been created and is
              pending verification.
            </p>
          </div>

          {/* Registration Summary */}
          {registrationData && (
            <div className="px-8 py-6 border-b border-white/10">
              <h2 className="text-xs font-bold uppercase tracking-widest text-blue-300 mb-4">
                Registration Summary
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <div className="flex items-center gap-2 mb-1">
                    <Building2 className="w-4 h-4 text-blue-300" />
                    <span className="text-xs text-blue-300 uppercase tracking-wide font-semibold">
                      Business
                    </span>
                  </div>
                  <p className="text-white font-semibold text-sm truncate">
                    {registrationData.businessName || "—"}
                  </p>
                  <p className="text-blue-300 text-xs mt-0.5">
                    {registrationData.businessType || "—"}
                  </p>
                </div>

                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <div className="flex items-center gap-2 mb-1">
                    <Users className="w-4 h-4 text-blue-300" />
                    <span className="text-xs text-blue-300 uppercase tracking-wide font-semibold">
                      Admin
                    </span>
                  </div>
                  <p className="text-white font-semibold text-sm truncate">
                    {registrationData.adminFirstName}{" "}
                    {registrationData.adminLastName}
                  </p>
                  <p className="text-blue-300 text-xs mt-0.5 truncate">
                    {registrationData.adminEmail || "—"}
                  </p>
                </div>

                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <div className="flex items-center gap-2 mb-1">
                    <Store className="w-4 h-4 text-blue-300" />
                    <span className="text-xs text-blue-300 uppercase tracking-wide font-semibold">
                      Plan
                    </span>
                  </div>
                  <p className="text-white font-semibold text-sm capitalize">
                    {registrationData.subscriptionPlan || "—"}
                  </p>
                  <p className="text-blue-300 text-xs mt-0.5 capitalize">
                    {registrationData.paymentMethod} billing
                  </p>
                </div>

                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar className="w-4 h-4 text-blue-300" />
                    <span className="text-xs text-blue-300 uppercase tracking-wide font-semibold">
                      Registered
                    </span>
                  </div>
                  <p className="text-white font-semibold text-sm">
                    {formatDate(registrationData.registeredAt)}
                  </p>
                  <p className="text-blue-300 text-xs mt-0.5 capitalize">
                    Status:{" "}
                    <span className="text-yellow-300 font-medium">
                      {registrationData.status}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Next Steps */}
          <div className="px-8 py-6 border-b border-white/10">
            <h2 className="text-xs font-bold uppercase tracking-widest text-blue-300 mb-4">
              What Happens Next
            </h2>
            <div className="space-y-4">
              {steps.map((step, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className="w-9 h-9 bg-blue-500/20 rounded-xl flex items-center justify-center flex-shrink-0 border border-blue-400/20 mt-0.5">
                    <step.icon className="w-4 h-4 text-blue-300" />
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">
                      {step.title}
                    </p>
                    <p className="text-blue-200 text-xs mt-0.5 leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                  {i < steps.length - 1 && (
                    <div className="ml-4 mt-9 w-px h-4 bg-white/10 absolute" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="px-8 py-6">
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                to="/login"
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 text-sm"
              >
                Go to Login
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/"
                className="flex-1 bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 text-sm border border-white/20"
              >
                <Home className="w-4 h-4" />
                Back to Home
              </Link>
            </div>

            {/* Countdown */}
            <p className="text-center text-blue-300 text-xs mt-4">
              Redirecting to login in{" "}
              <span className="text-white font-bold">{countdown}s</span> ·{" "}
              <button
                onClick={() => setCountdown(9999)}
                className="text-blue-200 hover:text-white underline transition-colors"
              >
                cancel
              </button>
            </p>
          </div>
        </div>

        {/* Footer note */}
        <p className="text-center text-blue-300 text-xs mt-6">
          Need help?{" "}
          <a
            href="mailto:support@orbit.app"
            className="text-white hover:underline font-medium"
          >
            Contact support
          </a>
        </p>
      </div>
    </div>
  );
};

export default RegistrationSuccess;
