import { ArrowRight } from "lucide-react";
const SearchResults = ({ isSearching, searchResults, handleAddToCart, setSelectedProductIndex,selectedProductIndex,formatCurrency }) => {
    return (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-sm shadow-xl z-30 max-h-100 overflow-y-auto">
            {isSearching ? (
                <div className="p-4 text-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm">Searching...</p>
                </div>
            ) : searchResults.length === 0 ? (
                <div className="p-4 text-center">
                    <p className="text-gray-500 dark:text-gray-400">No products found</p>
                    <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">
                        Try a different SKU or product name
                    </p>
                </div>
            ) : (
                <div>
                    <div className="px-3 py-2 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            Found {searchResults.length} product{searchResults.length !== 1 ? 's' : ''}
                        </p>
                    </div>
                    {searchResults?.map((item, index) => {
                        const product = item.product;
                        const isSelected = index === selectedProductIndex;
                        const isOutOfStock = item.stock <= 0;

                        return (
                            <button
                                key={item._id}
                                onClick={() => handleAddToCart(item)}
                                disabled={isOutOfStock}
                                className={`w-full text-left p-3 border-b border-gray-100 dark:border-gray-700 last:border-b-0 transition-colors ${isSelected ? 'bg-blue-50 dark:bg-blue-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                                    } ${isOutOfStock ? 'opacity-50 cursor-not-allowed' : ''}`}
                                onMouseEnter={() => setSelectedProductIndex(index)}
                            >
                                <div className="flex items-center justify-between text-sm">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-2 h-2 rounded-full ${item.stock > 10 ? 'bg-green-500' : item.stock > 0 ? 'bg-yellow-500' : 'bg-red-500'}`} />
                                            <span className="font-medium text-gray-900 dark:text-white truncate">
                                                {product?.name || 'Unknown Product'}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-3 mt-1">
                                            <span className="text-sm font-mono bg-gray-100 text-black dark:bg-gray-700 dark:text-white px-2 py-0.5 rounded">
                                                {product?.sku || 'N/A'}
                                            </span>
                                            <span className="text-sm text-gray-600 dark:text-gray-300">
                                                Stock: {item.stock}
                                            </span>
                                            <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                                                {formatCurrency(product?.price || 0)}
                                            </span>
                                        </div>
                                    </div>
                                    {!isOutOfStock && (
                                        <div className="flex items-center text-blue-600 dark:text-blue-400">
                                            <span className="text-sm mr-1">Add</span>
                                            <ArrowRight size={16} />
                                        </div>
                                    )}
                                </div>
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    )
}

export default SearchResults