const Invoice = require("./invoice.model");
const Transaction = require("../sales/transaction.model");

class InvoiceService {
  // ── From an ecommerce order ──────────────────────────────────────────────
  // Pass `session` so this write joins the caller's transaction (order
  // checkout creates the order and its invoice atomically).
  async createForOrder(order, { dueInDays = 7, session } = {}) {
    const items = order.items.map((item) => ({
      description: item.name,
      quantity: item.quantity,
      unitPrice: item.price,
      amount: item.subtotal,
    }));

    const isPaid = order.paymentStatus === "paid";

    const [invoice] = await Invoice.create(
      [
        {
          businessId: order.businessId,
          type: "order",
          order: order._id,
          customer: {
            name: order.customer.name,
            email: order.customer.email,
            phone: order.customer.phone,
            address: order.shippingAddress?.address || "",
          },
          items,
          subtotal: order.subtotal,
          tax: order.tax,
          discount: order.discount,
          shippingFee: order.shippingFee,
          total: order.total,
          currency: order.currency,
          status: isPaid ? "paid" : "issued",
          paidAt: isPaid ? new Date() : null,
          dueDate: new Date(Date.now() + dueInDays * 24 * 60 * 60 * 1000),
        },
      ],
      { session },
    );

    return invoice;
  }

  // ── From a completed POS sale/transaction ────────────────────────────────
  async createForSale(businessId, transactionId, userId = null) {
    const transaction = await Transaction.findOne({
      _id: transactionId,
      businessId,
      isDeleted: false,
    }).populate("saleIds");
    if (!transaction) throw new Error("Transaction not found");

    const existing = await Invoice.findOne({
      transaction: transaction._id,
      businessId,
      isDeleted: false,
    });
    if (existing) return existing;

    const sales = transaction.saleIds || [];
    const items = sales.length
      ? sales.map((sale) => ({
          description: sale.productName,
          quantity: sale.quantity,
          unitPrice: sale.unitPrice,
          amount: sale.total,
        }))
      : [
          {
            description: `Sale ${transaction.transactionId || transaction._id}`,
            quantity: 1,
            unitPrice: transaction.total,
            amount: transaction.total,
          },
        ];

    const isPaid = transaction.paymentStatus === "paid";

    return Invoice.create({
      businessId,
      type: "sale",
      transaction: transaction._id,
      customer: {
        name: transaction.customerName || "Walk-in Customer",
        email: transaction.customerEmail || "",
        phone: transaction.customerPhone || "",
      },
      items,
      subtotal: transaction.subtotal,
      tax: transaction.tax,
      discount: transaction.discount,
      total: transaction.total,
      status: isPaid ? "paid" : "issued",
      paidAt: isPaid ? new Date() : null,
      createdBy: userId,
    });
  }

  // ── Standalone / B2B invoice, billed directly by the business ───────────
  async createStandalone(businessId, userId, data) {
    const { customer, items: rawItems, tax = 0, discount = 0, shippingFee = 0, currency, dueDate, notes } = data;

    if (!customer?.name) throw new Error("Customer name is required");
    if (!Array.isArray(rawItems) || rawItems.length === 0) {
      throw new Error("Invoice must have at least one item");
    }

    const items = rawItems.map((item) => {
      const amount = item.amount ?? item.quantity * item.unitPrice;
      return {
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        amount,
      };
    });

    const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
    const total = subtotal + tax + shippingFee - discount;

    return Invoice.create({
      businessId,
      type: "standalone",
      customer,
      items,
      subtotal,
      tax,
      discount,
      shippingFee,
      total,
      currency,
      dueDate,
      notes,
      createdBy: userId,
      status: "issued",
    });
  }

  async list(businessId, { status, type, page = 1, limit = 20 } = {}) {
    const query = { businessId, isDeleted: false };
    if (status) query.status = status;
    if (type) query.type = type;

    const skip = (page - 1) * limit;
    const [invoices, total] = await Promise.all([
      Invoice.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Invoice.countDocuments(query),
    ]);

    return {
      invoices,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) || 1 },
    };
  }

  async getById(businessId, id) {
    const invoice = await Invoice.findOne({
      _id: id,
      businessId,
      isDeleted: false,
    });
    if (!invoice) throw new Error("Invoice not found");
    return invoice;
  }

  async updateStatus(businessId, id, status) {
    const invoice = await this.getById(businessId, id);
    invoice.status = status;
    if (status === "paid") invoice.paidAt = new Date();
    await invoice.save();
    return invoice;
  }

  async remove(businessId, id) {
    const invoice = await this.getById(businessId, id);
    invoice.isDeleted = true;
    invoice.deletedAt = new Date();
    await invoice.save();
    return invoice;
  }
}

module.exports = new InvoiceService();
