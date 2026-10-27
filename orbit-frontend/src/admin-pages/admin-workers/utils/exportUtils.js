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

const escapeHtml = (value) =>
    String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');

// Prints a users report from a separate window, so the app page is left as it is.
export const printUsers = (users) => {
    const win = window.open('', '_blank', 'width=1000,height=700');
    if (!win) return false; // blocked by a pop-up blocker

    const rows = users
        .map((user) => {
            const name = [user.firstName, user.lastName].filter(Boolean).join(' ') || user.name || '';
            return `<tr>
                <td>${escapeHtml(name)}</td>
                <td>${escapeHtml(user.email)}</td>
                <td>${escapeHtml(user.role)}</td>
                <td>${escapeHtml(user.phoneNo || user.phone || '')}</td>
                <td>${escapeHtml(user.assignedStore?.name || '')}</td>
                <td>${user.isSuspended ? 'Suspended' : 'Active'}</td>
            </tr>`;
        })
        .join('');

    win.document.write(`<!DOCTYPE html>
<html>
<head>
    <title>Users Report - ${new Date().toLocaleDateString()}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 24px; color: #111; }
        h1 { margin: 0 0 4px; font-size: 20px; }
        p { margin: 0 0 16px; color: #555; font-size: 12px; }
        table { width: 100%; border-collapse: collapse; font-size: 12px; }
        th, td { border: 1px solid #ddd; padding: 6px 8px; text-align: left; }
        th { background: #f3f4f6; }
        tr:nth-child(even) td { background: #fafafa; }
        @page { size: landscape; margin: 0.5in; }
    </style>
</head>
<body>
    <h1>Users Report</h1>
    <p>Generated ${new Date().toLocaleString()} &middot; ${users.length} users</p>
    <table>
        <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Phone</th><th>Store</th><th>Status</th></tr></thead>
        <tbody>${rows}</tbody>
    </table>
</body>
</html>`);
    win.document.close();
    win.focus();
    win.print();
    return true;
};
