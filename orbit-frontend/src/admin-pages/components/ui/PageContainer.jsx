// Standard admin page shell: one inset, background and section rhythm for every page.
const PageContainer = ({ children, className = "" }) => (
  <div
    className={`min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white p-4 sm:p-6 space-y-4 ${className}`}
  >
    {children}
  </div>
);

export default PageContainer;
