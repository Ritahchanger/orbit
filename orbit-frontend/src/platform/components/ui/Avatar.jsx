import { initials } from "../../utils/format";

// Initials monogram for a business or person
const SIZES = { sm: "h-8 w-8 text-xs", md: "h-10 w-10 text-sm", lg: "h-12 w-12 text-base" };

const Avatar = ({ name, size = "sm" }) => (
  <span
    className={`inline-flex shrink-0 items-center justify-center rounded-md border border-zinc-200 bg-zinc-50 font-semibold text-zinc-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 ${SIZES[size]}`}
    aria-hidden
  >
    {initials(name)}
  </span>
);

export default Avatar;
