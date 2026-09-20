const invoiceService = require("./invoice.service");

const list = async (req, res) => {
  const { status, type, page, limit } = req.query;
  const result = await invoiceService.list(req.businessId, {
    status,
    type,
    page: page ? parseInt(page, 10) : undefined,
    limit: limit ? parseInt(limit, 10) : undefined,
  });

  res.status(200).json({
    success: true,
    data: result.invoices,
    pagination: result.pagination,
  });
};

const getById = async (req, res) => {
  const invoice = await invoiceService.getById(req.businessId, req.params.id);

  res.status(200).json({ success: true, data: invoice });
};

const createFromSale = async (req, res) => {
  const invoice = await invoiceService.createForSale(
    req.businessId,
    req.params.transactionId,
    req.user?._id,
  );

  res.status(201).json({
    success: true,
    message: "Invoice generated successfully",
    data: invoice,
  });
};

const createStandalone = async (req, res) => {
  const invoice = await invoiceService.createStandalone(
    req.businessId,
    req.user?._id,
    req.body,
  );

  res.status(201).json({
    success: true,
    message: "Invoice created successfully",
    data: invoice,
  });
};

const updateStatus = async (req, res) => {
  const invoice = await invoiceService.updateStatus(
    req.businessId,
    req.params.id,
    req.body.status,
  );

  res.status(200).json({
    success: true,
    message: "Invoice status updated successfully",
    data: invoice,
  });
};

const remove = async (req, res) => {
  await invoiceService.remove(req.businessId, req.params.id);

  res.status(200).json({
    success: true,
    message: "Invoice deleted successfully",
  });
};

module.exports = {
  list,
  getById,
  createFromSale,
  createStandalone,
  updateStatus,
  remove,
};
