import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { Building2, LayoutDashboard, LogOut, Menu, Moon, Sun, X } from "lucide-react";
import { useTheme } from "../../context/theme-context/ThemeContext";
import { usePlatformAdmin, usePlatformLogout } from "../hooks/use-platform-auth";

const NAV = [
  { to: "/platform", label: "Overview", icon: <LayoutDashboard className="h-4 w-4" />, end: true },
  { to: "/platform/businesses", label: "Businesses", icon: <Building2 className="h-4 w-4" /> },
];

const PlatformLayout = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { isDarkMode, toggleTheme } = useTheme();
  const { data: admin } = usePlatformAdmin();
  const { mutate: logout } = usePlatformLogout();

  const signOut = () => logout(undefined, { onSettled: () => navigate("/platform/login") });

  const navLinks = (
    <nav className="flex flex-col gap-1 p-3">
      {NAV.map(({ to, label, icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          onClick={() => setMenuOpen(false)}
          className={({ isActive }) =>
            `flex items-center gap-2 px-3 py-2 text-sm rounded-sm ${
              isActive
                ? "bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400 font-medium"
                : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            }`
          }
        >
          {icon}
          {label}
        </NavLink>
      ))}
    </nav>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="sticky top-0 z-30 flex items-center justify-between gap-3 h-14 px-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="lg:hidden p-1 text-gray-600 dark:text-gray-300"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <span className="font-semibold text-gray-900 dark:text-white">Orbit</span>
          <span className="px-1.5 py-0.5 text-[11px] font-medium uppercase tracking-wide rounded-sm bg-gray-900 text-white dark:bg-white dark:text-gray-900">
            Platform
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="hidden sm:block text-sm text-gray-600 dark:text-gray-400">{admin?.email}</span>
          <button
            type="button"
            onClick={toggleTheme}
            className="p-2 rounded-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            aria-label="Toggle theme"
          >
            {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          <button
            type="button"
            onClick={signOut}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-sm rounded-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Sign out</span>
          </button>
        </div>
      </header>

      <div className="flex">
        <aside className="hidden lg:block w-56 shrink-0 min-h-[calc(100vh-3.5rem)] bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
          {navLinks}
        </aside>
        {menuOpen && (
          <aside className="lg:hidden fixed inset-x-0 top-14 z-20 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
            {navLinks}
          </aside>
        )}
        <main className="flex-1 min-w-0 p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default PlatformLayout;
