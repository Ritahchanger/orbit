const orderService = require("./order.service");

const list = async (req, res) => {
  const { status, page, limit } = req.query;
  const result = await orderService.listForBusiness(req.businessId, {
    status,
    page: page ? parseInt(page, 10) : undefined,
    limit: limit ? parseInt(limit, 10) : undefined,
  });

  res.status(200).json({
    success: true,
    data: result.orders,
    pagination: result.pagination,
  });
};

const getById = async (req, res) => {
  const order = await orderService.getById(req.businessId, req.params.id);

  res.status(200).json({ success: true, data: order });
};

const updateStatus = async (req, res) => {
  const order = await orderService.updateStatus(
    req.businessId,
    req.params.id,
    req.body.status,
  );

  res.status(200).json({
    success: true,
    message: "Order status updated successfully",
    data: order,
  });
};

const listCustomers = async (req, res) => {
  const { search, page, limit } = req.query;
  const result = await orderService.listCustomers(req.businessId, {
    search,
    page: page ? parseInt(page, 10) : undefined,
    limit: limit ? parseInt(limit, 10) : undefined,
  });

  res.status(200).json({
    success: true,
    data: result.customers,
    pagination: result.pagination,
  });
};

const getCustomerDetail = async (req, res) => {
  const result = await orderService.getCustomerDetail(
    req.businessId,
    req.params.phone,
  );

  res.status(200).json({ success: true, data: result });
};

module.exports = { list, getById, updateStatus, listCustomers, getCustomerDetail };
