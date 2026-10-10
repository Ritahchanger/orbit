// Standard surface for panels, tables and filter bars.
const Card = ({ children, className = "", padded = true, ...rest }) => (
  <div
    className={`bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-sm ${padded ? "p-4" : "overflow-hidden"} ${className}`}
    {...rest}
  >
    {children}
  </div>
);

export default Card;
