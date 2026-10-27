import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, Layers, Search, Store } from "lucide-react";

// Searchable store picker: the one place to choose which store the admin is
// looking at. Lists "All stores" (when allowed) and every accessible store by
// name and code. With a single store it is a read-only label.
const StoreSwitcher = ({
  stores,
  currentStore,
  isAllStores,
  canViewAllStores,
  onSelectStore,
  onSelectAll,
  label = "Store",
  fullWidth = false,
}) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const rootRef = useRef(null);
  const searchRef = useRef(null);

  const canSwitch = stores.length > 1;
  const showSearch = stores.length > 5;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return stores;
    return stores.filter(
      (s) =>
        s.name?.toLowerCase().includes(q) || s.code?.toLowerCase().includes(q),
    );
  }, [stores, query]);

  const showAllOption =
    canViewAllStores && (!query.trim() || "all stores".includes(query.trim().toLowerCase()));

  const close = () => {
    setOpen(false);
    setQuery("");
  };

  // Close on outside click and Escape
  useEffect(() => {
    if (!open) return undefined;
    const handlePointer = (e) => {
      if (!rootRef.current?.contains(e.target)) close();
    };
    const handleKey = (e) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("mousedown", handlePointer);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handlePointer);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  useEffect(() => {
    if (open && showSearch) searchRef.current?.focus();
  }, [open, showSearch]);

  const selectStore = (id) => {
    onSelectStore(id);
    close();
  };
  const selectAll = () => {
    onSelectAll();
    close();
  };

  const handleSearchKeyDown = (e) => {
    if (e.key !== "Enter") return;
    e.preventDefault();
    if (filtered[0]) selectStore(filtered[0]._id);
    else if (showAllOption) selectAll();
  };

  const currentLabel = isAllStores
    ? "All stores"
    : currentStore?.name || "No store selected";
  const currentCode = isAllStores ? null : currentStore?.code;

  const trigger = (
    <>
      {isAllStores ? (
        <Layers size={16} className="shrink-0 text-blue-600 dark:text-blue-400" />
      ) : (
        <Store size={16} className="shrink-0 text-blue-600 dark:text-blue-400" />
      )}
      <span className="shrink-0 text-xs text-gray-500 dark:text-gray-400">
        {label}:
      </span>
      <span className="truncate text-sm font-semibold text-gray-900 dark:text-white">
        {currentLabel}
      </span>
      {currentCode && (
        <span className="hidden shrink-0 text-xs text-gray-500 sm:inline dark:text-gray-400">
          {currentCode}
        </span>
      )}
    </>
  );

  const triggerClass = `flex h-9 min-w-0 items-center gap-2 rounded-sm border border-gray-300 bg-white px-3 dark:border-gray-700 dark:bg-gray-800 ${
    fullWidth ? "w-full" : "max-w-xs sm:max-w-sm"
  }`;

  if (!canSwitch) {
    return <div className={triggerClass}>{trigger}</div>;
  }

  const optionClass = (active) =>
    `flex w-full items-center gap-3 rounded-sm px-3 py-2 text-left transition-colors ${
      active
        ? "bg-blue-50 dark:bg-blue-500/10"
        : "hover:bg-gray-100 dark:hover:bg-gray-700/60"
    }`;

  return (
    <div ref={rootRef} className={`relative ${fullWidth ? "w-full" : ""}`}>
      <button
        type="button"
        onClick={() => (open ? close() : setOpen(true))}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={`${triggerClass} transition-colors hover:border-gray-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:hover:border-gray-600`}
      >
        {trigger}
        <ChevronDown
          size={16}
          className={`ml-auto shrink-0 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div
          className={`absolute left-0 z-50 mt-1 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800 ${
            fullWidth ? "w-full" : "w-80"
          }`}
        >
          {showSearch && (
            <div className="border-b border-gray-200 p-2 dark:border-gray-700">
              <div className="relative">
                <Search
                  size={14}
                  className="pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 text-gray-400"
                />
                <input
                  ref={searchRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleSearchKeyDown}
                  placeholder="Search stores"
                  className="h-8 w-full rounded-sm border border-gray-300 bg-white pr-2 pl-8 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-900 dark:text-white"
                />
              </div>
            </div>
          )}

          <ul role="listbox" className="max-h-72 overflow-y-auto p-1">
            {showAllOption && (
              <li>
                <button
                  type="button"
                  role="option"
                  aria-selected={isAllStores}
                  onClick={selectAll}
                  className={optionClass(isAllStores)}
                >
                  <Layers size={16} className="shrink-0 text-gray-500 dark:text-gray-400" />
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium text-gray-900 dark:text-white">
                      All stores
                    </span>
                    <span className="block text-xs text-gray-500 dark:text-gray-400">
                      {stores.length} stores combined
                    </span>
                  </span>
                  {isAllStores && (
                    <Check size={16} className="shrink-0 text-blue-600 dark:text-blue-400" />
                  )}
                </button>
              </li>
            )}

            {filtered.map((store) => {
              const active = !isAllStores && currentStore?._id === store._id;
              return (
                <li key={store._id}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={active}
                    onClick={() => selectStore(store._id)}
                    className={optionClass(active)}
                  >
                    <Store size={16} className="shrink-0 text-gray-500 dark:text-gray-400" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-gray-900 dark:text-white">
                        {store.name}
                      </span>
                      {store.code && (
                        <span className="block text-xs text-gray-500 dark:text-gray-400">
                          {store.code}
                        </span>
                      )}
                    </span>
                    {active && (
                      <Check size={16} className="shrink-0 text-blue-600 dark:text-blue-400" />
                    )}
                  </button>
                </li>
              );
            })}

            {filtered.length === 0 && !showAllOption && (
              <li className="px-3 py-6 text-center text-sm text-gray-500 dark:text-gray-400">
                No stores match "{query.trim()}"
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default StoreSwitcher;
