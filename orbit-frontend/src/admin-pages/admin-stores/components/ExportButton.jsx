import { useState } from 'react';
import { Download, FileDown, Database, Filter, ChevronDown } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { prepareStoresForCSV, exportToCSV } from '../utils/csvExporter';
import { useStoreId } from '../../../context/store/StoreContext';

const ExportButton = ({
    stores,
    filteredStores,
    variant = 'default'
}) => {
    const [isExporting, setIsExporting] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);

    const storeId = useStoreId();
    const currentStoreId = storeId?._id || storeId || null;

    const handleExportFiltered = async () => {
        if (filteredStores.length === 0) {
            toast.error('No filtered stores to export');
            return;
        }

        setIsExporting(true);
        try {
            const exportData = prepareStoresForCSV(filteredStores, currentStoreId || undefined);
            exportToCSV(exportData, 'filtered_stores');
            toast.success(`Exported ${filteredStores.length} store(s) to CSV`);
        } catch (error) {
            console.error('Export error:', error);
            toast.error('Failed to export filtered stores');
        } finally {
            setIsExporting(false);
            setShowDropdown(false);
        }
    };

    const handleExportAll = async () => {
        if (stores.length === 0) {
            toast.error('No stores available to export');
            return;
        }

        setIsExporting(true);
        try {
            const exportData = prepareStoresForCSV(stores, currentStoreId);
            exportToCSV(exportData, 'all_stores');
            toast.success(`Exported all ${stores.length} store(s) to CSV`);
        } catch (error) {
            console.error('Export error:', error);
            toast.error('Failed to export all stores');
        } finally {
            setIsExporting(false);
            setShowDropdown(false);
        }
    };

    const handleExportJSON = () => {
        try {
            const exportData = filteredStores.map(store => ({
                ...store,
                formattedAddress: `${store.address?.street || ''}, ${store.address?.city || ''}, ${store.address?.state || ''}, ${store.address?.country || ''}`
            }));

            const jsonString = JSON.stringify(exportData, null, 2);
            const blob = new Blob([jsonString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `stores_${new Date().toISOString().split('T')[0]}.json`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            toast.success(`Exported ${filteredStores.length} stores as JSON`);
            setShowDropdown(false);
        } catch (error) {
            toast.error('Failed to export JSON');
        }
    };

    if (variant === 'simple') {
        return (
            <button
                onClick={handleExportFiltered}
                disabled={isExporting || filteredStores.length === 0}
                className={`flex items-center gap-2 px-3 py-2 rounded-sm transition-colors ${isExporting || filteredStores.length === 0
                    ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600 text-white'
                    }`}
            >
                {isExporting ? (
                    <>
                        <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                        Exporting...
                    </>
                ) : (
                    <>
                        <Download size={16} />
                        Export ({filteredStores.length})
                    </>
                )}
            </button>
        );
    }

    return (
        <div className="relative">
            <button
                onClick={() => setShowDropdown(!showDropdown)}
                disabled={isExporting}
                className={`flex items-center gap-2 px-3 py-2 rounded-sm transition-colors ${isExporting
                    ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600 text-white'
                    }`}
            >
                {isExporting ? (
                    <>
                        <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                        Exporting...
                    </>
                ) : (
                    <>
                        <Download size={16} />
                        <span>Export</span>
                        <span className="text-xs bg-white/20 px-2 py-0.5 rounded">
                            {filteredStores.length}
                        </span>
                        <ChevronDown size={14} className={`transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
                    </>
                )}
            </button>

            {showDropdown && (
                <>
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setShowDropdown(false)}
                    />
                    <div className="absolute top-full right-0 mt-1 w-56 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-sm shadow-lg z-50">
                        <div className="py-1">
                            <div className="px-4 py-2 text-xs text-gray-600 dark:text-gray-400 border-b border-gray-300 dark:border-gray-700 font-medium">
                                Export Options
                            </div>

                            <button
                                onClick={handleExportFiltered}
                                disabled={filteredStores.length === 0}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Filter size={14} className="text-blue-600 dark:text-blue-400" />
                                <div className="flex-1">
                                    <div className="font-medium">Filtered Stores</div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">Current search & filters</div>
                                </div>
                                <span className="text-xs bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 px-2 py-0.5 rounded">
                                    {filteredStores.length}
                                </span>
                            </button>

                            <button
                                onClick={handleExportAll}
                                disabled={stores.length === 0}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Database size={14} className="text-purple-600 dark:text-purple-400" />
                                <div className="flex-1">
                                    <div className="font-medium">All Stores</div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">Complete database</div>
                                </div>
                                <span className="text-xs bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-0.5 rounded">
                                    {stores.length}
                                </span>
                            </button>

                            <button
                                onClick={handleExportJSON}
                                disabled={filteredStores.length === 0}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <FileDown size={14} className="text-green-600 dark:text-green-400" />
                                <div className="flex-1">
                                    <div className="font-medium">JSON Format</div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">For developers</div>
                                </div>
                            </button>

                            <div className="px-4 py-2 text-xs text-gray-500 dark:text-gray-400 border-t border-gray-300 dark:border-gray-700">
                                Files download in selected format
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default ExportButton;