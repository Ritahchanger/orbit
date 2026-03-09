const posService = require("./pos-service");
const initiateMpesaPayment = async (req, res) => {
  const {
    phone,
    amount,
    customerName,
    customerEmail,
    storeId,
    saleIds = [],
    notes,
    clientId,
  } = req.body;
  const wsClientId = clientId || req.headers["x-client-id"];
  const result = await posService.initiateMpesaPayment(
    {
      phone,
      amount,
      customerName,
      customerEmail,
      storeId,
      soldBy: req.user._id,
      saleIds,
      notes,
    },
    wsClientId,
  );
  res.status(200).json({
    success: true,
    message: result.message,
    data: result.data,
  });
};

/**
 * Handle M-Pesa Callback (called by Safaricom)
 * This is PUBLIC - no authentication required
 */
const handleMpesaCallback = async (req, res) => {
  const callbackData = req.body;
  // Validate callback data
  if (!callbackData.Body?.stkCallback) {
    return res.status(400).json({
      success: false,
      message: "Invalid callback format",
    });
  }
  // Process the callback
  const result = await posService.handleMpesaCallback(callbackData);
  // Safaricom expects specific response format
  if (result.success) {
    res.status(200).json({
      ResultCode: 0,
      ResultDesc: "Success",
      ThirdPartyTransID: result.data?.mpesaReceipt || "N/A",
    });
  } else {
    res.status(200).json({
      ResultCode: 1,
      ResultDesc: result.message || "Failed",
      ThirdPartyTransID: "N/A",
    });
  }
};

/**
 * Complete M-Pesa Transaction (called by frontend after payment success)
 */
const completeMpesaTransaction = async (req, res) => {
  const { transactionId, saleIds, transactionSummary, clientId } = req.body;

  // Call the service
  const result = await posService.completeMpesaTransaction({
    transactionId,
    saleIds,
    transactionSummary,
    clientId: clientId || req.headers["x-client-id"],
  });

  res.status(200).json({
    success: true,
    message: result.message,
    data: result.data,
  });
};

/**
 * Poll M-Pesa Status (fallback if WebSocket fails)
 */
const pollMpesaStatus = async (req, res) => {
  const { checkoutRequestId } = req.params;
  const clientId = req.headers["x-client-id"] || req.query.clientId;

  if (!checkoutRequestId) {
    return res.status(400).json({
      success: false,
      message: "CheckoutRequestID is required",
    });
  }

  const result = await posService.pollMpesaStatus(checkoutRequestId, clientId);

  res.status(200).json({
    success: true,
    message: "Status retrieved",
    data: result,
  });
};

/**
 * Generate M-Pesa Token (for testing/development)
 */
const generateMpesaToken = async (req, res) => {
  const token = await posService.generateMpesaToken();
  res.status(200).json({
    success: true,
    message: "Token generated",
    data: { token },
  });
};

/**
 * Validate M-Pesa Phone Number
 */
const validateMpesaPhone = async (req, res) => {
  const { phone } = req.body;
  if (!phone) {
    return res.status(400).json({
      success: false,
      message: "Phone number is required",
    });
  }
  const formattedPhone = posService.formatPhoneNumber(phone);
  res.status(200).json({
    success: true,
    message: "Phone number validated",
    data: {
      original: phone,
      formatted: formattedPhone,
      isValid: true,
    },
  });
};

module.exports = {
  initiateMpesaPayment,
  handleMpesaCallback,
  completeMpesaTransaction,
  pollMpesaStatus,
  generateMpesaToken,
  validateMpesaPhone,
};
