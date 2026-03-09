import { Copy } from "lucide-react";
import { toast } from "react-hot-toast"

const AdminCopySKU = ({ productSku }) => {
    // Handle SKU copy
    const handleCopySKU = (sku) => {
        navigator.clipboard.writeText(sku)
            .then(() => {
                toast.success('SKU copied to clipboard!', {
                    icon: '📋',
                    duration: 2000
                });
            })
            .catch(err => {
                console.error('Failed to copy:', err);
                toast.error('Failed to copy SKU');
            });
    }

    return (
        <div className="flex items-center gap-2 min-w-[150px]">
            <code 
                className="font-mono text-sm text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 px-2 py-1.5 rounded-sm cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                onClick={() => handleCopySKU(productSku)}
                title="Click to copy SKU"
            >
                {productSku}
            </code>
            <button
                onClick={() => handleCopySKU(productSku)}
                className="p-1.5 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-sm transition-colors"
                title="Copy SKU"
            >
                <Copy className="h-3.5 w-3.5" />
            </button>
        </div>
    )
}

export default AdminCopySKU