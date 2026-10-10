import { useState } from "react";
import { toast } from "react-hot-toast";
import transactionsApi from "../../services/transaction-api";
import { downloadPdf, pdfErrorMessage } from "./pdfFile";

// "Print" in the UI downloads the server-rendered receipt PDF (business letterhead).
export const useReceiptPdf = (transaction) => {
  const [busy, setBusy] = useState(false);

  const print = async () => {
    if (!transaction?._id) return;
    try {
      setBusy(true);
      const { blob, filename } = await transactionsApi.getReceiptPdf(transaction._id);
      downloadPdf(blob, filename);
    } catch (error) {
      toast.error(await pdfErrorMessage(error, "Failed to generate receipt"));
    } finally {
      setBusy(false);
    }
  };

  return { busy, print };
};
