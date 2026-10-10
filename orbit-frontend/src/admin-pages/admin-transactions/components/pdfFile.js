// Helpers for server-rendered PDF blobs (receipts, transaction reports).

const asPdf = (blob) =>
  blob.type === "application/pdf" ? blob : new Blob([blob], { type: "application/pdf" });

export const downloadPdf = (blob, filename) => {
  const url = URL.createObjectURL(asPdf(blob));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};

// Axios returns error bodies as Blobs when responseType is "blob".
export const pdfErrorMessage = async (error, fallback) => {
  const data = error?.response?.data;
  if (data instanceof Blob) {
    try {
      return JSON.parse(await data.text()).message || fallback;
    } catch {
      return fallback;
    }
  }
  return data?.message || fallback;
};
