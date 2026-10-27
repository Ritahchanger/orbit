import { Link } from "react-router-dom";

import ThemeButton from "../admin-pages/dashboard/layout/ThemeButton";

const Wordmark = ({ className = "" }) => (
  <Link
    to="/"
    className={`font-heading text-3xl font-black tracking-wide ${className}`}
  >
    ORBIT
  </Link>
);

// Split screen used by the login and signup pages: a brand panel on the
// left (hidden below lg) and the form on the right.
const AuthLayout = ({ aside, children, contentClassName = "" }) => (
  <div className="grid min-h-screen grid-cols-1 bg-white lg:h-screen lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] xl:grid-cols-2 dark:bg-gray-950">
    <aside className="relative hidden overflow-hidden bg-gray-950 px-12 py-10 text-white lg:flex lg:flex-col lg:justify-between xl:px-16">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-blue-600/25 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 -bottom-40 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl"
      />

      <Wordmark className="relative text-white" />
      <div className="relative max-w-md">{aside}</div>
      <p className="relative mb-0 text-base text-gray-500">
        © {new Date().getFullYear()} Orbit. All rights reserved.
      </p>
    </aside>

    <main className="relative flex flex-col lg:overflow-y-auto lg:border-l lg:border-transparent dark:lg:border-gray-800">
      <header className="flex items-center justify-between px-4 pt-4 sm:px-8 lg:justify-end">
        <Wordmark className="text-gray-900 lg:hidden dark:text-white" />
        <ThemeButton />
      </header>
      <div
        className={`flex flex-1 justify-center px-4 py-10 sm:px-8 ${contentClassName}`}
      >
        {children}
      </div>
    </main>
  </div>
);

export default AuthLayout;
