import { useRelatedProducts } from '../../../admin-pages/hooks/related-products.hook'
import { useNavigate } from 'react-router-dom'

const RelatedProducts = ({ productId }) => {
    const navigate = useNavigate()

    const { data: relatedProductsData, isLoading, error } = useRelatedProducts(productId)
    const relatedProducts = relatedProductsData?.products || []

    // Skeleton loader: 4 cards
    const skeletonArray = Array.from({ length: 4 })

    if (isLoading) {
        return (
            <section className="py-12">
                <div className="container mx-auto px-4">
                    <h2 className="text-3xl font-bold text-white mb-6">You Might Also Like</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {skeletonArray.map((_, idx) => (
                            <div key={idx} className="bg-dark-light rounded-sm border border-gray-800 overflow-hidden animate-pulse">
                                <div className="h-48 bg-gray-900"></div>
                                <div className="p-4">
                                    <div className="h-6 bg-gray-700 rounded mb-2 w-3/4"></div>
                                    <div className="h-6 bg-gray-700 rounded mb-3 w-1/2"></div>
                                    <div className="h-10 bg-gray-700 rounded w-full"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        )
    }

    if (error) return (
        <section className="py-12">
            <div className="container mx-auto px-4">
                <p className="text-red-500">Failed to load related products.</p>
            </div>
        </section>
    )

    if (!relatedProducts.length) return null

    return (
        <section className="py-12">
            <div className="container mx-auto px-4">
                <h2 className="text-3xl font-bold text-white mb-6">You Might Also Like</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {relatedProducts.map((rp) => (
                        <div key={rp.id} className="bg-dark-light rounded-sm border border-gray-800 overflow-hidden hover:border-primary transition group">
                            <div className="h-48 bg-gray-900 overflow-hidden">
                                <img
                                    src={rp.primaryImage || rp.image}
                                    alt={rp.name}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                />
                            </div>
                            <div className="p-4">
                                <h3 className="font-bold text-white mb-2 line-clamp-2">{rp.name}</h3>
                                <div className="text-xl font-bold text-white mb-3">KSh {rp.price}</div>
                                <button
                                    onClick={() => navigate(`/products/${rp.id}`)}
                                    className="w-full py-2 bg-gray-800 hover:bg-primary text-white rounded-sm text-sm font-medium transition"
                                >
                                    View Details
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}

export default RelatedProducts
