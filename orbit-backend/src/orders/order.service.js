const mongoose = require("mongoose");
const Order = require("./order.model");
const businessService = require("../business/services/business.service");
const invoiceService = require("../invoices/invoice.service");
const { findProducts, decrementStockIfAvailable } = require("../products");

class OrderService {
  // ── Public storefront checkout ───────────────────────────────────────────
  async createFromStorefront(storeSlug, payload) {
    const business = await businessService.getPublishedBySlug(storeSlug);
    const businessId = business._id;
    const settings = business.ecommerce;

    const { customer, shippingAddress, items, paymentMethod, notes } = payload;

    if (!customer?.name?.trim()) throw new Error("Customer name is required");
    if (!customer?.phone?.trim()) throw new Error("Customer phone is required");
    if (!Array.isArray(items) || items.length === 0) {
      throw new Error("At least one item is required");
    }
    if (paymentMethod && !settings.paymentMethods.includes(paymentMethod)) {
      throw new Error(`Payment method "${paymentMethod}" is not accepted by this store`);
    }

    // ── Validate all items against real, business-scoped catalog (no writes yet) ──
    const productIds = items.map((i) => i.productId);
    const products = await findProducts(
      { _id: { $in: productIds }, businessId },
    );
    const productsById = new Map(products.map((p) => [p._id.toString(), p]));

    const resolvedItems = [];
    for (const item of items) {
      const product = productsById.get(String(item.productId));
      if (!product) throw new Error(`Product not found: ${item.productId}`);
      if (!item.quantity || item.quantity < 1) {
        throw new Error(`Quantity must be at least 1 for "${product.name}"`);
      }
      if (product.stock < item.quantity) {
        throw new Error(
          `Insufficient stock for "${product.name}". Available: ${product.stock}, Requested: ${item.quantity}`,
        );
      }

      const price = product.price;
      const subtotal = price * item.quantity;
      resolvedItems.push({
        product: product._id,
        name: product.name,
        sku: product.sku,
        price,
        quantity: item.quantity,
        subtotal,
      });
    }

    // ── Totals (server-computed, never trust client-sent prices) ────────────
    const subtotal = resolvedItems.reduce((sum, i) => sum + i.subtotal, 0);
    const tax = Math.round(subtotal * (settings.taxRate / 100) * 100) / 100;
    const qualifiesForFreeShipping =
      settings.freeShippingThreshold != null &&
      subtotal >= settings.freeShippingThreshold;
    const shippingFee = qualifiesForFreeShipping ? 0 : settings.shippingFee;
    const total = subtotal + tax + shippingFee;

    // ── Writes: decrement stock, create order, generate invoice ─────────────
    // All in one transaction: if anything fails partway (a race on stock,
    // an invoice write error, a dropped connection), the whole attempt rolls
    // back instead of leaving stock decremented with no order to show for it,
    // or an order with no invoice.
    //
    // Two concurrent checkouts hitting the same product don't just "lose" the
    // stock check gracefully — MongoDB itself aborts one of them with a
    // WriteConflict (labelled TransientTransactionError), which is the
    // documented, expected outcome of two transactions touching the same
    // document at once, not a bug. The fix is to retry the whole attempt a
    // few times, per MongoDB's own retry guidance, instead of surfacing that
    // raw driver error to the customer.
    const MAX_ATTEMPTS = 3;
    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
      const session = await mongoose.startSession();
      try {
        session.startTransaction();

        // Atomic, conditional decrement per item — guards against two
        // concurrent checkouts both passing the earlier stock check and
        // overselling the last unit(s). A null result means we lost that race.
        for (const item of resolvedItems) {
          const updated = await decrementStockIfAvailable(
            item.product,
            item.quantity,
            item.subtotal,
            { session },
          );
          if (!updated) {
            throw new Error(
              `"${item.name}" just sold out. Please update your cart and try again.`,
            );
          }
        }

        const [order] = await Order.create(
          [
            {
              businessId,
              customer,
              shippingAddress,
              items: resolvedItems,
              subtotal,
              shippingFee,
              tax,
              total,
              currency: settings.currency,
              paymentMethod: paymentMethod || settings.paymentMethods[0],
              notes,
            },
          ],
          { session },
        );

        const invoice = await invoiceService.createForOrder(order, { session });
        order.invoice = invoice._id;
        await order.save({ session });

        await session.commitTransaction();
        return { order, invoice };
      } catch (err) {
        await session.abortTransaction().catch(() => {});

        const isTransient =
          typeof err.hasErrorLabel === "function" &&
          err.hasErrorLabel("TransientTransactionError");

        if (isTransient && attempt < MAX_ATTEMPTS) {
          continue; // another checkout won the race on this document — retry clean
        }
        if (isTransient) {
          throw new Error("This item is in high demand right now. Please try again.");
        }
        throw err;
      } finally {
        session.endSession();
      }
    }
  }

  // ── Admin (business-scoped) ──────────────────────────────────────────────
  async listForBusiness(businessId, { status, page = 1, limit = 20 } = {}) {
    const query = { businessId, isDeleted: false };
    if (status) query.status = status;

    const skip = (page - 1) * limit;
    const [orders, total] = await Promise.all([
      Order.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Order.countDocuments(query),
    ]);

    return {
      orders,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) || 1 },
    };
  }

  async getById(businessId, orderId) {
    const order = await Order.findOne({
      _id: orderId,
      businessId,
      isDeleted: false,
    }).populate("invoice");
    if (!order) throw new Error("Order not found");
    return order;
  }

  async updateStatus(businessId, orderId, status) {
    const order = await this.getById(businessId, orderId);
    order.status = status;
    await order.save();
    return order;
  }

  // ── Customers (derived from orders — there is no standalone Customer entity) ──
  async listCustomers(businessId, { search, page = 1, limit = 20 } = {}) {
    const match = { businessId, isDeleted: false };
    if (search) {
      match.$or = [
        { "customer.name": { $regex: search, $options: "i" } },
        { "customer.phone": { $regex: search, $options: "i" } },
        { "customer.email": { $regex: search, $options: "i" } },
      ];
    }

    const skip = (page - 1) * limit;
    const groupStage = {
      $group: {
        _id: "$customer.phone",
        name: { $last: "$customer.name" },
        email: { $last: "$customer.email" },
        phone: { $last: "$customer.phone" },
        totalOrders: { $sum: 1 },
        totalSpent: { $sum: "$total" },
        lastOrderAt: { $max: "$createdAt" },
        firstOrderAt: { $min: "$createdAt" },
      },
    };

    const [customers, totalResult] = await Promise.all([
      Order.aggregate([
        { $match: match },
        { $sort: { createdAt: -1 } },
        groupStage,
        { $sort: { lastOrderAt: -1 } },
        { $skip: skip },
        { $limit: limit },
      ]),
      Order.aggregate([{ $match: match }, groupStage, { $count: "count" }]),
    ]);

    const total = totalResult[0]?.count || 0;
    return {
      customers,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) || 1 },
    };
  }

  async getCustomerDetail(businessId, phone) {
    const orders = await Order.find({
      businessId,
      "customer.phone": phone,
      isDeleted: false,
    }).sort({ createdAt: -1 });

    if (!orders.length) throw new Error("Customer not found");

    const totalSpent = orders.reduce((sum, order) => sum + order.total, 0);

    return {
      customer: {
        name: orders[0].customer.name,
        email: orders[0].customer.email,
        phone,
      },
      totalOrders: orders.length,
      totalSpent,
      firstOrderAt: orders[orders.length - 1].createdAt,
      lastOrderAt: orders[0].createdAt,
      orders,
    };
  }
}

module.exports = new OrderService();
