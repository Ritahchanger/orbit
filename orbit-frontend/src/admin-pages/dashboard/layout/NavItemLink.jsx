import { Link } from "react-router-dom";

const VARIANTS = {
  desktop: {
    base: "flex items-center gap-2 rounded-sm px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors",
    active: "bg-blue-600 text-white",
    idle: "text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white",
    icon: "h-4 w-4",
  },
  mobile: {
    base: "flex items-center gap-3 rounded-sm px-4 py-3 text-sm transition-colors",
    active:
      "border border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-400",
    idle: "text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white",
    icon: "h-5 w-5",
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
      className={`${styles.base} ${active ? styles.active : styles.idle}`}
    >
      <Icon className={styles.icon} />
      {item.name}
    </Link>
  );
};

export default NavItemLink;
