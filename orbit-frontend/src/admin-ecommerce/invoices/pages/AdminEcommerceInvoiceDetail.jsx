import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, FileText, Trash2 } from "lucide-react";
import AdminEcommerceLayout from "../../layout/Layout";
import InvoiceStatusBadge from "../components/InvoiceStatusBadge";
import InvoiceTypeBadge from "../components/InvoiceTypeBadge";
import { InvoiceDetailSkeleton } from "../components/InvoiceSkeletons";
import {
    useInvoice,
    useUpdateInvoiceStatus,
    useDeleteInvoice,
} from "../../../admin-pages/hooks/invoices.hooks";

const STATUS_OPTIONS = ["draft", "issued", "paid", "overdue", "cancelled", "void"];

const formatCurrency = (amount, currency = "KES") => {
    try {
        return new Intl.NumberFormat("en-KE", {
            style: "currency",
            currency: currency || "KES",
            minimumFractionDigits: 0,
            maximumFractionDigits: 2,
        }).format(amount || 0);
    } catch {
        return `${currency || "KES"} ${(amount || 0).toLocaleString()}`;
    }
};

const formatDate = (date) => {
    if (!date) return "—";
    return new Date(date).toLocaleDateString("en-KE", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
};

const AdminEcommerceInvoiceDetail = () => {
    const { invoiceId } = useParams();
    const navigate = useNavigate();
    const { data, isLoading, isError } = useInvoice(invoiceId);
    const updateInvoiceStatus = useUpdateInvoiceStatus();
    const deleteInvoice = useDeleteInvoice();

    const invoice = data?.data;
    const [statusValue, setStatusValue] = useState("");

    useEffect(() => {
        if (invoice?.status) {
            setStatusValue(invoice.status);
        }
    }, [invoice?.status]);

    const handleUpdateStatus = () => {
        if (!invoice || !statusValue || statusValue === invoice.status) return;
        updateInvoiceStatus.mutate({ id: invoice._id, status: statusValue });
    };

    const handleDelete = () => {
        if (!invoice) return;
        if (!window.confirm("Delete this invoice? This action cannot be undone.")) return;

        deleteInvoice.mutate(invoice._id, {
            onSuccess: () => navigate("/admin/ecommerce/invoices"),
        });
    };

    return (
        <AdminEcommerceLayout>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white p-4 sm:p-6">
                <Link
                    to="/admin/ecommerce/invoices"
                    className="inline-flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4 transition-colors"
                >
                    <ArrowLeft size={15} />
                    Back to Invoices
                </Link>

                {isLoading && <InvoiceDetailSkeleton />}

                {!isLoading && isError && (
                    <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-sm p-8 text-center">
                        <FileText className="w-10 h-10 mx-auto text-red-400 mb-3" />
                        <h3 className="text-lg font-semibold text-red-600 dark:text-red-400">
                            Invoice not found
                        </h3>
                    </div>
                )}

                {!isLoading && !isError && invoice && (
                    <div className="space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {invoice.invoiceNumber}
                                    </h1>
                                    <InvoiceTypeBadge type={invoice.type} />
                                    <InvoiceStatusBadge status={invoice.status} />
                                    {invoice.isOverdue && (
                                        <span className="text-xs font-medium text-red-600 dark:text-red-400">
                                            Overdue
                                        </span>
                                    )}
                                </div>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                    Issued {formatDate(invoice.issueDate)} &middot; Due {formatDate(invoice.dueDate)}
                                    {invoice.paidAt ? ` · Paid ${formatDate(invoice.paidAt)}` : ""}
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                            <div className="lg:col-span-2 space-y-4">
                                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-sm p-4">
                                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                                        Customer
                                    </h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                                        <div>
                                            <p className="text-gray-500 dark:text-gray-400 text-xs">Name</p>
                                            <p className="text-gray-900 dark:text-white">{invoice.customer?.name || "—"}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500 dark:text-gray-400 text-xs">Email</p>
                                            <p className="text-gray-900 dark:text-white">{invoice.customer?.email || "—"}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500 dark:text-gray-400 text-xs">Phone</p>
                                            <p className="text-gray-900 dark:text-white">{invoice.customer?.phone || "—"}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500 dark:text-gray-400 text-xs">Address</p>
                                            <p className="text-gray-900 dark:text-white">{invoice.customer?.address || "—"}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-sm overflow-hidden">
                                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white p-4 pb-0">
                                        Line Items
                                    </h3>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm mt-3">
                                            <thead>
                                                <tr className="border-b border-gray-200 dark:border-gray-700">
                                                    {["Description", "Qty", "Unit Price", "Amount"].map((h) => (
                                                        <th
                                                            key={h}
                                                            className="text-left py-2.5 px-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide"
                                                        >
                                                            {h}
                                                        </th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {(invoice.items || []).map((item, i) => (
                                                    <tr key={i} className="border-b border-gray-100 dark:border-gray-700/50">
                                                        <td className="py-2.5 px-4 text-gray-900 dark:text-white">{item.description}</td>
                                                        <td className="py-2.5 px-4 text-gray-700 dark:text-gray-300">{item.quantity}</td>
                                                        <td className="py-2.5 px-4 text-gray-700 dark:text-gray-300">
                                                            {formatCurrency(item.unitPrice, invoice.currency)}
                                                        </td>
                                                        <td className="py-2.5 px-4 font-medium text-gray-900 dark:text-white">
                                                            {formatCurrency(item.amount, invoice.currency)}
                                                        </td>
                                                    </tr>
                                                ))}
                                                {(!invoice.items || invoice.items.length === 0) && (
                                                    <tr>
                                                        <td colSpan={4} className="py-4 px-4 text-center text-gray-400 dark:text-gray-500">
                                                            No line items
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {invoice.notes && (
                                    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-sm p-4">
                                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Notes</h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
                                            {invoice.notes}
                                        </p>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-4">
                                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-sm p-4">
                                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Totals</h3>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex items-center justify-between">
                                            <span className="text-gray-500 dark:text-gray-400">Subtotal</span>
                                            <span className="text-gray-900 dark:text-white">
                                                {formatCurrency(invoice.subtotal, invoice.currency)}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-gray-500 dark:text-gray-400">Tax</span>
                                            <span className="text-gray-900 dark:text-white">
                                                {formatCurrency(invoice.tax, invoice.currency)}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-gray-500 dark:text-gray-400">Discount</span>
                                            <span className="text-gray-900 dark:text-white">
                                                -{formatCurrency(invoice.discount, invoice.currency)}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-gray-500 dark:text-gray-400">Shipping</span>
                                            <span className="text-gray-900 dark:text-white">
                                                {formatCurrency(invoice.shippingFee, invoice.currency)}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
                                            <span className="font-semibold text-gray-900 dark:text-white">Total</span>
                                            <span className="font-semibold text-gray-900 dark:text-white">
                                                {formatCurrency(invoice.total, invoice.currency)}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-sm p-4">
                                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Update Status</h3>
                                    <div className="flex items-center gap-2">
                                        <select
                                            value={statusValue}
                                            onChange={(e) => setStatusValue(e.target.value)}
                                            className="flex-1 px-3 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 capitalize"
                                        >
                                            {STATUS_OPTIONS.map((status) => (
                                                <option key={status} value={status} className="capitalize">
                                                    {status}
                                                </option>
                                            ))}
                                        </select>
                                        <button
                                            onClick={handleUpdateStatus}
                                            disabled={updateInvoiceStatus.isPending || statusValue === invoice.status}
                                            className="px-4 py-2 text-sm bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600 text-white rounded-sm disabled:opacity-50 transition-colors"
                                        >
                                            Update
                                        </button>
                                    </div>
                                </div>

                                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-sm p-4">
                                    <button
                                        onClick={handleDelete}
                                        disabled={deleteInvoice.isPending}
                                        className="flex items-center justify-center gap-2 w-full px-4 py-2 text-sm bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 text-red-600 dark:text-red-400 rounded-sm disabled:opacity-50 transition-colors"
                                    >
                                        <Trash2 size={15} />
                                        {deleteInvoice.isPending ? "Deleting…" : "Delete Invoice"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AdminEcommerceLayout>
    );
};

export default AdminEcommerceInvoiceDetail;
