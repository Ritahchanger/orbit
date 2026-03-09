/**
 * Utility functions for CSV export
 */

// Helper to format opening hours for CSV
export const formatOpeningHoursForCSV = (openingHours) => {
    if (!openingHours) return 'N/A';

    const days = [
        { key: 'monday', label: 'Mon' },
        { key: 'tuesday', label: 'Tue' },
        { key: 'wednesday', label: 'Wed' },
        { key: 'thursday', label: 'Thu' },
        { key: 'friday', label: 'Fri' },
        { key: 'saturday', label: 'Sat' },
        { key: 'sunday', label: 'Sun' }
    ];

    const formatted = days.map(({ key, label }) => {
        const hours = openingHours[key];
        if (!hours || hours.open === 'Closed') return `${label}: Closed`;
        return `${label}: ${hours.open}-${hours.close}`;
    });

    return formatted.join(' | ');
};

// Helper to prepare store data for CSV
export const prepareStoresForCSV = (stores, currentStoreId) => {
    return stores.map(store => {
        const address = store.address || {};
        return {
            'Store ID': store._id,
            'Store Name': store.name,
            'Store Code': store.code,
            'Status': store.status.toUpperCase(),
            'Street': address.street || 'N/A',
            'City': address.city || 'N/A',
            'State': address.state || 'N/A',
            'Country': address.country || 'N/A',
            'Phone': store.phone || 'N/A',
            'Email': store.email || 'N/A',
            'Manager Name': store.manager?.name || 'No Manager',
            'Manager Email': store.manager?.email || 'N/A',
            'Opening Hours': formatOpeningHoursForCSV(store.openingHours),
            'Created Date': new Date(store.createdAt).toLocaleDateString(),
            'Created Time': new Date(store.createdAt).toLocaleTimeString(),
            'Total Revenue': `$${store.totalRevenue || 0}`,
            'Total Orders': store.totalOrders || 0,
            'Current Store': store._id === currentStoreId ? 'YES' : 'NO'
        };
    });
};

// Main function to export CSV
export const exportToCSV = (data, filename = 'export') => {
    if (!data || data.length === 0) {
        throw new Error('No data to export');
    }

    // Create CSV headers
    const headers = Object.keys(data[0]);

    // Create CSV rows
    const csvRows = [];

    // Add headers row
    csvRows.push(headers.join(','));

    // Add data rows
    data.forEach(row => {
        const values = headers.map(header => {
            const value = row[header];
            // Escape quotes and wrap in quotes if contains comma, quote, or newline
            const stringValue = String(value);
            const escaped = stringValue.replace(/"/g, '""');
            if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
                return `"${escaped}"`;
            }
            return escaped;
        });
        csvRows.push(values.join(','));
    });

    // Create CSV content
    const csvContent = csvRows.join('\n');

    // Create timestamp for filename
    const timestamp = new Date().toISOString().split('T')[0];

    // Create and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${filename}_${timestamp}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};