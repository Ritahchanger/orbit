import { Building, Globe, X } from 'lucide-react';
import { useStoreSelectionModal } from '../hooks/useStoreSelectionModal';
import Stores from './Stores';
import ModalFooter from './ModalFooter';

const StoreSelectionModal = () => {
    const {
        isOpen,
        user,
        selectedStore,
        stores,
        loadingStores,
        closeModal,
        selectStore,
        confirmSelection,
        handleGlobalSelect
    } = useStoreSelectionModal();

    const handleCancel = () => {
        // Clear any existing selection
        sessionStorage.removeItem('current_store_id');
        localStorage.removeItem('selectedStoreId');
        closeModal();
        // Optionally redirect to home
        window.location.href = '/';
    };

    const handleClose = () => {
        // Don't clear storage on close, just close modal
        closeModal();
    };

    const handleStoreSelect = (store) => {
        selectStore(store);
    };

    // Enhanced confirm selection that properly saves to sessionStorage
    const handleConfirmSelection = () => {
        if (selectedStore) {
            // Save to sessionStorage for AdminLayout to detect
            sessionStorage.setItem('current_store_id', selectedStore._id);
            // Also save to localStorage for backward compatibility
            localStorage.setItem('selectedStoreId', selectedStore._id);

            // Only log in development
            if (process.env.NODE_ENV !== 'production') {
                console.log('Store selected and saved to storage:', {
                    storeId: selectedStore._id,
                    storeName: selectedStore.name,
                    sessionStorage: sessionStorage.getItem('current_store_id'),
                    localStorage: localStorage.getItem('selectedStoreId')
                });
            }

            // Call the original confirmSelection
            confirmSelection();
        }
    };

    // Enhanced global select that properly saves to sessionStorage
    const handleGlobalSelection = () => {
        // For global view
        sessionStorage.setItem('current_store_id', 'global');
        localStorage.setItem('selectedStoreId', 'global');

        // Only log in development
        if (process.env.NODE_ENV !== 'production') {
            console.log('Global view selected:', {
                sessionStorage: sessionStorage.getItem('current_store_id'),
                localStorage: localStorage.getItem('selectedStoreId')
            });
        }

        // Call the original handleGlobalSelect
        handleGlobalSelect();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100]">
            {/* Backdrop with smooth animation */}
            <div 
                className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity duration-300"
            />
            
            {/* Modal Container */}
            <div className="absolute inset-0 flex items-center justify-center p-4">
                <div 
                    className="bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl transform transition-all duration-300 scale-100 opacity-100"
                >
                    {/* Modal Header */}
                    <div className="bg-linear-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 border-b border-gray-300 dark:border-gray-700 p-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                                    <Building className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                        Welcome back, {user?.name || 'Admin'}!
                                    </h2>
                                    <p className="text-gray-600 dark:text-gray-300 mt-1">
                                        Select a store to manage or choose Global View for system-wide access
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={handleClose}
                                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors duration-200"
                                aria-label="Close modal"
                            >
                                <X className="h-6 w-6" />
                            </button>
                        </div>
                    </div>

                    {/* Store Grid */}
                    <div className="p-6 overflow-y-auto max-h-[60vh]">
                        {/* Global View Card */}
                        <div
                            onClick={handleGlobalSelection}
                            className="mb-6 p-6 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-gray-800 dark:to-gray-900 border-2 border-purple-200 dark:border-gray-700 hover:border-purple-400 dark:hover:border-purple-500 rounded-sm cursor-pointer transition-all duration-300 hover:shadow-lg group"
                        >
                            <div className="flex items-center gap-5">
                                <div className="p-4 bg-gradient-to-br from-purple-500 to-blue-500 rounded-sm group-hover:from-purple-600 group-hover:to-blue-600 shadow-md transition-all duration-300">
                                    <Globe className="h-10 w-10 text-white" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Global View</h3>
                                    <p className="text-gray-600 dark:text-gray-300">
                                        Access all stores, view system-wide analytics, and manage global settings
                                    </p>
                                </div>
                                <div className="text-right">
                                    <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">All Stores</div>
                                    <div className="inline-flex items-center px-4 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-sm font-medium">
                                        Full System Access
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Stores Section */}
                        <div className="mb-4">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-3">
                                    <Building className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                                    Select Specific Store
                                </h3>
                                <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium">
                                    {stores.length} stores available
                                </span>
                            </div>

                            {loadingStores ? (
                                <div className="text-center py-12">
                                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-200 dark:border-gray-700 border-t-blue-600 dark:border-t-blue-500 mb-4"></div>
                                    <p className="text-gray-600 dark:text-gray-400">Loading stores...</p>
                                    <p className="text-gray-500 dark:text-gray-500 text-sm mt-1">Please wait a moment</p>
                                </div>
                            ) : stores.length > 0 ? (
                                <Stores 
                                    stores={stores} 
                                    handleStoreSelect={handleStoreSelect} 
                                    selectedStore={selectedStore} 
                                />
                            ) : (
                                <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-300 dark:border-gray-700">
                                    <div className="inline-flex p-4 bg-gray-200 dark:bg-gray-700 rounded-full mb-4">
                                        <Building className="h-12 w-12 text-gray-500 dark:text-gray-400" />
                                    </div>
                                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Stores Available</h4>
                                    <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                                        There are no stores configured in the system yet.
                                        Please contact your system administrator to add stores.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Modal Footer */}
                    <ModalFooter 
                        selectedStore={selectedStore} 
                        handleCancel={handleCancel} 
                        handleConfirmSelection={handleConfirmSelection} 
                    />
                </div>
            </div>
        </div>
    );
};

export default StoreSelectionModal;