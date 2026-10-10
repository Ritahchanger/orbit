import StatusBadge from "../../../components/common/status/StatusBadge";

const InvoiceStatusBadge = ({ status }) => <StatusBadge status={status || "draft"} />;

export default InvoiceStatusBadge;
