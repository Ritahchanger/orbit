import React, { useState, useEffect } from 'react';
import AdminLayout from "../../dashboard/layout/Layout";
import {
    DollarSign, CreditCard, Banknote, Filter, Search, Download,
    CheckCircle, XCircle, Clock, AlertCircle, TrendingUp, TrendingDown,
    RefreshCw, Printer, FileText, ArrowUpRight, ArrowDownRight,
    BarChart3, PieChart, Calendar, Users, Shield, Eye, MoreVertical,
    Phone, MessageSquare, Mail, ExternalLink, ChevronDown, Plus,
    Smartphone, Receipt, Wallet, Tag, Percent, Hash
} from 'lucide-react';

const Payments = () => {
    const [activeTab, setActiveTab] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('all');
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [dateRange, setDateRange] = useState('today');
    const [isLoading, setIsLoading] = useState(false);
    const [selectedPayment, setSelectedPayment] = useState(null);
    const [showPaymentDetails, setShowPaymentDetails] = useState(false);
    const [showSTKModal, setShowSTKModal] = useState(false);

    // Payment Methods
    const paymentMethods = [
        { id: 'all', name: 'All Methods', icon: CreditCard, color: 'bg-gray-500' },
        { id: 'mpesa', name: 'MPesa STK', icon: Smartphone, color: 'bg-green-500' },
        { id: 'cash', name: 'Cash', icon: Banknote, color: 'bg-yellow-500' },
        { id: 'paybill', name: 'PayBill', icon: Wallet, color: 'bg-blue-500' },
        { id: 'card', name: 'Credit Card', icon: CreditCard, color: 'bg-purple-500' },
        { id: 'installment', name: 'Installment', icon: Tag, color: 'bg-pink-500' },
        { id: 'bank', name: 'Bank Transfer', icon: DollarSign, color: 'bg-indigo-500' },
    ];

    // Payment Statuses
    const paymentStatuses = [
        { id: 'all', name: 'All Status', color: 'bg-gray-500' },
        { id: 'completed', name: 'Completed', color: 'bg-green-500' },
        { id: 'pending', name: 'Pending', color: 'bg-yellow-500' },
        { id: 'failed', name: 'Failed', color: 'bg-red-500' },
        { id: 'refunded', name: 'Refunded', color: 'bg-blue-500' },
        { id: 'cancelled', name: 'Cancelled', color: 'bg-gray-500' },
    ];

    // Date Ranges
    const dateRanges = [
        { id: 'today', name: 'Today' },
        { id: 'yesterday', name: 'Yesterday' },
        { id: 'week', name: 'This Week' },
        { id: 'month', name: 'This Month' },
        { id: 'quarter', name: 'This Quarter' },
        { id: 'year', name: 'This Year' },
        { id: 'custom', name: 'Custom Range' },
    ];

    // Sample Payments Data
    const [payments, setPayments] = useState([
        {
            id: 'PAY-001',
            orderId: 'ORD-1001',
            customer: 'John Kamau',
            phone: '0712345678',
            email: 'john@email.com',
            product: 'Alienware Aurora R15',
            amount: 2500,
            paymentMethod: 'mpesa',
            status: 'completed',
            transactionId: 'MPE00123456',
            mpesaCode: 'RFT9HJK78',
            date: '2024-01-20',
            time: '09:30 AM',
            autoAdded: true,
            receiptUrl: '/receipts/PAY-001.pdf'
        },
        {
            id: 'PAY-002',
            orderId: 'ORD-1002',
            customer: 'Sarah Mwangi',
            phone: '0723456789',
            email: 'sarah@email.com',
            product: 'PlayStation 5 (2 units)',
            amount: 1000,
            paymentMethod: 'cash',
            status: 'completed',
            transactionId: 'CASH001',
            mpesaCode: null,
            date: '2024-01-20',
            time: '11:45 AM',
            autoAdded: false,
            receiptUrl: '/receipts/PAY-002.pdf'
        },
        {
            id: 'PAY-003',
            orderId: 'ORD-1003',
            customer: 'Mike Ochieng',
            phone: '0734567890',
            email: 'mike@email.com',
            product: 'Razer BlackShark V2 Pro (3 units)',
            amount: 540,
            paymentMethod: 'paybill',
            status: 'pending',
            transactionId: 'PB001234',
            mpesaCode: null,
            date: '2024-01-20',
            time: '02:15 PM',
            autoAdded: false,
            receiptUrl: null
        },
        {
            id: 'PAY-004',
            orderId: 'ORD-1004',
            customer: 'Jane Akinyi',
            phone: '0745678901',
            email: 'jane@email.com',
            product: 'Xbox Series X 1TB',
            amount: 550,
            paymentMethod: 'mpesa',
            status: 'completed',
            transactionId: 'MPE00123457',
            mpesaCode: 'RFT9HJK79',
            date: '2024-01-20',
            time: '03:45 PM',
            autoAdded: true,
            receiptUrl: '/receipts/PAY-004.pdf'
        },
        {
            id: 'PAY-005',
            orderId: 'ORD-1005',
            customer: 'David Wambua',
            phone: '0756789012',
            email: 'david@email.com',
            product: 'Logitech G Pro X Superlight',
            amount: 130,
            paymentMethod: 'cash',
            status: 'completed',
            transactionId: 'CASH002',
            mpesaCode: null,
            date: '2024-01-20',
            time: '05:20 PM',
            autoAdded: false,
            receiptUrl: '/receipts/PAY-005.pdf'
        },
        {
            id: 'PAY-006',
            orderId: 'ORD-1006',
            customer: 'Peter Maina',
            phone: '0767890123',
            email: 'peter@email.com',
            product: 'ASUS ROG Zephyrus G14',
            amount: 1800,
            paymentMethod: 'card',
            status: 'failed',
            transactionId: 'CARD001234',
            mpesaCode: null,
            date: '2024-01-20',
            time: '04:30 PM',
            autoAdded: true,
            receiptUrl: null
        },
        {
            id: 'PAY-007',
            orderId: 'ORD-1007',
            customer: 'Lucy Wanjiku',
            phone: '0778901234',
            email: 'lucy@email.com',
            product: 'Secretlab Titan EVO 2023',
            amount: 650,
            paymentMethod: 'installment',
            status: 'pending',
            transactionId: 'INST001',
            mpesaCode: null,
            date: '2024-01-20',
            time: '01:15 PM',
            autoAdded: false,
            receiptUrl: null
        },
        {
            id: 'PAY-008',
            orderId: 'ORD-1008',
            customer: 'James Kariuki',
            phone: '0789012345',
            email: 'james@email.com',
            product: 'Samsung Odyssey G9 49"',
            amount: 1400,
            paymentMethod: 'bank',
            status: 'completed',
            transactionId: 'BANK001234',
            mpesaCode: null,
            date: '2024-01-20',
            time: '10:45 AM',
            autoAdded: false,
            receiptUrl: '/receipts/PAY-008.pdf'
        },
        {
            id: 'PAY-009',
            orderId: 'ORD-1009',
            customer: 'Grace Muthoni',
            phone: '0790123456',
            email: 'grace@email.com',
            product: 'Gaming PC Setup Bundle',
            amount: 3500,
            paymentMethod: 'mpesa',
            status: 'refunded',
            transactionId: 'MPE00123458',
            mpesaCode: 'RFT9HJK80',
            date: '2024-01-19',
            time: '03:20 PM',
            autoAdded: true,
            receiptUrl: '/receipts/PAY-009.pdf'
        },
        {
            id: 'PAY-010',
            orderId: 'ORD-1010',
            customer: 'Robert Omondi',
            phone: '0701234567',
            email: 'robert@email.com',
            product: 'Multiple Accessories',
            amount: 850,
            paymentMethod: 'cash',
            status: 'cancelled',
            transactionId: 'CASH003',
            mpesaCode: null,
            date: '2024-01-19',
            time: '11:30 AM',
            autoAdded: false,
            receiptUrl: null
        },
    ]);

    // Tabs
    const tabs = [
        { id: 'all', name: 'All Payments', count: payments.length },
        { id: 'mpesa', name: 'MPesa Payments', count: payments.filter(p => p.paymentMethod === 'mpesa').length },
        { id: 'cash', name: 'Cash Payments', count: payments.filter(p => p.paymentMethod === 'cash').length },
        { id: 'pending', name: 'Pending', count: payments.filter(p => p.status === 'pending').length },
        { id: 'failed', name: 'Failed', count: payments.filter(p => p.status === 'failed').length },
    ];

    // Statistics
    const [stats, setStats] = useState({
        totalPayments: 0,
        totalAmount: 0,
        todayPayments: 0,
        todayAmount: 0,
        mpesaPercentage: 0,
        cashPercentage: 0,
        pendingAmount: 0,
        failedAmount: 0,
        avgTransaction: 0,
        topCustomer: 'None'
    });

    // Calculate statistics
    useEffect(() => {
        const today = new Date().toISOString().split('T')[0];
        const todayPayments = payments.filter(p => p.date === today);
        const totalAmount = payments.reduce((sum, p) => sum + p.amount, 0);
        const todayAmount = todayPayments.reduce((sum, p) => sum + p.amount, 0);
        const mpesaCount = payments.filter(p => p.paymentMethod === 'mpesa').length;
        const cashCount = payments.filter(p => p.paymentMethod === 'cash').length;
        const pendingAmount = payments.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0);
        const failedAmount = payments.filter(p => p.status === 'failed').reduce((sum, p) => sum + p.amount, 0);

        // Find top customer by total spent
        const customerSpending = {};
        payments.forEach(p => {
            if (!customerSpending[p.customer]) {
                customerSpending[p.customer] = 0;
            }
            customerSpending[p.customer] += p.amount;
        });
        const topCustomer = Object.entries(customerSpending).sort((a, b) => b[1] - a[1])[0]?.[0] || 'None';

        setStats({
            totalPayments: payments.length,
            totalAmount,
            todayPayments: todayPayments.length,
            todayAmount,
            mpesaPercentage: payments.length > 0 ? Math.round((mpesaCount / payments.length) * 100) : 0,
            cashPercentage: payments.length > 0 ? Math.round((cashCount / payments.length) * 100) : 0,
            pendingAmount,
            failedAmount,
            avgTransaction: payments.length > 0 ? Math.round(totalAmount / payments.length) : 0,
            topCustomer
        });
    }, [payments]);

    // Filter payments
    const filteredPayments = payments.filter(payment => {
        const matchesSearch = searchQuery === '' ||
            payment.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
            payment.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
            payment.transactionId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            payment.product.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesMethod = selectedPaymentMethod === 'all' || payment.paymentMethod === selectedPaymentMethod;
        const matchesStatus = selectedStatus === 'all' || payment.status === selectedStatus;

        return matchesSearch && matchesMethod && matchesStatus;
    });

    // Get status color
    const getStatusColor = (status) => {
        switch (status) {
            case 'completed': return 'bg-green-500/10 text-green-400 border border-green-500/20';
            case 'pending': return 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20';
            case 'failed': return 'bg-red-500/10 text-red-400 border border-red-500/20';
            case 'refunded': return 'bg-blue-500/10 text-blue-400 border border-blue-500/20';
            case 'cancelled': return 'bg-gray-500/10 text-gray-400 border border-gray-500/20';
            default: return 'bg-gray-500/10 text-gray-400 border border-gray-500/20';
        }
    };

    // Get status icon
    const getStatusIcon = (status) => {
        switch (status) {
            case 'completed': return <CheckCircle className="h-4 w-4" />;
            case 'pending': return <Clock className="h-4 w-4" />;
            case 'failed': return <XCircle className="h-4 w-4" />;
            case 'refunded': return <ArrowDownRight className="h-4 w-4" />;
            case 'cancelled': return <XCircle className="h-4 w-4" />;
            default: return <AlertCircle className="h-4 w-4" />;
        }
    };

    // Get payment method icon
    const getPaymentMethodIcon = (method) => {
        const paymentMethod = paymentMethods.find(m => m.id === method);
        return paymentMethod ? paymentMethod.icon : CreditCard;
    };

    // Handle STK Push request
    const handleSTKPush = () => {
        setIsLoading(true);
        setTimeout(() => {
            // Simulate STK Push
            const newPayment = {
                id: `PAY-${payments.length + 1001}`,
                orderId: `ORD-${payments.length + 1001}`,
                customer: 'New Customer',
                phone: '0712345678',
                email: 'customer@email.com',
                product: 'Simulated Gaming Device',
                amount: Math.floor(Math.random() * 1000) + 500,
                paymentMethod: 'mpesa',
                status: 'completed',
                transactionId: `MPE00${Date.now()}`,
                mpesaCode: `RFT${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
                date: new Date().toISOString().split('T')[0],
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                autoAdded: true,
                receiptUrl: null
            };

            setPayments(prev => [newPayment, ...prev]);
            setIsLoading(false);
            setShowSTKModal(false);
            alert(`STK Push sent successfully! Payment ID: ${newPayment.id}`);
        }, 2000);
    };

    // Handle refund
    const handleRefund = (paymentId) => {
        setPayments(prev => prev.map(p =>
            p.id === paymentId ? { ...p, status: 'refunded' } : p
        ));
        alert('Payment refunded successfully!');
    };

    // Handle resend receipt
    const handleResendReceipt = (payment) => {
        alert(`Receipt sent to ${payment.email} and SMS to ${payment.phone}`);
    };

    // Handle view payment details
    const handleViewDetails = (payment) => {
        setSelectedPayment(payment);
        setShowPaymentDetails(true);
    };

    // Payment Method Distribution Data
    const paymentDistribution = paymentMethods
        .filter(m => m.id !== 'all')
        .map(method => ({
            name: method.name,
            value: payments.filter(p => p.paymentMethod === method.id).length,
            color: method.color.replace('bg-', '').replace('-500', '')
        }));

    return (
        <AdminLayout>
            <div className="min-h-screen bg-dark text-white p-4 sm:p-6">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-heading font-bold bg-gradient-to-r from-primary to-[#00D4FF] bg-clip-text text-transparent">
                                Payments Management
                            </h1>
                            <p className="text-gray-400 mt-1">Track, manage, and process all gaming device payments</p>
                        </div>

                        <div className="flex items-center space-x-3">
                            <button
                                onClick={() => window.location.reload()}
                                className="p-2 rounded-sm bg-dark-light border border-gray-800 hover:bg-gray-800 transition-colors"
                                title="Refresh"
                            >
                                <RefreshCw className="h-5 w-5 text-gray-400" />
                            </button>
                            <button
                                onClick={() => setShowSTKModal(true)}
                                className="px-4 py-2 rounded-sm bg-green-600 text-white hover:bg-green-700 flex items-center space-x-2"
                            >
                                <Smartphone className="h-4 w-4" />
                                <span>Send STK Push</span>
                            </button>
                            <button className="px-4 py-2 rounded-sm bg-primary text-white hover:bg-blue-600 flex items-center space-x-2">
                                <Plus className="h-4 w-4" />
                                <span>Add Payment</span>
                            </button>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        <div className="bg-dark-light border border-gray-800 rounded-sm p-4">
                            <div className="flex items-center justify-between">
                                <DollarSign className="h-6 w-6 text-primary" />
                                <TrendingUp className="h-4 w-4 text-green-500" />
                            </div>
                            <h3 className="text-2xl font-bold text-white mt-2">KSh {stats.totalAmount.toLocaleString()}</h3>
                            <p className="text-sm text-gray-400">Total Payments</p>
                        </div>

                        <div className="bg-dark-light border border-gray-800 rounded-sm p-4">
                            <div className="flex items-center justify-between">
                                <Calendar className="h-6 w-6 text-green-500" />
                                <ArrowUpRight className="h-4 w-4 text-green-500" />
                            </div>
                            <h3 className="text-2xl font-bold text-white mt-2">{stats.todayPayments}</h3>
                            <div className="flex justify-between">
                                <p className="text-sm text-gray-400">Today's Payments</p>
                                <p className="text-sm text-green-400">KSh {stats.todayAmount.toLocaleString()}</p>
                            </div>
                        </div>

                        <div className="bg-dark-light border border-gray-800 rounded-sm p-4">
                            <div className="flex items-center justify-between">
                                <PieChart className="h-6 w-6 text-purple-500" />
                                <Smartphone className="h-4 w-4 text-green-500" />
                            </div>
                            <h3 className="text-2xl font-bold text-white mt-2">{stats.mpesaPercentage}%</h3>
                            <div className="flex justify-between">
                                <p className="text-sm text-gray-400">MPesa Usage</p>
                                <p className="text-sm text-green-400">{stats.cashPercentage}% Cash</p>
                            </div>
                        </div>

                        <div className="bg-dark-light border border-gray-800 rounded-sm p-4">
                            <div className="flex items-center justify-between">
                                <Users className="h-6 w-6 text-orange-500" />
                                <Shield className="h-4 w-4 text-blue-500" />
                            </div>
                            <h3 className="text-lg font-bold text-white mt-2 truncate">{stats.topCustomer}</h3>
                            <div className="flex justify-between">
                                <p className="text-sm text-gray-400">Top Customer</p>
                                <p className="text-sm text-blue-400">Avg: KSh {stats.avgTransaction}</p>
                            </div>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex space-x-1 border-b border-gray-800 mb-6">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`px-4 py-3 text-sm font-medium transition-colors relative ${activeTab === tab.id
                                    ? 'text-primary border-b-2 border-primary'
                                    : 'text-gray-400 hover:text-white'
                                    }`}
                            >
                                {tab.name}
                                <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${activeTab === tab.id
                                    ? 'bg-primary/20 text-primary'
                                    : 'bg-gray-800 text-gray-400'
                                    }`}>
                                    {tab.count}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Filters */}
                <div className="mb-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search payments by customer, order ID, transaction ID..."
                                className="w-full pl-10 pr-4 py-2 bg-dark-light border border-gray-800 rounded-sm text-white focus:ring-1 focus:ring-primary focus:border-primary"
                            />
                        </div>

                        <div className="flex gap-2">
                            <select
                                value={selectedPaymentMethod}
                                onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                                className="px-4 py-2 bg-dark-light border border-gray-800 rounded-sm text-white"
                            >
                                {paymentMethods.map(method => (
                                    <option key={method.id} value={method.id}>{method.name}</option>
                                ))}
                            </select>

                            <select
                                value={selectedStatus}
                                onChange={(e) => setSelectedStatus(e.target.value)}
                                className="px-4 py-2 bg-dark-light border border-gray-800 rounded-sm text-white"
                            >
                                {paymentStatuses.map(status => (
                                    <option key={status.id} value={status.id}>{status.name}</option>
                                ))}
                            </select>

                            <select
                                value={dateRange}
                                onChange={(e) => setDateRange(e.target.value)}
                                className="px-4 py-2 bg-dark-light border border-gray-800 rounded-sm text-white"
                            >
                                {dateRanges.map(range => (
                                    <option key={range.id} value={range.id}>{range.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Payments Table */}
                <div className="bg-dark-light border border-gray-800 rounded-sm overflow-hidden mb-6">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gray-900/50">
                                    <th className="py-3 px-4 text-left text-sm font-medium text-gray-400">Payment ID</th>
                                    <th className="py-3 px-4 text-left text-sm font-medium text-gray-400">Customer</th>
                                    <th className="py-3 px-4 text-left text-sm font-medium text-gray-400">Product</th>
                                    <th className="py-3 px-4 text-left text-sm font-medium text-gray-400">Amount</th>
                                    <th className="py-3 px-4 text-left text-sm font-medium text-gray-400">Method</th>
                                    <th className="py-3 px-4 text-left text-sm font-medium text-gray-400">Status</th>
                                    <th className="py-3 px-4 text-left text-sm font-medium text-gray-400">Date & Time</th>
                                    <th className="py-3 px-4 text-left text-sm font-medium text-gray-400">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredPayments.map(payment => {
                                    const PaymentMethodIcon = getPaymentMethodIcon(payment.paymentMethod);
                                    return (
                                        <tr key={payment.id} className="border-t border-gray-800 hover:bg-gray-900/30">
                                            <td className="py-4 px-4">
                                                <div>
                                                    <p className="font-medium text-white">{payment.id}</p>
                                                    <p className="text-xs text-gray-400">{payment.orderId}</p>
                                                </div>
                                            </td>
                                            <td className="py-4 px-4">
                                                <div>
                                                    <p className="font-medium text-white">{payment.customer}</p>
                                                    <p className="text-xs text-gray-400">{payment.phone}</p>
                                                </div>
                                            </td>
                                            <td className="py-4 px-4">
                                                <p className="text-white truncate max-w-xs">{payment.product}</p>
                                                {payment.autoAdded && (
                                                    <span className="text-xs text-green-400">Auto Added</span>
                                                )}
                                            </td>
                                            <td className="py-4 px-4">
                                                <p className="text-white font-semibold">KSh {payment.amount.toLocaleString()}</p>
                                            </td>
                                            <td className="py-4 px-4">
                                                <div className="flex items-center space-x-2">
                                                    <PaymentMethodIcon className="h-4 w-4 text-gray-400" />
                                                    <span className="text-gray-300">{paymentMethods.find(m => m.id === payment.paymentMethod)?.name}</span>
                                                </div>
                                            </td>
                                            <td className="py-4 px-4">
                                                <span className={`px-3 py-1 rounded-sm text-sm flex items-center space-x-1 ${getStatusColor(payment.status)}`}>
                                                    {getStatusIcon(payment.status)}
                                                    <span>{payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}</span>
                                                </span>
                                            </td>
                                            <td className="py-4 px-4">
                                                <div>
                                                    <p className="text-white">{payment.time}</p>
                                                    <p className="text-xs text-gray-400">{payment.date}</p>
                                                </div>
                                            </td>
                                            <td className="py-4 px-4">
                                                <div className="flex space-x-2">
                                                    <button
                                                        onClick={() => handleViewDetails(payment)}
                                                        className="p-1 text-primary hover:bg-primary/20 rounded-sm"
                                                        title="View Details"
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleResendReceipt(payment)}
                                                        className="p-1 text-green-500 hover:bg-green-500/20 rounded-sm"
                                                        title="Resend Receipt"
                                                    >
                                                        <Receipt className="h-4 w-4" />
                                                    </button>
                                                    {payment.status === 'completed' && (
                                                        <button
                                                            onClick={() => handleRefund(payment.id)}
                                                            className="p-1 text-blue-500 hover:bg-blue-500/20 rounded-sm"
                                                            title="Refund Payment"
                                                        >
                                                            <ArrowDownRight className="h-4 w-4" />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Payment Summary */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                    {/* Payment Methods Distribution */}
                    <div className="bg-dark-light border border-gray-800 rounded-sm p-6">
                        <h3 className="text-lg font-heading font-semibold text-white mb-4">Payment Methods Distribution</h3>
                        <div className="space-y-4">
                            {paymentDistribution.map(method => (
                                <div key={method.name} className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-300">{method.name}</span>
                                        <span className="text-sm font-medium text-white">{method.value} payments</span>
                                    </div>
                                    <div className="w-full bg-gray-800 rounded-full h-2">
                                        <div
                                            className={`h-2 rounded-full bg-${method.color}-500`}
                                            style={{ width: `${(method.value / payments.length) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Recent Activity */}
                    <div className="bg-dark-light border border-gray-800 rounded-sm p-6 lg:col-span-2">
                        <h3 className="text-lg font-heading font-semibold text-white mb-4">Payment Activity</h3>
                        <div className="space-y-4">
                            {payments.slice(0, 5).map(payment => (
                                <div key={payment.id} className="flex items-center justify-between p-3 bg-gray-900/50 rounded-sm">
                                    <div className="flex items-center space-x-3">
                                        <div className={`p-2 rounded-sm ${payment.status === 'completed' ? 'bg-green-500/20' : 'bg-yellow-500/20'}`}>
                                            {React.createElement(getPaymentMethodIcon(payment.paymentMethod), { className: "h-4 w-4" })}
                                        </div>
                                        <div>
                                            <p className="font-medium text-white">{payment.customer}</p>
                                            <p className="text-xs text-gray-400">{payment.product}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-white">KSh {payment.amount.toLocaleString()}</p>
                                        <p className="text-xs text-gray-400">{payment.time}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-500">
                        Showing {filteredPayments.length} of {payments.length} payments
                    </div>
                    <div className="flex space-x-3">
                        <button className="px-4 py-2 border border-gray-700 rounded-sm hover:bg-gray-800 flex items-center space-x-2">
                            <Printer className="h-4 w-4" />
                            <span>Print Report</span>
                        </button>
                        <button className="px-4 py-2 border border-gray-700 rounded-sm hover:bg-gray-800 flex items-center space-x-2">
                            <Download className="h-4 w-4" />
                            <span>Export Data</span>
                        </button>
                        <button className="px-4 py-2 bg-primary text-white rounded-sm hover:bg-blue-600 flex items-center space-x-2">
                            <FileText className="h-4 w-4" />
                            <span>Generate Statement</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* STK Push Modal */}
            {showSTKModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-dark-light border border-gray-800 rounded-sm p-6 w-full max-w-md">
                        <h3 className="text-lg font-heading font-semibold text-white mb-4">Send STK Push Payment Request</h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Customer Phone Number</label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                    <input
                                        type="tel"
                                        placeholder="0712345678"
                                        className="w-full pl-10 pr-4 py-2 bg-gray-900 border border-gray-700 rounded-sm text-white"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Amount (KSh)</label>
                                <div className="relative">
                                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                    <input
                                        type="number"
                                        placeholder="Enter amount"
                                        className="w-full pl-10 pr-4 py-2 bg-gray-900 border border-gray-700 rounded-sm text-white"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Order Reference (Optional)</label>
                                <input
                                    type="text"
                                    placeholder="e.g., ORD-1234"
                                    className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-sm text-white"
                                />
                            </div>

                            <div className="flex space-x-3 pt-4">
                                <button
                                    onClick={handleSTKPush}
                                    disabled={isLoading}
                                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-sm hover:bg-green-700 disabled:opacity-50 flex items-center justify-center space-x-2"
                                >
                                    {isLoading ? (
                                        <>
                                            <RefreshCw className="h-4 w-4 animate-spin" />
                                            <span>Sending...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Smartphone className="h-4 w-4" />
                                            <span>Send STK Push</span>
                                        </>
                                    )}
                                </button>
                                <button
                                    onClick={() => setShowSTKModal(false)}
                                    className="px-4 py-2 border border-gray-700 rounded-sm hover:bg-gray-800"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Payment Details Modal */}
            {showPaymentDetails && selectedPayment && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-dark-light border border-gray-800 rounded-sm p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-heading font-semibold text-white">Payment Details</h3>
                            <button
                                onClick={() => setShowPaymentDetails(false)}
                                className="p-2 hover:bg-gray-800 rounded-sm"
                            >
                                <XCircle className="h-5 w-5 text-gray-400" />
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Left Column */}
                            <div className="space-y-4">
                                <div className="bg-gray-900/50 p-4 rounded-sm">
                                    <h4 className="font-medium text-white mb-2">Payment Information</h4>
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <span className="text-gray-400">Payment ID:</span>
                                            <span className="text-white font-medium">{selectedPayment.id}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-400">Order ID:</span>
                                            <span className="text-white">{selectedPayment.orderId}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-400">Transaction ID:</span>
                                            <span className="text-white">{selectedPayment.transactionId}</span>
                                        </div>
                                        {selectedPayment.mpesaCode && (
                                            <div className="flex justify-between">
                                                <span className="text-gray-400">MPesa Code:</span>
                                                <span className="text-white font-mono">{selectedPayment.mpesaCode}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="bg-gray-900/50 p-4 rounded-sm">
                                    <h4 className="font-medium text-white mb-2">Customer Information</h4>
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <span className="text-gray-400">Name:</span>
                                            <span className="text-white">{selectedPayment.customer}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-400">Phone:</span>
                                            <span className="text-white">{selectedPayment.phone}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-400">Email:</span>
                                            <span className="text-white">{selectedPayment.email}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right Column */}
                            <div className="space-y-4">
                                <div className="bg-gray-900/50 p-4 rounded-sm">
                                    <h4 className="font-medium text-white mb-2">Payment Details</h4>
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <span className="text-gray-400">Amount:</span>
                                            <span className="text-white font-bold">KSh {selectedPayment.amount.toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-400">Payment Method:</span>
                                            <span className={`px-2 py-1 rounded-sm text-sm ${getPaymentColor(selectedPayment.paymentMethod)}`}>
                                                {paymentMethods.find(m => m.id === selectedPayment.paymentMethod)?.name}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-400">Status:</span>
                                            <span className={`px-2 py-1 rounded-sm text-sm flex items-center space-x-1 ${getStatusColor(selectedPayment.status)}`}>
                                                {getStatusIcon(selectedPayment.status)}
                                                <span>{selectedPayment.status.charAt(0).toUpperCase() + selectedPayment.status.slice(1)}</span>
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-400">Date & Time:</span>
                                            <span className="text-white">{selectedPayment.date} {selectedPayment.time}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-400">Auto Added:</span>
                                            <span className="text-white">{selectedPayment.autoAdded ? 'Yes' : 'No'}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-gray-900/50 p-4 rounded-sm">
                                    <h4 className="font-medium text-white mb-2">Product Information</h4>
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <span className="text-gray-400">Product:</span>
                                            <span className="text-white">{selectedPayment.product}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex space-x-3 mt-6 pt-6 border-t border-gray-800">
                            {selectedPayment.receiptUrl && (
                                <button className="px-4 py-2 bg-primary text-white rounded-sm hover:bg-blue-600 flex items-center space-x-2">
                                    <Receipt className="h-4 w-4" />
                                    <span>View Receipt</span>
                                </button>
                            )}
                            <button
                                onClick={() => handleResendReceipt(selectedPayment)}
                                className="px-4 py-2 border border-gray-700 rounded-sm hover:bg-gray-800 flex items-center space-x-2"
                            >
                                <Mail className="h-4 w-4" />
                                <span>Resend Receipt</span>
                            </button>
                            <button
                                onClick={() => {
                                    navigator.clipboard.writeText(selectedPayment.transactionId || selectedPayment.id);
                                    alert('Transaction ID copied to clipboard!');
                                }}
                                className="px-4 py-2 border border-gray-700 rounded-sm hover:bg-gray-800 flex items-center space-x-2"
                            >
                                <Hash className="h-4 w-4" />
                                <span>Copy ID</span>
                            </button>
                            {selectedPayment.status === 'completed' && (
                                <button
                                    onClick={() => handleRefund(selectedPayment.id)}
                                    className="px-4 py-2 border border-red-700 text-red-400 rounded-sm hover:bg-red-500/10 flex items-center space-x-2"
                                >
                                    <ArrowDownRight className="h-4 w-4" />
                                    <span>Refund Payment</span>
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
};

export default Payments;