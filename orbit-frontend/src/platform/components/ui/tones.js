// Dot colours for status and chart segments. Class names are written out in
// full so Tailwind can find them.
const DOTS = {
  green: "bg-emerald-500",
  amber: "bg-amber-500",
  red: "bg-red-500",
  blue: "bg-sky-500",
  gray: "bg-zinc-400 dark:bg-zinc-500",
};

export const dotClass = (tone) => DOTS[tone] || DOTS.gray;
