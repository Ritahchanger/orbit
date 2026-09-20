import AdminEcommerceLayout from "../../layout/Layout";
import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, FileText } from "lucide-react";
import { useOrder, useUpdateOrderStatus } from "../../../admin-pages/hooks/orders.hooks";
import OrderStatusBadge from "../components/OrderStatusBadge";
import PaymentStatusBadge from "../components/PaymentStatusBadge";
import { OrderDetailSkeleton } from "../components/OrdersSkeleton";

const STATUS_OPTIONS = ["pending", "processing", "shipped", "delivered", "cancelled", "refunded"];

const formatCurrency = (amount, currency) => {
  try {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: currency || "KES",
      minimumFractionDigits: 2,
    }).format(amount || 0);
  } catch {
    return `${currency || ""} ${(amount || 0).toLocaleString()}`;
  }
};

const formatDate = (date) => {
  if (!date) return "-";
  return new Date(date).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const InfoCard = ({ title, children }) => (
  <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-sm p-4">
    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">{title}</h3>
    <div className="space-y-1.5 text-sm text-gray-700 dark:text-gray-300">{children}</div>
  </div>
);

const CustomerCard = ({ customer }) => (
  <InfoCard title="Customer">
    <p>{customer?.name || "-"}</p>
    <p className="text-gray-500 dark:text-gray-400">{customer?.email || "-"}</p>
    <p className="text-gray-500 dark:text-gray-400">{customer?.phone || "-"}</p>
  </InfoCard>
);

const ShippingCard = ({ address }) => (
  <InfoCard title="Shipping Address">
    <p>{address?.address || "-"}</p>
    <p>
      {[address?.city, address?.country].filter(Boolean).join(", ") || "-"}
    </p>
    <p className="text-gray-500 dark:text-gray-400">{address?.postalCode || ""}</p>
  </InfoCard>
);

const LineItemsTable = ({ items, currency }) => (
  <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-sm overflow-hidden">
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-900/50">
          <tr>
            {["Item", "SKU", "Unit Price", "Qty", "Subtotal"].map((head) => (
              <th
                key={head}
                className="px-4 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider"
              >
                {head}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
          {(items || []).map((item, index) => (
            <tr key={index}>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                {item.name}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                {item.sku || "-"}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                {formatCurrency(item.price, currency)}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                {item.quantity}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                {formatCurrency(item.subtotal, currency)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const TotalsBreakdown = ({ order }) => (
  <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-sm p-4">
    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Totals</h3>
    <div className="space-y-1.5 text-sm">
      <div className="flex justify-between text-gray-600 dark:text-gray-400">
        <span>Subtotal</span>
        <span>{formatCurrency(order.subtotal, order.currency)}</span>
      </div>
      <div className="flex justify-between text-gray-600 dark:text-gray-400">
        <span>Shipping</span>
        <span>{formatCurrency(order.shippingFee, order.currency)}</span>
      </div>
      <div className="flex justify-between text-gray-600 dark:text-gray-400">
        <span>Tax</span>
        <span>{formatCurrency(order.tax, order.currency)}</span>
      </div>
      {order.discount > 0 && (
        <div className="flex justify-between text-gray-600 dark:text-gray-400">
          <span>Discount</span>
          <span>-{formatCurrency(order.discount, order.currency)}</span>
        </div>
      )}
      <div className="flex justify-between text-base font-semibold text-gray-900 dark:text-white pt-2 border-t border-gray-200 dark:border-gray-700">
        <span>Total</span>
        <span>{formatCurrency(order.total, order.currency)}</span>
      </div>
    </div>
  </div>
);

const PaymentCard = ({ order }) => (
  <InfoCard title="Payment">
    <div className="flex items-center justify-between">
      <span className="text-gray-500 dark:text-gray-400">Method</span>
      <span className="capitalize">{order.paymentMethod || "-"}</span>
    </div>
    <div className="flex items-center justify-between">
      <span className="text-gray-500 dark:text-gray-400">Status</span>
      <PaymentStatusBadge status={order.paymentStatus} />
    </div>
  </InfoCard>
);

const InvoiceCard = ({ invoice }) => {
  if (!invoice) return null;

  return (
    <InfoCard title="Linked Invoice">
      <div className="flex items-center justify-between">
        <span className="text-gray-500 dark:text-gray-400">Number</span>
        <span>{invoice.invoiceNumber}</span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-gray-500 dark:text-gray-400">Status</span>
        <span className="capitalize">{invoice.status}</span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-gray-500 dark:text-gray-400">Total</span>
        <span>{formatCurrency(invoice.total, invoice.currency)}</span>
      </div>
      <Link
        to={`/admin/ecommerce/invoices/${invoice._id}`}
        className="mt-2 inline-flex items-center gap-1.5 text-sm text-blue-600 dark:text-blue-400 hover:underline"
      >
        <FileText size={14} />
        View invoice
      </Link>
    </InfoCard>
  );
};

const StatusUpdateControl = ({ currentStatus, orderId }) => {
  const [selected, setSelected] = useState(currentStatus);
  const updateStatusMutation = useUpdateOrderStatus();

  const handleUpdate = () => {
    if (!selected || selected === currentStatus) return;
    updateStatusMutation.mutate({ id: orderId, status: selected });
  };

  return (
    <InfoCard title="Update Status">
      <div className="flex items-center gap-2">
        <select
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
          disabled={updateStatusMutation.isPending}
          className="flex-1 px-3 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-sm text-gray-900 dark:text-white disabled:opacity-50"
        >
          {STATUS_OPTIONS.map((status) => (
            <option key={status} value={status} className="capitalize">
              {status}
            </option>
          ))}
        </select>
        <button
          onClick={handleUpdate}
          disabled={updateStatusMutation.isPending || selected === currentStatus}
          className="px-4 py-2 text-sm bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600 text-white rounded-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {updateStatusMutation.isPending ? "Updating..." : "Update"}
        </button>
      </div>
    </InfoCard>
  );
};

const OrderDetailErrorState = ({ message, onRetry }) => (
  <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-sm p-4">
    <p className="text-red-600 dark:text-red-400">Error: {message}</p>
    <button
      onClick={onRetry}
      className="mt-2 px-4 py-2 bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-500/30 rounded-sm transition-colors"
    >
      Retry
    </button>
  </div>
);

const OrderNotFound = () => (
  <div className="bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-sm p-8 text-center">
    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Order not found</h3>
    <p className="text-gray-600 dark:text-gray-400">
      This order may have been removed or the link is incorrect.
    </p>
  </div>
);

const AdminEcommerceOrderDetail = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { data, isLoading, isError, error, refetch } = useOrder(orderId);

  const order = data?.data || null;

  return (
    <AdminEcommerceLayout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white p-4 sm:p-6">
        <button
          onClick={() => navigate("/admin/ecommerce/orders")}
          className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4"
        >
          <ArrowLeft size={16} />
          Back to orders
        </button>

        {isLoading && <OrderDetailSkeleton />}

        {!isLoading && isError && (
          <OrderDetailErrorState message={error?.message || "Failed to load order"} onRetry={refetch} />
        )}

        {!isLoading && !isError && !order && <OrderNotFound />}

        {!isLoading && !isError && order && (
          <div className="space-y-4">
            <div className="flex items-start flex-col md:flex-row justify-between md:items-center">
              <div>
                <h1 className="text-2xl sm:text-3xl font-heading font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-500 dark:to-indigo-500 bg-clip-text text-transparent">
                  {order.orderNumber}
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Placed on {formatDate(order.createdAt)}
                </p>
              </div>
              <OrderStatusBadge status={order.status} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <CustomerCard customer={order.customer} />
              <ShippingCard address={order.shippingAddress} />
            </div>

            <LineItemsTable items={order.items} currency={order.currency} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TotalsBreakdown order={order} />
              <div className="space-y-4">
                <PaymentCard order={order} />
                {order.invoice && <InvoiceCard invoice={order.invoice} />}
              </div>
            </div>

            <StatusUpdateControl currentStatus={order.status} orderId={orderId} />
          </div>
        )}
      </div>
    </AdminEcommerceLayout>
  );
};

export default AdminEcommerceOrderDetail;
