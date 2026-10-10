import StatCard from "../../components/ui/StatCard";

const StoreStatsCard = ({ title, value, icon, color, description, trend }) => (
  <StatCard
    title={title}
    value={value}
    icon={icon}
    color={color}
    hint={description}
    badge={trend}
  />
);

export default StoreStatsCard;
