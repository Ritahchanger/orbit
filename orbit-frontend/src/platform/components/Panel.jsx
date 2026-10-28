// A titled card section
const Panel = ({ title, action, children, className = "" }) => (
  <section
    className={`bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-sm ${className}`}
  >
    {(title || action) && (
      <header className="flex items-center justify-between gap-3 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-white">{title}</h2>
        {action}
      </header>
    )}
    <div className="p-4">{children}</div>
  </section>
);

export default Panel;
