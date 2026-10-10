// src/components/admin/consultation/ConsultationStatusBadge.jsx
const ConsultationStatusBadge = ({ status }) => {
    const getStatusConfig = (status) => {
        switch (status) {
            case 'scheduled':
                return {
                    color: 'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-500/30',
                    icon: '⏰'
                };
            case 'completed':
                return {
                    color: 'bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-500/30',
                    icon: '✅'
                };
            case 'cancelled':
                return {
                    color: 'bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-500/30',
                    icon: '❌'
                };
            case 'no-show':
                return {
                    color: 'bg-yellow-50 dark:bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-500/30',
                    icon: '⚠️'
                };
            default:
                return {
                    color: 'bg-gray-50 dark:bg-gray-500/10 text-gray-700 dark:text-gray-400 border border-gray-200 dark:border-gray-500/30',
                    icon: '📝'
                };
        }
    };

    const config = getStatusConfig(status);

    return (
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${config.color}`}>
            <span className="mr-1">{config.icon}</span>
            {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
    );
};

export default ConsultationStatusBadge;