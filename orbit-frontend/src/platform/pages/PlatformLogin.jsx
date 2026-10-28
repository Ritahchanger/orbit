import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { AlertCircle, Eye, EyeOff, Lock } from "lucide-react";
import { usePlatformAdmin, usePlatformLogin } from "../hooks/use-platform-auth";
import BrandMark from "../components/ui/BrandMark";
import Button from "../components/ui/Button";
import { inputClass, labelClass } from "../components/ui/styles";

const PlatformLogin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const { data: admin } = usePlatformAdmin();
  const { mutate: login, isPending, error } = usePlatformLogin();

  const destination = location.state?.from || "/platform";
  if (admin) return <Navigate to={destination} replace />;

  const submit = (event) => {
    event.preventDefault();
    login(form, { onSuccess: () => navigate(destination, { replace: true }) });
  };

  const update = (field) => (event) => setForm((f) => ({ ...f, [field]: event.target.value }));

  return (
    <div className="grid min-h-screen bg-white antialiased lg:grid-cols-2 dark:bg-zinc-950">
      {/* Brand panel */}
      <div className="relative hidden overflow-hidden bg-zinc-950 p-10 text-white lg:flex lg:flex-col">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.15]"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgb(255 255 255 / 0.12) 1px, transparent 1px), linear-gradient(to bottom, rgb(255 255 255 / 0.12) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
            maskImage: "radial-gradient(ellipse at 30% 40%, black 20%, transparent 75%)",
            WebkitMaskImage: "radial-gradient(ellipse at 30% 40%, black 20%, transparent 75%)",
          }}
          aria-hidden
        />
        <div className="relative">
          <BrandMark inverted />
        </div>
        <div className="relative mt-auto max-w-md">
          <h2 className="text-3xl font-semibold leading-tight tracking-tight">
            Every business on Orbit, in one place.
          </h2>
          <p className="mt-4 text-[15px] leading-relaxed text-zinc-400">
            Monitor sign-ups, subscriptions and activity across the platform, and verify or
            suspend businesses when they need it.
          </p>
        </div>
        <p className="relative mt-16 text-xs text-zinc-500">© {new Date().getFullYear()} Orbit</p>
      </div>

      {/* Sign-in form */}
      <div className="flex items-center justify-center px-4 py-12 sm:px-8">
        <div className="w-full max-w-sm">
          <div className="text-zinc-900 lg:hidden dark:text-zinc-50">
            <BrandMark />
          </div>

          <h1 className="mt-8 text-2xl font-semibold tracking-tight text-zinc-900 lg:mt-0 dark:text-zinc-50">
            Sign in to the console
          </h1>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            Use your Orbit staff account. Business accounts sign in at the main app.
          </p>

          <form onSubmit={submit} className="mt-8 space-y-5">
            {error && (
              <div
                role="alert"
                className="flex items-start gap-2.5 rounded-md border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300"
              >
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                {error.message}
              </div>
            )}

            <div className="space-y-1.5">
              <label htmlFor="platform-email" className={labelClass}>
                Email
              </label>
              <input
                id="platform-email"
                type="email"
                autoComplete="username"
                autoFocus
                required
                value={form.email}
                onChange={update("email")}
                placeholder="name@orbit.com"
                className={`${inputClass} h-10`}
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="platform-password" className={labelClass}>
                Password
              </label>
              <div className="relative">
                <input
                  id="platform-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={form.password}
                  onChange={update("password")}
                  className={`${inputClass} h-10 pr-10`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" variant="primary" className="h-10 w-full justify-center" disabled={isPending}>
              {isPending ? "Signing in…" : "Sign in"}
            </Button>
          </form>

          <p className="mt-8 flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
            <Lock className="h-3.5 w-3.5 shrink-0" aria-hidden />
            Restricted to authorised Orbit staff. Sign-ins are logged.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PlatformLogin;
