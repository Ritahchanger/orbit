const productService = require("./product.service");

const productController = {
  /**
   * Create a new product in a specific store
   */
  createStoreProduct: async (req, res) => {
    console.log('=== CREATE STORE PRODUCT REQUEST ===');
    console.log('Store ID from params:', req.params.storeId);
    console.log('Request body keys:', Object.keys(req.body));
    console.log('Files received:', req.files ? req.files.length : 0);

    const { storeId } = req.params;
    let productData;

    // Parse product data from requestI
    if (req.body.product) {
      productData = JSON.parse(req.body.product);
      console.log('✅ Successfully parsed product data from "product" field');
    } else {
      console.log('📝 Using req.body directly (assuming JSON request)');
      productData = req.body;
    }

    // Get user ID from authenticated user
    const userId = req.user?._id || null;

    // FIXED: First create global product, then add to store
    // 1. Create global product
    const globalProductResult = await productService.createProduct(
      productData,
      req.files || []
    );

    // 2. Add to store inventory
    const inventoryData = {
      stock: productData.stock || 0,
      minStock: productData.minStock || 5,
      price: productData.price || productData.storePrice
    };

    const addToStoreResult = await productService.addProductToStore(
      storeId,
      globalProductResult.data._id,
      inventoryData
    );

    // Return success response
    res.status(201).json({
      success: true,
      message: "Product created and added to store successfully",
      data: {
        product: globalProductResult.data,
        inventory: addToStoreResult.data
      }
    });
  },



  /**
   * Get all products for a specific store
   */
  getProductsByStore: async (req, res) => {
    const { storeId } = req.params;
    const { page = 1, limit = 20, ...filters } = req.query;

    const result = await productService.getProductsByStore(
      storeId,
      filters,
      parseInt(page),
      parseInt(limit)
    );

    res.json(result);
  },

  /**
   * Get product by ID within a specific store
   */
  getStoreProductById: async (req, res) => {
    const { storeId, productId } = req.params;

    // Since products are global now, just get the product
    const result = await productService.getProductById(productId);
    res.json(result);
  },

  updateProductStock: async (req, res) => {

    console.log('=== UPDATE PRODUCT STOCK REQUEST ===');
    console.log('Product ID from params:', req.params.productId);
    console.log('Stock data from body:', req.body);

    const { productId } = req.params;
    const stockData = req.body;

    // Validate stock data exists
    if (!stockData || !stockData.operation || typeof stockData.stock === 'undefined') {
      return res.status(400).json({
        success: false,
        error: "Missing required stock data. Need 'operation' and 'stock' fields"
      });
    }

    // Convert stock to number if it's a string
    if (typeof stockData.stock === 'string') {
      stockData.stock = parseInt(stockData.stock, 10);
    }

    const result = await productService.updateProductStock(productId, stockData);

    res.status(200).json(result);

  },

  /**
   * Restock product (global - add stock)
   */
  restockProduct: async (req, res) => {
    console.log('=== RESTOCK PRODUCT REQUEST ===');
    console.log('Product ID from params:', req.params.productId);
    console.log('Restock data from body:', req.body);
    const { productId } = req.params;
    const { quantity, buyingPrice } = req.body;
    if (!quantity || quantity <= 0) {
      return res.status(400).json({
        success: false,
        error: "Quantity is required and must be positive"
      });
    }
    const result = await productService.restockProduct(
      productId,
      quantity,
      buyingPrice
    );
    res.status(200).json(result);
  },

  /**
   * Update product in a specific store - REMOVED (products are global)
   */
  updateStoreProduct: async (req, res) => {
    // Products are now global, use the global update method
    const { productId } = req.params; // storeId is ignored
    let updateData;

    if (req.body.product) {
      updateData = JSON.parse(req.body.product);
    } else {
      updateData = req.body;
    }

    const result = await productService.updateProduct(
      productId,
      updateData,
      req.files || []
    );

    res.status(200).json(result);
  },

  /**
   * Delete product from a specific store - CHANGED to only remove from store inventory
   */
  deleteStoreProduct: async (req, res) => {
    const { storeId, productId } = req.params;

    // FIXED: Remove product from store inventory, not delete the product
    // Find and delete the store inventory entry
    const inventoryItem = await StoreInventory.findOneAndDelete({
      store: storeId,
      product: productId
    });

    if (!inventoryItem) {
      return res.status(404).json({
        success: false,
        error: "Product not found in this store inventory"
      });
    }

    res.json({
      success: true,
      message: "Product removed from store inventory successfully"
    });
  },

  /**
   * Update stock for a product in a specific store - REMOVED (use StoreInventory service)
   */
  updateStoreProductStock: async (req, res) => {
    const { storeId, productId } = req.params;
    const stockData = req.body;

    // This should be handled by store inventory service
    res.status(501).json({
      success: false,
      error: "Use store inventory endpoints for stock management"
    });
  },


  getGlobalLowStockProducts: async (req, res) => {

    const result = await productService.getGlobalLowStockProducts();

    res.json(result)

  },


  /**
   * Get low stock products for a specific store - UPDATED
   */
  getStoreLowStockProducts: async (req, res) => {
    const { storeId } = req.params;
    const { limit = 20 } = req.query;

    // Get store inventory with low stock filter
    const result = await productService.getProductsByStore(
      storeId,
      { lowStock: "true" },
      1,
      parseInt(limit)
    );
    res.json(result);
  },

  /**
   * Get featured products for a specific store - UPDATED
   */
  getStoreFeaturedProducts: async (req, res) => {
    const { storeId } = req.params;
    const { limit = 10 } = req.query;

    // Get store inventory with featured filter
    const result = await productService.getProductsByStore(
      storeId,
      { isFeatured: true },
      1,
      parseInt(limit)
    );
    res.json(result);
  },

  /**
   * Get products by category for a specific store - UPDATED
   */
  getStoreProductsByCategory: async (req, res) => {
    const { storeId, category } = req.params;
    const { limit = 20 } = req.query;

    // Get store inventory with category filter
    const result = await productService.getProductsByStore(
      storeId,
      { category },
      1,
      parseInt(limit)
    );
    res.json(result);
  },

  /**
   * Get product statistics for a specific store - REMOVED (use store service)
   */
  getStoreProductStats: async (req, res) => {
    const { storeId } = req.params;

    // This should be handled by store service
    res.status(501).json({
      success: false,
      error: "Use store service for store statistics"
    });
  },

  /**
   * Record a sale for a product in a specific store - REMOVED (use sales service)
   */
  recordStoreSale: async (req, res) => {
    const { storeId, productId } = req.params;

    // This should be handled by sales service
    res.status(501).json({
      success: false,
      error: "Use sales service for recording sales"
    });
  },

  /**
   * ============ GLOBAL PRODUCT CONTROLLERS ============
   */

  /**
   * Get product statistics (global)
   */
  getProductStats: async (req, res) => {
    const result = await productService.getProductStats();
    res.json(result);
  },

  /**
   * Create product (global)
   */
  createProduct: async (req, res) => {
    console.log('=== CREATE PRODUCT (GLOBAL) REQUEST ===');
    console.log('Request body keys:', Object.keys(req.body));
    console.log('Files received:', req.files ? req.files.length : 0);

    let productData;

    // Parse product data from request
    if (req.body.product) {
      productData = JSON.parse(req.body.product);
      console.log('✅ Successfully parsed product data');
    } else {
      productData = req.body;
    }

    // Call global product service method
    const result = await productService.createProduct(
      productData,
      req.files || []
    );

    res.status(201).json(result);
  },

  /**
   * Get all products with filtering and pagination (global)
   */
  getProducts: async (req, res) => {
    const { page = 1, limit = 10, ...filters } = req.query;

    const result = await productService.getProducts(
      filters,
      parseInt(page),
      parseInt(limit)
    );
    res.json(result);
  },

  /**
   * Get single product by ID (global)
   */
  getProductById: async (req, res) => {
    const result = await productService.getProductById(req.params.id);
    res.json(result);
  },

  /**
   * Update product (global)
   */
  updateProduct: async (req, res) => {
    console.log('=== UPDATE PRODUCT (GLOBAL) REQUEST ===');
    console.log('Product ID from params:', req.params.id);
    console.log('Request body keys:', Object.keys(req.body));
    console.log('Files received:', req.files ? req.files.length : 0);

    const productId = req.params.id;
    let updateData;

    // Parse update data from request
    if (req.body.product) {
      updateData = JSON.parse(req.body.product);
      console.log('✅ Successfully parsed update data from "product" field');
    } else {
      updateData = req.body;
    }

    const result = await productService.updateProduct(
      productId,
      updateData,
      req.files || []
    );

    res.status(200).json(result);
  },

  /**
   * Delete product (global)
   */
  deleteProduct: async (req, res) => {
    const result = await productService.deleteProduct(req.params.id);
    res.json(result);
  }, 

  /**
   * Update product stock (global) - REMOVED (products don't have stock anymore)
   */
  updateStock: async (req, res) => {
    res.status(400).json({
      success: false,
      error: "Products no longer have stock. Use store inventory endpoints."
    });
  },

  /**
   * Get product by SKU (global)
   */
  getProductBySKU: async (req, res) => {
    const { sku } = req.params;

    // Find product by SKU
    const product = await Product.findOne({ sku });

    if (!product) {
      return res.status(404).json({
        success: false,
        error: "Product not found"
      });
    }

    res.json({
      success: true,
      data: product.toFrontendFormat()
    });
  },

  /**
   * Get low stock products (global)
   */
  getLowStockProducts: async (req, res) => {
    // Products are now global, use the global low stock method
    const result = await productService.getLowStockProducts();
    res.json(result);
  },

  /**
   * Get products by category (global)
   */
  getProductsByCategory: async (req, res) => {
    const { category } = req.params;
    const { page = 1, limit = 10 } = req.query;

    // Use global method with category filter
    const result = await productService.getProducts(
      { category },
      parseInt(page),
      parseInt(limit)
    );
    res.json(result);
  },

  /**
   * Get featured products (global)
   */
  getFeaturedProducts: async (req, res) => {
    const { page = 1, limit = 10 } = req.query;

    // Use global method
    const result = await productService.getProducts(
      { isFeatured: true },
      parseInt(page),
      parseInt(limit)
    );
    res.json(result);
  },

  /**
   * Search products (global)
   */
  searchProducts: async (req, res) => {
    const { q: searchQuery, page = 1, limit = 10 } = req.query;

    // Use global method
    const result = await productService.getProducts(
      { search: searchQuery },
      parseInt(page),
      parseInt(limit)
    );
    res.json(result);
  },

  /**
   * Add images to product (global)
   */
  addProductImages: async (req, res) => {
    const productId = req.params.id;
    let updateData = {};

    // Add images from files
    if (req.files && req.files.length > 0) {
      // This should be handled by the updateProduct method
      updateData.images = req.files;
    }

    const result = await productService.updateProduct(
      productId,
      updateData,
      req.files || []
    );
    res.json(result);
  },

  /**
   * Remove image from product (global)
   */
  removeProductImage: async (req, res) => {
    const { productId } = req.params;
    const { gcsFileName } = req.body;

    // This requires a special method in the service
    res.status(501).json({
      success: false,
      error: "Not implemented"
    });
  },

  /**
   * Set primary image (global)
   */
  setPrimaryImage: async (req, res) => {
    const { productId } = req.params;
    const { gcsFileName } = req.body;

    // This requires a special method in the service
    res.status(501).json({
      success: false,
      error: "Not implemented"
    });
  },

  /**
   * Record a sale (global) - REMOVED (use sales service)
   */
  recordSale: async (req, res) => {
    res.status(501).json({
      success: false,
      error: "Use sales service for recording sales"
    });
  },

  /**
   * Restock product (global) - REMOVED (products don't have stock anymore)
   */
  restockProduct: async (req, res) => {
    res.status(400).json({
      success: false,
      error: "Products no longer have stock. Use store inventory endpoints."
    });
  },

  /**
   * Add existing product to store inventory
   */
  addProductToStore: async (req, res) => {
    const { productId, storeId } = req.params;
    const inventoryData = req.body;

    const result = await productService.addProductToStore(
      storeId,
      productId,
      inventoryData
    );

    res.status(200).json(result);
  },
};

module.exports = productController;