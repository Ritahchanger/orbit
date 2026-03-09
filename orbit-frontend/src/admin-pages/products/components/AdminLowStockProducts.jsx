import { AlertCircle } from "lucide-react";
const AdminLowStockProducts = ({ storeProducts, getCategoryIcon }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {storeProducts
                .filter(p => p.quantity <= p.minStock)
                .map(product => {
                    const CategoryIcon = getCategoryIcon(product.category);
                    return (
                        <div key={product.id} className="bg-dark-light border border-gray-800 rounded-sm p-4">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center space-x-3">
                                    <div className="p-2 rounded-sm bg-yellow-500/20">
                                        <CategoryIcon className="h-5 w-5 text-yellow-500" />
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-white">{product.name}</h4>
                                        <p className="text-sm text-gray-400">{product.sku}</p>
                                    </div>
                                </div>
                                <AlertCircle className="h-5 w-5 text-yellow-500" />
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                    <p className="text-sm text-gray-400">Current Stock</p>
                                    <p className="text-xl font-bold text-white">{product.quantity}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-400">Minimum Required</p>
                                    <p className="text-xl font-bold text-white">{product.minStock}</p>
                                </div>
                            </div>

                            <div className="flex space-x-2">
                                <button className="flex-1 px-3 py-2 bg-primary/20 text-primary rounded-sm hover:bg-primary/30 text-sm">
                                    Restock
                                </button>
                                <button className="flex-1 px-3 py-2 border border-gray-700 rounded-sm hover:bg-gray-800 text-sm">
                                    View Details
                                </button>
                            </div>
                        </div>
                    );
                })}
        </div>
    )
}

export default AdminLowStockProducts