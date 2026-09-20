import AdminEcommerceLayout from "../../layout/Layout";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Users, RefreshCw, Search } from "lucide-react";
import { useCustomers } from "../../../admin-pages/hooks/orders.hooks";
import OrdersPagination from "../../orders/components/OrdersPagination";
import { CustomersListSkeleton } from "../components/CustomersSkeleton";
import { useDebounce } from "../../../globals/hooks/useDebounce";

const formatCurrency = (amount) => {
  try {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
      minimumFractionDigits: 2,
    }).format(amount || 0);
  } catch {
    return (amount || 0).toLocaleString();
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

const CustomersHeader = ({ search, setSearch, onRefresh, isFetching }) => (
  <div className="mb-4">
    <div className="flex items-start flex-col md:flex-row justify-between md:items-center mb-4">
      <div>
        <h1 className="text-2xl sm:text-3xl font-heading font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-500 dark:to-indigo-500 bg-clip-text text-transparent">
          Customers
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Everyone who has ordered through your storefront
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

    <div className="relative max-w-sm">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search by name, phone, or email..."
        className="w-full pl-9 pr-3 py-2 rounded-sm border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
      />
    </div>
  </div>
);

const CustomersEmptyState = () => (
  <div className="bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-sm p-8 text-center">
    <Users className="w-12 h-12 mx-auto text-gray-400 dark:text-gray-500 mb-4" />
    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No customers yet</h3>
    <p className="text-gray-600 dark:text-gray-400">
      Customers appear here once they've placed at least one order.
    </p>
  </div>
);

const CustomersErrorState = ({ message, onRetry }) => (
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

const CustomersTable = ({ customers, navigate }) => (
  <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-sm overflow-hidden">
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-900/50">
          <tr>
            {["Name", "Phone", "Email", "Orders", "Total Spent", "Last Order", ""].map((head) => (
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
          {customers.map((customer) => (
            <tr key={customer.phone} className="hover:bg-gray-50 dark:hover:bg-gray-700/40">
              <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                {customer.name || "-"}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                {customer.phone || "-"}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                {customer.email || "-"}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                {customer.totalOrders}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                {formatCurrency(customer.totalSpent)}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                {formatDate(customer.lastOrderAt)}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-right">
                <button
                  onClick={() =>
                    navigate(`/admin/ecommerce/customers/${encodeURIComponent(customer.phone)}`)
                  }
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

const AdminEcommerceCustomers = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const limit = 10;
  const debouncedSearch = useDebounce(search, 400);

  const filters = debouncedSearch.trim()
    ? { search: debouncedSearch.trim(), page, limit }
    : { page, limit };

  const { data, isLoading, isFetching, isError, error, refetch } = useCustomers(filters);

  const customers = data?.data || [];
  const pagination = data?.pagination || { page, limit, total: 0, pages: 1 };

  const handleSearchChange = (value) => {
    setSearch(value);
    setPage(1);
  };

  return (
    <AdminEcommerceLayout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white p-4 sm:p-6">
        <CustomersHeader
          search={search}
          setSearch={handleSearchChange}
          onRefresh={refetch}
          isFetching={isFetching}
        />

        {isLoading && <CustomersListSkeleton />}

        {!isLoading && isError && (
          <CustomersErrorState message={error?.message || "Failed to load customers"} onRetry={refetch} />
        )}

        {!isLoading && !isError && customers.length === 0 && <CustomersEmptyState />}

        {!isLoading && !isError && customers.length > 0 && (
          <>
            <CustomersTable customers={customers} navigate={navigate} />
            <OrdersPagination pagination={pagination} onPageChange={setPage} itemLabel="customer" />
          </>
        )}
      </div>
    </AdminEcommerceLayout>
  );
};

export default AdminEcommerceCustomers;
