import {
    AlertTriangle,
    CheckCircle,
    Minimize2, Maximize2,
} from "lucide-react";
import PurchaseOrderGenerator from "./PurchaseOrderGenerator";
import { useState } from "react";

const LowStockAlerts = ({ lowStockData, lowStockAlerts, formatCurrency, formatNumber, showFullChart, setShowFullChart }) => {
    const [showPurchaseOrder, setShowPurchaseOrder] = useState(false);
    
    return (
        <div className={`bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-sm p-4 ${showFullChart ? 'lg:col-span-2' : ''}`}>
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <AlertTriangle size={18} className="text-red-600 dark:text-red-500" />
                    Low Stock Alerts
                    {lowStockData?.data?.lowStockAlerts?.summary && (
                        <span className="text-sm text-red-700 dark:text-red-400 bg-red-100 dark:bg-red-900/20 px-2 py-0.5 rounded-sm">
                            {lowStockData.data.lowStockAlerts.summary.totalAlerts} Products
                        </span>
                    )}
                </h3>
                {lowStockData?.data?.lowStockAlerts?.timestamp && (
                    <span className="text-xs text-gray-600 dark:text-gray-400">
                        Updated: {new Date(lowStockData.data.lowStockAlerts.timestamp).toLocaleTimeString()}
                    </span>
                )}
            </div>

            {/* Summary Stats */}
            {lowStockData?.data?.lowStockAlerts?.summary && (
                <div className="mb-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                        <div className="bg-gray-100 dark:bg-gray-700/50 p-3 rounded-sm border border-gray-200 dark:border-gray-600">
                            <p className="text-xs text-gray-600 dark:text-gray-400">Total Alerts</p>
                            <p className="text-xl font-bold text-gray-900 dark:text-white">
                                {lowStockData.data.lowStockAlerts.summary.totalAlerts}
                            </p>
                        </div>
                        <div className="bg-gray-100 dark:bg-gray-700/50 p-3 rounded-sm border border-gray-200 dark:border-gray-600">
                            <p className="text-xs text-gray-600 dark:text-gray-400">Restock Value</p>
                            <p className="text-xl font-bold text-yellow-700 dark:text-yellow-400">
                                {formatCurrency(lowStockData.data.lowStockAlerts.summary.estimatedRestockValue)}
                            </p>
                        </div>
                        <div className="bg-gray-100 dark:bg-gray-700/50 p-3 rounded-sm border border-gray-200 dark:border-gray-600">
                            <p className="text-xs text-gray-600 dark:text-gray-400">Potential Loss</p>
                            <p className="text-xl font-bold text-red-700 dark:text-red-400">
                                {formatCurrency(lowStockData.data.lowStockAlerts.summary.totalPotentialLoss)}
                            </p>
                        </div>
                        <div className="bg-gray-100 dark:bg-gray-700/50 p-3 rounded-sm border border-gray-200 dark:border-gray-600">
                            <p className="text-xs text-gray-600 dark:text-gray-400">Critical Items</p>
                            <p className="text-xl font-bold text-red-700 dark:text-red-400">
                                {lowStockData.data.lowStockAlerts.summary.critical}
                            </p>
                        </div>
                    </div>

                    {/* Category Breakdown */}
                    {lowStockData.data.lowStockAlerts.summary.byCategory &&
                        Object.keys(lowStockData.data.lowStockAlerts.summary.byCategory)?.length > 0 && (
                            <div className="bg-gray-50 dark:bg-gray-700/30 p-3 rounded-sm border border-gray-200 dark:border-gray-600">
                                <p className="text-sm text-gray-700 dark:text-gray-400 mb-2">Affected Categories:</p>
                                <div className="flex flex-wrap gap-2">
                                    {Object.entries(lowStockData.data.lowStockAlerts.summary.byCategory)?.map(([category, data]) => (
                                        <div key={category} className="flex items-center gap-2 bg-gray-200 dark:bg-gray-700 px-3 py-1.5 rounded-sm border border-gray-300 dark:border-gray-600">
                                            <span className="text-gray-900 dark:text-white text-sm font-medium">
                                                {category.replace('-', ' ').toUpperCase()}
                                            </span>
                                            <span className="text-red-700 dark:text-red-400 text-xs bg-red-100 dark:bg-red-900/20 px-2 py-0.5 rounded">
                                                {data.count} product(s)
                                            </span>
                                            <span className="text-gray-600 dark:text-gray-400 text-xs">
                                                Deficit: {formatNumber(data.totalDeficit)}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                </div>
            )}

            {/* Low Stock Products */}
            <div className="space-y-4">
                {lowStockAlerts?.length === 0 ? (
                    <div className="text-center py-8 text-gray-600 dark:text-gray-400">
                        <CheckCircle className="w-12 h-12 mx-auto text-green-600 dark:text-green-500 mb-2" />
                        <p>No low stock alerts</p>
                        <p className="text-sm mt-1">All products are sufficiently stocked</p>
                    </div>
                ) : (
                    lowStockAlerts?.map((product, index) => (
                        <div
                            key={index}
                            className={`p-4 rounded-sm border ${product.severity === 'critical'
                                ? 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800/30'
                                : 'bg-yellow-50 dark:bg-yellow-900/10 border-yellow-200 dark:border-yellow-800/30'
                                }`}
                        >
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                {/* Left Column - Product Info */}
                                <div className="flex-1">
                                    <div className="flex items-start justify-between mb-3">
                                        <div>
                                            <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-1">{product.name}</h4>
                                            <div className="flex items-center gap-3 text-sm">
                                                <span className="text-gray-600 dark:text-gray-400">SKU: {product.sku}</span>
                                                <span className="text-gray-400">•</span>
                                                <span className="text-gray-600 dark:text-gray-400">Category: {product.category.replace('-', ' ')}</span>
                                                <span className="text-gray-400">•</span>
                                                <span className="text-gray-600 dark:text-gray-400">Brand: {product.brand || 'N/A'}</span>
                                            </div>
                                        </div>

                                        <div className={`px-3 py-1 rounded-sm text-sm font-bold ${product.severity === 'critical' ? 'bg-red-600 dark:bg-red-500 text-white' :
                                            product.severity === 'high' ? 'bg-orange-600 dark:bg-orange-500 text-white' :
                                                'bg-yellow-600 dark:bg-yellow-500 text-white'
                                            }`}>
                                            {product.severity?.toUpperCase() || 'WARNING'}
                                        </div>
                                    </div>

                                    {/* Stock Details */}
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <div>
                                            <p className="text-xs text-gray-600 dark:text-gray-400">Current Stock</p>
                                            <p className="text-xl font-bold text-red-700 dark:text-red-400">
                                                {formatNumber(product.stock)}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-600 dark:text-gray-400">Minimum Required</p>
                                            <p className="text-xl font-bold text-gray-900 dark:text-white">
                                                {formatNumber(product.minStock)}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-600 dark:text-gray-400">Deficit</p>
                                            <p className="text-xl font-bold text-orange-700 dark:text-orange-400">
                                                {formatNumber(product.deficit)}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-600 dark:text-gray-400">Urgency</p>
                                            <div className="flex items-center gap-2">
                                                <div className="w-full bg-gray-300 dark:bg-gray-700 rounded-full h-2">
                                                    <div
                                                        className={`h-2 rounded-full ${product.urgency >= 80 ? 'bg-red-600 dark:bg-red-500' :
                                                            product.urgency >= 50 ? 'bg-orange-600 dark:bg-orange-500' :
                                                                'bg-yellow-600 dark:bg-yellow-500'
                                                            }`}
                                                        style={{ width: `${Math.min(product.urgency, 100)}%` }}
                                                    ></div>
                                                </div>
                                                <span className={`text-sm font-bold ${product.urgency >= 80 ? 'text-red-700 dark:text-red-400' :
                                                    product.urgency >= 50 ? 'text-orange-700 dark:text-orange-400' :
                                                        'text-yellow-700 dark:text-yellow-400'
                                                    }`}>
                                                    {product.urgency}%
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Recommendation */}
                                    {product.recommendation && (
                                        <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-700/50 rounded-sm border border-gray-300 dark:border-gray-600">
                                            <div className="flex items-start gap-3">
                                                <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-500 mt-0.5" />
                                                <div className="flex-1">
                                                    <p className="text-gray-900 dark:text-white font-medium mb-1">
                                                        {product.recommendation.message}
                                                    </p>
                                                    <div className="flex items-center gap-4 text-sm">
                                                        <span className="text-gray-600 dark:text-gray-400">
                                                            Action: <span className="text-green-700 dark:text-green-400 font-medium">{product.recommendation.action}</span>
                                                        </span>
                                                        <span className="text-gray-400">•</span>
                                                        <span className="text-gray-600 dark:text-gray-400">
                                                            Quantity: <span className="text-orange-700 dark:text-orange-400 font-medium">{formatNumber(product.recommendation.quantity)}</span>
                                                        </span>
                                                        <span className="text-gray-400">•</span>
                                                        <span className="text-gray-600 dark:text-gray-400">
                                                            Timeframe: <span className="text-blue-700 dark:text-blue-400 font-medium">{product.recommendation.timeframe}</span>
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Right Column - Financial Info */}
                                <div className="md:w-48 space-y-3">
                                    <div className="bg-gray-100 dark:bg-gray-700/50 p-3 rounded-sm border border-gray-300 dark:border-gray-600">
                                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Inventory Value</p>
                                        <p className="text-lg font-bold text-gray-900 dark:text-white">
                                            {formatCurrency(product.inventoryValue)}
                                        </p>
                                    </div>
                                    <div className="bg-red-100 dark:bg-red-900/20 p-3 rounded-sm border border-red-300 dark:border-red-800/30">
                                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Potential Lost Sales</p>
                                        <p className="text-lg font-bold text-red-700 dark:text-red-400">
                                            {formatCurrency(product.lostSalesValue)}
                                        </p>
                                    </div>
                                    <div className="bg-blue-100 dark:bg-blue-900/20 p-3 rounded-sm border border-blue-300 dark:border-blue-800/30">
                                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Last Restock</p>
                                        <p className="text-sm text-gray-900 dark:text-white">
                                            {new Date(product.lastRestock).toLocaleDateString()}
                                        </p>
                                        <p className="text-xs text-gray-600 dark:text-gray-400">
                                            {new Date(product.lastRestock).toLocaleTimeString()}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Stats Row */}
                            <div className="mt-4 pt-4 border-t border-gray-300 dark:border-gray-700 grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div>
                                    <p className="text-xs text-gray-600 dark:text-gray-400">Total Sold</p>
                                    <p className="text-sm font-bold text-green-700 dark:text-green-400">
                                        {formatNumber(product.totalSold)}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-600 dark:text-gray-400">Price</p>
                                    <p className="text-sm font-bold text-gray-900 dark:text-white">
                                        {formatCurrency(product.price)}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-600 dark:text-gray-400">Cost Price</p>
                                    <p className="text-sm font-bold text-gray-700 dark:text-gray-400">
                                        {formatCurrency(product.costPrice)}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-600 dark:text-gray-400">Product Type</p>
                                    <p className="text-sm font-bold text-blue-700 dark:text-blue-400">
                                        {product.productType?.toUpperCase() || 'N/A'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Quick Actions */}
            {lowStockAlerts?.length > 0 && (
                <div className="mt-6 pt-6 border-t border-gray-300 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-700 dark:text-gray-400">Quick Actions:</p>
                            <p className="text-xs text-gray-600 dark:text-gray-500">Manage your low stock inventory</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <button 
                                className="px-4 py-2 bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600 text-white rounded-sm text-sm transition-colors"
                                onClick={() => setShowPurchaseOrder(!showPurchaseOrder)}
                            >
                                Generate Purchase Order
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showPurchaseOrder && (
                <div className="mt-6">
                    <PurchaseOrderGenerator
                        lowStockAlerts={lowStockAlerts}
                        formatCurrency={formatCurrency}
                    />
                </div>
            )}
        </div>
    );
}

export default LowStockAlerts;