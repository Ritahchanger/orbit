import { Layers } from "lucide-react";

// The "All stores" choice in the store switcher. One component for the three
// places the switcher appears, so they look and behave the same:
//   chip   - the button row in the store strip
//   menu   - the quick-switch dropdown in the strip
//   mobile - the store list in the mobile menu
const AllStoresOption = ({ active, onSelect, storeCount, variant = "chip" }) => {
    if (variant === "menu") {
        return (
            <button
                onClick={onSelect}
                className={`w-full text-left px-4 py-2.5 text-sm flex items-center justify-between transition-colors duration-150 border-b border-gray-200 dark:border-gray-700 ${active
                    ? "bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-600/10 dark:to-indigo-600/10 border-l-2 border-l-blue-500"
                    : "hover:bg-gray-50 dark:hover:bg-gray-800/50"
                    }`}
                title="Show every store on dashboards and reports"
            >
                <div className="flex items-center gap-2">
                    <Layers size={14} className={active ? "text-blue-600 dark:text-blue-400" : "text-gray-500 dark:text-gray-400"} />
                    <div>
                        <p className={`text-sm font-medium ${active ? "text-blue-600 dark:text-blue-400 font-semibold" : "text-gray-800 dark:text-white"}`}>
                            All stores
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">{storeCount} stores combined</p>
                    </div>
                </div>
                {active && <div className="w-2 h-2 rounded-sm bg-blue-600 dark:bg-blue-400"></div>}
            </button>
        );
    }

    if (variant === "mobile") {
        return (
            <button
                onClick={onSelect}
                className={`w-full text-left px-4 py-3 border-b border-gray-200 dark:border-gray-600 flex items-center justify-between transition-colors ${active ? "bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400" : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"}`}
            >
                <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 flex items-center justify-center rounded-sm ${active ? "bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400" : "bg-gray-100 dark:bg-gray-600 text-gray-500 dark:text-gray-400"}`}>
                        <Layers size={14} />
                    </div>
                    <div className="text-left">
                        <p className="text-xs font-medium">All stores</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{storeCount} stores combined</p>
                    </div>
                </div>
                {active && <div className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400"></div>}
            </button>
        );
    }

    return (
        <button
            onClick={onSelect}
            className={`px-3 py-2 rounded-sm text-sm font-medium transition-all whitespace-nowrap flex items-center gap-2 shadow-sm flex-shrink-0 ${active
                ? "bg-linear-to-r from-blue-600 to-indigo-600 text-white shadow-md border border-blue-500/30"
                : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white border border-gray-300 dark:border-gray-700"
                }`}
            title="Show every store on dashboards and reports"
        >
            <Layers size={14} />
            <span className="font-medium">All</span>
        </button>
    );
};

export default AllStoresOption;
