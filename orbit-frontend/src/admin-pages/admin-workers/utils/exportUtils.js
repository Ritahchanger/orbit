import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Export to CSV
export const exportToCSV = (users, filename = 'users.csv') => {
    if (!users || !Array.isArray(users) || users.length === 0) {
        toast.error('No users to export');
        return;
    }

    try {
        const headers = [
            'Name',
            'Email',
            'Role',
            'Phone',
            'Company',
            'Store Access',
            'Permissions',
            'Newsletter',
            'Joined Date',
            'Last Updated'
        ];

        const rows = users.map(user => [
            `${user.firstName || ''} ${user.lastName || ''}`,
            user.email || '',
            user.role || '',
            user.phoneNo || '',
            user.company || '',
            user.assignedStore ? 'Yes' : 'No',
            getStorePermissionsText(user),
            user.newsletter ? 'Subscribed' : 'Not Subscribed',
            formatExportDate(user.createdAt),
            formatExportDate(user.updatedAt)
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);

        link.href = url;
        link.download = filename;
        link.style.visibility = 'hidden';

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        return true;
    } catch (error) {
        console.error('Error exporting to CSV:', error);
        return false;
    }
};

// Export to PDF
export const exportToPDF = (users, filename = 'users.pdf') => {
    if (!users || !Array.isArray(users) || users.length === 0) {
        toast.error('No users to export');
        return;
    }

    try {
        const doc = new jsPDF();

        doc.setFontSize(16);
        doc.text('Users Report', 14, 15);

        doc.setFontSize(10);
        doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 25);
        doc.text(`Total Users: ${users.length}`, 14, 35);

        const tableData = users.map(user => [
            `${user.firstName || ''} ${user.lastName || ''}`,
            user.email || '',
            user.role || '',
            user.phoneNo || '',
            user.company || '',
            user.assignedStore ? 'Yes' : 'No',
            getStorePermissionsText(user),
            user.newsletter ? '✓' : '✗'
        ]);

        const headers = [
            ['Name', 'Email', 'Role', 'Phone', 'Company', 'Store Access', 'Permissions', 'Newsletter']
        ];

        autoTable(doc, {
            startY: 45,
            head: headers,
            body: tableData,
            theme: 'striped',
            headStyles: { fillColor: [59, 130, 246] },
            styles: { fontSize: 8, cellPadding: 2 },
            columnStyles: {
                0: { cellWidth: 30 },
                1: { cellWidth: 40 },
                2: { cellWidth: 20 },
                3: { cellWidth: 25 },
                4: { cellWidth: 25 },
                5: { cellWidth: 20 },
                6: { cellWidth: 30 },
                7: { cellWidth: 15 }
            },
            margin: { top: 45 }
        });

        doc.save(filename);
        return true;
    } catch (error) {
        console.error('Error exporting to PDF:', error);
        return false;
    }
};

// Helpers
const getStorePermissionsText = (user) => {
    if (!user?.storePermissions?.length) return 'No permissions';

    const permissions = user.storePermissions[0];
    if (!permissions) return 'View only';

    const list = [];
    if (permissions.canView) list.push('View');
    if (permissions.canEdit) list.push('Edit');
    if (permissions.canSell) list.push('Sell');
    if (permissions.canManage) list.push('Manage');

    return list.join(', ') || 'View only';
};

const formatExportDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return isNaN(date.getTime())
        ? 'Invalid date'
        : date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
};

// Export to Excel (CSV-based)
export const exportToExcel = (users, filename = 'users.xlsx') =>
    exportToCSV(users, filename.replace('.xlsx', '.csv'));

export const exportCurrentView = (users, format = 'csv') => {
    const date = new Date().toISOString().split('T')[0];

    switch (format.toLowerCase()) {
        case 'pdf':
            return exportToPDF(users, `users-${date}.pdf`);
        case 'excel':
            return exportToExcel(users, `users-${date}.xlsx`);
        default:
            return exportToCSV(users, `users-${date}.csv`);
    }
};

export const exportAllUsers = async (fetchAllUsers, format = 'csv') => {
    try {
        const allUsers = await fetchAllUsers();
        if (!allUsers?.length) {
            toast.error('No users to export');
            return false;
        }

        const date = new Date().toISOString().split('T')[0];

        switch (format.toLowerCase()) {
            case 'pdf':
                return exportToPDF(allUsers, `all-users-${date}.pdf`);
            case 'excel':
                return exportToExcel(allUsers, `all-users-${date}.xlsx`);
            default:
                return exportToCSV(allUsers, `all-users-${date}.csv`);
        }
    } catch (error) {
        console.error('Error exporting all users:', error);
        toast.error('Failed to export all users');
        return false;
    }
};
