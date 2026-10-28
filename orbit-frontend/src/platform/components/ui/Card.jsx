// Surface for a block of content, with an optional header row
const Card = ({ title, description, action, children, className = "", bodyClassName = "p-5" }) => (
  <section
    className={`rounded-lg border border-zinc-200 bg-white shadow-xs dark:border-zinc-800 dark:bg-zinc-900 ${className}`}
  >
    {(title || action) && (
      <header className="flex items-start justify-between gap-4 border-b border-zinc-100 px-5 py-4 dark:border-zinc-800">
        <div className="min-w-0">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{title}</h2>
          {description && (
            <p className="mt-0.5 text-[13px] text-zinc-500 dark:text-zinc-400">{description}</p>
          )}
        </div>
        {action}
      </header>
    )}
    <div className={bodyClassName}>{children}</div>
  </section>
);

export default Card;
