const productService = require("./product.service");
const StoreInventory = require("../store-inventory/store-inventory.model");

const productController = {
  /**
   * Create a new product and add it to a store's inventory
   */
  createStoreProduct: async (req, res) => {
    const { storeId } = req.params;
    const businessId = req.businessId;

    let productData;
    if (req.body.product) {
      productData = JSON.parse(req.body.product);
    } else {
      productData = req.body;
    }

    const globalProductResult = await productService.createProduct(
      productData,
      req.files || [],
      businessId,
    );

    const inventoryData = {
      stock: productData.stock || 0,
      minStock: productData.minStock || 5,
      price: productData.price || productData.storePrice,
    };

    const addToStoreResult = await productService.addProductToStore(
      storeId,
      globalProductResult.data._id,
      inventoryData,
      businessId,
    );

    res.status(201).json({
      success: true,
      message: "Product created and added to store successfully",
      data: {
        product: globalProductResult.data,
        inventory: addToStoreResult.data,
      },
    });
  },

  /**
   * Get all products for a specific store
   */
  getProductsByStore: async (req, res) => {
    const { storeId } = req.params;
    const { page = 1, limit = 20, ...filters } = req.query;
    const businessId = req.businessId;

    const result = await productService.getProductsByStore(
      storeId,
      filters,
      parseInt(page),
      parseInt(limit),
      businessId,
    );

    res.json(result);
  },

  /**
   * Get product by ID within a specific store
   */
  getStoreProductById: async (req, res) => {
    const { productId } = req.params;
    const businessId = req.businessId;

    const result = await productService.getProductById(productId, businessId);
    res.json(result);
  },

  /**
   * Update stock for a product
   */
  updateProductStock: async (req, res) => {
    const { productId } = req.params;
    const stockData = req.body;
    const businessId = req.businessId;

    if (
      !stockData ||
      !stockData.operation ||
      typeof stockData.stock === "undefined"
    ) {
      return res.status(400).json({
        success: false,
        error:
          "Missing required stock data. Need 'operation' and 'stock' fields",
      });
    }

    if (typeof stockData.stock === "string") {
      stockData.stock = parseInt(stockData.stock, 10);
    }

    const result = await productService.updateProductStock(
      productId,
      stockData,
      businessId,
    );

    res.status(200).json(result);
  },

  /**
   * Restock product
   */
  restockProduct: async (req, res) => {
    const { productId } = req.params;
    const { quantity, buyingPrice } = req.body;
    const businessId = req.businessId;

    if (!quantity || quantity <= 0) {
      return res.status(400).json({
        success: false,
        error: "Quantity is required and must be positive",
      });
    }

    const result = await productService.restockProduct(
      productId,
      quantity,
      buyingPrice,
      businessId,
    );

    res.status(200).json(result);
  },

  /**
   * Update product (global, business-scoped)
   */
  updateStoreProduct: async (req, res) => {
    const { productId } = req.params;
    const businessId = req.businessId;

    let updateData;
    if (req.body.product) {
      updateData = JSON.parse(req.body.product);
    } else {
      updateData = req.body;
    }

    const result = await productService.updateProduct(
      productId,
      updateData,
      req.files || [],
      businessId,
    );

    res.status(200).json(result);
  },

  /**
   * Remove product from a store's inventory
   */
  deleteStoreProduct: async (req, res) => {
    const { storeId, productId } = req.params;

    const inventoryItem = await StoreInventory.findOneAndDelete({
      store: storeId,
      product: productId,
    });

    if (!inventoryItem) {
      return res.status(404).json({
        success: false,
        error: "Product not found in this store inventory",
      });
    }

    res.json({
      success: true,
      message: "Product removed from store inventory successfully",
    });
  },

  updateStoreProductStock: async (req, res) => {
    res.status(501).json({
      success: false,
      error: "Use store inventory endpoints for stock management",
    });
  },

  getGlobalLowStockProducts: async (req, res) => {

    const businessId = req.businessId;
    
    const result = await productService.getGlobalLowStockProducts(
      {},
      businessId,
    );
    res.json(result);
  },

  getStoreLowStockProducts: async (req, res) => {
    const { storeId } = req.params;
    const { limit = 20 } = req.query;
    const businessId = req.businessId;

    const result = await productService.getProductsByStore(
      storeId,
      { lowStock: "true" },
      1,
      parseInt(limit),
      businessId,
    );
    res.json(result);
  },

  getStoreFeaturedProducts: async (req, res) => {
    const { storeId } = req.params;
    const { limit = 10 } = req.query;
    const businessId = req.businessId;

    const result = await productService.getProductsByStore(
      storeId,
      { isFeatured: true },
      1,
      parseInt(limit),
      businessId,
    );
    res.json(result);
  },

  getStoreProductsByCategory: async (req, res) => {
    const { storeId, category } = req.params;
    const { limit = 20 } = req.query;
    const businessId = req.businessId;

    const result = await productService.getProductsByStore(
      storeId,
      { category },
      1,
      parseInt(limit),
      businessId,
    );
    res.json(result);
  },

  getStoreProductStats: async (req, res) => {
    res.status(501).json({
      success: false,
      error: "Use store service for store statistics",
    });
  },

  recordStoreSale: async (req, res) => {
    res.status(501).json({
      success: false,
      error: "Use sales service for recording sales",
    });
  },

  // ============ GLOBAL PRODUCT CONTROLLERS ============

  getProductStats: async (req, res) => {
    const businessId = req.businessId;

    const result = await productService.getProductStats(businessId);
    res.json(result);
  },

  createProduct: async (req, res) => {
    const businessId = req.businessId;

    let productData;
    if (req.body.product) {
      productData = JSON.parse(req.body.product);
    } else {
      productData = req.body;
    }

    const result = await productService.createProduct(
      productData,
      req.files || [],
      businessId,
    );

    res.status(201).json(result);
  },

  getProducts: async (req, res) => {
    const { page = 1, limit = 10, ...filters } = req.query;
    const businessId = req.businessId;
    const result = await productService.getProducts(
      filters,
      parseInt(page),
      parseInt(limit),
      businessId,
    );
    res.json(result);
  },

  getProductById: async (req, res) => {
    const businessId = req.businessId;

    const result = await productService.getProductById(
      req.params.id,
      businessId,
    );
    res.json(result);
  },

  updateProduct: async (req, res) => {
    const productId = req.params.id;
    const businessId = req.businessId;

    let updateData;
    if (req.body.product) {
      updateData = JSON.parse(req.body.product);
    } else {
      updateData = req.body;
    }

    const result = await productService.updateProduct(
      productId,
      updateData,
      req.files || [],
      businessId,
    );

    res.status(200).json(result);
  },

  deleteProduct: async (req, res) => {
    const businessId = req.businessId;

    const result = await productService.deleteProduct(
      req.params.id,
      businessId,
    );
    res.json(result);
  },

  updateStock: async (req, res) => {
    res.status(400).json({
      success: false,
      error: "Products no longer have stock. Use store inventory endpoints.",
    });
  },

  getProductBySKU: async (req, res) => {
    const { sku } = req.params;
    const businessId = req.businessId;

    const Product = require("./products.model");
    const product = await Product.findOne({ sku, businessId });

    if (!product) {
      return res
        .status(404)
        .json({ success: false, error: "Product not found" });
    }

    res.json({ success: true, data: product.toFrontendFormat() });
  },

  getLowStockProducts: async (req, res) => {
    const businessId = req.businessId;

    const result = await productService.getLowStockProducts(20, businessId);
    res.json(result);
  },

  getProductsByCategory: async (req, res) => {
    const { category } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const businessId = req.businessId;

    const result = await productService.getProducts(
      { category },
      parseInt(page),
      parseInt(limit),
      businessId,
    );
    res.json(result);
  },

  getFeaturedProducts: async (req, res) => {
    const { page = 1, limit = 10 } = req.query;
    const businessId = req.businessId;

    const result = await productService.getProducts(
      { isFeatured: true },
      parseInt(page),
      parseInt(limit),
      businessId,
    );
    res.json(result);
  },

  searchProducts: async (req, res) => {
    const { q: searchQuery, page = 1, limit = 10 } = req.query;
    const businessId = req.businessId;

    const result = await productService.getProducts(
      { search: searchQuery },
      parseInt(page),
      parseInt(limit),
      businessId,
    );
    res.json(result);
  },

  addProductImages: async (req, res) => {
    const productId = req.params.id;
    const businessId = req.businessId;

    const result = await productService.updateProduct(
      productId,
      {},
      req.files || [],
      businessId,
    );
    res.json(result);
  },

  removeProductImage: async (req, res) => {
    res.status(501).json({ success: false, error: "Not implemented" });
  },

  setPrimaryImage: async (req, res) => {
    res.status(501).json({ success: false, error: "Not implemented" });
  },

  recordSale: async (req, res) => {
    res
      .status(501)
      .json({ success: false, error: "Use sales service for recording sales" });
  },

  restockProductGlobal: async (req, res) => {
    res.status(400).json({
      success: false,
      error: "Products no longer have stock. Use store inventory endpoints.",
    });
  },

  addProductToStore: async (req, res) => {
    const { productId, storeId } = req.params;
    const inventoryData = req.body;
    const businessId = req.businessId;

    const result = await productService.addProductToStore(
      storeId,
      productId,
      inventoryData,
      businessId,
    );

    res.status(200).json(result);
  },
};

module.exports = productController;
