import { Users, Shield, UserCog, Layers, TrendingUp, TrendingDown } from "lucide-react"

const StatisticsCard = ({ title, value, icon: Icon, color, loading = false, trend = null }) => {
    const getTrendIcon = () => {
        if (!trend) return null
        if (trend > 0) {
            return <TrendingUp className="h-4 w-4 text-green-400" />
        } else if (trend < 0) {
            return <TrendingDown className="h-4 w-4 text-red-400" />
        }
        return null
    }

    const getTrendText = () => {
        if (!trend) return null
        if (trend > 0) {
            return <span className="text-green-400">+{trend}</span>
        } else if (trend < 0) {
            return <span className="text-red-400">{trend}</span>
        }
        return null
    }

    if (loading) {
        return (
            <div className="bg-gray-800/50 border border-gray-700 rounded-sm p-4">
                <div className="flex items-center justify-between mb-3">
                    <div className="h-4 w-24 bg-gray-700 rounded animate-pulse"></div>
                    <div className="h-6 w-6 bg-gray-700 rounded-full animate-pulse"></div>
                </div>
                <div className="h-8 w-16 bg-gray-700 rounded animate-pulse"></div>
            </div>
        )
    }

    return (
        <div className="bg-gray-800/50 border border-gray-700 rounded-sm p-4 hover:border-gray-600 transition-colors">
            <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-300">{title}</h3>
                <div className={`p-2 rounded-sm ${color.split(' ')[0]}`}>
                    <Icon className="h-4 w-4" />
                </div>
            </div>
            <div className="flex items-end justify-between">
                <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-white">{value}</span>
                    {trend !== null && getTrendText() && (
                        <div className="flex items-center gap-1">
                            {getTrendIcon()}
                            <span className="text-xs">{getTrendText()}</span>
                        </div>
                    )}
                </div>
                {trend !== null && (
                    <div className="text-xs text-gray-500">
                        vs last period
                    </div>
                )}
            </div>
        </div>
    )
}

export default StatisticsCard