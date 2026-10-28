import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { LogOut, Menu, Moon, Search, Sun } from "lucide-react";
import { useTheme } from "../../context/theme-context/ThemeContext";
import { usePlatformAdmin, usePlatformLogout } from "../hooks/use-platform-auth";
import Avatar from "./ui/Avatar";
import BrandMark from "./ui/BrandMark";
import Button from "./ui/Button";
import SearchPalette from "./SearchPalette";
import { focusRing } from "./ui/styles";

const isTyping = (target) =>
  ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName) || target.isContentEditable;

const isMac = typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform);

// Opens the search palette; "/" or Ctrl/⌘+K open it from anywhere
const SearchTrigger = () => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKey = (e) => {
      const shortcut = (e.key === "k" || e.key === "K") && (e.metaKey || e.ctrlKey);
      if (shortcut || (e.key === "/" && !isTyping(e.target))) {
        e.preventDefault();
        setOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`flex h-9 w-full max-w-md items-center gap-2 rounded-md border border-zinc-200 bg-zinc-50 px-3 text-sm text-zinc-400 shadow-xs transition-colors hover:border-zinc-300 hover:bg-white dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-700 ${focusRing}`}
      >
        <Search className="h-4 w-4 shrink-0" aria-hidden />
        <span className="flex-1 truncate text-left">Search businesses, stores, owners…</span>
        <kbd className="hidden shrink-0 rounded border border-zinc-200 bg-white px-1.5 font-mono text-[11px] sm:block dark:border-zinc-700 dark:bg-zinc-900">
          {isMac ? "⌘K" : "Ctrl K"}
        </kbd>
      </button>
      {/* Portalled to <body>: the navbar's backdrop-blur would otherwise
          become the containing block for the palette's fixed overlay */}
      {open && createPortal(<SearchPalette onClose={() => setOpen(false)} />, document.body)}
    </>
  );
};

const menuItemClass =
  "flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm outline-none select-none data-[highlighted]:bg-zinc-100 dark:data-[highlighted]:bg-zinc-800";

const AccountMenu = () => {
  const navigate = useNavigate();
  const { data: admin } = usePlatformAdmin();
  const { mutate: logout } = usePlatformLogout();
  const name = `${admin?.firstName || ""} ${admin?.lastName || ""}`.trim();

  return (
    <DropdownMenu.Root modal={false}>
      <DropdownMenu.Trigger asChild>
        <button type="button" className={`rounded-md p-0.5 ${focusRing}`} aria-label="Account menu">
          <Avatar name={name} />
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={8}
          className="z-50 min-w-56 rounded-md border border-zinc-200 bg-white p-1 text-zinc-700 shadow-lg dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300"
        >
          <div className="px-2 py-2">
            <p className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-100">{name || "Platform admin"}</p>
            <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">{admin?.email}</p>
          </div>
          <DropdownMenu.Separator className="my-1 h-px bg-zinc-200 dark:bg-zinc-800" />
          <DropdownMenu.Item
            className={menuItemClass}
            onSelect={() => logout(undefined, { onSettled: () => navigate("/platform/login") })}
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
};

/**
 * Top bar of the console. `actions` is the slot for platform-wide
 * operations (e.g. exports, announcements) as they're added; it renders
 * before the theme toggle and account menu.
 */
const PlatformNavbar = ({ onOpenMenu, actions }) => {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-zinc-200 bg-white/85 px-4 backdrop-blur supports-[backdrop-filter]:bg-white/70 sm:px-6 lg:px-8 dark:border-zinc-800 dark:bg-zinc-900/85 dark:supports-[backdrop-filter]:bg-zinc-900/70">
      <div className="flex items-center gap-2 lg:hidden">
        <Button variant="ghost" size="icon" onClick={onOpenMenu} aria-label="Open menu">
          <Menu className="h-5 w-5" />
        </Button>
        <span className="hidden text-zinc-900 sm:block dark:text-zinc-50">
          <BrandMark />
        </span>
      </div>

      <div className="flex min-w-0 flex-1">
        <SearchTrigger />
      </div>

      <div className="flex shrink-0 items-center gap-1.5">
        {actions}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          title={isDarkMode ? "Light theme" : "Dark theme"}
          aria-label={isDarkMode ? "Switch to light theme" : "Switch to dark theme"}
        >
          {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
        <span className="mx-1 h-5 w-px bg-zinc-200 dark:bg-zinc-800" aria-hidden />
        <AccountMenu />
      </div>
    </header>
  );
};

export default PlatformNavbar;
