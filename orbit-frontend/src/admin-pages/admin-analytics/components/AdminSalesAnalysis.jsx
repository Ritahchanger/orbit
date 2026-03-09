import { useState, useEffect } from "react"
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    PointElement,
    LineElement,
    Filler,
    RadialLinearScale
} from 'chart.js'
import { Bar, Pie, Line, Radar } from 'react-chartjs-2'
import {
    TrendingUp,
    TrendingDown,
    DollarSign,
    ShoppingCart,
    CreditCard,
    Wallet,
    Activity,
    Target,
    Percent,
    Users,
    Package,
    Calendar,
    Download,
    RefreshCw,
    BarChart3,
    PieChart as PieChartIcon,
    LineChart
} from "lucide-react"


import SalesAnalysisSkeleton from "../preloaders/AdminSalesAnalysisPreloader"

// Register ChartJS components
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    PointElement,
    LineElement,
    Filler,
    RadialLinearScale
)



const AdminSalesAnalysis = () => {
    const [timePeriod, setTimePeriod] = useState('month')
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)

    // This would come from your API hook
    useEffect(() => {
        // Simulate API call
        setTimeout(() => {
            setData({
                period: "month",
                dateRange: {
                    startDate: "2025-11-18T07:25:54.139Z",
                    endDate: "2025-12-18T07:25:54.139Z"
                },
                dailyBreakdown: [
                    {
                        _id: "2025-12-16",
                        dailyRevenue: 465570,
                        dailyProfit: 399800,
                        transactionCount: 6,
                        itemsSold: 6
                    },
                    {
                        _id: "2025-12-17",
                        dailyRevenue: 3529.98,
                        dailyProfit: 1529.98,
                        transactionCount: 3,
                        itemsSold: 3
                    },
                    {
                        _id: "2025-12-18",
                        dailyRevenue: 160000,
                        dailyProfit: 136000,
                        transactionCount: 2,
                        itemsSold: 3
                    }
                ],
                paymentMethodBreakdown: [
                    {
                        _id: "paybill",
                        total: 80000,
                        count: 1
                    },
                    {
                        _id: "cash",
                        total: 242570,
                        count: 4
                    },
                    {
                        _id: "card",
                        total: 306129.99,
                        count: 5
                    },
                    {
                        _id: "installment",
                        total: 399.99,
                        count: 1
                    }
                ],
                overallSummary: {
                    _id: null,
                    totalRevenue: 629099.98,
                    totalProfit: 537329.98,
                    totalTransactions: 11,
                    totalItemsSold: 12,
                    averageTransactionValue: 57190.90727272727
                }
            })
            setLoading(false)
        }, 1000)
    }, [])

  

    // Format currency
    const formatCurrency = (amount) => {
        if (!amount && amount !== 0) return 'KSh 0'
        return `KSh ${Math.round(amount).toLocaleString()}`
    }

    // Format date
    const formatDate = (dateString) => {
        const date = new Date(dateString)
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }

    // Calculate metrics
    const calculateMetrics = () => {
        if (!data) return null

        const { dailyBreakdown, paymentMethodBreakdown, overallSummary } = data

        // Calculate daily averages
        const avgDailyRevenue = overallSummary.totalRevenue / dailyBreakdown.length
        const avgDailyProfit = overallSummary.totalProfit / dailyBreakdown.length

        // Calculate profit margin
        const profitMargin = ((overallSummary.totalProfit / overallSummary.totalRevenue) * 100).toFixed(1)

        // Calculate best day
        const bestDay = dailyBreakdown.reduce((max, day) =>
            day.dailyRevenue > max.dailyRevenue ? day : max
        )

        // Calculate payment method percentages
        const paymentMethodPercentages = paymentMethodBreakdown.map(pm => ({
            ...pm,
            percentage: ((pm.total / overallSummary.totalRevenue) * 100).toFixed(1)
        }))

        // Calculate transaction value range
        const transactionValues = dailyBreakdown.map(d => d.dailyRevenue / d.transactionCount)
        const maxTransactionValue = Math.max(...transactionValues)
        const minTransactionValue = Math.min(...transactionValues)

        return {
            avgDailyRevenue,
            avgDailyProfit,
            profitMargin,
            bestDay,
            paymentMethodPercentages,
            maxTransactionValue,
            minTransactionValue
        }
    }

    const metrics = calculateMetrics()

    // Chart configurations
    const dailyRevenueChart = {
        labels: data?.dailyBreakdown.map(d => formatDate(d._id)) || [],
        datasets: [
            {
                label: 'Revenue',
                data: data?.dailyBreakdown.map(d => d.dailyRevenue) || [],
                backgroundColor: 'rgba(59, 130, 246, 0.7)',
                borderColor: 'rgb(59, 130, 246)',
                borderWidth: 2,
                borderRadius: 8,
                borderSkipped: false,
            },
            {
                label: 'Profit',
                data: data?.dailyBreakdown.map(d => d.dailyProfit) || [],
                backgroundColor: 'rgba(34, 197, 94, 0.7)',
                borderColor: 'rgb(34, 197, 94)',
                borderWidth: 2,
                borderRadius: 8,
                borderSkipped: false,
            }
        ]
    }

    const paymentMethodChart = {
        labels: data?.paymentMethodBreakdown.map(p => {
            const labels = {
                paybill: 'Paybill',
                cash: 'Cash',
                card: 'Card',
                installment: 'Installment',
                mpesa: 'M-Pesa'
            }
            return labels[p._id] || p._id
        }) || [],
        datasets: [{
            data: data?.paymentMethodBreakdown.map(p => p.total) || [],
            backgroundColor: [
                'rgba(59, 130, 246, 0.8)',
                'rgba(34, 197, 94, 0.8)',
                'rgba(139, 92, 246, 0.8)',
                'rgba(245, 158, 11, 0.8)',
                'rgba(239, 68, 68, 0.8)',
            ],
            borderColor: [
                'rgb(59, 130, 246)',
                'rgb(34, 197, 94)',
                'rgb(139, 92, 246)',
                'rgb(245, 158, 11)',
                'rgb(239, 68, 68)',
            ],
            borderWidth: 2,
            hoverOffset: 20
        }]
    }

    const transactionTrendChart = {
        labels: data?.dailyBreakdown.map(d => formatDate(d._id)) || [],
        datasets: [
            {
                label: 'Transactions',
                data: data?.dailyBreakdown.map(d => d.transactionCount) || [],
                borderColor: 'rgb(168, 85, 247)',
                backgroundColor: 'rgba(168, 85, 247, 0.1)',
                tension: 0.4,
                fill: true,
                pointBackgroundColor: 'rgb(168, 85, 247)',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 5,
                pointHoverRadius: 7
            },
            {
                label: 'Items Sold',
                data: data?.dailyBreakdown.map(d => d.itemsSold) || [],
                borderColor: 'rgb(59, 130, 246)',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                tension: 0.4,
                fill: true,
                pointBackgroundColor: 'rgb(59, 130, 246)',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 5,
                pointHoverRadius: 7
            }
        ]
    }

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
                labels: {
                    color: '#9ca3af',
                    font: {
                        size: 12,
                        family: "'Inter', sans-serif"
                    },
                    padding: 20,
                    usePointStyle: true
                }
            },
            tooltip: {
                backgroundColor: 'rgba(17, 24, 39, 0.95)',
                titleColor: '#d1d5db',
                bodyColor: '#d1d5db',
                borderColor: '#4b5563',
                borderWidth: 1,
                padding: 12,
                cornerRadius: 8,
                callbacks: {
                    label: function (context) {
                        return ` ${context.dataset.label}: ${formatCurrency(context.raw)}`
                    }
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: {
                    color: 'rgba(55, 65, 81, 0.2)',
                    drawBorder: false
                },
                ticks: {
                    color: '#9ca3af',
                    font: {
                        size: 11
                    },
                    callback: function (value) {
                        if (value >= 1000000) return `KSh ${(value / 1000000).toFixed(1)}M`
                        if (value >= 1000) return `KSh ${(value / 1000).toFixed(0)}K`
                        return `KSh ${value}`
                    }
                }
            },
            x: {
                grid: {
                    color: 'rgba(55, 65, 81, 0.2)',
                    drawBorder: false
                },
                ticks: {
                    color: '#9ca3af',
                    font: {
                        size: 11
                    }
                }
            }
        },
        interaction: {
            intersect: false,
            mode: 'index'
        },
        animation: {
            duration: 1000,
            easing: 'easeInOutQuart'
        }
    }


    if (loading) {
        return (
            <SalesAnalysisSkeleton />
        )
    }

    if (!data) {
        return (
            <div className="text-center py-12">
                <BarChart3 className="h-12 w-12 text-gray-700 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-400 mb-2">No analytics data available</h3>
                <p className="text-gray-600">Start making sales to see analytics here</p>
            </div>
        )
    }



    return (
        <div className="space-y-6 sales-analyis" id="sales-analysis">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-blue-900/20 to-blue-800/10 border border-blue-800/30 rounded-sm p-5">
                    <div className="flex items-center justify-between mb-3">
                        <div className="p-2 bg-blue-500/20 rounded-lg">
                            <DollarSign className="h-5 w-5 text-blue-500" />
                        </div>
                        <span className="text-xs font-medium text-blue-400 bg-blue-500/10 px-2 py-1 rounded-full">
                            Total
                        </span>
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-1">{formatCurrency(data.overallSummary.totalRevenue)}</h3>
                    <p className="text-sm text-blue-300">Total Revenue</p>
                    <div className="flex items-center gap-2 text-xs text-gray-400 mt-3">
                        <Activity className="h-3 w-3" />
                        <span>{data.overallSummary.totalTransactions} transactions</span>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-green-900/20 to-green-800/10 border border-green-800/30 rounded-sm p-5">
                    <div className="flex items-center justify-between mb-3">
                        <div className="p-2 bg-green-500/20 rounded-lg">
                            <TrendingUp className="h-5 w-5 text-green-500" />
                        </div>
                        <span className="text-xs font-medium text-green-400 bg-green-500/10 px-2 py-1 rounded-full">
                            {metrics?.profitMargin}%
                        </span>
                    </div>
                    <h3 className="text-2xl font-bold text-green-400 mb-1">{formatCurrency(data.overallSummary.totalProfit)}</h3>
                    <p className="text-sm text-green-300">Total Profit</p>
                    <div className="flex items-center gap-2 text-xs text-gray-400 mt-3">
                        <Percent className="h-3 w-3" />
                        <span>Profit Margin</span>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-purple-900/20 to-purple-800/10 border border-purple-800/30 rounded-sm p-5">
                    <div className="flex items-center justify-between mb-3">
                        <div className="p-2 bg-purple-500/20 rounded-lg">
                            <ShoppingCart className="h-5 w-5 text-purple-500" />
                        </div>
                        <span className="text-xs font-medium text-purple-400 bg-purple-500/10 px-2 py-1 rounded-full">
                            Avg {Math.round(data.overallSummary.totalItemsSold / data.overallSummary.totalTransactions)}
                        </span>
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-1">{data.overallSummary.totalItemsSold}</h3>
                    <p className="text-sm text-purple-300">Items Sold</p>
                    <div className="flex items-center gap-2 text-xs text-gray-400 mt-3">
                        <Package className="h-3 w-3" />
                        <span>{data.dailyBreakdown.length} days tracked</span>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-amber-900/20 to-amber-800/10 border border-amber-800/30 rounded-sm p-5">
                    <div className="flex items-center justify-between mb-3">
                        <div className="p-2 bg-amber-500/20 rounded-lg">
                            <Target className="h-5 w-5 text-amber-500" />
                        </div>
                        <span className="text-xs font-medium text-amber-400 bg-amber-500/10 px-2 py-1 rounded-full">
                            {formatCurrency(metrics?.maxTransactionValue || 0)}
                        </span>
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-1">{formatCurrency(data.overallSummary.averageTransactionValue)}</h3>
                    <p className="text-sm text-amber-300">Avg. Transaction</p>
                    <div className="flex items-center gap-2 text-xs text-gray-400 mt-3">
                        <CreditCard className="h-3 w-3" />
                        <span>Per transaction</span>
                    </div>
                </div>
            </div>

            {/* Main Charts Grid */}
            <div className="grid lg:grid-cols-2 gap-6">
                {/* Daily Revenue & Profit Chart */}
                <div className="bg-dark-light border border-gray-800 rounded-sm p-5">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                <BarChart3 className="h-5 w-5 text-blue-500" />
                                Daily Revenue & Profit
                            </h3>
                            <p className="text-gray-400 text-sm mt-1">Performance over {data.dailyBreakdown.length} days</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="text-xs text-gray-400 bg-gray-900/50 px-3 py-1.5 rounded-full">
                                <Calendar className="h-3 w-3 inline mr-1" />
                                {formatDate(data.dateRange.startDate)} - {formatDate(data.dateRange.endDate)}
                            </div>
                        </div>
                    </div>
                    <div className="h-72">
                        <Bar data={dailyRevenueChart} options={chartOptions} />
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-800">
                        <div className="text-center">
                            <p className="text-xs text-gray-400 mb-1">Best Day</p>
                            <p className="font-semibold text-white">{formatDate(metrics?.bestDay?._id)}</p>
                            <p className="text-sm text-green-400">{formatCurrency(metrics?.bestDay?.dailyRevenue)}</p>
                        </div>
                        <div className="text-center">
                            <p className="text-xs text-gray-400 mb-1">Daily Average</p>
                            <p className="font-semibold text-white">{formatCurrency(metrics?.avgDailyRevenue)}</p>
                            <p className="text-sm text-blue-400">Revenue per day</p>
                        </div>
                    </div>
                </div>

                {/* Payment Methods Distribution */}
                <div className="bg-dark-light border border-gray-800 rounded-sm p-5">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                <PieChartIcon className="h-5 w-5 text-purple-500" />
                                Payment Methods
                            </h3>
                            <p className="text-gray-400 text-sm mt-1">Revenue distribution by payment method</p>
                        </div>
                        <div className="text-xs text-gray-400 bg-gray-900/50 px-3 py-1.5 rounded-full">
                            {data.paymentMethodBreakdown.length} methods
                        </div>
                    </div>
                    <div className="h-72">
                        <Pie
                            data={paymentMethodChart}
                            options={{
                                ...chartOptions,
                                plugins: {
                                    ...chartOptions.plugins,
                                    legend: {
                                        ...chartOptions.plugins.legend,
                                        position: 'right'
                                    }
                                }
                            }}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-gray-800">
                        {metrics?.paymentMethodPercentages.map((pm, index) => (
                            <div key={index} className="flex items-center justify-between p-2 bg-gray-900/30 rounded-sm">
                                <div className="flex items-center gap-2">
                                    <div className={`w-2 h-2 rounded-full ${pm._id === 'cash' ? 'bg-blue-500' :
                                        pm._id === 'card' ? 'bg-purple-500' :
                                            pm._id === 'paybill' ? 'bg-green-500' :
                                                'bg-amber-500'
                                        }`}></div>
                                    <span className="text-xs text-gray-300 capitalize">{pm._id}</span>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs font-semibold text-white">{formatCurrency(pm.total)}</p>
                                    <p className="text-xs text-gray-400">{pm.percentage}%</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Transaction Trends */}
            <div className="bg-dark-light border border-gray-800 rounded-sm p-5">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                            <LineChart className="h-5 w-5 text-purple-500" />
                            Transaction Trends
                        </h3>
                        <p className="text-gray-400 text-sm mt-1">Daily transaction and items sold patterns</p>
                    </div>
                    <div className="text-xs text-gray-400 bg-gray-900/50 px-3 py-1.5 rounded-full">
                        {data.overallSummary.totalTransactions} total transactions
                    </div>
                </div>
                <div className="h-64">
                    <Line data={transactionTrendChart} options={chartOptions} />
                </div>
                <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-800">
                    <div className="text-center">
                        <p className="text-xs text-gray-400 mb-1">Avg. Transactions/Day</p>
                        <p className="font-semibold text-white">
                            {(data.overallSummary.totalTransactions / data.dailyBreakdown.length).toFixed(1)}
                        </p>
                    </div>
                    <div className="text-center">
                        <p className="text-xs text-gray-400 mb-1">Conversion Rate</p>
                        <p className="font-semibold text-white">
                            {((data.overallSummary.totalItemsSold / data.overallSummary.totalTransactions) * 100).toFixed(1)}%
                        </p>
                    </div>
                    <div className="text-center">
                        <p className="text-xs text-gray-400 mb-1">Items/Transaction</p>
                        <p className="font-semibold text-white">
                            {(data.overallSummary.totalItemsSold / data.overallSummary.totalTransactions).toFixed(1)}
                        </p>
                    </div>
                </div>
            </div>

            {/* Insights & Recommendations */}
            <div className="grid lg:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/20 border border-gray-800 rounded-sm p-5">
                    <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <Target className="h-5 w-5 text-green-500" />
                        Key Insights
                    </h4>
                    <ul className="space-y-3">
                        <li className="flex items-start gap-2">
                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-1.5"></div>
                            <div>
                                <p className="text-sm text-white">Profit margin of <span className="font-semibold text-green-400">{metrics?.profitMargin}%</span></p>
                                <p className="text-xs text-gray-400">Well above industry average</p>
                            </div>
                        </li>
                        <li className="flex items-start gap-2">
                            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5"></div>
                            <div>
                                <p className="text-sm text-white">Card payments lead with <span className="font-semibold text-blue-400">
                                    {formatCurrency(data.paymentMethodBreakdown.find(p => p._id === 'card')?.total || 0)}
                                </span></p>
                                <p className="text-xs text-gray-400">48.7% of total revenue</p>
                            </div>
                        </li>
                        <li className="flex items-start gap-2">
                            <div className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-1.5"></div>
                            <div>
                                <p className="text-sm text-white">Best day: <span className="font-semibold text-amber-400">
                                    {formatDate(metrics?.bestDay?._id)}
                                </span></p>
                                <p className="text-xs text-gray-400">Generated {formatCurrency(metrics?.bestDay?.dailyRevenue)} in revenue</p>
                            </div>
                        </li>
                    </ul>
                </div>

                <div className="bg-gradient-to-br from-blue-900/20 to-blue-800/10 border border-blue-800/30 rounded-sm p-5">
                    <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-blue-500" />
                        Growth Opportunities
                    </h4>
                    <ul className="space-y-3">
                        <li className="flex items-start gap-2">
                            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5"></div>
                            <div>
                                <p className="text-sm text-white">Promote digital payments</p>
                                <p className="text-xs text-gray-400">Card payments show highest transaction value</p>
                            </div>
                        </li>
                        <li className="flex items-start gap-2">
                            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5"></div>
                            <div>
                                <p className="text-sm text-white">Focus on high-margin days</p>
                                <p className="text-xs text-gray-400">Replicate strategies from best performing days</p>
                            </div>
                        </li>
                        <li className="flex items-start gap-2">
                            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5"></div>
                            <div>
                                <p className="text-sm text-white">Increase transaction size</p>
                                <p className="text-xs text-gray-400">Current average: {formatCurrency(data.overallSummary.averageTransactionValue)}</p>
                            </div>
                        </li>
                    </ul>
                </div>

                <div className="bg-gradient-to-br from-purple-900/20 to-purple-800/10 border border-purple-800/30 rounded-sm p-5">
                    <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <Activity className="h-5 w-5 text-purple-500" />
                        Quick Actions
                    </h4>
                    <div className="space-y-3">
                        <button className="w-full text-left p-3 bg-gray-900/30 hover:bg-gray-800/50 rounded-sm transition-colors group">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-white group-hover:text-purple-300">Export Report</p>
                                    <p className="text-xs text-gray-400">Download detailed analytics</p>
                                </div>
                                <Download className="h-4 w-4 text-gray-400 group-hover:text-purple-400" />
                            </div>
                        </button>
                        <button className="w-full text-left p-3 bg-gray-900/30 hover:bg-gray-800/50 rounded-sm transition-colors group">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-white group-hover:text-purple-300">Refresh Data</p>
                                    <p className="text-xs text-gray-400">Update with latest sales</p>
                                </div>
                                <RefreshCw className="h-4 w-4 text-gray-400 group-hover:text-purple-400" />
                            </div>
                        </button>
                        <button className="w-full text-left p-3 bg-gray-900/30 hover:bg-gray-800/50 rounded-sm transition-colors group">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-white group-hover:text-purple-300">Compare Periods</p>
                                    <p className="text-xs text-gray-400">Analyze growth trends</p>
                                </div>
                                <BarChart3 className="h-4 w-4 text-gray-400 group-hover:text-purple-400" />
                            </div>
                        </button>
                    </div>
                </div>
            </div>

            {/* Performance Summary */}
            <div className="bg-dark-light border border-gray-800 rounded-sm p-5">
                <h4 className="text-lg font-semibold text-white mb-4">Performance Summary</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-gray-900/30 rounded-sm">
                        <p className="text-xs text-gray-400 mb-1">Revenue/Day</p>
                        <p className="text-lg font-bold text-white">{formatCurrency(metrics?.avgDailyRevenue)}</p>
                    </div>
                    <div className="text-center p-4 bg-gray-900/30 rounded-sm">
                        <p className="text-xs text-gray-400 mb-1">Profit/Day</p>
                        <p className="text-lg font-bold text-green-400">{formatCurrency(metrics?.avgDailyProfit)}</p>
                    </div>
                    <div className="text-center p-4 bg-gray-900/30 rounded-sm">
                        <p className="text-xs text-gray-400 mb-1">Transaction Value Range</p>
                        <p className="text-lg font-bold text-white">
                            {formatCurrency(metrics?.minTransactionValue)} - {formatCurrency(metrics?.maxTransactionValue)}
                        </p>
                    </div>
                    <div className="text-center p-4 bg-gray-900/30 rounded-sm">
                        <p className="text-xs text-gray-400 mb-1">Active Days</p>
                        <p className="text-lg font-bold text-white">{data.dailyBreakdown.length}</p>
                        <p className="text-xs text-gray-400">{data.period} period</p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AdminSalesAnalysis