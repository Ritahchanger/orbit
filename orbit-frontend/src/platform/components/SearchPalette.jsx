import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Building2, CornerDownLeft, Loader2, Search, Store, UserRound } from "lucide-react";
import { usePlatformSearch } from "../hooks/use-platform-data";
import { BusinessStatus } from "./ui/StatusDot";
import { capitalise } from "../utils/format";

const GROUPS = [
  { key: "businesses", label: "Businesses", icon: <Building2 className="h-4 w-4" /> },
  { key: "stores", label: "Stores", icon: <Store className="h-4 w-4" /> },
  { key: "owners", label: "Owners", icon: <UserRound className="h-4 w-4" /> },
];

// Every result opens the business it belongs to
const toItem = (group, row) => {
  if (group === "businesses") {
    return {
      id: `b-${row._id}`,
      to: `/platform/businesses/${row._id}`,
      title: row.businessName,
      subtitle: [row.city, row.country].filter(Boolean).join(", "),
      meta: <BusinessStatus status={row.status} />,
    };
  }
  if (group === "stores") {
    return {
      id: `s-${row._id}`,
      to: `/platform/businesses/${row.businessId}`,
      title: row.name,
      subtitle: `${row.code} · ${row.businessName}`,
      meta: <span className="text-xs text-zinc-500 dark:text-zinc-400">{capitalise(row.status)}</span>,
    };
  }
  return {
    id: `o-${row._id}-${row.businessId}`,
    to: `/platform/businesses/${row.businessId}`,
    title: row.name,
    subtitle: `Owner of ${row.businessName}`,
  };
};

const useDebounced = (value, delay) => {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
};

/**
 * Quick search across businesses, stores and business owners. Owners are
 * matched by name and shown only with the business they own.
 */
const SearchPalette = ({ onClose }) => {
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const listRef = useRef(null);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const debounced = useDebounced(query.trim(), 200);
  const { data, isFetching, error } = usePlatformSearch(debounced);

  const ready = debounced.length >= 2;

  // Flat list for keyboard navigation, then a final "see all" row
  // Each item carries its position in the flat list for keyboard navigation
  const groups = useMemo(() => {
    if (!ready || !data) return [];
    let position = 0;
    return GROUPS.map((g) => ({
      ...g,
      items: (data[g.key] || []).map((row) => ({ ...toItem(g.key, row), index: position++ })),
    })).filter((g) => g.items.length);
  }, [data, ready]);
  const items = useMemo(() => {
    const flat = groups.flatMap((g) => g.items);
    if (ready) {
      flat.push({
        id: "all",
        to: `/platform/businesses?search=${encodeURIComponent(debounced)}`,
        title: `See all businesses matching "${debounced}"`,
      });
    }
    return flat;
  }, [groups, ready, debounced]);

  const activeIndex = Math.min(active, Math.max(items.length - 1, 0));

  useEffect(() => {
    listRef.current?.querySelector(`[data-index="${activeIndex}"]`)?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  const go = (item) => {
    if (!item) return;
    navigate(item.to);
    onClose();
  };

  const onKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, items.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      go(items[activeIndex]);
    } else if (e.key === "Escape") {
      e.preventDefault();
      onClose();
    }
  };

  const optionClass = (index) =>
    `flex w-full cursor-pointer items-center gap-3 rounded-md px-3 py-2 text-left ${
      index === activeIndex ? "bg-zinc-100 dark:bg-zinc-800" : ""
    }`;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center px-4 pt-[12vh]">
      <button
        type="button"
        className="absolute inset-0 bg-zinc-950/50 backdrop-blur-[2px]"
        aria-label="Close search"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Search"
        className="relative w-full max-w-xl overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-900"
      >
        <div className="flex items-center gap-3 border-b border-zinc-200 px-4 dark:border-zinc-800">
          {isFetching ? (
            <Loader2 className="h-4 w-4 shrink-0 animate-spin text-zinc-400" aria-hidden />
          ) : (
            <Search className="h-4 w-4 shrink-0 text-zinc-400" aria-hidden />
          )}
          <input
            ref={inputRef}
            autoFocus
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActive(0);
            }}
            onKeyDown={onKeyDown}
            placeholder="Search businesses, stores or owners…"
            className="h-12 w-full bg-transparent text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none dark:text-zinc-100"
            role="combobox"
            aria-expanded={items.length > 0}
            aria-controls="platform-search-results"
            aria-activedescendant={items[activeIndex] ? `search-option-${activeIndex}` : undefined}
          />
          <kbd className="hidden shrink-0 rounded border border-zinc-200 px-1.5 font-mono text-[11px] text-zinc-400 sm:block dark:border-zinc-700">
            Esc
          </kbd>
        </div>

        <div ref={listRef} id="platform-search-results" role="listbox" className="max-h-[50vh] overflow-y-auto p-2">
          {!ready ? (
            <p className="px-3 py-8 text-center text-sm text-zinc-500 dark:text-zinc-400">
              Type at least 2 characters to search names, emails, registration numbers, cities, store names and codes,
              and owners' names.
            </p>
          ) : error ? (
            <p className="px-3 py-8 text-center text-sm text-red-600 dark:text-red-400">{error.message}</p>
          ) : (
            <>
              {data && groups.length === 0 && !isFetching && (
                <p className="px-3 py-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
                  Nothing matches "{debounced}".
                </p>
              )}
              {groups.map((group) => (
                <div key={group.key} className="mb-1" role="group" aria-label={group.label}>
                  <p className="px-3 pb-1 pt-2 text-[11px] font-medium uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                    {group.label}
                  </p>
                  {group.items.map((item) => {
                    const i = item.index;
                    return (
                      <div
                        key={item.id}
                        id={`search-option-${i}`}
                        data-index={i}
                        role="option"
                        aria-selected={i === activeIndex}
                        className={optionClass(i)}
                        onMouseMove={() => setActive(i)}
                        onClick={() => go(item)}
                      >
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-zinc-200 text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
                          {group.icon}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-medium text-zinc-900 dark:text-zinc-100">
                            {item.title}
                          </span>
                          {item.subtitle && (
                            <span className="block truncate text-xs text-zinc-500 dark:text-zinc-400">
                              {item.subtitle}
                            </span>
                          )}
                        </span>
                        {item.meta}
                      </div>
                    );
                  })}
                </div>
              ))}
              {(() => {
                const i = items.length - 1;
                return (
                  <div
                    id={`search-option-${i}`}
                    data-index={i}
                    role="option"
                    aria-selected={i === activeIndex}
                    className={`${optionClass(i)} mt-1 text-sm text-zinc-600 dark:text-zinc-400`}
                    onMouseMove={() => setActive(i)}
                    onClick={() => go(items[i])}
                  >
                    <ArrowRight className="h-4 w-4 shrink-0" aria-hidden />
                    <span className="truncate">{items[i].title}</span>
                  </div>
                );
              })()}
            </>
          )}
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-zinc-200 bg-zinc-50 px-4 py-2 text-[11px] text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-400">
          <span className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="rounded border border-zinc-200 bg-white px-1 font-mono dark:border-zinc-700 dark:bg-zinc-900">↑</kbd>
              <kbd className="rounded border border-zinc-200 bg-white px-1 font-mono dark:border-zinc-700 dark:bg-zinc-900">↓</kbd>
              to move
            </span>
            <span className="flex items-center gap-1">
              <CornerDownLeft className="h-3 w-3" aria-hidden /> to open
            </span>
          </span>
          <span>Owners show by name and business only</span>
        </div>
      </div>
    </div>
  );
};

export default SearchPalette;
