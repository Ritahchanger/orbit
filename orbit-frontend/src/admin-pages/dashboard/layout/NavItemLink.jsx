import { Link } from "react-router-dom";

const VARIANTS = {
  desktop: {
    base: "flex items-center gap-2 rounded-sm px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors",
    active: "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400",
    idle: "text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-900 dark:hover:text-white",
    icon: "h-4 w-4 shrink-0",
    // Nine labelled links plus the actions need ~1,700px. Narrower than that,
    // links show just their icon (name on hover); the current page keeps its label.
    label: (active) => (active ? "" : "hidden min-[1700px]:inline"),
  },
  mobile: {
    base: "flex items-center gap-3 rounded-sm px-4 py-3 text-sm transition-colors",
    active:
      "border border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-400",
    idle: "text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white",
    icon: "h-5 w-5",
    label: () => "",
  },
};

// One admin menu link, shared by the desktop navbar and the mobile menu
const NavItemLink = ({ item, active, variant = "desktop", onClick }) => {
  const styles = VARIANTS[variant];
  const Icon = item.icon;
  return (
    <Link
      to={item.path}
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      aria-label={item.name}
      title={item.name}
      className={`${styles.base} ${active ? styles.active : styles.idle}`}
    >
      <Icon className={styles.icon} aria-hidden="true" />
      <span className={styles.label(active)}>{item.name}</span>
    </Link>
  );
};

export default NavItemLink;
