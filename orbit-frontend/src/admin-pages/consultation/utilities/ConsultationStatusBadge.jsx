// src/components/admin/consultation/ConsultationStatusBadge.jsx
const ConsultationStatusBadge = ({ status }) => {
    const getStatusConfig = (status) => {
        switch (status) {
            case 'scheduled':
                return {
                    color: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
                    icon: '⏰'
                };
            case 'completed':
                return {
                    color: 'bg-green-500/10 text-green-400 border border-green-500/20',
                    icon: '✅'
                };
            case 'cancelled':
                return {
                    color: 'bg-red-500/10 text-red-400 border border-red-500/20',
                    icon: '❌'
                };
            case 'no-show':
                return {
                    color: 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20',
                    icon: '⚠️'
                };
            default:
                return {
                    color: 'bg-gray-500/10 text-gray-400 border border-gray-500/20',
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