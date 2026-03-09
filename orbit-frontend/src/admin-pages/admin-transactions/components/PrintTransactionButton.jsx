// components/PrintTransactionButton.jsx
import { useState } from "react";
import { Printer, Download, FileText } from "lucide-react";

import { generateTransactionPDF } from "./GenerateTransactionPDF";

import { toast } from "react-hot-toast";

const PrintTransactionButton = ({
  transaction,
  formatCurrency,
  formatDate,
  variant = "icon", // 'icon', 'button', or 'dropdown'
  className = "",
}) => {
  const [isPrinting, setIsPrinting] = useState(false);

  const handlePrint = async () => {
    try {
      setIsPrinting(true);

      const doc = generateTransactionPDF(
        transaction,
        formatCurrency,
        formatDate,
      );

      // Open in new window for printing
      const pdfBlob = doc.output("blob");
      const pdfUrl = URL.createObjectURL(pdfBlob);
      const printWindow = window.open(pdfUrl);

      if (printWindow) {
        printWindow.onload = () => {
          printWindow.print();
        };
      }

      toast.success("PDF generated successfully!");
    } catch (error) {
      console.error("Print error:", error);
      toast.error("Failed to generate PDF");
    } finally {
      setIsPrinting(false);
    }
  };

  const handleDownload = async () => {
    try {
      setIsPrinting(true);

      const doc = generateTransactionPDF(
        transaction,
        formatCurrency,
        formatDate,
      );

      const fileName = `transaction-${
        transaction.transactionId || transaction._id.slice(-8)
      }.pdf`;
      doc.save(fileName);

      toast.success("PDF downloaded successfully!");
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Failed to download PDF");
    } finally {
      setIsPrinting(false);
    }
  };

  if (variant === "icon") {
    return (
      <div className="flex items-center gap-1">
        <button
          onClick={handlePrint}
          disabled={isPrinting}
          className={`p-1 text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-sm transition-colors ${className}`}
          title="Print Receipt"
        >
          <Printer className="h-4 w-4" />
        </button>
        <button
          onClick={handleDownload}
          disabled={isPrinting}
          className={`p-1 text-gray-600 hover:text-green-600 dark:text-gray-400 dark:hover:text-green-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-sm transition-colors ${className}`}
          title="Download PDF"
        >
          <Download className="h-4 w-4" />
        </button>
      </div>
    );
  }

  if (variant === "button") {
    return (
      <button
        onClick={handlePrint}
        disabled={isPrinting}
        className={`inline-flex items-center px-3 py-1.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 rounded-sm transition-colors disabled:opacity-50 ${className}`}
      >
        <Printer className="h-4 w-4 mr-2" />
        {isPrinting ? "Generating..." : "Print Receipt"}
      </button>
    );
  }

  return (
    <div className="relative inline-block text-left">
      <button
        type="button"
        className={`inline-flex items-center px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-sm hover:bg-gray-50 dark:hover:bg-gray-700 ${className}`}
      >
        <FileText className="h-4 w-4 mr-2" />
        Export
      </button>
      <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-sm shadow-lg z-10">
        <button
          onClick={handlePrint}
          className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          Print Receipt
        </button>
        <button
          onClick={handleDownload}
          className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          Download PDF
        </button>
      </div>
    </div>
  );
};

export default PrintTransactionButton;
