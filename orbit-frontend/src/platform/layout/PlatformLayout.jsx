import { useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { Building2, LayoutGrid, PanelLeftClose, PanelLeftOpen, X } from "lucide-react";
import BrandMark, { BrandGlyph } from "../components/ui/BrandMark";
import Button from "../components/ui/Button";
import PlatformNavbar from "../components/PlatformNavbar";
import { focusRing } from "../components/ui/styles";

const NAV = [
  { to: "/platform", label: "Overview", icon: <LayoutGrid className="h-4 w-4 shrink-0" />, end: true },
  { to: "/platform/businesses", label: "Businesses", icon: <Building2 className="h-4 w-4 shrink-0" /> },
];

const COLLAPSED_KEY = "platform.sidebarCollapsed";

// Remembered per browser; storage can be unavailable (private mode etc.)
const readCollapsed = () => {
  try {
    return localStorage.getItem(COLLAPSED_KEY) === "true";
  } catch {
    return false;
  }
};

const writeCollapsed = (value) => {
  try {
    localStorage.setItem(COLLAPSED_KEY, String(value));
  } catch {
    // Not remembered; the toggle still works for this visit
  }
};

const Sidebar = ({ collapsed, footer }) => (
  <div className="flex h-full flex-col">
    <div
      className={`flex h-14 shrink-0 items-center border-b border-zinc-200 text-zinc-900 dark:border-zinc-800 dark:text-zinc-50 ${
        collapsed ? "justify-center px-0" : "px-5"
      }`}
    >
      {collapsed ? <BrandGlyph /> : <BrandMark />}
    </div>

    <nav className={`flex-1 space-y-0.5 overflow-y-auto py-4 ${collapsed ? "px-2" : "px-3"}`} aria-label="Console">
      {!collapsed && (
        <p className="px-2 pb-2 text-[11px] font-medium uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
          Platform
        </p>
      )}
      {NAV.map(({ to, label, icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          title={collapsed ? label : undefined}
          aria-label={collapsed ? label : undefined}
          className={({ isActive }) =>
            `flex items-center rounded-md py-2 text-sm transition-colors ${focusRing} ${
              collapsed ? "justify-center px-0" : "gap-2.5 px-2"
            } ${
              isActive
                ? "bg-zinc-100 font-medium text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50"
                : "text-zinc-600 hover:bg-zinc-100/70 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800/60 dark:hover:text-zinc-100"
            }`
          }
        >
          {icon}
          {!collapsed && label}
        </NavLink>
      ))}
    </nav>

    {footer && (
      <div className={`border-t border-zinc-200 dark:border-zinc-800 ${collapsed ? "p-2" : "p-3"}`}>{footer}</div>
    )}
  </div>
);

const PlatformLayout = () => {
  const location = useLocation();

  const [collapsed, setCollapsed] = useState(readCollapsed);
  const toggleCollapsed = () =>
    setCollapsed((value) => {
      writeCollapsed(!value);
      return !value;
    });

  // The mobile menu stays open only on the page it was opened from, so
  // navigating closes it
  const [menuOpenOn, setMenuOpenOn] = useState(null);
  const menuOpen = menuOpenOn === location.pathname;

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 antialiased dark:bg-zinc-950 dark:text-zinc-100">
      <aside
        className={`fixed inset-y-0 left-0 z-30 hidden border-r border-zinc-200 bg-white transition-[width] duration-200 lg:block dark:border-zinc-800 dark:bg-zinc-900 ${
          collapsed ? "w-16" : "w-60"
        }`}
      >
        <Sidebar
          collapsed={collapsed}
          footer={
            <Button
              variant="ghost"
              size={collapsed ? "icon" : "sm"}
              className={collapsed ? "mx-auto flex" : "w-full"}
              onClick={toggleCollapsed}
              title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {collapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
              {!collapsed && "Collapse"}
            </Button>
          }
        />
      </aside>

      {menuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-zinc-950/40"
            aria-label="Close menu"
            onClick={() => setMenuOpenOn(null)}
          />
          <aside className="absolute inset-y-0 left-0 w-64 border-r border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-3 top-3"
              onClick={() => setMenuOpenOn(null)}
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </Button>
            <Sidebar collapsed={false} />
          </aside>
        </div>
      )}

      <div className={`transition-[padding] duration-200 ${collapsed ? "lg:pl-16" : "lg:pl-60"}`}>
        <PlatformNavbar onOpenMenu={() => setMenuOpenOn(location.pathname)} />
        <main className="w-full px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default PlatformLayout;
