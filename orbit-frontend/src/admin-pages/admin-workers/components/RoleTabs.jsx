// Role filter for the workers list. The selected tab is sent to the API, so
// the list, its counts and the pagination all cover the same users.
const RoleTabs = ({ tabs, activeTab, onChange }) => (
  <div className="mb-2 flex flex-wrap gap-2" role="tablist" aria-label="Filter by role">
    {tabs.map(({ id, name, icon: Icon, count }) => {
      const active = activeTab === id;
      return (
        <button
          key={id}
          type="button"
          role="tab"
          aria-selected={active}
          onClick={() => onChange(id)}
          className={`flex items-center gap-2 rounded-sm px-4 py-2 transition-colors ${
            active
              ? "bg-blue-600 text-white dark:bg-blue-500"
              : "bg-white text-gray-700 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
          }`}
        >
          <Icon size={18} />
          <span className="text-sm md:text-base">{name}</span>
          <span
            className={`rounded-full px-2 py-0.5 text-xs ${
              active ? "bg-white/20" : "bg-gray-100 dark:bg-gray-700"
            }`}
          >
            {count}
          </span>
        </button>
      );
    })}
  </div>
);

export default RoleTabs;
