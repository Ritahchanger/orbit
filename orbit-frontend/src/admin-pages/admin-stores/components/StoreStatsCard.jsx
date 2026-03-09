const StoreStatsCard = ({ title, value, icon, color, description, trend }) => {
    const colorClasses = {
        blue: {
            bg: 'bg-blue-100 dark:bg-blue-900/20',
            text: 'text-blue-700 dark:text-blue-400',
            border: 'border-blue-300 dark:border-blue-800/30',
            trend: 'text-green-600 dark:text-green-400'
        },
        green: {
            bg: 'bg-green-100 dark:bg-green-900/20',
            text: 'text-green-700 dark:text-green-400',
            border: 'border-green-300 dark:border-green-800/30',
            trend: 'text-green-600 dark:text-green-400'
        },
        orange: {
            bg: 'bg-orange-100 dark:bg-orange-900/20',
            text: 'text-orange-700 dark:text-orange-400',
            border: 'border-orange-300 dark:border-orange-800/30',
            trend: 'text-green-600 dark:text-green-400'
        },
        purple: {
            bg: 'bg-purple-100 dark:bg-purple-900/20',
            text: 'text-purple-700 dark:text-purple-400',
            border: 'border-purple-300 dark:border-purple-800/30',
            trend: 'text-green-600 dark:text-green-400'
        },
        red: {
            bg: 'bg-red-100 dark:bg-red-900/20',
            text: 'text-red-700 dark:text-red-400',
            border: 'border-red-300 dark:border-red-800/30',
            trend: 'text-green-600 dark:text-green-400'
        },
    };

    const colorSet = colorClasses[color] || colorClasses.blue;

    return (
        <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-sm p-4 hover:shadow-sm transition-shadow duration-200">
            <div className="flex items-center justify-between mb-3">
                <div className={`p-2.5 rounded-sm ${colorSet.bg} ${colorSet.border} border`}>
                    <div className={colorSet.text}>
                        {icon}
                    </div>
                </div>
                {trend && (
                    <span className={`text-xs font-medium ${colorSet.trend}`}>
                        {trend}
                    </span>
                )}
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{value}</p>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{title}</p>
            {description && (
                <p className="text-xs text-gray-600 dark:text-gray-500 mt-1">{description}</p>
            )}
        </div>
    );
};

export default StoreStatsCard;