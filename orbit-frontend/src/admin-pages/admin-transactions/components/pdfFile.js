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

// Print through a hidden iframe so the PDF's own layout is printed,
// not the admin page. Falls back to a new tab if the browser blocks it.
export const printPdf = (blob) => {
  const url = URL.createObjectURL(asPdf(blob));
  const frame = document.createElement("iframe");
  frame.style.cssText = "position:fixed;right:0;bottom:0;width:0;height:0;border:0";
  frame.src = url;
  frame.onload = () => {
    try {
      frame.contentWindow.focus();
      frame.contentWindow.print();
    } catch {
      window.open(url, "_blank");
    }
    setTimeout(() => {
      frame.remove();
      URL.revokeObjectURL(url);
    }, 60000);
  };
  document.body.appendChild(frame);
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
