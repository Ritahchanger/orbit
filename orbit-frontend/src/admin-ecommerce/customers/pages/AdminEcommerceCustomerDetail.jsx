import AdminEcommerceLayout from "../../layout/Layout";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, User, ShoppingBag, Wallet, Calendar } from "lucide-react";
import { useCustomerDetail } from "../../../admin-pages/hooks/orders.hooks";
import OrderStatusBadge from "../../orders/components/OrderStatusBadge";
import PaymentStatusBadge from "../../orders/components/PaymentStatusBadge";
import { CustomerDetailSkeleton } from "../components/CustomersSkeleton";

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
  return new Date(date).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const StatCard = ({ icon: Icon, label, value }) => (
  <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-sm p-4">
    <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-2">
      <Icon size={16} />
      <span className="text-xs uppercase tracking-wide">{label}</span>
    </div>
    <p className="text-lg font-semibold text-gray-900 dark:text-white">{value}</p>
  </div>
);

const CustomerOrdersTable = ({ orders, navigate }) => (
  <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-sm overflow-hidden">
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-900/50">
          <tr>
            {["Order", "Items", "Total", "Payment", "Status", "Created", ""].map((head) => (
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
          {orders.map((order) => (
            <tr key={order._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/40">
              <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                {order.orderNumber}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                {order.items?.length || 0}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                {formatCurrency(order.total, order.currency)}
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                <PaymentStatusBadge status={order.paymentStatus} />
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                <OrderStatusBadge status={order.status} />
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                {formatDate(order.createdAt)}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-right">
                <button
                  onClick={() => navigate(`/admin/ecommerce/orders/${order._id}`)}
                  className="px-3 py-1.5 text-sm bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600 text-white rounded-sm transition-colors"
                >
                  View
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const AdminEcommerceCustomerDetail = () => {
  const { phone } = useParams();
  const navigate = useNavigate();
  const { data, isLoading, isError, error } = useCustomerDetail(phone);
  const detail = data?.data;

  return (
    <AdminEcommerceLayout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white p-4 sm:p-6">
        <Link
          to="/admin/ecommerce/customers"
          className="inline-flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400 hover:underline mb-4"
        >
          <ArrowLeft size={16} />
          Back to customers
        </Link>

        {isLoading && <CustomerDetailSkeleton />}

        {!isLoading && (isError || !detail) && (
          <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-sm p-4">
            <p className="text-red-600 dark:text-red-400">
              {error?.message || "Customer not found"}
            </p>
          </div>
        )}

        {!isLoading && detail && (
          <>
            <div className="mb-4">
              <h1 className="text-2xl sm:text-3xl font-heading font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-500 dark:to-indigo-500 bg-clip-text text-transparent flex items-center gap-2">
                <User size={24} className="text-blue-500" />
                {detail.customer.name || "Unnamed customer"}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {detail.customer.phone}
                {detail.customer.email ? ` · ${detail.customer.email}` : ""}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <StatCard icon={ShoppingBag} label="Total Orders" value={detail.totalOrders} />
              <StatCard
                icon={Wallet}
                label="Total Spent"
                value={formatCurrency(detail.totalSpent, detail.orders?.[0]?.currency)}
              />
              <StatCard icon={Calendar} label="Last Order" value={formatDate(detail.lastOrderAt)} />
            </div>

            <CustomerOrdersTable orders={detail.orders} navigate={navigate} />
          </>
        )}
      </div>
    </AdminEcommerceLayout>
  );
};

export default AdminEcommerceCustomerDetail;
