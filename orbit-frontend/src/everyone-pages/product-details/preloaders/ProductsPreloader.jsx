// src/everyone-pages/products/components/ProductGridSkeleton.jsx

const ProductGridSkeleton = () => {
    return (
        <div className="animate-pulse">
            {/* Header Section Skeleton */}
            <div className="mb-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <div className="h-8 bg-gray-800 rounded-sm w-64 mb-2"></div>
                        <div className="h-4 bg-gray-800 rounded-sm w-48"></div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="h-10 bg-gray-800 rounded-sm w-32"></div>
                        <div className="h-10 bg-gray-800 rounded-sm w-48"></div>
                    </div>
                </div>
            </div>

            {/* Product Grid Skeleton */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
                {/* Generate 12 skeleton cards (3 rows × 4 columns) */}
                {Array.from({ length: 12 }).map((_, index) => (
                    <div key={index} className="bg-dark-light rounded-sm border border-gray-800 overflow-hidden">
                        {/* Image Skeleton */}
                        <div className="relative h-48 bg-gray-900">
                            {/* Stock Badge Skeleton */}
                            <div className="absolute top-3 right-3">
                                <div className="h-6 w-16 bg-gray-800 rounded-sm"></div>
                            </div>
                        </div>

                        {/* Content Skeleton */}
                        <div className="p-4">
                            {/* Brand & SKU Skeleton */}
                            <div className="flex items-center justify-between mb-2">
                                <div className="h-4 w-20 bg-gray-800 rounded-sm"></div>
                                <div className="h-3 w-24 bg-gray-800 rounded-sm"></div>
                            </div>

                            {/* Name Skeleton */}
                            <div className="mb-2">
                                <div className="h-5 w-3/4 bg-gray-800 rounded-sm mb-1"></div>
                                <div className="h-4 w-1/2 bg-gray-800 rounded-sm"></div>
                            </div>

                            {/* Description Skeleton */}
                            <div className="mb-3">
                                <div className="h-3 w-full bg-gray-800 rounded-sm mb-1"></div>
                                <div className="h-3 w-2/3 bg-gray-800 rounded-sm"></div>
                            </div>

                            {/* Price & Stock Skeleton */}
                            <div className="mb-4">
                                <div className="h-6 w-24 bg-gray-800 rounded-sm mb-1"></div>
                                <div className="h-3 w-16 bg-gray-800 rounded-sm"></div>
                            </div>

                            {/* Features Skeleton */}
                            <div className="mb-4 flex gap-1">
                                <div className="h-6 w-16 bg-gray-800 rounded-sm"></div>
                                <div className="h-6 w-20 bg-gray-800 rounded-sm"></div>
                            </div>

                            {/* Action Buttons Skeleton */}
                            <div className="flex gap-2">
                                <div className="flex-1 h-10 bg-gray-800 rounded-sm"></div>
                                <div className="w-10 h-10 bg-gray-800 rounded-sm"></div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Store Info Skeleton */}
            <div className="mt-12 p-6 bg-gray-900/50 rounded-sm border border-gray-800">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex-1 space-y-3">
                        <div className="h-6 w-48 bg-gray-800 rounded-sm"></div>
                        <div className="h-4 w-64 bg-gray-800 rounded-sm"></div>
                        <div className="h-3 w-56 bg-gray-800 rounded-sm"></div>
                    </div>
                    <div className="h-10 w-40 bg-gray-800 rounded-sm"></div>
                </div>
            </div>
        </div>
    );
};

export default ProductGridSkeleton;