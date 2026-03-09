import {
    RefreshCw,
    Download,
    Calendar,
} from "lucide-react";

import { useState } from "react";

const AdminProductAnalysisTimeRangeSelector = ({
    timeRange,
    refreshData,
    handleExportCSV,
    downloading,
    setTimeRange,
    customStartDate,
    customEndDate,
    setCustomStartDate,
    setCustomEndDate
}) => {
    const [showCustomRange, setShowCustomRange] = useState(false);

    const handleTimeRangeChange = (e) => {
        const value = e.target.value;
        if (value === "custom") {
            setShowCustomRange(true);
        } else {
            setShowCustomRange(false);
            setTimeRange(value);
        }
    };

    const applyCustomRange = () => {
        if (customStartDate && customEndDate) {
            setTimeRange(`custom_${customStartDate}_${customEndDate}`);
        }
        setShowCustomRange(false);
    };

    return (
        <div className="flex flex-col md:flex-row items-start md:items-center gap-3">
            {/* Time Range Selector */}
            <div className="flex items-center gap-2">
                <Calendar size={16} className="text-gray-400" />
                <select
                    value={timeRange.includes("custom_") ? "custom" : timeRange}
                    onChange={handleTimeRangeChange}
                    className="bg-dark border border-gray-800 text-white text-sm rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary min-w-[180px]"
                >
                    <option value="day">Last 24 Hours</option>
                    <option value="week">Last Week</option>
                    <option value="month">Last Month</option>
                    <option value="quarter">Last Quarter</option>
                    <option value="year">Last Year</option>
                    <option value="custom">Custom Range</option>
                    <option value="all">All Time</option>
                </select>
            </div>

            {/* Custom Date Range Picker */}
            {showCustomRange && (
                <div className="flex items-center gap-2 p-3 bg-gray-900/50 border border-gray-800 rounded-md">
                    <div className="flex items-center gap-2">
                        <label className="text-gray-300 text-sm">From:</label>
                        <input
                            type="date"
                            value={customStartDate}
                            onChange={(e) => setCustomStartDate(e.target.value)}
                            className="bg-dark border border-gray-700 text-white text-sm rounded px-2 py-1"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <label className="text-gray-300 text-sm">To:</label>
                        <input
                            type="date"
                            value={customEndDate}
                            onChange={(e) => setCustomEndDate(e.target.value)}
                            className="bg-dark border border-gray-700 text-white text-sm rounded px-2 py-1"
                        />
                    </div>
                    <button
                        onClick={applyCustomRange}
                        className="px-3 py-1 bg-primary hover:bg-primary-dark text-white text-sm rounded"
                    >
                        Apply
                    </button>
                    <button
                        onClick={() => setShowCustomRange(false)}
                        className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded"
                    >
                        Cancel
                    </button>
                </div>
            )}

            {/* Current Range Display */}
            {!showCustomRange && timeRange.includes("custom_") && (
                <div className="text-gray-400 text-sm bg-gray-900/50 px-3 py-1 rounded">
                    Custom Range Selected
                </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
                {/* Refresh Button */}
                <button
                    onClick={refreshData}
                    className="p-2 bg-gray-800 hover:bg-gray-700 rounded-md transition-colors"
                    title="Refresh Data"
                >
                    <RefreshCw size={18} className="text-gray-300" />
                </button>

                {/* Export Button */}
                <button
                    onClick={handleExportCSV}
                    disabled={downloading}
                    className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-dark text-white text-sm font-medium rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Download size={16} />
                    {downloading ? "Exporting..." : "Export CSV"}
                </button>
            </div>
        </div>
    );
};

export default AdminProductAnalysisTimeRangeSelector;