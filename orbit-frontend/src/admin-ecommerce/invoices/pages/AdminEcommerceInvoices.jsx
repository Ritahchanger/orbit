import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FileText, Plus, Zap, X } from "lucide-react";
import AdminEcommerceLayout from "../../layout/Layout";
import InvoiceStatusBadge from "../components/InvoiceStatusBadge";
import InvoiceTypeBadge from "../components/InvoiceTypeBadge";
import InvoicesPagination from "../components/InvoicesPagination";
import { InvoiceListSkeleton } from "../components/InvoiceSkeletons";
import LineItemsEditor from "../components/LineItemsEditor";
import {
    useInvoices,
    useCreateStandaloneInvoice,
    useCreateInvoiceFromSale,
} from "../../../admin-pages/hooks/invoices.hooks";

const TYPE_OPTIONS = [
    { value: "all", label: "All Types" },
    { value: "order", label: "Order" },
    { value: "sale", label: "Sale" },
    { value: "standalone", label: "Standalone" },
];

const STATUS_OPTIONS = [
    { value: "all", label: "All Statuses" },
    { value: "draft", label: "Draft" },
    { value: "issued", label: "Issued" },
    { value: "paid", label: "Paid" },
    { value: "overdue", label: "Overdue" },
    { value: "cancelled", label: "Cancelled" },
    { value: "void", label: "Void" },
];

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

const ModalShell = ({ title, onClose, children, maxWidth = "max-w-lg" }) => (
    <div className="fixed inset-0 z-[100]">
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
        <div className="absolute inset-0 flex items-center justify-center p-4">
            <div className={`bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-sm w-full ${maxWidth} max-h-[90vh] overflow-y-auto shadow-2xl`}>
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h2>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-1.5 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-sm transition-colors"
                        aria-label="Close"
                    >
                        <X size={18} />
                    </button>
                </div>
                <div className="p-5">{children}</div>
            </div>
        </div>
    </div>
);

const initialStandaloneForm = () => ({
    customer: { name: "", email: "", phone: "", address: "" },
    items: [{ description: "", quantity: 1, unitPrice: 0 }],
    tax: 0,
    discount: 0,
    shippingFee: 0,
    currency: "KES",
    dueDate: "",
    notes: "",
});

const StandaloneInvoiceModal = ({ onClose }) => {
    const [form, setForm] = useState(initialStandaloneForm());
    const createStandaloneInvoice = useCreateStandaloneInvoice();

    const itemsTotal = form.items.reduce(
        (sum, item) => sum + (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0),
        0
    );
    const computedTotal =
        itemsTotal + (Number(form.tax) || 0) + (Number(form.shippingFee) || 0) - (Number(form.discount) || 0);

    const updateCustomerField = (field, value) => {
        setForm((prev) => ({ ...prev, customer: { ...prev.customer, [field]: value } }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!form.customer.name.trim()) return;

        const payload = {
            customer: {
                name: form.customer.name.trim(),
                email: form.customer.email.trim() || undefined,
                phone: form.customer.phone.trim() || undefined,
                address: form.customer.address.trim() || undefined,
            },
            items: form.items
                .filter((item) => item.description.trim())
                .map((item) => ({
                    description: item.description.trim(),
                    quantity: Number(item.quantity) || 0,
                    unitPrice: Number(item.unitPrice) || 0,
                })),
            tax: Number(form.tax) || 0,
            discount: Number(form.discount) || 0,
            shippingFee: Number(form.shippingFee) || 0,
            currency: form.currency.trim() || "KES",
            dueDate: form.dueDate || undefined,
            notes: form.notes.trim() || undefined,
        };

        createStandaloneInvoice.mutate(payload, {
            onSuccess: () => onClose(),
        });
    };

    return (
        <ModalShell title="New Standalone Invoice" onClose={onClose} maxWidth="max-w-2xl">
            <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Customer</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <input
                            type="text"
                            required
                            placeholder="Customer name *"
                            value={form.customer.name}
                            onChange={(e) => updateCustomerField("name", e.target.value)}
                            className="px-3 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <input
                            type="email"
                            placeholder="Email"
                            value={form.customer.email}
                            onChange={(e) => updateCustomerField("email", e.target.value)}
                            className="px-3 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <input
                            type="text"
                            placeholder="Phone"
                            value={form.customer.phone}
                            onChange={(e) => updateCustomerField("phone", e.target.value)}
                            className="px-3 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <input
                            type="text"
                            placeholder="Address"
                            value={form.customer.address}
                            onChange={(e) => updateCustomerField("address", e.target.value)}
                            className="px-3 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>

                <div>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Line Items</h3>
                    <LineItemsEditor
                        items={form.items}
                        onChange={(items) => setForm((prev) => ({ ...prev, items }))}
                        currency={form.currency || "KES"}
                    />
                </div>

                <div>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Charges</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div>
                            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Tax</label>
                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={form.tax}
                                onChange={(e) => setForm((prev) => ({ ...prev, tax: e.target.value }))}
                                className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Discount</label>
                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={form.discount}
                                onChange={(e) => setForm((prev) => ({ ...prev, discount: e.target.value }))}
                                className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Shipping</label>
                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={form.shippingFee}
                                onChange={(e) => setForm((prev) => ({ ...prev, shippingFee: e.target.value }))}
                                className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Currency</label>
                            <input
                                type="text"
                                value={form.currency}
                                onChange={(e) => setForm((prev) => ({ ...prev, currency: e.target.value }))}
                                className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                        <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Due Date</label>
                        <input
                            type="date"
                            value={form.dueDate}
                            onChange={(e) => setForm((prev) => ({ ...prev, dueDate: e.target.value }))}
                            className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Notes</label>
                    <textarea
                        rows={3}
                        value={form.notes}
                        onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
                        className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                        Computed total:{" "}
                        <span className="font-semibold text-gray-900 dark:text-white">
                            {formatCurrency(computedTotal, form.currency)}
                        </span>
                    </p>
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-sm transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={createStandaloneInvoice.isPending}
                            className="px-4 py-2 text-sm bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600 text-white rounded-sm disabled:opacity-50 transition-colors"
                        >
                            {createStandaloneInvoice.isPending ? "Creating…" : "Create Invoice"}
                        </button>
                    </div>
                </div>
            </form>
        </ModalShell>
    );
};

const GenerateFromSaleModal = ({ onClose }) => {
    const [transactionId, setTransactionId] = useState("");
    const createInvoiceFromSale = useCreateInvoiceFromSale();

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!transactionId.trim()) return;

        createInvoiceFromSale.mutate(transactionId.trim(), {
            onSuccess: () => onClose(),
        });
    };

    return (
        <ModalShell title="Generate Invoice from Sale" onClose={onClose}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                        Transaction ID
                    </label>
                    <input
                        type="text"
                        required
                        autoFocus
                        placeholder="Paste POS transaction id"
                        value={transactionId}
                        onChange={(e) => setTransactionId(e.target.value)}
                        className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <div className="flex items-center justify-end gap-2">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-sm transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={createInvoiceFromSale.isPending}
                        className="px-4 py-2 text-sm bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600 text-white rounded-sm disabled:opacity-50 transition-colors"
                    >
                        {createInvoiceFromSale.isPending ? "Generating…" : "Generate"}
                    </button>
                </div>
            </form>
        </ModalShell>
    );
};

const AdminEcommerceInvoices = () => {
    const navigate = useNavigate();
    const [typeFilter, setTypeFilter] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all");
    const [page, setPage] = useState(1);
    const [limit] = useState(20);
    const [showStandaloneModal, setShowStandaloneModal] = useState(false);
    const [showFromSaleModal, setShowFromSaleModal] = useState(false);

    const { data, isLoading, isError, refetch } = useInvoices({
        status: statusFilter !== "all" ? statusFilter : undefined,
        type: typeFilter !== "all" ? typeFilter : undefined,
        page,
        limit,
    });

    const invoices = data?.data || [];
    const pagination = data?.pagination;

    const handlePageChange = (newPage) => {
        if (newPage < 1) return;
        setPage(newPage);
    };

    return (
        <AdminEcommerceLayout>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white p-4 sm:p-6">
                <div className="flex items-start flex-col md:flex-row justify-between md:items-center mb-4 gap-3">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-heading font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-500 dark:to-indigo-500 bg-clip-text text-transparent">
                            Invoices
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">
                            Orders, POS sales, and standalone / B2B bills for this business
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setShowFromSaleModal(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 text-gray-800 dark:text-white rounded-sm text-sm transition-colors"
                        >
                            <Zap size={16} />
                            Generate from Sale
                        </button>
                        <button
                            onClick={() => setShowStandaloneModal(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600 text-white rounded-sm text-sm transition-colors"
                        >
                            <Plus size={16} />
                            New Standalone Invoice
                        </button>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 mb-4">
                    <select
                        value={typeFilter}
                        onChange={(e) => {
                            setTypeFilter(e.target.value);
                            setPage(1);
                        }}
                        className="px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        {TYPE_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                    <select
                        value={statusFilter}
                        onChange={(e) => {
                            setStatusFilter(e.target.value);
                            setPage(1);
                        }}
                        className="px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        {STATUS_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                </div>

                {isLoading && <InvoiceListSkeleton />}

                {!isLoading && isError && (
                    <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-sm p-4">
                        <p className="text-red-600 dark:text-red-400">Failed to load invoices.</p>
                        <button
                            onClick={() => refetch()}
                            className="mt-2 px-4 py-2 bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-500/30 rounded-sm transition-colors"
                        >
                            Retry
                        </button>
                    </div>
                )}

                {!isLoading && !isError && invoices.length === 0 && (
                    <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-sm p-8 text-center">
                        <FileText className="w-12 h-12 mx-auto text-gray-400 dark:text-gray-500 mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                            No Invoices Found
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400">
                            No invoices match the selected filters.
                        </p>
                    </div>
                )}

                {!isLoading && !isError && invoices.length > 0 && (
                    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-gray-200 dark:border-gray-700">
                                        {["Invoice #", "Type", "Customer", "Total", "Status", "Due Date", ""].map((h) => (
                                            <th
                                                key={h}
                                                className="text-left py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide"
                                            >
                                                {h}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {invoices.map((invoice) => (
                                        <tr
                                            key={invoice._id}
                                            className="border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
                                        >
                                            <td className="py-3 px-4 font-medium text-gray-900 dark:text-white whitespace-nowrap">
                                                {invoice.invoiceNumber}
                                            </td>
                                            <td className="py-3 px-4">
                                                <InvoiceTypeBadge type={invoice.type} />
                                            </td>
                                            <td className="py-3 px-4 text-gray-700 dark:text-gray-300">
                                                {invoice.customer?.name || "—"}
                                            </td>
                                            <td className="py-3 px-4 font-medium text-gray-900 dark:text-white whitespace-nowrap">
                                                {formatCurrency(invoice.total, invoice.currency)}
                                            </td>
                                            <td className="py-3 px-4">
                                                <InvoiceStatusBadge status={invoice.status} />
                                            </td>
                                            <td className="py-3 px-4 text-gray-500 dark:text-gray-400 whitespace-nowrap">
                                                {formatDate(invoice.dueDate)}
                                            </td>
                                            <td className="py-3 px-4 text-right">
                                                <button
                                                    onClick={() => navigate(`/admin/ecommerce/invoices/${invoice._id}`)}
                                                    className="px-3 py-1.5 text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-sm transition-colors"
                                                >
                                                    View
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <InvoicesPagination pagination={pagination} onPageChange={handlePageChange} />
                    </div>
                )}
            </div>

            {showStandaloneModal && (
                <StandaloneInvoiceModal onClose={() => setShowStandaloneModal(false)} />
            )}
            {showFromSaleModal && (
                <GenerateFromSaleModal onClose={() => setShowFromSaleModal(false)} />
            )}
        </AdminEcommerceLayout>
    );
};

export default AdminEcommerceInvoices;
