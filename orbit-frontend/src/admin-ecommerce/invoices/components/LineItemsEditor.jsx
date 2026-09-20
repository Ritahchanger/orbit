import { Plus, Trash2 } from "lucide-react";

const emptyItem = () => ({ description: "", quantity: 1, unitPrice: 0 });

const LineItemsEditor = ({ items, onChange, currency = "KES" }) => {
    const updateItem = (index, field, value) => {
        const next = items.map((item, i) =>
            i === index ? { ...item, [field]: value } : item
        );
        onChange(next);
    };

    const addItem = () => {
        onChange([...items, emptyItem()]);
    };

    const removeItem = (index) => {
        onChange(items.filter((_, i) => i !== index));
    };

    const lineTotal = (item) =>
        (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0);

    const grandTotal = items.reduce((sum, item) => sum + lineTotal(item), 0);

    return (
        <div className="space-y-3">
            <div className="hidden sm:grid grid-cols-[1fr_80px_120px_120px_32px] gap-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide px-1">
                <span>Description</span>
                <span>Qty</span>
                <span>Unit Price</span>
                <span>Amount</span>
                <span />
            </div>

            {items.map((item, index) => (
                <div
                    key={index}
                    className="grid grid-cols-1 sm:grid-cols-[1fr_80px_120px_120px_32px] gap-2 items-center"
                >
                    <input
                        type="text"
                        value={item.description}
                        onChange={(e) => updateItem(index, "description", e.target.value)}
                        placeholder="Item description"
                        className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                        type="number"
                        min="0"
                        value={item.quantity}
                        onChange={(e) => updateItem(index, "quantity", e.target.value)}
                        className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.unitPrice}
                        onChange={(e) => updateItem(index, "unitPrice", e.target.value)}
                        className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <div className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300 truncate">
                        {currency} {lineTotal(item).toLocaleString()}
                    </div>
                    <button
                        type="button"
                        onClick={() => removeItem(index)}
                        disabled={items.length <= 1}
                        className="p-2 text-gray-400 hover:text-red-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        aria-label="Remove item"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            ))}

            <div className="flex items-center justify-between pt-1">
                <button
                    type="button"
                    onClick={addItem}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-sm transition-colors"
                >
                    <Plus size={14} />
                    Add item
                </button>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                    Items total: <span className="font-semibold text-gray-900 dark:text-white">{currency} {grandTotal.toLocaleString()}</span>
                </p>
            </div>
        </div>
    );
};

export default LineItemsEditor;
