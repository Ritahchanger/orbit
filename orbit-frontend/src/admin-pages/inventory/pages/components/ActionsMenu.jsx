import { Package, Plus } from "lucide-react";
import { openModal } from "../../../products/redux/add-product-modal-slice";
import { useDispatch } from "react-redux";

const ActionsMenu = ({ setShowActionsMenu, setShowQuickAddModal }) => {
    const dispatch = useDispatch();

    return (
        <div className="absolute top-full right-0 mt-2 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-sm shadow-lg z-30">
            {/* Quick Add by SKU */}
            <button
                onClick={() => {
                    setShowActionsMenu(false);
                    setShowQuickAddModal(true);
                }}
                className="flex items-center space-x-3 w-full p-3 py-0 pt-1 hover:bg-gray-50 dark:hover:bg-gray-700 text-left transition-colors"
            >
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-sm flex items-center justify-center">
                    <Plus size={16} className="text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                    <p className="font-medium text-sm text-gray-900 dark:text-white">Add product to inventory</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Add product using SKU</p>
                </div>
            </button>

            {/* Add New Product */}
            {/* <button
                onClick={() => {
                    setShowActionsMenu(false);
                    dispatch(openModal());
                }}
                className="flex items-center space-x-3 w-full p-3 hover:bg-gray-50 dark:hover:bg-gray-700 text-left transition-colors"
            >
                <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-900/20 rounded-sm flex items-center justify-center">
                    <Package size={16} className="text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                    <p className="font-medium text-sm text-gray-900 dark:text-white">Add New Product</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Add new product to inventory</p>
                </div>
            </button> */}
        </div>
    )
}

export default ActionsMenu