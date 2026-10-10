import { useState } from "react";
import { toast } from "react-hot-toast";
import transactionsApi from "../../services/transaction-api";
import { downloadPdf, printPdf, pdfErrorMessage } from "./pdfFile";

// Receipt PDF is rendered server-side with the business's own letterhead.
export const useReceiptPdf = (transaction) => {
  const [busy, setBusy] = useState(null); // "print" | "download" | null

  const run = async (mode) => {
    if (!transaction?._id) return;
    try {
      setBusy(mode);
      const { blob, filename } = await transactionsApi.getReceiptPdf(transaction._id);
      if (mode === "print") printPdf(blob);
      else downloadPdf(blob, filename);
    } catch (error) {
      toast.error(await pdfErrorMessage(error, "Failed to generate receipt"));
    } finally {
      setBusy(null);
    }
  };

  return {
    busy,
    print: () => run("print"),
    download: () => run("download"),
  };
};
