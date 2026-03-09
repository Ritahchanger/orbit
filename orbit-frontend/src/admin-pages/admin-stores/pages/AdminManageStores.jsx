import { useState } from 'react';
import AdminLayout from "../../dashboard/layout/Layout";
import { useStoreContext } from '../../../context/store/StoreContext';
import { useStores, useDeleteStore, useUpdateStore, useCreateStore } from '../../hooks/store-hook';
import { Building2, Store, Clock, Plus, Search, Users, CheckCircle, XCircle, Filter, List, Grid } from 'lucide-react';
import { toast } from 'react-hot-toast';
import StoreFormModal from '../components/StoreFormModal';
import StoreStatsCard from '../components/StoreStatsCard';
import StoreDetailsModal from '../components/StoreDetailsModal';
import StoreSkeleton from '../preloaders/AdminManageStoresPreloader';
import ListView from '../components/ListView';
import GridView from '../components/GridView';
import ExportButton from '../components/ExportButton';
import { useNavigate } from 'react-router-dom';

const AdminManageStores = () => {
    const navigate = useNavigate();
    const { currentStore, switchStore } = useStoreContext();
    const { data: storesData, isLoading, refetch } = useStores();

    // ========== STATE DECLARATIONS ==========
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [selectedStore, setSelectedStore] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
    const [showStoresMenu, setShowStoresMenu] = useState(false);

    // ========== HOOK CALLS ==========
    const createStoreMutation = useCreateStore();
    const deleteStoreMutation = useDeleteStore();
    const updateStoreMutation = useUpdateStore();

    const stores = storesData?.data || [];

    // Calculate statistics
    const stats = {
        total: stores.length,
        active: stores.filter(s => s.status === 'active').length,
        inactive: stores.filter(s => s.status === 'inactive').length,
        withManager: stores.filter(s => s.manager).length,
        openNow: calculateOpenStores(stores),
    };

    // Filter stores based on search and status
    const filteredStores = stores.filter(store => {
        const matchesSearch = searchTerm === '' ||
            store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            store.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
            store.address?.street?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === 'all' || store.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    // Handle store creation
    const handleCreateStore = async (storeData) => {
        try {
            await createStoreMutation.mutateAsync(storeData);
            setShowCreateModal(false);
            toast.success('Store created successfully');
            refetch();
        } catch (error) {
            toast.error(error.message || 'Failed to create store');
        }
    };

    const formatOpeningHours = (openingHours) => {
        if (!openingHours) return 'No hours set';

        const now = new Date();
        const day = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
        const dayMap = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        const currentDay = dayMap[day];

        // Get today's hours
        const todayHours = openingHours[currentDay];

        if (!todayHours || todayHours.open === 'Closed' || todayHours.close === 'Closed') {
            return 'Closed Today';
        }

        // Format the hours nicely
        const formatTime = (time) => {
            if (!time) return '';
            // If time is in HH:mm format
            if (time.includes(':')) {
                const [hours, minutes] = time.split(':');
                const hour = parseInt(hours);
                const ampm = hour >= 12 ? 'PM' : 'AM';
                const displayHour = hour % 12 || 12;
                return `${displayHour}:${minutes} ${ampm}`;
            }
            return time;
        };

        return `${formatTime(todayHours.open)} - ${formatTime(todayHours.close)}`;
    };

    // Handle store update
    const handleUpdateStore = async (storeId, updateData) => {
        try {
            await updateStoreMutation.mutateAsync({ storeId, updateData });
            setShowEditModal(false);
            setSelectedStore(null);
            toast.success('Store updated successfully');
            refetch();
        } catch (error) {
            toast.error(error.message || 'Failed to update store');
        }
    };

    // Handle store deletion
    const handleDeleteStore = async (storeId) => {
        try {
            await deleteStoreMutation.mutateAsync(storeId);
            toast.success('Store deleted successfully');
            refetch();
        } catch (error) {
            toast.error(error.message || 'Failed to delete store');
        }
    };

    // Handle store status toggle
    const handleToggleStatus = async (storeId, currentStatus) => {
        const newStatus = currentStatus === 'active' ? 'inactive' : 'active';

        try {
            await updateStoreMutation.mutateAsync({
                storeId,
                updateData: { status: newStatus }
            });
            toast.success(`Store ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully`);
            refetch();
        } catch (error) {
            toast.error(error.message || 'Failed to update store status');
        }
    };

    // Open store details
    const handleViewDetails = (store) => {
        setSelectedStore(store);
        setShowDetailsModal(true);
    };

    // Open edit modal
    const handleEditStore = (store) => {
        setSelectedStore(store);
        setShowEditModal(true);
    };

    // Handle store switch
    const handleStoreSwitch = async (storeId) => {
        try {
            await switchStore(storeId);

            if (showStoresMenu !== undefined) {
                setShowStoresMenu(false);
            }

            toast.success('Store switched successfully');
            navigate('/admin/inventory');

        } catch (error) {
            console.error('Failed to switch store:', error);
            toast.error('Failed to switch store');
        }
    };

    // Helper function to calculate open stores
    function calculateOpenStores(stores) {
        const now = new Date();
        const day = now.getDay();
        const hours = now.getHours();
        const minutes = now.getMinutes();
        const currentTime = hours * 60 + minutes;

        return stores.filter(store => {
            const dayMap = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
            const dayName = dayMap[day];
            const hours = store.openingHours?.[dayName];

            if (!hours || hours.open === 'Closed' || hours.close === 'Closed') {
                return false;
            }

            const [openHour, openMinute] = hours.open.split(':').map(Number);
            const [closeHour, closeMinute] = hours.close.split(':').map(Number);

            const openTime = openHour * 60 + openMinute;
            const closeTime = closeHour * 60 + closeMinute;

            return currentTime >= openTime && currentTime <= closeTime;
        }).length;
    }

    if (isLoading) {
        return (
            <AdminLayout>
                <StoreSkeleton />
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="space-y-2 mx-4 pt-5">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                            Store Management
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">
                            Manage {stores.length} stores across your network
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                            className="p-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-sm transition-colors"
                            title={viewMode === 'grid' ? 'Switch to list view' : 'Switch to grid view'}
                        >
                            {viewMode === 'grid' ? (
                                <List size={18} className="text-gray-700 dark:text-gray-300" />
                            ) : (
                                <Grid size={18} className="text-gray-700 dark:text-gray-300" />
                            )}
                        </button>

                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600 text-white font-medium rounded-sm transition-colors"
                        >
                            <Plus size={18} />
                            Add New Store
                        </button>
                    </div>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                    <StoreStatsCard
                        title="Total Stores"
                        value={stats.total}
                        icon={<Building2 className="h-5 w-5" />}
                        color="blue"
                        trend={`+${Math.floor(Math.random() * 5)}%`}
                    />

                    <StoreStatsCard
                        title="Active Stores"
                        value={stats.active}
                        icon={<CheckCircle className="h-5 w-5" />}
                        color="green"
                        description="Currently operating"
                    />

                    <StoreStatsCard
                        title="Open Now"
                        value={stats.openNow}
                        icon={<Clock className="h-5 w-5" />}
                        color="orange"
                        description="Based on opening hours"
                    />

                    <StoreStatsCard
                        title="With Manager"
                        value={stats.withManager}
                        icon={<Users className="h-5 w-5" />}
                        color="purple"
                        description={`${Math.round((stats.withManager / stats.total) * 100)}% managed`}
                    />

                    <StoreStatsCard
                        title="Inactive"
                        value={stats.inactive}
                        icon={<XCircle className="h-5 w-5" />}
                        color="red"
                        description="Requires attention"
                    />
                </div>

                {/* Filters and Search */}
                <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-sm p-4">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <div className="flex-1 w-full">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 h-4 w-4" />
                                <input
                                    type="text"
                                    placeholder="Search stores by name, code, or address..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2">
                                <Filter size={16} className="text-gray-600 dark:text-gray-400" />
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white text-sm rounded-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                                >
                                    <option value="all" className="text-gray-700 dark:text-gray-300">All Status</option>
                                    <option value="active" className="text-gray-900 dark:text-white">Active</option>
                                    <option value="inactive" className="text-gray-900 dark:text-white">Inactive</option>
                                    <option value="maintenance" className="text-gray-900 dark:text-white">Maintenance</option>
                                </select>
                            </div>

                            <button
                                onClick={() => refetch()}
                                className="p-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-sm transition-colors"
                                title="Refresh stores"
                            >
                                <svg className="w-4 h-4 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                            </button>

                            <ExportButton stores={stores} filteredStores={filteredStores} />
                        </div>
                    </div>
                </div>

                {/* Stores Display */}
                <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-sm overflow-hidden">
                    {filteredStores.length === 0 ? (
                        <div className="p-8 text-center">
                            <Store className="h-12 w-12 text-gray-500 dark:text-gray-600 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">No stores found</h3>
                            <p className="text-gray-600 dark:text-gray-500 mb-4">
                                {searchTerm ? 'Try adjusting your search terms' : 'Get started by creating your first store'}
                            </p>
                            <button
                                onClick={() => setShowCreateModal(true)}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600 text-white font-medium rounded-sm transition-colors"
                            >
                                <Plus size={18} />
                                Create Store
                            </button>
                        </div>
                    ) : viewMode === 'grid' ? (
                        // Grid View
                        <GridView
                            filteredStores={filteredStores}
                            currentStore={currentStore}
                            handleViewDetails={handleViewDetails}
                            handleEditStore={handleEditStore}
                            handleDeleteStore={handleDeleteStore}
                            handleToggleStatus={handleToggleStatus}
                            handleStoreSwitch={handleStoreSwitch}
                        />
                    ) : (
                        // List View
                        <ListView
                            filteredStores={filteredStores}
                            currentStore={currentStore}
                            formatOpeningHours={formatOpeningHours}
                            handleViewDetails={handleViewDetails}
                            handleEditStore={handleEditStore}
                            handleDeleteStore={handleDeleteStore}
                            handleStoreSwitch={handleStoreSwitch}
                        />
                    )}
                </div>

                {/* Pagination/Info */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-600 dark:text-gray-400">
                    <div>
                        Showing {filteredStores.length} of {stores.length} stores
                        {searchTerm && ` matching "${searchTerm}"`}
                    </div>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => refetch()}
                            className="text-blue-600 dark:text-blue-500 hover:text-blue-700 dark:hover:text-blue-400 transition-colors"
                        >
                            Refresh Data
                        </button>
                    </div>
                </div>
            </div>

            {/* Modals */}
            {showCreateModal && (
                <StoreFormModal
                    isOpen={showCreateModal}
                    onClose={() => setShowCreateModal(false)}
                    onSubmit={handleCreateStore}
                    title="Create New Store"
                    submitText="Create Store"
                    isLoading={createStoreMutation.isPending}
                />
            )}

            {showEditModal && selectedStore && (
                <StoreFormModal
                    isOpen={showEditModal}
                    onClose={() => {
                        setShowEditModal(false);
                        setSelectedStore(null);
                    }}
                    onSubmit={(data) => handleUpdateStore(selectedStore._id, data)}
                    title="Edit Store"
                    submitText="Update Store"
                    initialData={selectedStore}
                    isLoading={updateStoreMutation.isPending}
                />
            )}

            {showDetailsModal && selectedStore && (
                <StoreDetailsModal
                    isOpen={showDetailsModal}
                    onClose={() => {
                        setShowDetailsModal(false);
                        setSelectedStore(null);
                    }}
                    store={selectedStore}
                    onEdit={() => {
                        setShowDetailsModal(false);
                        setShowEditModal(true);
                    }}
                    onDelete={() => handleDeleteStore(selectedStore._id)}
                />
            )}
        </AdminLayout>
    );
};

export default AdminManageStores;