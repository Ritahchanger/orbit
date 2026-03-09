const Product = require("./products.model");

class RelatedProductsService {
    async getRelatedProducts(productId, limit = 8, strategy = 'hybrid') {
        try {
            const sourceProduct = await Product.findById(productId);
            if (!sourceProduct) {
                return { success: false, message: "Product not found" };
            }

            let relatedProducts = [];

            switch (strategy) {
                case 'category':
                    relatedProducts = await this.getByCategory(sourceProduct, limit);
                    break;
                case 'price':
                    relatedProducts = await this.getByPriceRange(sourceProduct, limit);
                    break;
                case 'brand':
                    relatedProducts = await this.getByBrand(sourceProduct, limit);
                    break;
                case 'tags':
                    relatedProducts = await this.getByTags(sourceProduct, limit);
                    break;
                case 'bestsellers':
                    relatedProducts = await this.getBestsellers(sourceProduct, limit);
                    break;
                case 'recent':
                    relatedProducts = await this.getRecentlyAdded(sourceProduct, limit);
                    break;
                case 'hybrid':
                default:
                    relatedProducts = await this.getHybridRecommendations(sourceProduct, limit);
                    break;
            }

            if (relatedProducts.length < limit) {
                const complementary = await this.getComplementaryProducts(sourceProduct, limit - relatedProducts.length);
                relatedProducts = [...relatedProducts, ...complementary];
            }

            relatedProducts = relatedProducts.filter(p => p._id.toString() !== productId);

            const formattedProducts = relatedProducts.map(product => {
                const productObj = new Product(product);
                return productObj.toFrontendFormat();
            });

            return {
                success: true,
                data: formattedProducts.slice(0, limit),
                count: formattedProducts.length,
                strategy: strategy,
                sourceProduct: {
                    id: sourceProduct._id,
                    name: sourceProduct.name,
                    category: sourceProduct.category,
                    brand: sourceProduct.brand
                }
            };
        } catch (error) {
            console.error('getRelatedProducts error:', error);
            return {
                success: false,
                message: "Failed to get related products",
                error: error.message
            };
        }
    }

    // ============ HELPER METHODS ============

    async getByCategory(product, limit) {
        try {
            return await Product.find({
                category: product.category,
                _id: { $ne: product._id },
                status: { $in: ["active", "In Stock", "Low Stock"] }
            })
                .sort({ isFeatured: -1, totalSold: -1, createdAt: -1 })
                .limit(limit)
                .lean();
        } catch (error) {
            console.error('getByCategory error:', error);
            return [];
        }
    }

    async getByPriceRange(product, limit) {
        try {
            const priceRange = product.price * 0.3; // ±30%
            const minPrice = Math.max(0, product.price - priceRange);
            const maxPrice = product.price + priceRange;

            return await Product.find({
                price: { $gte: minPrice, $lte: maxPrice },
                _id: { $ne: product._id },
                status: { $in: ["active", "In Stock", "Low Stock"] }
            })
                .sort({ createdAt: -1 })
                .limit(limit)
                .lean();
        } catch (error) {
            console.error('getByPriceRange error:', error);
            return [];
        }
    }

    async getByBrand(product, limit) {
        try {
            return await Product.find({
                brand: product.brand,
                _id: { $ne: product._id },
                status: { $in: ["active", "In Stock", "Low Stock"] }
            })
                .sort({ price: 1, totalSold: -1 })
                .limit(limit)
                .lean();
        } catch (error) {
            console.error('getByBrand error:', error);
            return [];
        }
    }

    async getByTags(product, limit) {
        try {
            if (!product.features || product.features.length === 0) {
                return await this.getByCategory(product, limit);
            }

            return await Product.find({
                features: { $in: product.features },
                _id: { $ne: product._id },
                status: { $in: ["active", "In Stock", "Low Stock"] }
            })
                .sort({ createdAt: -1 })
                .limit(limit)
                .lean();
        } catch (error) {
            console.error('getByTags error:', error);
            return [];
        }
    }

    async getBestsellers(product, limit) {
        try {
            return await Product.find({
                _id: { $ne: product._id },
                status: { $in: ["active", "In Stock", "Low Stock"] },
                totalSold: { $gt: 0 }
            })
                .sort({ totalSold: -1, rating: -1 })
                .limit(limit)
                .lean();
        } catch (error) {
            console.error('getBestsellers error:', error);
            return [];
        }
    }

    async getRecentlyAdded(product, limit) {
        try {
            return await Product.find({
                _id: { $ne: product._id },
                status: { $in: ["active", "In Stock", "Low Stock"] }
            })
                .sort({ createdAt: -1 })
                .limit(limit)
                .lean();
        } catch (error) {
            console.error('getRecentlyAdded error:', error);
            return [];
        }
    }

    async getHybridRecommendations(product, limit) {
        try {
            // Get products from multiple strategies
            const [byCategory, byPrice, byBrand] = await Promise.all([
                this.getByCategory(product, Math.ceil(limit / 3)),
                this.getByPriceRange(product, Math.ceil(limit / 3)),
                this.getByBrand(product, Math.ceil(limit / 3))
            ]);

            // Combine and deduplicate
            const combined = [...byCategory, ...byPrice, ...byBrand];
            const uniqueProducts = [];
            const seenIds = new Set();

            for (const prod of combined) {
                if (!seenIds.has(prod._id.toString())) {
                    seenIds.add(prod._id.toString());
                    uniqueProducts.push(prod);
                }
            }

            return uniqueProducts.slice(0, limit);
        } catch (error) {
            console.error('getHybridRecommendations error:', error);
            return await this.getByCategory(product, limit); // Fallback
        }
    }

    async getComplementaryProducts(product, limit) {
        try {
            // Find complementary products based on product type
            const complementaryCategories = {
                'gaming-pcs': ['gaming-monitors', 'mechanical-keyboards', 'gaming-mice', 'gaming-headsets'],
                'gaming-laptops': ['gaming-bags', 'laptop-coolers', 'external-storage'],
                'consoles': ['games', 'controllers', 'console-accessories'],
                'gaming-monitors': ['monitor-stands', 'cables', 'gaming-chairs'],
                'gaming-headsets': ['audio-mixers', 'microphones', 'streaming-gear'],
                'mechanical-keyboards': ['keycap-sets', 'wrist-rests', 'cables'],
                'gaming-mice': ['mouse-pads', 'mouse-bungees', 'cables']
            };

            const categories = complementaryCategories[product.category] || ['gaming-accessories'];

            return await Product.find({
                category: { $in: categories },
                _id: { $ne: product._id },
                status: { $in: ["active", "In Stock", "Low Stock"] }
            })
                .sort({ isFeatured: -1, createdAt: -1 })
                .limit(limit)
                .lean();
        } catch (error) {
            console.error('getComplementaryProducts error:', error);
            return [];
        }
    }
}

const relatedProductsService = new RelatedProductsService();

module.exports =  relatedProductsService ;