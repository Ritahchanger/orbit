// components/BulkPrintButton.jsx
import { useState } from "react";
import { Printer, Download, Loader2 } from "lucide-react";
import { generateMultipleTransactionsPDF } from "./GenerateTransactionPDF";
import { toast } from "react-hot-toast";

const BulkPrintButton = ({
  transactions,
  pagination,
  onFetchAll,
  formatCurrency,
  formatDate,
  title = "Transactions Report",
  isLoading = false,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [allTransactions, setAllTransactions] = useState(null);

  // Fetch all transactions (no setIsProcessing here — callers manage that)
  const fetchAllData = async () => {
    if (allTransactions) return allTransactions;

    try {
      // If everything fits on one page, just use current transactions
      if (pagination.total <= pagination.limit) {
        return transactions;
      }

      // onFetchAll handles all pages internally
      const data = await onFetchAll();

      if (data?.length) {
        setAllTransactions(data);
        return data;
      }

      return transactions; // fallback to current page
    } catch (error) {
      console.error("Error fetching all transactions:", error);
      toast.error("Failed to load all transactions");
      return null;
    }
  };

  // Handle print
  const handlePrint = async () => {
    if (!transactions?.length && !pagination?.total) {
      toast.error("No transactions to print");
      return;
    }

    try {
      setIsProcessing(true);

      const dataToPrint = await fetchAllData();

      if (!dataToPrint || dataToPrint.length === 0) {
        toast.error("No transactions to print");
        return;
      }

      const doc = generateMultipleTransactionsPDF(
        dataToPrint,
        formatCurrency,
        formatDate,
        title,
      );

      const pdfBlob = doc.output("blob");
      const pdfUrl = URL.createObjectURL(pdfBlob);
      const printWindow = window.open(pdfUrl);

      if (printWindow) {
        printWindow.onload = () => {
          printWindow.print();
        };
      }

      toast.success(`Generated PDF with ${dataToPrint.length} transactions`);
    } catch (error) {
      console.error("Bulk print error:", error);
      toast.error("Failed to generate report");
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle download
  const handleDownload = async () => {
    if (!transactions?.length && !pagination?.total) {
      toast.error("No transactions to download");
      return;
    }

    try {
      setIsProcessing(true);

      const dataToPrint = await fetchAllData();

      if (!dataToPrint || dataToPrint.length === 0) {
        toast.error("No transactions to download");
        return;
      }

      const doc = generateMultipleTransactionsPDF(
        dataToPrint,
        formatCurrency,
        formatDate,
        title,
      );

      const fileName = `transactions-report-${new Date().toISOString().slice(0, 10)}.pdf`;
      doc.save(fileName);

      toast.success(`Downloaded ${dataToPrint.length} transactions`);
    } catch (error) {
      console.error("Bulk download error:", error);
      toast.error("Failed to download report");
    } finally {
      setIsProcessing(false);
    }
  };

  const buttonText = () => {
    if (isProcessing) return "Processing...";
    if (pagination?.total > (transactions?.length || 0)) {
      return `Print All (${pagination.total} transactions)`;
    }
    return `Print Report (${transactions?.length || 0})`;
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handlePrint}
        disabled={isProcessing || isLoading || !transactions?.length}
        className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 rounded-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isProcessing ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <Printer className="h-4 w-4 mr-2" />
        )}
        {buttonText()}
      </button>

      <button
        onClick={handleDownload}
        disabled={isProcessing || isLoading || !transactions?.length}
        className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isProcessing ? (
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
