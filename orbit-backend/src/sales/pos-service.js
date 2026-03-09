const Sale = require("./sales.model");
const Product = require("../products/products.model");
const Store = require("../stores/store.model");
const StoreInventory = require("../store-inventory/store-inventory.model");
const Transaction = require("./transaction.model");
const axios = require("axios");
const wsService = require("./wsService");
require("dotenv").config();

const { formatPhoneNumber } = require("../utils/formatPhoneNumber");

const recordMultipleItemsSale = async (transactionData) => {
  try {
    // Validate required fields
    if (!transactionData.storeId) {
      throw new Error("Store ID is required");
    }
    if (!transactionData.paymentMethod) {
      throw new Error("Payment method is required");
    }
    if (
      !transactionData.items ||
      !Array.isArray(transactionData.items) ||
      transactionData.items.length === 0
    ) {
      throw new Error("At least one item is required");
    }

    // Validate cash payment details if payment method is cash
    if (transactionData.paymentMethod === "cash") {
      if (transactionData.cashPayment?.amountGiven === undefined) {
        throw new Error("Amount given is required for cash payments");
      }
      if (transactionData.cashPayment?.amountGiven < 0) {
        throw new Error("Amount given cannot be negative");
      }
    }

    const store = await Store.findById(transactionData.storeId);
    if (!store) {
      throw new Error("Store not found");
    }

    let subtotal = 0;
    let totalProfit = 0;
    const saleIds = [];
    const sales = [];

    // Generate ONE transaction ID for the entire transaction
    const transactionId = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Process each item
    for (const item of transactionData.items) {
      if (!item.sku) {
        throw new Error("SKU is required for all items");
      }
      if (!item.quantity || item.quantity < 1) {
        throw new Error(`Quantity must be at least 1 for product: ${item.sku}`);
      }

      // Find the product by SKU
      const product = await Product.findOne({ sku: item.sku.toUpperCase() });
      if (!product) {
        throw new Error(`Product not found with SKU: ${item.sku}`);
      }

      // Check store inventory
      const storeInventory = await StoreInventory.findOne({
        store: transactionData.storeId,
        product: product._id,
      });

      if (!storeInventory) {
        throw new Error(`Product ${product.name} not available in this store`);
      }

      if (storeInventory.stock < item.quantity) {
        throw new Error(
          `Insufficient stock for ${product.name}. Available: ${storeInventory.stock} units`,
        );
      }

      // Calculate item totals
      const unitPrice = item.unitPrice || product.price;
      const discount = item.discount || 0;
      const itemSubtotal = unitPrice * item.quantity;
      const itemTotal = itemSubtotal - discount;
      const itemProfit =
        item.profit || (unitPrice - (product.costPrice || 0)) * item.quantity;

      subtotal += itemSubtotal;
      totalProfit += itemProfit;

      // Create individual sale record - use the SAME transactionId for all sales
      const sale = new Sale({
        productId: product._id,
        storeId: transactionData.storeId,
        productName: product.name,
        sku: product.sku,
        quantity: item.quantity,
        unitPrice: unitPrice,
        discount: discount,
        subtotal: itemSubtotal,
        total: itemTotal,
        profit: itemProfit,
        paymentMethod: transactionData.paymentMethod,
        customerName: transactionData.customerName.trim(),
        customerPhone: transactionData.customerPhone?.trim() || "",
        notes: transactionData.notes || "",
        status: "completed",
        transactionId: transactionId, // Use the SAME transaction ID for all items
      });

      const savedSale = await sale.save();
      saleIds.push(savedSale._id);
      sales.push(savedSale);

      // Update inventory
      const newStock = storeInventory.stock - item.quantity;

      if (newStock <= 0) {
        await StoreInventory.findByIdAndDelete(storeInventory._id);
      } else {
        let newStatus = "In Stock";
        if (newStock <= storeInventory.minStock) {
          newStatus = "Low Stock";
        }
        await StoreInventory.findByIdAndUpdate(storeInventory._id, {
          $inc: {
            stock: -item.quantity,
            storeSold: item.quantity,
            storeRevenue: itemTotal,
          },
          $set: {
            status: newStatus,
            lastSold: new Date(),
          },
        });
      }

      // Update global product
      await Product.findByIdAndUpdate(product._id, {
        $inc: {
          totalSold: item.quantity,
          totalRevenue: itemTotal,
        },
      });
    }

    // Calculate transaction totals
    const discount = transactionData.discount || 0;
    const tax = transactionData.tax || 0;
    const total = subtotal - discount + tax;

    // Calculate change for cash payments
    let amountGiven = 0;
    let change = 0;

    if (
      transactionData.paymentMethod === "cash" &&
      transactionData.cashPayment
    ) {
      amountGiven = transactionData.cashPayment.amountGiven;

      // Validate amount given for cash payments
      if (amountGiven < total) {
        throw new Error(
          `Amount given (${amountGiven}) is less than total amount (${total})`,
        );
      }

      change = amountGiven - total;
    }

    // Create transaction record
    const transaction = new Transaction({
      transactionId: transactionId, // Use the same ID generated above
      storeId: transactionData.storeId,
      customerName: transactionData.customerName.trim(),
      customerPhone: transactionData.customerPhone?.trim() || "",
      customerEmail: transactionData.customerEmail?.trim() || "",
      saleIds: saleIds,
      itemsCount: transactionData.items.length,
      subtotal: subtotal,
      discount: discount,
      tax: tax,
      total: total,
      totalProfit: totalProfit,
      paymentMethod: transactionData.paymentMethod,
      // Add cash payment fields
      amountGiven: amountGiven,
      change: change,
      paymentStatus: "paid",
      status: "completed",
      notes: transactionData.notes || "",
      soldBy: transactionData.soldBy,
    });

    const savedTransaction = await transaction.save();

    return {
      success: true,
      message: `Transaction completed with ${transactionData.items.length} items`,
      data: {
        transaction: savedTransaction,
        sales: sales,
        summary: {
          itemsCount: transactionData.items.length,
          subtotal: subtotal,
          discount: discount,
          tax: tax,
          total: total,
          totalProfit: totalProfit,
          // Include cash payment summary if applicable
          ...(transactionData.paymentMethod === "cash" && {
            amountGiven: amountGiven,
            change: change,
          }),
        },
      },
    };
  } catch (error) {
    console.error("Transaction failed:", error);
    throw error;
  }
};
const generateMpesaToken = async () => {
  const consumerKey = process.env.SAFARICOM_CONSUMER_KEY;
  const consumerSecret = process.env.SAFARICOM_SECRET_KEY;
  const encoded = Buffer.from(`${consumerKey}:${consumerSecret}`).toString(
    "base64",
  );

  const tokenUrl = process.env.STK_TOKEN_URL_TEST;

  const response = await axios.get(tokenUrl, {
    headers: {
      Authorization: `Basic ${encoded}`,
    },
  });

  return response.data.access_token;
};

/**
 * Initiate M-Pesa STK Push Payment
 */

// Add this new function to pos-service.js
/**
 * Record sales AFTER M-Pesa payment is confirmed
 * This is called from completeMpesaTransaction
 */
const recordMpesaPaidSales = async (saleData) => {
  try {
    // Validate required fields
    if (!saleData.storeId) {
      throw new Error("Store ID is required");
    }
    // if (!saleData.customerName?.trim()) {
    //   throw new Error("Customer name is required");
    // }
    if (!saleData.transactionId) {
      throw new Error("Transaction ID is required");
    }
    if (
      !saleData.items ||
      !Array.isArray(saleData.items) ||
      saleData.items.length === 0
    ) {
      throw new Error("At least one item is required");
    }

    const store = await Store.findById(saleData.storeId);
    if (!store) {
      throw new Error("Store not found");
    }

    let subtotal = 0;
    let totalProfit = 0;
    const saleIds = [];
    const sales = [];

    // Use the transaction MongoDB ID as reference
    const transactionId = saleData.transactionId;

    // Process each item
    for (const item of saleData.items) {
      if (!item.sku) {
        throw new Error("SKU is required for all items");
      }
      if (!item.quantity || item.quantity < 1) {
        throw new Error(`Quantity must be at least 1 for product: ${item.sku}`);
      }

      // Find the product by SKU
      const product = await Product.findOne({ sku: item.sku.toUpperCase() });
      if (!product) {
        throw new Error(`Product not found with SKU: ${item.sku}`);
      }

      // Check store inventory
      const storeInventory = await StoreInventory.findOne({
        store: saleData.storeId,
        product: product._id,
      });

      if (!storeInventory) {
        throw new Error(`Product ${product.name} not available in this store`);
      }

      if (storeInventory.stock < item.quantity) {
        throw new Error(
          `Insufficient stock for ${product.name}. Available: ${storeInventory.stock} units`,
        );
      }

      // Calculate item totals
      const unitPrice = item.unitPrice || product.price;
      const discount = item.discount || 0;
      const itemSubtotal = unitPrice * item.quantity;
      const itemTotal = itemSubtotal - discount;
      const itemProfit =
        item.profit || (unitPrice - (product.costPrice || 0)) * item.quantity;

      subtotal += itemSubtotal;
      totalProfit += itemProfit;

      // Create sale record - status is "completed" because payment is already done
      const sale = new Sale({
        productId: product._id,
        storeId: saleData.storeId,
        productName: product.name,
        sku: product.sku,
        quantity: item.quantity,
        unitPrice: unitPrice,
        discount: discount,
        subtotal: itemSubtotal,
        total: itemTotal,
        profit: itemProfit,
        paymentMethod: "mpesa",
        customerName: saleData.customerName.trim(),
        customerPhone: saleData.customerPhone?.trim() || "",
        notes:
          saleData.notes ||
          `M-Pesa payment - Receipt: ${saleData.mpesaReceipt || "N/A"}`,
        status: "completed",
        paymentStatus: "paid",
        mpesaReceipt: saleData.mpesaReceipt,
        mpesaCheckoutId: saleData.mpesaCheckoutId,
        transactionId: transactionId, // Link to the transaction
      });

      const savedSale = await sale.save();
      saleIds.push(savedSale._id);
      sales.push(savedSale);

      // Update inventory
      const newStock = storeInventory.stock - item.quantity;

      if (newStock <= 0) {
        await StoreInventory.findByIdAndDelete(storeInventory._id);
      } else {
        let newStatus = "In Stock";
        if (newStock <= storeInventory.minStock) {
          newStatus = "Low Stock";
        }
        await StoreInventory.findByIdAndUpdate(storeInventory._id, {
          $inc: {
            stock: -item.quantity,
            storeSold: item.quantity,
            storeRevenue: itemTotal,
          },
          $set: {
            status: newStatus,
            lastSold: new Date(),
          },
        });
      }

      // Update global product
      await Product.findByIdAndUpdate(product._id, {
        $inc: {
          totalSold: item.quantity,
          totalRevenue: itemTotal,
        },
      });
    }

    // Calculate totals
    const discount = saleData.discount || 0;
    const tax = saleData.tax || 0;
    const total = subtotal - discount + tax;

    return {
      success: true,
      message: `M-Pesa sales recorded with ${saleData.items.length} items`,
      data: {
        saleIds,
        sales,
        summary: {
          itemsCount: saleData.items.length,
          subtotal,
          discount,
          tax,
          total,
          totalProfit,
        },
      },
    };
  } catch (error) {
    console.error("M-Pesa sales recording failed:", error);
    throw error;
  }
};

const initiateMpesaPayment = async (paymentData, clientId = null) => {
  const {
    phone,
    amount,
    customerName,
    customerEmail,
    storeId,
    soldBy,
    saleIds = [],
    notes,
  } = paymentData;

  console.log("M-Pesa Payment Data:", paymentData);

  // Validate required fields
  if (!phone) throw new Error("Phone number is required");
  if (!amount || amount <= 0) throw new Error("Valid amount is required");
  if (!storeId) throw new Error("Store ID is required");
  if (!customerName) throw new Error("Customer name is required");

  try {
    // Generate access token
    const token = await generateMpesaToken();
    console.log("✅ M-Pesa token generated");

    const shortCode = process.env.SHORT_CODE;
    const passKey = process.env.SAFARICOM_PASS_KEY;
    const mpesaUrl = process.env.LIPA_NA_MPESA_URL_TEST;

    // Log environment variables (remove in production)
    console.log("M-Pesa Config:", {
      shortCode: shortCode ? "Set" : "Missing",
      passKey: passKey ? "Set" : "Missing",
      mpesaUrl: mpesaUrl,
      hasToken: !!token,
    });

    // Format timestamp - M-Pesa requires YYYYMMDDHHmmss
    const now = new Date();
    const timestamp =
      now.getFullYear() +
      String(now.getMonth() + 1).padStart(2, "0") +
      String(now.getDate()).padStart(2, "0") +
      String(now.getHours()).padStart(2, "0") +
      String(now.getMinutes()).padStart(2, "0") +
      String(now.getSeconds()).padStart(2, "0");

    console.log("Timestamp:", timestamp);

    // Generate password
    const password = Buffer.from(shortCode + passKey + timestamp).toString(
      "base64",
    );

    // Format phone number
    const phoneFormatted = formatPhoneNumber(phone);
    console.log("Phone formatted:", {
      input: phone,
      formatted: phoneFormatted,
    });

    // ============ FIX 1: Don't generate custom transactionId ============
    // Create pending transaction WITHOUT transactionId
    // MongoDB _id will be the primary identifier
    const pendingTransaction = new Transaction({
      // NO transactionId field - let it be null/undefined
      storeId: storeId,
      customerName: customerName.trim(),
      customerPhone: phoneFormatted,
      customerEmail: customerEmail?.trim() || "",
      saleIds: saleIds,
      itemsCount: 0,
      subtotal: amount,
      discount: 0,
      tax: 0,
      total: amount,
      totalProfit: 0,
      paymentMethod: "mpesa",
      paymentStatus: "pending",
      status: "pending",
      notes: notes || `M-Pesa payment initiated`,
      soldBy: soldBy,
      clientId: clientId,
      // M-Pesa fields will be added after response
    });

    await pendingTransaction.save();
    console.log("✅ Pending transaction saved:", {
      mongoId: pendingTransaction._id.toString(),
      clientId: clientId,
    });

    // Notify frontend via WebSocket
    if (clientId) {
      wsService.sendToClient(clientId, "mpesa_status", {
        status: "initiating",
        message: "Initiating M-Pesa payment...",
        transactionId: pendingTransaction._id.toString(), // Send MongoDB ID
        timestamp: new Date().toISOString(),
      });
    }

    // ============ FIX 2: Use MongoDB _id in AccountReference ============
    // Prepare STK Push payload
    const payload = {
      BusinessShortCode: shortCode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: "CustomerPayBillOnline",
      Amount: Math.round(amount),
      PartyA: phoneFormatted,
      PartyB: shortCode,
      PhoneNumber: phoneFormatted,
      CallBackURL: `${process.env.CALLBACK_URL}/api/v1/mpesa/callback`,
      AccountReference: pendingTransaction._id.toString().slice(-12), // Last 12 chars of MongoDB ID
      TransactionDesc: `Pay ${customerName}`.substring(0, 13), // Max 13 chars
    };

    console.log("📤 M-Pesa STK Payload:", JSON.stringify(payload, null, 2));

    // Send STK Push request with timeout
    const response = await axios.post(mpesaUrl, payload, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      timeout: 30000,
    });

    console.log("📥 M-Pesa Response:", JSON.stringify(response.data, null, 2));

    if (response.data.ResponseCode === "0") {
      // ============ FIX 3: Store M-Pesa Checkout ID properly ============
      await Transaction.findByIdAndUpdate(pendingTransaction._id, {
        $set: {
          mpesaCheckoutId: response.data.CheckoutRequestID,
          mpesaMerchantRequestId: response.data.MerchantRequestID,
          notes:
            `${notes || ""}\nM-Pesa STK sent. Checkout ID: ${response.data.CheckoutRequestID}`.trim(),
        },
      });

      console.log(
        "✅ Transaction updated with M-Pesa Checkout ID:",
        response.data.CheckoutRequestID,
      );

      // Notify frontend
      if (clientId) {
        wsService.sendToClient(clientId, "mpesa_status", {
          status: "stk_sent",
          message: "STK Push sent to customer phone",
          transactionId: pendingTransaction._id.toString(), // MongoDB ID
          mpesaCheckoutId: response.data.CheckoutRequestID, // M-Pesa checkout ID
          customerMessage: response.data.CustomerMessage,
          timestamp: new Date().toISOString(),
        });
      }

      return {
        success: true,
        message: "STK Push sent successfully",
        data: {
          transactionId: pendingTransaction._id.toString(), // MongoDB document ID (primary)
          mpesaCheckoutId: response.data.CheckoutRequestID, // M-Pesa checkout ID (for callbacks)
          merchantRequestId: response.data.MerchantRequestID,
          customerMessage: response.data.CustomerMessage,
          clientId: clientId,
        },
      };
    } else {
      // Update transaction status to failed
      await Transaction.findByIdAndUpdate(pendingTransaction._id, {
        $set: {
          status: "cancelled",
          paymentStatus: "failed",
          mpesaResultCode: response.data.ResponseCode,
          mpesaResultDesc: response.data.ResponseDescription,
          notes:
            `${notes || ""}\nM-Pesa STK Push failed: ${response.data.ResponseDescription}`.trim(),
        },
      });

      // Notify frontend of failure
      if (clientId) {
        wsService.sendToClient(clientId, "mpesa_status", {
          status: "failed",
          message: "STK Push failed to send",
          error: response.data.ResponseDescription,
          transactionId: pendingTransaction._id.toString(),
          timestamp: new Date().toISOString(),
        });
      }

      throw new Error(
        `M-Pesa STK Push failed: ${response.data.ResponseDescription}`,
      );
    }
  } catch (error) {
    console.error("❌ M-Pesa Initiation Error:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      stack: error.stack,
    });

    // Re-throw with better error message
    if (error.response?.data) {
      throw new Error(
        `M-Pesa API Error: ${JSON.stringify(error.response.data)}`,
      );
    } else if (error.message.includes("timeout")) {
      throw new Error("M-Pesa API timeout. Please try again.");
    } else {
      throw new Error(`Failed to initiate M-Pesa payment: ${error.message}`);
    }
  }
};

/**
 * Handle M-Pesa STK Push Callback with WebSocket notifications
 */
const handleMpesaCallback = async (callbackData) => {
  try {
    const {
      Body: {
        stkCallback: {
          CheckoutRequestID,
          ResultCode,
          ResultDesc,
          CallbackMetadata,
        },
      },
    } = callbackData;

    console.log("📞 M-Pesa Callback received for:", CheckoutRequestID);
    console.log("Result Code:", ResultCode);
    console.log("Result Desc:", ResultDesc);

    // ============ FIX 4: Find transaction by mpesaCheckoutId ============
    const transaction = await Transaction.findOne({
      mpesaCheckoutId: CheckoutRequestID,
    });

    if (!transaction) {
      console.error(
        `❌ Transaction not found for CheckoutRequestID: ${CheckoutRequestID}`,
      );
      return {
        success: false,
        message: "Transaction not found",
        checkoutRequestId: CheckoutRequestID,
      };
    }

    console.log("✅ Found transaction:", transaction._id.toString());

    const clientId = transaction.clientId;

    if (ResultCode === 0) {
      // Payment successful - extract metadata
      const metadata = {};
      if (CallbackMetadata?.Item) {
        CallbackMetadata.Item.forEach((item) => {
          metadata[item.Name] = item.Value;
        });
      }

      console.log("💰 Payment metadata:", metadata);

      // ============ FIX 5: Store all M-Pesa transaction details ============
      transaction.paymentStatus = "paid";
      transaction.status = "completed";
      transaction.mpesaReceipt = metadata.MpesaReceiptNumber;
      transaction.mpesaPhone =
        metadata.PhoneNumber || transaction.customerPhone;
      transaction.mpesaAmount = metadata.Amount || transaction.total;
      transaction.mpesaTransactionDate = metadata.TransactionDate;
      transaction.mpesaResultCode = ResultCode;
      transaction.mpesaResultDesc = ResultDesc;

      // Add to notes
      transaction.notes =
        `${transaction.notes || ""}\n✅ M-Pesa Payment Confirmed:
      - Receipt: ${metadata.MpesaReceiptNumber || "N/A"}
      - Amount: KES ${metadata.Amount || transaction.total}
      - Phone: ${metadata.PhoneNumber || transaction.customerPhone}
      - Date: ${metadata.TransactionDate || new Date().toISOString()}`.trim();

      await transaction.save();
      console.log("✅ Transaction updated with payment success");

      // Notify frontend via WebSocket
      if (clientId) {
        wsService.sendToClient(clientId, "mpesa_status", {
          status: "success",
          message: "Payment confirmed successfully",
          transactionId: transaction._id.toString(),
          mpesaReceipt: metadata.MpesaReceiptNumber,
          mpesaCheckoutId: transaction.mpesaCheckoutId,
          amount: metadata.Amount || transaction.total,
          phone: metadata.PhoneNumber || transaction.customerPhone,
          timestamp: new Date().toISOString(),
        });
        console.log("📱 WebSocket notification sent to client:", clientId);
      }

      // If saleIds are already linked, we could auto-complete
      if (transaction.saleIds && transaction.saleIds.length > 0) {
        console.log(
          `📦 Transaction has ${transaction.saleIds.length} sale IDs linked`,
        );
        // Frontend will call completeMpesaTransaction to finish
      }

      return {
        success: true,
        message: "Payment confirmed successfully",
        data: {
          transactionId: transaction._id,
          mpesaReceipt: metadata.MpesaReceiptNumber,
          mpesaCheckoutId: transaction.mpesaCheckoutId,
          amount: metadata.Amount,
          phone: metadata.PhoneNumber,
        },
      };
    } else {
      // Payment failed
      console.log("❌ Payment failed with result:", ResultDesc);

      transaction.paymentStatus = "failed";
      transaction.status = "cancelled";
      transaction.mpesaResultCode = ResultCode;
      transaction.mpesaResultDesc = ResultDesc;
      transaction.notes =
        `${transaction.notes || ""}\n❌ M-Pesa Payment Failed: ${ResultDesc}`.trim();

      await transaction.save();
      console.log("✅ Transaction updated with payment failure");

      // Notify frontend via WebSocket
      if (clientId) {
        wsService.sendToClient(clientId, "mpesa_status", {
          status: "failed",
          message: "Payment failed",
          error: ResultDesc,
          transactionId: transaction._id.toString(),
          mpesaCheckoutId: transaction.mpesaCheckoutId,
          timestamp: new Date().toISOString(),
        });
      }

      return {
        success: false,
        message: `Payment failed: ${ResultDesc}`,
        data: {
          transactionId: transaction._id,
          resultCode: ResultCode,
          resultDesc: ResultDesc,
          mpesaCheckoutId: transaction.mpesaCheckoutId,
        },
      };
    }
  } catch (error) {
    console.error("❌ Error handling M-Pesa callback:", error);
    return {
      success: false,
      message: "Error processing callback",
      error: error.message,
    };
  }
};

/**
 * Complete POS transaction after successful M-Pesa payment
 */
/**
 * Complete POS transaction after successful M-Pesa payment
 * NOW ALSO RECORDS THE SALES
 */
const completeMpesaTransaction = async (transactionData) => {
  try {
    const {
      transactionId,
      saleIds = [],
      transactionSummary,
      clientId,
      // Add these new fields
      items,
      storeId,
      customerName,
      customerPhone,
      mpesaReceipt,
      mpesaCheckoutId,
      soldBy,
    } = transactionData;

    console.log("🔄 Completing M-Pesa transaction:", {
      transactionId,
      saleIdsCount: saleIds?.length || 0,
      hasItems: !!items,
    });

    // Find by MongoDB _id
    const transaction = await Transaction.findById(transactionId);

    if (!transaction) {
      throw new Error(`Transaction not found with ID: ${transactionId}`);
    }

    if (transaction.paymentStatus !== "paid") {
      throw new Error(
        `Transaction payment not confirmed. Status: ${transaction.paymentStatus}`,
      );
    }

    if (transaction.status === "completed") {
      console.log("Transaction already completed");
      return {
        success: true,
        message: "Transaction already completed",
        data: transaction,
      };
    }

    let finalSaleIds = saleIds;
    let salesData = [];

    // ============ NEW: Record sales if items are provided ============
    if (items && items.length > 0 && (!saleIds || saleIds.length === 0)) {
      console.log(
        "📦 Recording sales for M-Pesa payment:",
        items.length,
        "items",
      );

      const saleResult = await recordMpesaPaidSales({
        storeId: storeId || transaction.storeId,
        customerName: customerName || transaction.customerName,
        customerPhone: customerPhone || transaction.customerPhone,
        items,
        transactionId: transaction._id.toString(),
        mpesaReceipt: mpesaReceipt || transaction.mpesaReceipt,
        mpesaCheckoutId: mpesaCheckoutId || transaction.mpesaCheckoutId,
        soldBy: soldBy || transaction.soldBy,
        notes: `M-Pesa payment completed`,
      });

      finalSaleIds = saleResult.data.saleIds;
      salesData = saleResult.data.sales;

      console.log("✅ Sales recorded:", finalSaleIds.length, "sales");
    }

    // ============ Update transaction with sale details ============
    if (finalSaleIds && finalSaleIds.length > 0) {
      transaction.saleIds = finalSaleIds;
      transaction.itemsCount =
        transactionSummary?.itemsCount || items?.length || finalSaleIds.length;
      transaction.notes =
        `${transaction.notes || ""}\n📦 Linked to sales: ${finalSaleIds.length} items`.trim();
    }

    // Update transaction summary
    if (transactionSummary) {
      transaction.subtotal =
        transactionSummary.subtotal || transaction.subtotal;
      transaction.discount =
        transactionSummary.discount || transaction.discount;
      transaction.tax = transactionSummary.tax || transaction.tax;
      transaction.total = transactionSummary.total || transaction.total;
      transaction.totalProfit =
        transactionSummary.totalProfit || transaction.totalProfit;
    }

    transaction.status = "completed";
    await transaction.save(); // This triggers pre-save hook to generate transactionId

    console.log(
      "✅ Transaction completed with ID:",
      transaction.transactionId || transaction._id,
    );

    // Notify frontend of completion
    if (clientId) {
      wsService.sendToClient(clientId, "mpesa_status", {
        status: "completed",
        message: "Transaction completed successfully",
        transactionId: transaction._id.toString(),
        transactionNumber: transaction.transactionId,
        mpesaReceipt: transaction.mpesaReceipt,
        saleIds: finalSaleIds,
        salesCount: salesData.length,
        timestamp: new Date().toISOString(),
      });
    }

    return {
      success: true,
      message: "M-Pesa transaction completed successfully",
      data: {
        _id: transaction._id,
        transactionId: transaction.transactionId,
        mpesaReceipt: transaction.mpesaReceipt,
        total: transaction.total,
        itemsCount: transaction.itemsCount,
        saleIds: finalSaleIds,
        sales: salesData,
      },
    };
  } catch (error) {
    console.error("❌ Error completing M-Pesa transaction:", error);
    throw error;
  }
};

/**
 * Poll M-Pesa transaction status (backup if WebSocket fails)
 */
const pollMpesaStatus = async (checkoutRequestId, clientId = null) => {
  try {
    console.log("🔄 Polling M-Pesa status for:", checkoutRequestId);

    const token = await generateMpesaToken();

    const timestamp = new Date()
      .toISOString()
      .replace(/[-:T.Z]/g, "")
      .slice(0, 14);

    const password = Buffer.from(
      process.env.SHORT_CODE + process.env.SAFARICOM_PASS_KEY + timestamp,
    ).toString("base64");

    const response = await axios.post(
      process.env.STK_QUERY_URL_TEST,
      {
        BusinessShortCode: process.env.SHORT_CODE,
        Password: password,
        Timestamp: timestamp,
        CheckoutRequestID: checkoutRequestId,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );

    console.log("📥 Poll response:", response.data);

    // If we have a result, notify via WebSocket
    if (clientId) {
      wsService.sendToClient(clientId, "mpesa_poll", {
        checkoutRequestId: checkoutRequestId,
        result: response.data,
        timestamp: new Date().toISOString(),
      });
    }

    return response.data;
  } catch (error) {
    console.error(
      "❌ Error querying M-Pesa status:",
      error.response?.data || error.message,
    );
    throw error;
  }
};

/**
 * Get transaction status by MongoDB ID or M-Pesa Checkout ID
 */
const getTransactionStatus = async (identifier) => {
  try {
    let transaction;

    // Check if identifier is MongoDB ObjectId
    if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
      transaction = await Transaction.findById(identifier);
    } else {
      // Try to find by mpesaCheckoutId
      transaction = await Transaction.findOne({ mpesaCheckoutId: identifier });
    }

    if (!transaction) {
      return {
        success: false,
        message: "Transaction not found",
      };
    }

    return {
      success: true,
      data: {
        _id: transaction._id,
        transactionId: transaction.transactionId,
        mpesaCheckoutId: transaction.mpesaCheckoutId,
        mpesaReceipt: transaction.mpesaReceipt,
        paymentStatus: transaction.paymentStatus,
        status: transaction.status,
        total: transaction.total,
        customerName: transaction.customerName,
        customerPhone: transaction.customerPhone,
        createdAt: transaction.createdAt,
      },
    };
  } catch (error) {
    console.error("Error getting transaction status:", error);
    return {
      success: false,
      message: error.message,
    };
  }
};

// Export functions
module.exports = {
  recordMultipleItemsSale, // UNCHANGED
  generateMpesaToken,
  initiateMpesaPayment,
  handleMpesaCallback,
  completeMpesaTransaction,
  pollMpesaStatus,
  getTransactionStatus, // NEW helper function
  formatPhoneNumber,
};
