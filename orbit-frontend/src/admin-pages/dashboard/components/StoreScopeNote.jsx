import { Info } from "lucide-react";
import { useStoreContext } from "../../../context/store/StoreContext";

// Shown on pages that always work on a single store (POS, inventory) when
// "All stores" is selected in the store strip, so it's clear which store the
// page is acting on. Renders nothing otherwise.
const StoreScopeNote = ({ className = "" }) => {
    const { isAllStores, currentStore } = useStoreContext();

    if (!isAllStores || !currentStore) return null;

    return (
        <div
            className={`flex items-start gap-2 rounded-sm border border-blue-200 dark:border-blue-500/30 bg-blue-50 dark:bg-blue-500/10 px-3 py-2 text-sm text-blue-800 dark:text-blue-300 ${className}`}
        >
            <Info size={16} className="mt-0.5 shrink-0" />
            <span>
                Working in <strong>{currentStore.name}</strong>
                {currentStore.code ? ` (${currentStore.code})` : ""}, the last store you picked.
                "All stores" in the store strip applies to dashboards and reports; pick a store there to change this page.
            </span>
        </div>
    );
};

export default StoreScopeNote;
