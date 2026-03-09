import { api } from "../../api/axios-conf";

const reportsApi = {
    // ============ DASHBOARD REPORTS ============
    getDashboardStats: async (storeId = null) => {
        const params = storeId ? { storeId } : {};
        const response = await api.get("/reports/dashboard", { params });
        return response.data;
    },

    // ============ SALES REPORTS ============
    getSalesReport: async (filters = {}) => {
        const response = await api.get("/reports/sales", { params: filters });
        return response.data;
    },

    getSalesTrendReport: async (period = 'daily', filters = {}) => {
        const params = { period, ...filters };
        const response = await api.get("/reports/sales/trend", { params });
        return response.data;
    },

    getDailySalesSummary: async (date, storeId = null) => {
        const params = {};
        if (date) params.date = date;
        if (storeId) params.storeId = storeId;
        
        const response = await api.get("/reports/daily-summary", { params });
        return response.data;
    },

    getMonthlySalesSummary: async (year, month, storeId = null) => {
        const params = {};
        if (year) params.year = year;
        if (month) params.month = month;
        if (storeId) params.storeId = storeId;
        
        const response = await api.get("/reports/monthly-summary", { params });
        return response.data;
    },

    // ============ INVENTORY REPORTS ============
    getInventoryReport: async (filters = {}) => {
        const response = await api.get("/reports/inventory", { params: filters });
        return response.data;
    },

    // ============ PRODUCT REPORTS ============
    getProductPerformanceReport: async (filters = {}) => {
        const response = await api.get("/reports/products/performance", { params: filters });
        return response.data;
    },

    getTopPerformingProducts: async (metric = 'revenue', filters = {}) => {
        const params = { metric, ...filters };
        const response = await api.get("/reports/products/top-performing", { params });
        return response.data;
    },

    // ============ STORE REPORTS ============
    getStorePerformanceReport: async (filters = {}) => {
        const response = await api.get("/reports/stores/performance", { params: filters });
        return response.data;
    },

    // ============ FINANCIAL REPORTS ============
    getFinancialSummary: async (filters = {}) => {
        const response = await api.get("/reports/financial/summary", { params: filters });
        return response.data;
    },

    // ============ ALERT REPORTS ============
    getLowStockAlerts: async (storeId = null, limit = 50) => {
        const params = { limit };
        if (storeId) params.storeId = storeId;
        
        const response = await api.get("/reports/alerts/low-stock", { params });
        return response.data;
    },

    getOutOfStockReport: async (storeId = null, limit = 50) => {
        const params = { limit };
        if (storeId) params.storeId = storeId;
        
        const response = await api.get("/reports/alerts/out-of-stock", { params });
        return response.data;
    },

    // ============ CATEGORY REPORTS ============
    getCategoryRevenueReport: async (filters = {}) => {
        const response = await api.get("/reports/category/revenue", { params: filters });
        return response.data;
    },

    // ============ PAYMENT METHOD ANALYSIS ============
    getPaymentMethodAnalysis: async (filters = {}) => {
        const response = await api.get("/reports/payment-methods", { params: filters });
        return response.data;
    },

    // ============ CUSTOMER REPORTS ============
    getCustomerPurchaseHistory: async (customerPhone, filters = {}) => {
        const response = await api.get(`/reports/customers/${customerPhone}/history`, { 
            params: filters 
        });
        return response.data;
    },

    // ============ EXPORT REPORTS ============
    exportReport: async (type, filters = {}, format = 'csv') => {
        const params = { format, ...filters };
        
        const response = await api.get(`/reports/export/${type}`, {
            params,
            responseType: 'blob' // Important for file downloads
        });
        
        return {
            data: response.data,
            filename: this.extractFilename(response) || `${type}_report.${format}`
        };
    },

    // ============ BATCH REPORTS (Multiple reports at once) ============
    getBatchReports: async (reportRequests = []) => {
        const response = await api.post("/reports/batch", { reports: reportRequests });
        return response.data;
    },

    // ============ REPORT SCHEDULING ============
    scheduleReport: async (scheduleData) => {
        const response = await api.post("/reports/schedule", scheduleData);
        return response.data;
    },

    getScheduledReports: async () => {
        const response = await api.get("/reports/schedule");
        return response.data;
    },

    cancelScheduledReport: async (scheduleId) => {
        const response = await api.delete(`/reports/schedule/${scheduleId}`);
        return response.data;
    },

    // ============ HELPER METHODS ============
    extractFilename: (response) => {
        const contentDisposition = response.headers['content-disposition'];
        if (contentDisposition) {
            const matches = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(contentDisposition);
            if (matches != null && matches[1]) {
                return matches[1].replace(/['"]/g, '');
            }
        }
        return null;
    },

    // ============ REPORT DOWNLOAD UTILITIES ============
    downloadFile: (blobData, filename) => {
        // Create a blob URL
        const url = window.URL.createObjectURL(new Blob([blobData]));
        
        // Create a temporary link element
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', filename);
        
        // Append to body, click, and remove
        document.body.appendChild(link);
        link.click();
        
        // Clean up
        link.parentNode.removeChild(link);
        window.URL.revokeObjectURL(url);
    },

    downloadCSV: async (type, filters = {}) => {
        const result = await this.exportReport(type, filters, 'csv');
        this.downloadFile(result.data, result.filename);
        return result;
    },

    downloadExcel: async (type, filters = {}) => {
        const result = await this.exportReport(type, filters, 'excel');
        this.downloadFile(result.data, result.filename);
        return result;
    },

    downloadJSON: async (type, filters = {}) => {
        const result = await this.exportReport(type, filters, 'json');
        this.downloadFile(result.data, result.filename);
        return result;
    },

    // ============ REPORT FILTER PRESETS ============
    getFilterPresets: async (reportType) => {
        const response = await api.get(`/reports/filters/${reportType}`);
        return response.data;
    },

    saveFilterPreset: async (reportType, presetData) => {
        const response = await api.post(`/reports/filters/${reportType}`, presetData);
        return response.data;
    },

    deleteFilterPreset: async (reportType, presetId) => {
        const response = await api.delete(`/reports/filters/${reportType}/${presetId}`);
        return response.data;
    },

    // ============ REPORT HISTORY ============
    getReportHistory: async (limit = 20, page = 1) => {
        const response = await api.get("/reports/history", { 
            params: { limit, page } 
        });
        return response.data;
    },

    deleteReportHistory: async (historyId) => {
        const response = await api.delete(`/reports/history/${historyId}`);
        return response.data;
    },

    // ============ CUSTOM REPORT BUILDER ============
    createCustomReport: async (reportConfig) => {
        const response = await api.post("/reports/custom", reportConfig);
        return response.data;
    },

    getCustomReports: async () => {
        const response = await api.get("/reports/custom");
        return response.data;
    },

    updateCustomReport: async (reportId, reportConfig) => {
        const response = await api.put(`/reports/custom/${reportId}`, reportConfig);
        return response.data;
    },

    deleteCustomReport: async (reportId) => {
        const response = await api.delete(`/reports/custom/${reportId}`);
        return response.data;
    },

    // ============ QUICK REPORTS (Commonly used reports) ============
    getTodaySales: async (storeId = null) => {
        const today = new Date().toISOString().split('T')[0];
        return this.getSalesReport({
            startDate: today,
            endDate: today,
            storeId,
            limit: 100
        });
    },

    getThisMonthSales: async (storeId = null) => {
        const now = new Date();
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
            .toISOString().split('T')[0];
        const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)
            .toISOString().split('T')[0];
            
        return this.getSalesReport({
            startDate: firstDay,
            endDate: lastDay,
            storeId,
            limit: 200
        });
    },

    getTopProductsThisMonth: async (limit = 10, storeId = null) => {
        const now = new Date();
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
            .toISOString().split('T')[0];
        const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)
            .toISOString().split('T')[0];
            
        return this.getProductPerformanceReport({
            startDate: firstDay,
            endDate: lastDay,
            storeId,
            limit
        });
    },

    getInventorySnapshot: async (storeId = null) => {
        return this.getInventoryReport({
            storeId,
            sortBy: 'stock',
            sortOrder: 'asc',
            limit: 100
        });
    },

    // ============ REAL-TIME UPDATES ============
    subscribeToLiveUpdates: (reportType, callback) => {
        // This would use WebSockets or Server-Sent Events in a real implementation
        console.log(`Subscribed to ${reportType} updates`);
        // Return unsubscribe function
        return () => console.log(`Unsubscribed from ${reportType} updates`);
    }
};

export default reportsApi;