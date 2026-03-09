import { BarChart3, Minimize2, Maximize2, PieChartIcon } from "lucide-react"
import ChartWrapper from "./Charts/ChartWrapper"

const TopProductsComponent = ({ showFullChart, topProductsChartConfig, chartType, timeRange, setShowFullChart, categoryChartConfig }) => {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
            {/* Top Products Performance */}
            <div className={`bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-sm p-4 ${showFullChart ? 'lg:col-span-2' : ''}`}>
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                        <BarChart3 size={18} className="text-blue-600 dark:text-blue-500" />
                        Top Products by Revenue
                    </h3>
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-sm">
                            Last {timeRange}
                        </span>
                        <button
                            onClick={() => setShowFullChart(!showFullChart)}
                            className="p-1 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-sm transition-colors"
                            title={showFullChart ? 'Minimize' : 'Maximize'}
                        >
                            {showFullChart ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                        </button>
                    </div>
                </div>
                <div className={`${showFullChart ? 'h-96' : 'h-72'}`}>
                    <ChartWrapper
                        key={`top-products-${chartType}-${timeRange}-${showFullChart}`}
                        {...topProductsChartConfig}
                    />
                </div>
            </div>

            {/* Category Distribution */}
            {!showFullChart && (
                <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-sm p-4">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                            <PieChartIcon size={18} className="text-green-600 dark:text-green-500" />
                            Category Revenue Distribution
                        </h3>
                        <span className="text-xs text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-sm">
                            By Revenue
                        </span>
                    </div>
                    <div className="h-72">
                        <ChartWrapper
                            key={`category-${timeRange}`}
                            {...categoryChartConfig}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}

export default TopProductsComponent;