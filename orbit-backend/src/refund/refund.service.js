// services/refund.service.js
const Refund = require("./refund.model");
const Transaction = require("../sales/transaction.model");
const Sale = require("../sales/sales.model");
const Product = require("../products/products.model");
const StoreInventory = require("../store-inventory/store-inventory.model");
const mongoose = require("mongoose");

/**
 * REFUND SERVICE
 * Handles both Cash and M-Pesa refunds
 * M-Pesa refunds: 88% of original amount (12% transaction fee retained)
 * Cash refunds: 100% of original amount
 * NO WEBSOCKETS NEEDED - Synchronous operations
 */
class RefundService {
  /**
   * Process a refund - COMPLETE REFUND LOGIC
   */
  async processRefund(refundData) {
    console.log(refundData);

    try {
      const {
        transactionId,
        amount,
        method,
        reason,
        reasonText,
        items = [],
        returnToStock = true,
        notes,
        processedBy,
        mpesaPhone,
        bankReference,
        bankAccount,
        bankName,
        cashReceivedBy,
      } = refundData;

      // ============ VALIDATION ============
      if (!transactionId) throw new Error("Transaction ID is required");
      if (!amount || amount <= 0)
        throw new Error("Valid refund amount is required");
      if (!method) throw new Error("Refund method is required");
      if (!reason) throw new Error("Refund reason is required");
      if (!processedBy) throw new Error("Processed by user is required");

      // Find original transaction - NO .session()
      const transaction = await Transaction.findById(transactionId)
        .populate("storeId")
        .populate("saleIds");

      if (!transaction) throw new Error("Transaction not found");

      // Check refund eligibility
      if (transaction.status === "refunded") {
        throw new Error("Transaction has already been fully refunded");
      }
      if (transaction.paymentStatus !== "paid") {
        throw new Error("Only paid transactions can be refunded");
      }

      const currentRefunded = transaction.refundedAmount || 0;
      const availableAmount = transaction.total - currentRefunded;

      if (amount > availableAmount) {
        throw new Error(
          `Refund amount (${amount}) exceeds available amount (${availableAmount})`,
        );
      }

      // ============ CALCULATE REFUND AMOUNT ============
      let refundAmount = amount;
      let feeDeducted = 0;

      if (transaction.paymentMethod === "mpesa") {
        feeDeducted = amount * 0.12;
        refundAmount = amount * 0.88;
      }

      // ============ PROCESS ITEMS RETURN ============
      const processedItems = [];
      let itemsToRefund = [];

      if (items && items.length > 0) {
        itemsToRefund = items;
      } else {
        for (const saleId of transaction.saleIds || []) {
          const sale = await Sale.findById(saleId); // NO .session()
          if (sale && sale.status !== "refunded") {
            itemsToRefund.push({
              saleId: sale._id,
              sku: sale.sku,
              productName: sale.productName,
              quantity: sale.quantity,
              unitPrice: sale.unitPrice,
              subtotal: sale.subtotal,
              discount: sale.discount,
            });
          }
        }
      }

      // Process each item being refunded
      for (const item of itemsToRefund) {
        const sale = await Sale.findById(item.saleId); // NO .session()
        if (!sale) {
          throw new Error(`Sale record not found for SKU: ${item.sku}`);
        }

        if (sale.status === "refunded") {
          console.warn(`⚠️ Sale ${sale._id} already refunded, skipping`);
          continue;
        }

        const product = await Product.findOne({ sku: item.sku }); // NO .session()
        if (!product) {
          throw new Error(`Product not found with SKU: ${item.sku}`);
        }

        if (returnToStock) {
          const storeInventory = await StoreInventory.findOne({
            store: transaction.storeId,
            product: product._id,
          }); // NO .session()

          if (storeInventory) {
            await StoreInventory.findByIdAndUpdate(
              storeInventory._id,
              {
                $inc: { stock: item.quantity },
                $set: {
                  status: this.calculateStockStatus(
                    storeInventory.stock + item.quantity,
                    storeInventory.minStock,
                  ),
                },
              }, // NO { session }
            );
          } else {
            await StoreInventory.create([
              {
                store: transaction.storeId,
                product: product._id,
                stock: item.quantity,
                minStock: 5,
                status: "In Stock",
              },
            ]); // NO { session }
          }

          await Product.findByIdAndUpdate(
            product._id,
            { $inc: { stock: item.quantity } }, // NO { session }
          );
        }

        sale.status = "refunded";
        sale.notes = sale.notes
          ? `${sale.notes}\nRefunded: ${new Date().toISOString()}`
          : `Refunded: ${new Date().toISOString()}`;
        await sale.save(); // NO { session }

        processedItems.push({
          saleId: sale._id,
          sku: item.sku,
          productName: item.productName || product.name,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          subtotal: item.quantity * item.unitPrice,
          discount: item.discount || 0,
          returnToStock,
        });
      }

      // ============ CREATE REFUND RECORD ============
      const refundId = this.generateRefundId(method);

      const refund = new Refund({
        refundId,
        transaction: transaction._id,
        storeId: transaction.storeId,
        amount: refundAmount,
        originalAmount: amount,
        remainingBalance: availableAmount - amount,
        method,
        reason,
        reasonText: reason === "other" ? reasonText : undefined,
        items: processedItems,
        refundStatus: "completed",
        processedBy,
        processedAt: new Date(),
        notes: notes || `Refund processed via ${method}`,
        ...(method === "cash" && { cashReceivedBy }),
        ...(method === "mpesa" && {
          mpesaPhone:
            mpesaPhone || transaction.customerPhone || transaction.mpesaPhone,
          mpesaRefundId: `MPR-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`,
        }),
        ...(method === "bank" && {
          bankReference,
          bankAccount,
          bankName,
        }),
      });

      await refund.save(); // NO { session }

      // ============ UPDATE TRANSACTION ============
      if (!transaction.refunds) transaction.refunds = [];
      transaction.refunds.push(refund._id);
      transaction.refundedAmount = (transaction.refundedAmount || 0) + amount;

      if (transaction.refundedAmount >= transaction.total) {
        transaction.refundStatus = "full";
        transaction.status = "refunded";
        transaction.paymentStatus = "refunded";
      } else {
        transaction.refundStatus = "partial";
      }

      transaction.lastRefundDate = new Date();

      if (transaction.paymentMethod === "mpesa" && feeDeducted > 0) {
        transaction.notes = transaction.notes
          ? `${transaction.notes}\n⚠️ M-Pesa Refund: KES ${refundAmount} given to customer (12% fee: KES ${feeDeducted.toFixed(2)} deducted)`
          : `⚠️ M-Pesa Refund: KES ${refundAmount} given to customer (12% fee: KES ${feeDeducted.toFixed(2)} deducted)`;
      }

      await transaction.save(); // NO { session }

      console.log("✅ Refund processed successfully:", {
        refundId: refund.refundId,
        transactionId: transaction.transactionId || transaction._id,
        amount: refundAmount,
        originalAmount: amount,
        method,
        feeDeducted: feeDeducted > 0 ? feeDeducted : 0,
      });

      return {
        success: true,
        message: `Refund processed successfully via ${method}`,
        data: {
          refund: {
            _id: refund._id,
            refundId: refund.refundId,
            amount: refundAmount,
            originalAmount: amount,
            method,
            reason,
            itemsCount: processedItems.length,
            processedAt: refund.processedAt,
          },
          transaction: {
            _id: transaction._id,
            transactionId: transaction.transactionId,
            refundedAmount: transaction.refundedAmount,
            refundStatus: transaction.refundStatus,
            status: transaction.status,
          },
          ...(transaction.paymentMethod === "mpesa" && {
            warning: "12% transaction fee applied",
            feeDeducted: feeDeducted.toFixed(2),
            customerReceived: refundAmount.toFixed(2),
          }),
        },
      };
    } catch (error) {
      console.error("❌ Refund failed:", error);
      throw error;
    }
  }

  /**
   * Get refund by ID
   */
  async getRefundById(refundId) {
    try {
      const refund = await Refund.findById(refundId)
        .populate(
          "transaction",
          "transactionId total paymentMethod customerName",
        )
        .populate("processedBy", "name email")
        .populate("approvedBy", "name email");

      if (!refund) {
        return {
          success: false,
          message: "Refund not found",
        };
      }

      return {
        success: true,
        data: refund,
      };
    } catch (error) {
      console.error("Error fetching refund:", error);
      throw error;
    }
  }

  /**
   * Get refunds by transaction
   */
  async getRefundsByTransaction(transactionId) {
    try {
      const refunds = await Refund.find({ transaction: transactionId })
        .populate("processedBy", "name email")
        .sort("-createdAt");

      return {
        success: true,
        data: refunds,
        count: refunds.length,
      };
    } catch (error) {
      console.error("Error fetching transaction refunds:", error);
      throw error;
    }
  }

  /**
   * Get refunds by store with pagination
   */
  async getRefundsByStore(storeId, page = 1, limit = 20, filters = {}) {
    try {
      const query = { storeId };

      // Apply filters
      if (filters.method) query.method = filters.method;
      if (filters.reason) query.reason = filters.reason;
      if (filters.refundStatus) query.refundStatus = filters.refundStatus;

      if (filters.startDate || filters.endDate) {
        query.createdAt = {};
        if (filters.startDate)
          query.createdAt.$gte = new Date(filters.startDate);
        if (filters.endDate) query.createdAt.$lte = new Date(filters.endDate);
      }

      const skip = (page - 1) * limit;

      const [refunds, total] = await Promise.all([
        Refund.find(query)
          .populate("transaction", "transactionId total paymentMethod")
          .populate("processedBy", "name email")
          .sort("-createdAt")
          .skip(skip)
          .limit(limit),
        Refund.countDocuments(query),
      ]);

      return {
        success: true,
        data: refunds,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      console.error("Error fetching store refunds:", error);
      throw error;
    }
  }

  /**
   * Get refund summary/dashboard stats
   */
  async getRefundSummary(storeId = null, days = 30) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const match = {
        createdAt: { $gte: startDate },
        refundStatus: "completed",
      };

      if (storeId) match.storeId = mongoose.Types.ObjectId(storeId);

      const summary = await Refund.aggregate([
        { $match: match },
        {
          $facet: {
            totals: [
              {
                $group: {
                  _id: null,
                  totalRefunds: { $sum: 1 },
                  totalAmount: { $sum: "$amount" },
                  totalOriginalAmount: { $sum: "$originalAmount" },
                  totalFeeDeducted: {
                    $sum: { $subtract: ["$originalAmount", "$amount"] },
                  },
                },
              },
            ],
            byMethod: [
              {
                $group: {
                  _id: "$method",
                  count: { $sum: 1 },
                  total: { $sum: "$amount" },
                },
              },
            ],
            byReason: [
              {
                $group: {
                  _id: "$reason",
                  count: { $sum: 1 },
                  total: { $sum: "$amount" },
                },
              },
              { $sort: { count: -1 } },
              { $limit: 5 },
            ],
            daily: [
              {
                $group: {
                  _id: {
                    $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
                  },
                  count: { $sum: 1 },
                  total: { $sum: "$amount" },
                },
              },
              { $sort: { _id: -1 } },
              { $limit: 30 },
            ],
          },
        },
      ]);

      const result = {
        period: `${days} days`,
        totals: summary[0].totals[0] || {
          totalRefunds: 0,
          totalAmount: 0,
          totalOriginalAmount: 0,
          totalFeeDeducted: 0,
        },
        byMethod: summary[0].byMethod,
        byReason: summary[0].byReason,
        daily: summary[0].daily,
      };

      return {
        success: true,
        data: result,
      };
    } catch (error) {
      console.error("Error getting refund summary:", error);
      throw error;
    }
  }

  /**
   * Check if transaction can be refunded
   */
  async canRefundTransaction(transactionId, amount = null) {
    try {
      const transaction = await Transaction.findById(transactionId);

      if (!transaction) {
        return {
          success: false,
          message: "Transaction not found",
          canRefund: false,
        };
      }

      if (transaction.status === "refunded") {
        return {
          success: false,
          message: "Transaction already fully refunded",
          canRefund: false,
        };
      }

      if (transaction.paymentStatus !== "paid") {
        return {
          success: false,
          message: `Transaction payment status is ${transaction.paymentStatus}`,
          canRefund: false,
        };
      }

      const currentRefunded = transaction.refundedAmount || 0;
      const availableAmount = transaction.total - currentRefunded;

      if (amount && amount > availableAmount) {
        return {
          success: false,
          message: `Requested amount (${amount}) exceeds available amount (${availableAmount})`,
          canRefund: false,
          availableAmount,
        };
      }

      return {
        success: true,
        canRefund: true,
        availableAmount,
        currentRefunded,
        totalAmount: transaction.total,
        paymentMethod: transaction.paymentMethod,
        // M-Pesa specific
        ...(transaction.paymentMethod === "mpesa" && {
          refundRate: "88%",
          feeRate: "12%",
          warning: "Customer will receive 88% of refund amount",
        }),
      };
    } catch (error) {
      console.error("Error checking refund eligibility:", error);
      throw error;
    }
  }

  /**
   * Approve a pending refund
   */
  async approveRefund(refundId, approvedBy) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const refund = await Refund.findById(refundId).session(session);

      if (!refund) {
        throw new Error("Refund not found");
      }

      if (refund.refundStatus !== "pending") {
        throw new Error(
          `Refund cannot be approved. Status: ${refund.refundStatus}`,
        );
      }

      refund.refundStatus = "completed";
      refund.approvedBy = approvedBy;
      refund.approvedAt = new Date();

      await refund.save({ session });

      // Also mark the transaction refund as approved
      const transaction = await Transaction.findById(
        refund.transaction,
      ).session(session);

      if (transaction) {
        transaction.notes = transaction.notes
          ? `${transaction.notes}\n✅ Refund ${refund.refundId} approved by ${approvedBy}`
          : `✅ Refund ${refund.refundId} approved by ${approvedBy}`;
        await transaction.save({ session });
      }

      await session.commitTransaction();
      session.endSession();

      return {
        success: true,
        message: "Refund approved successfully",
        data: refund,
      };
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }

  /**
   * Generate refund ID
   */
  generateRefundId(method) {
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.random().toString(36).substr(2, 4).toUpperCase();
    const prefix =
      method === "mpesa" ? "MPR" : method === "cash" ? "CSR" : "BNR";
    return `${prefix}-${timestamp}-${random}`;
  }

  /**
   * Calculate stock status
   */
  calculateStockStatus(stock, minStock) {
    if (stock <= 0) return "Out of Stock";
    if (stock <= minStock) return "Low Stock";
    return "In Stock";
  }
}

module.exports = new RefundService();
