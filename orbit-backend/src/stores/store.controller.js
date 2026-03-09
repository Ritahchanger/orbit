// controllers/store.controller.js
const storeService = require("./store.service");

// @desc    Get all stores
// @route   GET /api/v1/stores
// @access  Private
exports.getAllStores = async (req, res) => {
  const result = await storeService.getAllStores(req.user, req.query);
  res.json(result);
};

// @desc    Get single store
// @route   GET /api/v1/stores/:id
// @access  Private
exports.getStoreById = async (req, res) => {
  const result = await storeService.getStoreById(req.params.id, req.user);
  res.json(result);
};

// @desc    Create new store
// @route   POST /api/v1/stores
// @access  Private (Superadmin only)
exports.createStore = async (req, res) => {
  const result = await storeService.createStore(req.body, req.user);
  res.status(201).json(result);
};

// @desc    Update store
// @route   PUT /api/v1/stores/:id
// @access  Private (Superadmin/Manager)
exports.updateStore = async (req, res) => {
  const result = await storeService.updateStore(
    req.params.id,
    req.body,
    req.user,
  );
  res.json(result);
};

// @desc    Delete store
// @route   DELETE /api/v1/stores/:id
// @access  Private (Superadmin only)
exports.deleteStore = async (req, res) => {
  const result = await storeService.deleteStore(req.params.id, req.user);
  res.json(result);
};

// @desc    Get store statistics
// @route   GET /api/v1/stores/:id/stats
// @access  Private
exports.getStoreStats = async (req, res) => {
  const result = await storeService.getStoreStats(req.params.id, req.user);
  res.json(result);
};

// @desc    Assign user to store
// @route   POST /api/v1/stores/:id/users/:userId
// @access  Private (Superadmin/Manager)
exports.assignUserToStore = async (req, res) => {
  const result = await storeService.assignUserToStore(
    req.params.id,
    req.params.userId,
    req.body.permissions || {},
    req.user,
  );
  res.json(result);
};

// @desc    Get all workers of a specific store
// @route   GET /api/v1/stores/:id/workers
// @access  Private
exports.getStoreWorkers = async (req, res) => {
  const { id } = req.params;
  const { role, search, page, limit } = req.query;
  const result = await storeService.getStoreWorkers(id, req.user, {
    role,
    search,
    page: parseInt(page) || 1,
    limit: parseInt(limit) || 20,
  });

  res.json(result);
};

// @desc    Get store users
// @route   GET /api/v1/stores/:id/users
// @access  Private
exports.getStoreUsers = async (req, res) => {
  const result = await storeService.getStoreUsers(req.params.id, req.user);
  res.json(result);
};

// @desc    Search stores
// @route   GET /api/v1/stores/search
// @access  Private
exports.searchStores = async (req, res) => {
  const { q, limit = 10 } = req.query;
  if (!q) {
    return res.status(400).json({
      success: false,
      message: "Search term is required",
    });
  }

  const result = await storeService.searchStores(q, req.user, parseInt(limit));
  res.json(result);
};

// @desc    Get store by code
// @route   GET /api/v1/stores/code/:code
// @access  Private
exports.getStoreByCode = async (req, res) => {
  const result = await storeService.getStoreByCode(req.params.code, req.user);
  res.json(result);
};
