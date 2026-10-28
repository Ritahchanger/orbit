// The orbit glyph on its own, for the collapsed sidebar
export const BrandGlyph = () => (
  <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden>
    <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeOpacity="0.35" strokeWidth="1.5" />
    <circle cx="12" cy="12" r="4" fill="currentColor" />
    <circle cx="20.5" cy="8.5" r="2" fill="currentColor" />
  </svg>
);

// The console's wordmark: the orbit glyph, "Orbit" and a "Console" label
const BrandMark = ({ inverted = false }) => (
  <span className="inline-flex items-center gap-2.5">
    <BrandGlyph />
    <span className="text-[15px] font-semibold tracking-tight">Orbit</span>
    <span
      className={`rounded border px-1.5 py-px text-[11px] font-medium ${
        inverted
          ? "border-white/20 text-white/70"
          : "border-zinc-200 text-zinc-500 dark:border-zinc-700 dark:text-zinc-400"
      }`}
    >
      Console
    </span>
  </span>
);

export default BrandMark;
