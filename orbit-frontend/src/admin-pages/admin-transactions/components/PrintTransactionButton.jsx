// components/PrintTransactionButton.jsx
import { Printer, Download, Loader2 } from "lucide-react";
import { useReceiptPdf } from "./useReceiptPdf";

const PrintTransactionButton = ({
  transaction,
  variant = "icon", // 'icon' or 'button'
  className = "",
}) => {
  const { busy, print, download } = useReceiptPdf(transaction);

  if (variant === "icon") {
    return (
      <div className="flex items-center gap-1">
        <button
          onClick={print}
          disabled={!!busy}
          className={`p-1 text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-sm transition-colors disabled:opacity-50 ${className}`}
          title="Print receipt"
        >
          {busy === "print" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Printer className="h-4 w-4" />}
        </button>
        <button
          onClick={download}
          disabled={!!busy}
          className={`p-1 text-gray-600 hover:text-green-600 dark:text-gray-400 dark:hover:text-green-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-sm transition-colors disabled:opacity-50 ${className}`}
          title="Download receipt PDF"
        >
          {busy === "download" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={print}
      disabled={!!busy}
      className={`inline-flex items-center px-3 py-1.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 rounded-sm transition-colors disabled:opacity-50 ${className}`}
    >
      <Printer className="h-4 w-4 mr-2" />
      {busy ? "Generating..." : "Print Receipt"}
    </button>
  );
};

export default PrintTransactionButton;
