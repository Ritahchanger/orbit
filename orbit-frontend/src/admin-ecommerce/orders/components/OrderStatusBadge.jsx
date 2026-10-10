import StatusBadge from "../../../components/common/status/StatusBadge";

const OrderStatusBadge = ({ status }) => <StatusBadge status={status || "pending"} />;

export default OrderStatusBadge;
