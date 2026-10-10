import StatusBadge from "../../../components/common/status/StatusBadge";

const PaymentStatusBadge = ({ status }) => <StatusBadge status={status || "pending"} />;

export default PaymentStatusBadge;
