// A titled card inside the user details drawer
const DetailSection = ({ icon: Icon, title, children, tone = "default" }) => (
  <section
    className={`rounded-lg border bg-white p-4 dark:bg-gray-800 ${
      tone === "danger"
        ? "border-red-200 dark:border-red-500/30"
        : "border-gray-200 dark:border-gray-700"
    }`}
  >
    <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white">
      {Icon && (
        <Icon
          size={16}
          className={
            tone === "danger"
              ? "text-red-600 dark:text-red-400"
              : "text-gray-500 dark:text-gray-400"
          }
        />
      )}
      {title}
    </h3>
    {children}
  </section>
);

export default DetailSection;
