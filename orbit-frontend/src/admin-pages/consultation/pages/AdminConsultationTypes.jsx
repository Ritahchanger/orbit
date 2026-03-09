// pages/admin/consultation-types/AdminConsultationTypes.jsx
import { useState } from 'react';
import {
    Plus,
    Search,
    RefreshCw,
    BarChart3,
    AlertCircle,
    Loader2,
    Download
} from 'lucide-react';

import AdminLayout from "../../dashboard/layout/Layout";

import { useConsultationMutations } from "../../hooks/use-consultation-mutations";

import { useConsultationTypes } from "../../hooks/use-consultation-queries";

import { toast } from 'react-hot-toast';


import StatsConsultationTypes from '../components/StatsConsultationTypes';

import ConsultationEdit from '../components/ConsultationEdit';

import ConsultationTypesList from '../components/ConsultationTypesList';

import Toggles from '../components/Toggles';

const AdminConsultationTypes = () => {
    // State
    const [searchQuery, setSearchQuery] = useState('');
    const [showInactive, setShowInactive] = useState(false);
    const [viewMode, setViewMode] = useState('grid');
    const [sortBy, setSortBy] = useState('order');
    const [sortOrder, setSortOrder] = useState('asc');
    const [selectedTypes, setSelectedTypes] = useState([]);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [editingType, setEditingType] = useState(null);

    // Helper functions - MOVED UP HERE
    const extractPriceValue = (price) => {
        if (!price) return 0;

        if (price === 'FREE') return 0;

        if (typeof price === 'number') return price;

        if (typeof price === 'string') {
            // Remove currency symbol, commas, and extract number
            const cleanedPrice = price.replace(/[^\d.]/g, '');
            return parseFloat(cleanedPrice) || 0;
        }

        if (typeof price === 'object' && price !== null) {
            // Handle price object { amount: 1500, currency: 'KES', display: 'KSh 1,500' }
            if (price.amount !== undefined) return price.amount;
            return 0;
        }

        return 0;
    };

    const extractDurationMinutes = (duration) => {
        if (!duration) return 0;

        // Handle cases like "45 minutes", "60 minutes", "2 hours", etc.
        const lowerDuration = duration.toLowerCase();

        if (lowerDuration.includes('hour')) {
            const hoursMatch = duration.match(/\d+/);
            const hours = hoursMatch ? parseInt(hoursMatch[0]) : 0;
            return hours * 60;
        }

        if (lowerDuration.includes('minute')) {
            const minutesMatch = duration.match(/\d+/);
            return minutesMatch ? parseInt(minutesMatch[0]) : 0;
        }

        // Try to extract any number
        const match = duration.match(/\d+/);
        return match ? parseInt(match[0]) : 0;
    };

    // Queries
    const {
        data: consultationTypesData,
        isLoading,
        error,
        refetch
    } = useConsultationTypes({
        activeOnly: !showInactive
    });

    // Mutations
    const {
        createConsultationType,
        updateConsultationType,
        deleteConsultationType,
        toggleConsultationTypeStatus,
        reorderConsultationTypes,
        isDeletingConsultationType,
        isTogglingConsultationTypeStatus,
        isCreatingConsultationType,
        isUpdatingConsultationType
    } = useConsultationMutations();

    // Data
    const consultationTypes = consultationTypesData?.data || [];

    // Stats
    const stats = {
        total: consultationTypes.length,
        active: consultationTypes.filter(t => t.isActive !== false).length,
        inactive: consultationTypes.filter(t => t.isActive === false).length,
        free: consultationTypes.filter(t =>
            t.price === 'FREE' ||
            (typeof t.price === 'string' && t.price.includes('FREE')) ||
            (typeof t.price === 'number' && t.price === 0)
        ).length,
        paid: consultationTypes.length - consultationTypes.filter(t =>
            t.price === 'FREE' ||
            (typeof t.price === 'string' && t.price.includes('FREE')) ||
            (typeof t.price === 'number' && t.price === 0)
        ).length
    };

    // Filter and sort - Now this can use the helper functions
    const filteredAndSortedTypes = consultationTypes
        .filter(type => {
            const matchesSearch = searchQuery === '' ||
                type.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                type.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (type.id && type.id.toLowerCase().includes(searchQuery.toLowerCase()));

            return matchesSearch;
        })
        .sort((a, b) => {
            let aValue, bValue;

            switch (sortBy) {
                case 'title':
                    aValue = a.title.toLowerCase();
                    bValue = b.title.toLowerCase();
                    break;
                case 'price':
                    // Extract numeric price for sorting
                    aValue = extractPriceValue(a.price);
                    bValue = extractPriceValue(b.price);
                    break;
                case 'duration':
                    // Extract minutes from duration string
                    aValue = extractDurationMinutes(a.duration);
                    bValue = extractDurationMinutes(b.duration);
                    break;
                case 'order':
                default:
                    aValue = a.order || 0;
                    bValue = b.order || 0;
                    break;
            }

            if (sortOrder === 'asc') {
                return aValue > bValue ? 1 : -1;
            } else {
                return aValue < bValue ? 1 : -1;
            }
        });

    // Handlers
    const handleCreateType = async (typeData) => {
        try {
            await createConsultationType(typeData);
            setIsCreateModalOpen(false);
            toast.success('Consultation type created successfully');
        } catch (error) {
            toast.error(error.message || 'Failed to create consultation type');
        }
    };

    const handleUpdateType = async (id, updateData) => {
        try {
            await updateConsultationType({ id, data: updateData });
            setEditingType(null);
            toast.success('Consultation type updated successfully');
        } catch (error) {
            toast.error(error.message || 'Failed to update consultation type');
        }
    };

    const handleDeleteType = async (id) => {
        if (window.confirm('Are you sure you want to delete this consultation type?')) {
            try {
                await deleteConsultationType(id);
                toast.success('Consultation type deleted successfully');
            } catch (error) {
                toast.error(error.message || 'Failed to delete consultation type');
            }
        }
    };

    const handleToggleStatus = async (id) => {
        try {
            await toggleConsultationTypeStatus(id);
        } catch (error) {
            toast.error(error.message || 'Failed to toggle status');
        }
    };

    const handleDuplicateType = (type) => {
        const duplicate = {
            ...type,
            title: `${type.title} (Copy)`,
            id: `${type.id}-copy-${Date.now()}`
        };
        handleCreateType(duplicate);
    };

    const handleExportCSV = () => {
        const dataToExport = consultationTypes.map(type => ({
            'ID': type.id,
            'Title': type.title,
            'Description': type.description,
            'Duration': type.duration,
            'Price': type.price,
            'Status': type.isActive === false ? 'Inactive' : 'Active',
            'Features Count': type.features?.length || 0,
            'Icon': type.icon
        }));

        const csvContent = [
            Object.keys(dataToExport[0]).join(','),
            ...dataToExport.map(row => Object.values(row).map(value => `"${value}"`).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `consultation-types-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
    };

    // Loading state
    if (isLoading) {
        return (
            <AdminLayout>
                <div className="flex items-center justify-center min-h-screen">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600 dark:text-blue-400" />
                </div>
            </AdminLayout>
        );
    }

    // Error state
    if (error) {
        return (
            <AdminLayout>
                <div className="flex flex-col items-center justify-center min-h-screen">
                    <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Failed to load consultation types</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">{error.message}</p>
                    <button
                        onClick={() => refetch()}
                        className="px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-sm hover:bg-blue-700 dark:hover:bg-blue-600 transition"
                    >
                        Retry
                    </button>
                </div>
            </AdminLayout>
        );
    }

    // Empty state
    if (consultationTypes.length === 0) {
        return (
            <AdminLayout>
                <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white p-6">
                    <div className="flex flex-col items-center justify-center min-h-[60vh]">
                        <div className="text-center max-w-md">
                            <div className="h-16 w-16 bg-gray-200 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                <BarChart3 className="h-8 w-8 text-gray-500 dark:text-gray-400" />
                            </div>
                            <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">No consultation types yet</h3>
                            <p className="text-gray-600 dark:text-gray-400 mb-6">Create your first consultation type to get started</p>
                            <button
                                onClick={() => setIsCreateModalOpen(true)}
                                className="px-6 py-3 bg-blue-600 dark:bg-blue-500 text-white rounded-sm hover:bg-blue-700 dark:hover:bg-blue-600 flex items-center justify-center mx-auto space-x-2 transition"
                            >
                                <Plus className="h-5 w-5" />
                                <span>Create First Type</span>
                            </button>
                        </div>
                    </div>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white p-4 sm:p-6">
                {/* Header */}
                <div className="mb-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-blue-500 dark:to-cyan-500 bg-clip-text text-transparent">
                                Consultation Types
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400 mt-1">Manage different types of gaming setup consultations</p>
                        </div>

                        <div className="flex items-center space-x-3">
                            <button
                                onClick={() => refetch()}
                                className="p-2 rounded-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                title="Refresh"
                            >
                                <RefreshCw className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                            </button>
                            <button
                                onClick={handleExportCSV}
                                className="p-2 rounded-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                title="Export CSV"
                            >
                                <Download className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                            </button>
                            <button
                                onClick={() => setIsCreateModalOpen(true)}
                                className="px-4 py-2 rounded-sm bg-blue-600 dark:bg-blue-500 text-white hover:bg-blue-700 dark:hover:bg-blue-600 flex items-center space-x-2 transition"
                                disabled={isCreatingConsultationType}
                            >
                                <Plus className="h-4 w-4" />
                                <span>New Type</span>
                            </button>
                        </div>
                    </div>

                    {/* Stats */}
                    <StatsConsultationTypes stats={stats} />
                </div>

                {/* Filters & Controls */}
                <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-sm p-4 mb-2">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {/* Search */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-2">Search</label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                                <input
                                    type="text"
                                    placeholder="Search by title or description..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-sm text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
                                />
                            </div>
                        </div>

                        {/* Sort By */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-2">Sort By</label>
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
                            >
                                <option value="order">Display Order</option>
                                <option value="title">Title</option>
                                <option value="price">Price</option>
                                <option value="duration">Duration</option>
                            </select>
                        </div>

                        {/* Sort Order */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-2">Order</label>
                            <div className="flex">
                                <button
                                    onClick={() => setSortOrder('asc')}
                                    className={`flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-l-sm ${sortOrder === 'asc' ? 'bg-blue-600 dark:bg-blue-500 text-white' : 'bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
                                >
                                    Asc
                                </button>
                                <button
                                    onClick={() => setSortOrder('desc')}
                                    className={`flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 border-l-0 rounded-r-sm ${sortOrder === 'desc' ? 'bg-blue-600 dark:bg-blue-500 text-white' : 'bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
                                >
                                    Desc
                                </button>
                            </div>
                        </div>

                        {/* Toggles */}
                        <Toggles
                            setViewMode={setViewMode}
                            viewMode={viewMode}
                            setShowInactive={setShowInactive}
                            showInactive={showInactive}
                        />
                    </div>
                </div>

                {/* Results Count */}
                <div className="flex items-center justify-between mb-2">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                        Showing {filteredAndSortedTypes.length} of {consultationTypes.length} consultation types
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                        {searchQuery && `Search: "${searchQuery}"`}
                    </div>
                </div>

                {/* Consultation Types List/Grid */}
                <ConsultationTypesList
                    filteredAndSortedTypes={filteredAndSortedTypes}
                    handleToggleStatus={handleToggleStatus}
                    setEditingType={setEditingType}
                    handleDeleteType={handleDeleteType}
                    isTogglingConsultationTypeStatus={isTogglingConsultationTypeStatus}
                    handleDuplicateType={handleDuplicateType}
                    isDeletingConsultationType={isDeletingConsultationType}
                    viewMode={viewMode}
                />

                {/* Empty search results */}
                {filteredAndSortedTypes.length === 0 && consultationTypes.length > 0 && (
                    <div className="text-center py-12">
                        <Search className="h-12 w-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No consultation types found</h3>
                        <p className="text-gray-600 dark:text-gray-400">Try adjusting your search or filters</p>
                    </div>
                )}

                {/* Create/Edit Modal */}
                <ConsultationEdit
                    isCreateModalOpen={isCreateModalOpen}
                    editingType={editingType}
                    setIsCreateModalOpen={setIsCreateModalOpen}
                    setEditingType={setEditingType}
                    handleUpdateType={handleUpdateType}
                    handleCreateType={handleCreateType}
                    isCreatingConsultationType={isCreatingConsultationType}
                    isUpdatingConsultationType={isUpdatingConsultationType}
                />
            </div>
        </AdminLayout>
    );
};

export default AdminConsultationTypes;