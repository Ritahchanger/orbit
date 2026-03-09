import React from 'react';

const ProductDetailsSkeleton = () => {
    return (
        <div className="min-h-screen gaming-theme">
            {/* Breadcrumb Skeleton */}
            <div className="bg-dark-light py-4 border-b border-gray-800">
                <div className="container mx-auto px-4">
                    <div className="flex items-center gap-3">
                        <div className="h-4 w-16 bg-gray-700 rounded-sm animate-pulse"></div>
                        <div className="h-4 w-4 bg-gray-700 rounded-sm animate-pulse"></div>
                        <div className="h-4 w-24 bg-gray-700 rounded-sm animate-pulse"></div>
                        <div className="h-4 w-4 bg-gray-700 rounded-sm animate-pulse"></div>
                        <div className="h-4 w-32 bg-gray-700 rounded-sm animate-pulse"></div>
                    </div>
                </div>
            </div>

            {/* Main Product Section Skeleton */}
            <div className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Image Gallery Skeleton */}
                    <div>
                        {/* Main Image */}
                        <div className="bg-gray-900 rounded-sm h-96 animate-pulse mb-4"></div>

                        {/* Thumbnails */}
                        <div className="flex gap-3">
                            {[1, 2, 3, 4].map((i) => (
                                <div
                                    key={i}
                                    className="flex-1 h-20 bg-gray-800 animate-pulse rounded-sm"
                                ></div>
                            ))}
                        </div>
                    </div>

                    {/* Product Info Skeleton */}
                    <div>
                        {/* Brand & Category Tags */}
                        <div className="flex items-center gap-3 mb-4 flex-wrap">
                            {[1, 2, 3].map((i) => (
                                <div
                                    key={i}
                                    className="h-6 w-20 bg-gray-800 animate-pulse rounded-sm"
                                ></div>
                            ))}
                        </div>

                        {/* Product Name */}
                        <div className="h-10 bg-gray-800 animate-pulse rounded-sm mb-4"></div>

                        {/* Rating & Stats */}
                        <div className="flex items-center gap-4 mb-6">
                            <div className="h-5 w-32 bg-gray-800 animate-pulse rounded-sm"></div>
                            <div className="h-5 w-20 bg-gray-800 animate-pulse rounded-sm"></div>
                        </div>

                        {/* Price */}
                        <div className="h-12 w-48 bg-gray-800 animate-pulse rounded-sm mb-8"></div>

                        {/* Quantity Selector */}
                        <div className="flex items-center gap-4 mb-8">
                            <div className="h-5 w-16 bg-gray-700 animate-pulse rounded-sm"></div>
                            <div className="h-10 w-32 bg-gray-800 animate-pulse rounded-sm"></div>
                            <div className="h-5 w-36 bg-gray-700 animate-pulse rounded-sm"></div>
                        </div>

                        {/* Features Skeleton */}
                        <div className="mb-8">
                            <div className="h-6 w-32 bg-gray-700 animate-pulse rounded-sm mb-3"></div>
                            <div className="space-y-2">
                                {[1, 2, 3, 4].map((i) => (
                                    <div key={i} className="flex items-center gap-3">
                                        <div className="h-4 w-4 bg-gray-700 animate-pulse rounded-full"></div>
                                        <div className="h-4 w-full bg-gray-800 animate-pulse rounded-sm"></div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="mb-6 flex gap-4">
                            <div className="h-10 w-10 bg-gray-800 animate-pulse rounded-sm"></div>
                            <div className="h-10 w-10 bg-gray-800 animate-pulse rounded-sm"></div>
                        </div>

                        {/* Main Action Buttons */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                            <div className="h-14 bg-gray-800 animate-pulse rounded-sm"></div>
                            <div className="h-14 bg-gray-800 animate-pulse rounded-sm"></div>
                        </div>

                        {/* Store Info Card */}
                        <div className="bg-gray-900/50 rounded-sm border border-gray-800 p-5 mb-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="h-6 w-6 bg-gray-700 animate-pulse rounded-full"></div>
                                <div className="h-6 w-48 bg-gray-700 animate-pulse rounded-sm"></div>
                            </div>
                            <div className="p-4 rounded-sm border border-gray-700 bg-gray-800/30 mb-3">
                                <div className="space-y-3">
                                    <div className="h-5 w-40 bg-gray-700 animate-pulse rounded-sm"></div>
                                    <div className="h-4 w-32 bg-gray-700 animate-pulse rounded-sm"></div>
                                    <div className="flex items-center gap-4">
                                        <div className="h-4 w-24 bg-gray-700 animate-pulse rounded-sm"></div>
                                        <div className="h-4 w-28 bg-gray-700 animate-pulse rounded-sm"></div>
                                    </div>
                                </div>
                            </div>
                            <div className="h-12 w-full bg-gray-800 animate-pulse rounded-sm mb-3"></div>
                            <div className="h-4 w-64 bg-gray-700 animate-pulse rounded-sm mx-auto"></div>
                        </div>

                        {/* Benefits Grid */}
                        <div className="grid grid-cols-2 gap-4">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <div className="h-10 w-10 bg-gray-800 animate-pulse rounded-sm"></div>
                                    <div>
                                        <div className="h-4 w-32 bg-gray-700 animate-pulse rounded-sm mb-1"></div>
                                        <div className="h-3 w-24 bg-gray-700 animate-pulse rounded-sm"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs Section Skeleton */}
            <div className="py-8 bg-dark-light">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto">
                        {/* Tabs */}
                        <div className="flex border-b border-gray-800 mb-8">
                            {['Description', 'Specifications', 'Features'].map((tab, i) => (
                                <div
                                    key={i}
                                    className="px-6 py-4 h-14 w-32 bg-gray-800 animate-pulse mr-4 rounded-t-sm"
                                ></div>
                            ))}
                        </div>

                        {/* Tab Content */}
                        <div className="mb-12">
                            <div className="h-8 w-48 bg-gray-800 animate-pulse rounded-sm mb-6"></div>
                            <div className="space-y-3">
                                <div className="h-4 w-full bg-gray-800 animate-pulse rounded-sm"></div>
                                <div className="h-4 w-5/6 bg-gray-800 animate-pulse rounded-sm"></div>
                                <div className="h-4 w-4/5 bg-gray-800 animate-pulse rounded-sm"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Related Products Skeleton */}
            <div className="py-12">
                <div className="container mx-auto px-4">
                    <div className="flex items-center justify-between mb-8">
                        <div className="h-8 w-64 bg-gray-800 animate-pulse rounded-sm"></div>
                        <div className="h-8 w-32 bg-gray-800 animate-pulse rounded-sm"></div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="bg-dark-light rounded-sm border border-gray-800 overflow-hidden">
                                <div className="h-48 bg-gray-900 animate-pulse"></div>
                                <div className="p-4">
                                    <div className="h-5 w-40 bg-gray-800 animate-pulse rounded-sm mb-2"></div>
                                    <div className="h-6 w-24 bg-gray-800 animate-pulse rounded-sm mb-3"></div>
                                    <div className="h-9 w-full bg-gray-800 animate-pulse rounded-sm"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Store CTA Skeleton */}
            <div className="py-12 bg-dark-light">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto">
                        <div className="flex justify-center gap-3 mb-6">
                            {[1, 2, 3].map((i) => (
                                <div
                                    key={i}
                                    className="h-16 w-16 bg-gray-800 animate-pulse rounded-full"
                                ></div>
                            ))}
                        </div>

                        <div className="h-10 w-96 bg-gray-800 animate-pulse rounded-sm mx-auto mb-8"></div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                            <div>
                                <div className="h-7 w-40 bg-gray-800 animate-pulse rounded-sm mb-4"></div>
                                <div className="bg-gray-900/50 rounded-sm border border-gray-800 p-6">
                                    <div className="space-y-4">
                                        {[1, 2, 3, 4].map((i) => (
                                            <div key={i} className="space-y-2">
                                                <div className="h-4 w-24 bg-gray-700 animate-pulse rounded-sm"></div>
                                                <div className="h-3 w-48 bg-gray-700 animate-pulse rounded-sm"></div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div>
                                <div className="h-7 w-48 bg-gray-800 animate-pulse rounded-sm mb-4"></div>
                                <div className="space-y-4">
                                    {[1, 2, 3, 4, 5].map((i) => (
                                        <div key={i} className="flex items-start gap-3">
                                            <div className="h-5 w-5 bg-gray-700 animate-pulse rounded-full mt-1"></div>
                                            <div className="h-4 w-full bg-gray-800 animate-pulse rounded-sm"></div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            {[1, 2, 3].map((i) => (
                                <div
                                    key={i}
                                    className="h-14 w-48 bg-gray-800 animate-pulse rounded-sm"
                                ></div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetailsSkeleton;