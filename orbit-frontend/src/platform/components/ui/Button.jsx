import { forwardRef } from "react";
import { focusRing } from "./styles";

const VARIANTS = {
  primary:
    "bg-zinc-900 text-white shadow-xs hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200",
  secondary:
    "border border-zinc-200 bg-white text-zinc-900 shadow-xs hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800",
  destructive: "bg-red-600 text-white shadow-xs hover:bg-red-700",
  ghost:
    "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100",
};

const SIZES = {
  sm: "h-8 px-2.5 text-[13px] gap-1.5",
  md: "h-9 px-3.5 text-sm gap-2",
  icon: "h-8 w-8 justify-center",
};

const Button = forwardRef(
  ({ variant = "secondary", size = "md", className = "", type = "button", ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      className={`inline-flex shrink-0 items-center rounded-md font-medium transition-colors disabled:pointer-events-none disabled:opacity-50 ${focusRing} ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...props}
    />
  ),
);

Button.displayName = "Button";

export default Button;
