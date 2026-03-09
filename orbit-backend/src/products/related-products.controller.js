const  relatedProductsService  = require("./related-products.service");

const RelatedProductsController = {
  
    getRelatedProducts: async (req, res) => {
     
            const { productId } = req.params;
            const {
                limit = 8,
                strategy = 'hybrid',
                exclude = '', // Comma-separated product IDs to exclude
                category = null,
                priceRange = null
            } = req.query;

            // Validate product ID
            if (!productId || productId === 'undefined' || productId === 'null') {
                return res.status(400).json({
                    success: false,
                    message: "Product ID is required"
                });
            }

            // Validate limit
            const parsedLimit = parseInt(limit);
            if (isNaN(parsedLimit) || parsedLimit < 1 || parsedLimit > 50) {
                return res.status(400).json({
                    success: false,
                    message: "Limit must be between 1 and 50"
                });
            }

            // Validate strategy
            const validStrategies = ['category', 'price', 'brand', 'tags', 'bestsellers', 'recent', 'hybrid'];
            if (!validStrategies.includes(strategy)) {
                return res.status(400).json({
                    success: false,
                    message: `Invalid strategy. Must be one of: ${validStrategies.join(', ')}`
                });
            }

            // Get related products
            const result = await relatedProductsService.getRelatedProducts(
                productId,
                parsedLimit,
                strategy
            );

            if (!result.success) {
                return res.status(404).json(result);
            }

            // Apply additional filters if provided
            let filteredProducts = result.data;

            if (category) {
                filteredProducts = filteredProducts.filter(p =>
                    p.category === category ||
                    p.category?.toLowerCase() === category.toLowerCase()
                );
            }

            if (priceRange) {
                const [min, max] = priceRange.split('-').map(Number);
                if (!isNaN(min) && !isNaN(max)) {
                    filteredProducts = filteredProducts.filter(p =>
                        p.price >= min && p.price <= max
                    );
                }
            }

            if (exclude) {
                const excludeIds = exclude.split(',').map(id => id.trim());
                filteredProducts = filteredProducts.filter(p =>
                    !excludeIds.includes(p._id?.toString())
                );
            }

            return res.status(200).json({
                success: true,
                data: filteredProducts,
                count: filteredProducts.length,
                totalCount: result.count,
                strategy: result.strategy,
                sourceProduct: result.sourceProduct,
                filters: {
                    limit: parsedLimit,
                    strategy,
                    category: category || 'none',
                    priceRange: priceRange || 'none',
                    excluded: exclude ? exclude.split(',').length : 0
                },
                timestamp: new Date().toISOString()
            });

    },

}


const relatedProductsController = RelatedProductsController;



module.exports = relatedProductsController