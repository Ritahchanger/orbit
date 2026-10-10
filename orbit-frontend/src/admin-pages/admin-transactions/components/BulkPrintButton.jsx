// components/BulkPrintButton.jsx
import { useState } from "react";
import { Printer, Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";
import transactionsApi from "../../services/transaction-api";
import { downloadPdf, pdfErrorMessage } from "./pdfFile";

// Transactions report PDF for the list's active filters ("Print" = download).
const BulkPrintButton = ({ filters = {}, total = 0, isLoading = false }) => {
  const [busy, setBusy] = useState(false);

  const print = async () => {
    if (!total) {
      toast.error("No transactions to print");
      return;
    }
    try {
      setBusy(true);
      const { blob, filename } = await transactionsApi.exportTransactionsPdf(filters);
      downloadPdf(blob, filename);
      toast.success(`Report downloaded (${total} transactions)`);
    } catch (error) {
      toast.error(await pdfErrorMessage(error, "Failed to generate report"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      onClick={print}
      disabled={busy || isLoading || !total}
      className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 rounded-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {busy ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Printer className="h-4 w-4 mr-2" />}
      {busy ? "Preparing..." : `Print Report (${total})`}
    </button>
  );
};

export default BulkPrintButton;
