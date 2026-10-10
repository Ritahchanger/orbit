// components/BulkPrintButton.jsx
import { useState } from "react";
import { Printer, Download, Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";
import transactionsApi from "../../services/transaction-api";
import { downloadPdf, printPdf, pdfErrorMessage } from "./pdfFile";

// Transactions report PDF, rendered server-side for the list's active filters.
const BulkPrintButton = ({ filters = {}, total = 0, isLoading = false }) => {
  const [busy, setBusy] = useState(null); // "print" | "download" | null

  const run = async (mode) => {
    if (!total) {
      toast.error("No transactions to export");
      return;
    }
    try {
      setBusy(mode);
      const { blob, filename } = await transactionsApi.exportTransactionsPdf(filters);
      if (mode === "print") printPdf(blob);
      else downloadPdf(blob, filename);
      toast.success(`PDF report ready (${total} transactions)`);
    } catch (error) {
      toast.error(await pdfErrorMessage(error, "Failed to generate report"));
    } finally {
      setBusy(null);
    }
  };

  const disabled = !!busy || isLoading || !total;

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => run("print")}
        disabled={disabled}
        className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 rounded-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {busy === "print" ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <Printer className="h-4 w-4 mr-2" />
        )}
        {busy === "print" ? "Preparing..." : `Print Report (${total})`}
      </button>

      <button
        onClick={() => run("download")}
        disabled={disabled}
        className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {busy === "download" ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <Download className="h-4 w-4 mr-2" />
        )}
        Download PDF
      </button>
    </div>
  );
};

export default BulkPrintButton;
