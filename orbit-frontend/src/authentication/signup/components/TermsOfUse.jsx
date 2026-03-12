import { useState, useEffect, useRef } from "react";
import { CheckCircle, AlertCircle, X, ChevronDown, Shield } from "lucide-react";
import { SECTIONS } from "./data";

export default function TermsModal({ isOpen, onAccept, onDecline }) {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const [activeSection, setActiveSection] = useState("acceptance");
  const [expandedSections, setExpandedSections] = useState({
    acceptance: true,
  });
  const scrollRef = useRef(null);
  const sectionRefs = useRef({});

  useEffect(() => {
    if (isOpen) {
      setScrollProgress(0);
      setHasScrolledToBottom(false);
      setActiveSection("acceptance");
      setExpandedSections({ acceptance: true });
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Esc key to close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) onDecline();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onDecline]);

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const progress = el.scrollTop / (el.scrollHeight - el.clientHeight);
    setScrollProgress(Math.min(progress * 100, 100));
    if (progress > 0.95) setHasScrolledToBottom(true);

    for (const section of SECTIONS) {
      const ref = sectionRefs.current[section.id];
      if (ref) {
        const rect = ref.getBoundingClientRect();
        const containerRect = el.getBoundingClientRect();
        if (
          rect.top >= containerRect.top &&
          rect.top <= containerRect.top + 200
        ) {
          setActiveSection(section.id);
          break;
        }
      }
    }
  };

  const toggleSection = (id) => {
    setExpandedSections((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const scrollToSection = (id) => {
    sectionRefs.current[id]?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
    setExpandedSections((prev) => ({ ...prev, [id]: true }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onDecline}
      />

      {/* Modal */}
      <div
        className="terms-modal-content relative w-full max-w-7xl bg-white dark:bg-gray-800 rounded-sm shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col"
        style={{ height: "90vh" }}
      >
        {/* ── Header ── */}
        <div className="flex-shrink-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-sm bg-gradient-to-r from-purple-500 to-pink-500">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                  Orbit Business Terms
                </h2>
                <div className="flex items-center space-x-2">
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                    Please read carefully before registering your business
                  </p>
                  <span className="px-2 py-0.5 text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full">
                    v2.1 · 2026
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={onDecline}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-sm transition-colors"
              aria-label="Close terms"
            >
              <X className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600 dark:text-gray-400" />
            </button>
          </div>

          {/* Progress bar */}
          <div className="mt-4">
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                Reading progress
              </span>
              <span
                className={`text-xs font-mono ${
                  scrollProgress > 95
                    ? "text-green-600 dark:text-green-400"
                    : "text-gray-600 dark:text-gray-400"
                }`}
              >
                {Math.round(scrollProgress)}%
              </span>
            </div>
            <div className="h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-150 ${
                  scrollProgress > 95
                    ? "bg-gradient-to-r from-green-500 to-blue-500"
                    : "bg-gradient-to-r from-purple-500 to-pink-500"
                }`}
                style={{ width: `${scrollProgress}%` }}
              />
            </div>
          </div>
        </div>

        {/* ── Body ── */}
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <div className="w-48 flex-shrink-0 border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 overflow-y-auto py-3 h-full">
            {SECTIONS.map((s) => {
              const Icon = s.icon;
              const isActive = activeSection === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => scrollToSection(s.id)}
                  className={`w-full px-4 py-2 text-left flex items-center gap-2 transition-all ${
                    isActive
                      ? "bg-purple-50 dark:bg-purple-900/20 border-l-2 border-purple-600 dark:border-purple-400 text-purple-700 dark:text-purple-300"
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                  }`}
                >
                  <Icon size={14} className="flex-shrink-0" />
                  <span className="text-xs font-medium truncate">
                    {s.title.replace(/^\d+\.\s/, "")}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Scrollable content */}
          <div
            ref={scrollRef}
            onScroll={handleScroll}
            className="flex-1 overflow-y-auto p-6 h-full"
          >
            {SECTIONS.map((section) => {
              const Icon = section.icon;
              const isExpanded = expandedSections[section.id];
              return (
                <div
                  key={section.id}
                  ref={(el) => (sectionRefs.current[section.id] = el)}
                  className="mb-4"
                >
                  <button
                    onClick={() => toggleSection(section.id)}
                    className={`w-full p-4 border rounded-sm transition-all flex items-center justify-between ${
                      isExpanded
                        ? "bg-purple-50 dark:bg-purple-900/10 border-purple-300 dark:border-purple-700"
                        : "bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-700"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-1.5 rounded-sm ${
                          isExpanded
                            ? "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400"
                            : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400"
                        }`}
                      >
                        <Icon size={16} />
                      </div>
                      <span
                        className={`text-sm font-semibold ${
                          isExpanded
                            ? "text-gray-900 dark:text-white"
                            : "text-gray-700 dark:text-gray-300"
                        }`}
                      >
                        {section.title}
                      </span>
                    </div>
                    <ChevronDown
                      size={16}
                      className={`text-gray-500 transition-transform duration-200 ${
                        isExpanded ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {isExpanded && (
                    <div className="p-4 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 border-t-0 rounded-b-sm">
                      {section.content.split("\n\n").map((para, i) => (
                        <p
                          key={i}
                          className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-3 last:mb-0 whitespace-pre-line"
                        >
                          {para}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            {/* End marker */}
            <div className="mt-6 p-4 text-center border border-gray-200 dark:border-gray-700 rounded-sm bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20">
              <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600 dark:text-gray-400">
                You've reached the end of the Terms of Service
              </p>
            </div>
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="flex-shrink-0 border-t border-gray-200 dark:border-gray-700 px-6 py-4 bg-gray-50 dark:bg-gray-900">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              {!hasScrolledToBottom ? (
                <>
                  <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400 flex-shrink-0" />
                  <span className="text-xs text-gray-600 dark:text-gray-400">
                    Scroll through all sections to enable acceptance
                  </span>
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                  <span className="text-xs text-green-600 dark:text-green-400">
                    You've reviewed the full Terms of Service
                  </span>
                </>
              )}
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <button
                onClick={onDecline}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Decline
              </button>
              <button
                onClick={hasScrolledToBottom ? onAccept : undefined}
                disabled={!hasScrolledToBottom}
                className={`px-5 py-2 text-sm font-medium rounded-sm flex items-center gap-2 transition-all ${
                  hasScrolledToBottom
                    ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md hover:shadow-lg hover:opacity-90"
                    : "bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                }`}
              >
                <Shield size={14} />I Accept These Terms
              </button>
            </div>
          </div>

          <div className="mt-2 text-center">
            <span className="text-xs text-gray-500 dark:text-gray-500">
              Press{" "}
              <kbd className="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-700 rounded border border-gray-300 dark:border-gray-600 text-xs">
                Esc
              </kbd>{" "}
              to close
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
