import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { usePlatformAdmin, usePlatformLogin } from "../hooks/use-platform-auth";

const input =
  "mt-1 w-full px-3 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500";

const PlatformLogin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
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
    <div className="min-h-screen flex items-center justify-center px-4 bg-gray-50 dark:bg-gray-900">
      <form
        onSubmit={submit}
        className="w-full max-w-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-sm p-6 space-y-4"
      >
        <div>
          <div className="flex items-center gap-2">
            <span className="text-lg font-semibold text-gray-900 dark:text-white">Orbit</span>
            <span className="px-1.5 py-0.5 text-[11px] font-medium uppercase tracking-wide rounded-sm bg-gray-900 text-white dark:bg-white dark:text-gray-900">
              Platform
            </span>
          </div>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Sign in with your Orbit staff account.
          </p>
        </div>

        <label className="block">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Email</span>
          <input
            type="email"
            autoComplete="username"
            required
            value={form.email}
            onChange={update("email")}
            className={input}
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Password</span>
          <input
            type="password"
            autoComplete="current-password"
            required
            value={form.password}
            onChange={update("password")}
            className={input}
          />
        </label>

        {error && (
          <p role="alert" className="text-sm text-red-600 dark:text-red-400">
            {error.message}
          </p>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="w-full py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-sm disabled:opacity-50"
        >
          {isPending ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  );
};

export default PlatformLogin;
