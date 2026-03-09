import { Package } from "lucide-react"
const NoProductState = () => {
    return (
        <div className="text-center py-12">
            <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No Product Data Available
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
                There are no product performance records for the selected period.
                Products will appear here once they have sales data.
            </p>
        </div>
    )
}

export default NoProductState