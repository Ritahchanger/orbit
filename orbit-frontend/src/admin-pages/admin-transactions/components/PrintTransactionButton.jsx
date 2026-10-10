// components/PrintTransactionButton.jsx
import { Printer, Loader2 } from "lucide-react";
import { useReceiptPdf } from "./useReceiptPdf";

// Downloads the receipt PDF ("Print" = download).
const PrintTransactionButton = ({ transaction, variant = "icon", className = "" }) => {
  const { busy, print } = useReceiptPdf(transaction);

  if (variant === "icon") {
    return (
      <button
        onClick={print}
        disabled={busy}
        className={`p-1 text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-sm transition-colors disabled:opacity-50 ${className}`}
        title="Print receipt (downloads PDF)"
      >
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Printer className="h-4 w-4" />}
      </button>
    );
  }

  return (
    <button
      onClick={print}
      disabled={busy}
      className={`inline-flex items-center px-3 py-1.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 rounded-sm transition-colors disabled:opacity-50 ${className}`}
    >
      <Printer className="h-4 w-4 mr-2" />
      {busy ? "Preparing..." : "Print Receipt"}
    </button>
  );
};

export default PrintTransactionButton;
