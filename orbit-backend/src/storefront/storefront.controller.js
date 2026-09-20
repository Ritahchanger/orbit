const businessService = require("../business/services/business.service");
const orderService = require("../orders/order.service");
const { findProducts, countProducts, findProductById } = require("../products");

// Never leak internal-only fields (cost/margin data, sales counters, minStock
// thresholds) to anonymous storefront visitors.
const PUBLIC_PRODUCT_FIELDS =
  "name sku category price description weight dimensions brand warranty images status isFeatured productType model color connectivity powerConsumption stock";

const getStorefront = async (req, res) => {
  const business = await businessService.getPublishedBySlug(req.params.slug);

  res.status(200).json({
    success: true,
    data: {
      businessName: business.businessName,
      businessLogo: business.businessLogo,
      city: business.city,
      country: business.country,
      ecommerce: business.ecommerce,
    },
  });
};

const listProducts = async (req, res) => {
  const business = await businessService.getPublishedBySlug(req.params.slug);
  const { page = 1, limit = 20, category, search } = req.query;

  const filter = { businessId: business._id, stock: { $gt: 0 } };
  if (category) filter.category = category.toLowerCase();
  if (search) filter.name = { $regex: search, $options: "i" };

  const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
  const [products, total] = await Promise.all([
    findProducts(filter, {
      skip,
      limit: parseInt(limit, 10),
      sort: { createdAt: -1 },
      select: PUBLIC_PRODUCT_FIELDS,
    }),
    countProducts(filter),
  ]);

  res.status(200).json({
    success: true,
    data: products,
    pagination: {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      total,
      pages: Math.ceil(total / limit) || 1,
    },
  });
};

const getProduct = async (req, res) => {
  const business = await businessService.getPublishedBySlug(req.params.slug);
  const product = await findProductById(req.params.productId, {
    select: `${PUBLIC_PRODUCT_FIELDS} businessId`,
  });

  if (!product || String(product.businessId) !== String(business._id)) {
    return res.status(404).json({ success: false, message: "Product not found" });
  }
  delete product.businessId;

  res.status(200).json({ success: true, data: product });
};

const checkout = async (req, res) => {
  const { order, invoice } = await orderService.createFromStorefront(
    req.params.slug,
    req.body,
  );

  res.status(201).json({
    success: true,
    message: "Order placed successfully",
    data: { order, invoice },
  });
};

module.exports = { getStorefront, listProducts, getProduct, checkout };
