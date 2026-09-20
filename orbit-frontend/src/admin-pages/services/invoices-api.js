// invoices-api.js
import { api } from "../../api/axios-conf";

/**
 * List invoices (businessId-scoped, authenticated)
 * GET /invoices?status=&type=&page=&limit=
 * @param {Object} params - { status, type, page, limit }
 */
export const getInvoices = async (params = {}) => {
    const response = await api.get("/invoices", { params });
    return response.data;
};

/**
 * Get a single invoice by id
 * GET /invoices/:id
 * @param {string} id - Invoice identifier
 */
export const getInvoiceById = async (id) => {
    const response = await api.get(`/invoices/${id}`);
    return response.data;
};

/**
 * Create a standalone / B2B invoice
 * POST /invoices/standalone
 * @param {Object} data - { customer, items, tax?, discount?, shippingFee?, currency?, dueDate?, notes? }
 */
export const createStandaloneInvoice = async (data) => {
    const response = await api.post("/invoices/standalone", data);
    return response.data;
};

/**
 * Generate (or fetch existing) invoice from a completed POS sale
 * POST /invoices/from-sale/:transactionId
 * @param {string} transactionId - POS Transaction identifier
 */
export const createInvoiceFromSale = async (transactionId) => {
    const response = await api.post(`/invoices/from-sale/${transactionId}`);
    return response.data;
};

/**
 * Update an invoice's status
 * PATCH /invoices/:id/status
 * @param {string} id - Invoice identifier
 * @param {string} status - draft|issued|paid|overdue|cancelled|void
 */
export const updateInvoiceStatus = async (id, status) => {
    const response = await api.patch(`/invoices/${id}/status`, { status });
    return response.data;
};

/**
 * Soft-delete an invoice
 * DELETE /invoices/:id
 * @param {string} id - Invoice identifier
 */
export const deleteInvoice = async (id) => {
    const response = await api.delete(`/invoices/${id}`);
    return response.data;
};

const invoicesApi = {
    getInvoices,
    getInvoiceById,
    createStandaloneInvoice,
    createInvoiceFromSale,
    updateInvoiceStatus,
    deleteInvoice,
};

export default invoicesApi;
