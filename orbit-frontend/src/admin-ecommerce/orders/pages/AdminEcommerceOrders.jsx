import AdminEcommerceLayout from "../../layout/Layout";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShoppingBag, RefreshCw } from "lucide-react";
import { useOrders } from "../../../admin-pages/hooks/orders.hooks";
import OrderStatusBadge from "../components/OrderStatusBadge";
import PaymentStatusBadge from "../components/PaymentStatusBadge";
import OrdersPagination from "../components/OrdersPagination";
import { OrdersListSkeleton } from "../components/OrdersSkeleton";

const STATUS_TABS = [
  { id: "all", label: "All" },
  { id: "pending", label: "Pending" },
  { id: "processing", label: "Processing" },
  { id: "shipped", label: "Shipped" },
  { id: "delivered", label: "Delivered" },
  { id: "cancelled", label: "Cancelled" },
  { id: "refunded", label: "Refunded" },
];

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

const OrdersHeader = ({ activeStatus, setActiveStatus, onRefresh, isFetching }) => (
  <div className="mb-4">
    <div className="flex items-start flex-col md:flex-row justify-between md:items-center mb-4">
      <div>
        <h1 className="text-2xl sm:text-3xl font-heading font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-500 dark:to-indigo-500 bg-clip-text text-transparent">
          Orders
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          View and manage orders placed through your storefront
        </p>
      </div>
      <button
        onClick={onRefresh}
        disabled={isFetching}
        className="flex items-center gap-2 mt-2 md:mt-0 px-4 py-2 bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 text-gray-800 dark:text-white rounded-sm disabled:opacity-50 disabled:cursor-not-allowed text-sm"
      >
        <RefreshCw size={16} className={isFetching ? "animate-spin" : ""} />
        <span>Refresh</span>
      </button>
    </div>

    <div className="flex flex-wrap gap-2">
      {STATUS_TABS.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveStatus(tab.id)}
          className={`px-3 py-1.5 text-sm rounded-sm border transition-colors ${
            activeStatus === tab.id
              ? "bg-blue-600 dark:bg-blue-500 text-white border-blue-600 dark:border-blue-500"
              : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  </div>
);

const OrdersEmptyState = () => (
  <div className="bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-sm p-8 text-center">
    <ShoppingBag className="w-12 h-12 mx-auto text-gray-400 dark:text-gray-500 mb-4" />
    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No orders yet</h3>
    <p className="text-gray-600 dark:text-gray-400">
      Orders placed through your storefront will show up here.
    </p>
  </div>
);

const OrdersErrorState = ({ message, onRetry }) => (
  <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-sm p-4 mb-4">
    <p className="text-red-600 dark:text-red-400">Error: {message}</p>
    <button
      onClick={onRetry}
      className="mt-2 px-4 py-2 bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-500/30 rounded-sm transition-colors"
    >
      Retry
    </button>
  </div>
);

const OrdersTable = ({ orders, navigate }) => (
  <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-sm overflow-hidden">
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-900/50">
          <tr>
            {["Order", "Customer", "Items", "Total", "Payment", "Status", "Created", ""].map((head) => (
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
                {order.customer?.name || "-"}
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

const AdminEcommerceOrders = () => {
  const navigate = useNavigate();
  const [activeStatus, setActiveStatus] = useState("all");
  const [page, setPage] = useState(1);
  const limit = 10;

  const filters =
    activeStatus === "all" ? { page, limit } : { status: activeStatus, page, limit };

  const { data, isLoading, isFetching, isError, error, refetch } = useOrders(filters);

  const orders = data?.data || [];
  const pagination = data?.pagination || { page, limit, total: 0, pages: 1 };

  const handleStatusChange = (statusId) => {
    setActiveStatus(statusId);
    setPage(1);
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  return (
    <AdminEcommerceLayout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white p-4 sm:p-6">
        <OrdersHeader
          activeStatus={activeStatus}
          setActiveStatus={handleStatusChange}
          onRefresh={refetch}
          isFetching={isFetching}
        />

        {isLoading && <OrdersListSkeleton />}

        {!isLoading && isError && (
          <OrdersErrorState message={error?.message || "Failed to load orders"} onRetry={refetch} />
        )}

        {!isLoading && !isError && orders.length === 0 && <OrdersEmptyState />}

        {!isLoading && !isError && orders.length > 0 && (
          <>
            <OrdersTable orders={orders} navigate={navigate} />
            <OrdersPagination pagination={pagination} onPageChange={handlePageChange} />
          </>
        )}
      </div>
    </AdminEcommerceLayout>
  );
};

export default AdminEcommerceOrders;
