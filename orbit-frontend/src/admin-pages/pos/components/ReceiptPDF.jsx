import { useState } from "react";
import { createPortal } from "react-dom";
import { Printer, Download, X, Loader2, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";
import { buildReceiptPDF } from "./util";

const ReceiptPDF = ({
  isOpen,
  onClose,
  transaction,
  items,
  storeDetails,
  formatCurrency,
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [paperSize, setPaperSize] = useState("80mm");

  const formatAddress = (address) => {
    if (!address) return "";
    if (typeof address === "string") return address;
    return (
      [
        address.street,
        address.building,
        address.floor && `Floor ${address.floor}`,
        address.city,
        address.county,
      ]
        .filter(Boolean)
        .join(", ") || ""
    );
  };

  if (!isOpen || !transaction) return null;

  const subtotal = items.reduce(
    (s, i) => s + (i.unitPrice || i.product?.price || 0) * i.quantity,
    0,
  );
  const discount = transaction?.discount || 0;
  const total = subtotal - discount;

  const parsedDate = transaction?.timestamp
    ? new Date(transaction.timestamp)
    : new Date();
  const safeDate = isNaN(parsedDate.getTime()) ? new Date() : parsedDate;

  const handleDownload = () => {
    setIsGenerating(true);
    try {
      const doc = buildReceiptPDF(
        transaction,
        items,
        storeDetails,
        formatCurrency,
        { paperSize },
      );
      doc.save(
        `receipt-${transaction.transactionId?.slice(-8) || "new"}-${format(new Date(), "yyyyMMddHHmm")}.pdf`,
      );
    } catch (e) {
      console.error(e);
      alert("Error generating PDF. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrint = () => {
    setIsGenerating(true);
    try {
      const doc = buildReceiptPDF(
        transaction,
        items,
        storeDetails,
        formatCurrency,
        { paperSize },
      );
      const url = URL.createObjectURL(doc.output("blob"));
      const win = window.open(url);
      if (!win) {
        alert("Allow popups to print, or use Download PDF.");
        URL.revokeObjectURL(url);
        return;
      }
      win.addEventListener("load", () => {
        win.focus();
        win.print();
        URL.revokeObjectURL(url);
      });
    } catch (e) {
      console.error(e);
      alert("Error preparing receipt for printing.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Thermal dashes helper
  const Divider = ({ char = "-", count = 32 }) => (
    <div className="font-mono text-[11px] text-gray-400 tracking-tighter select-none">
      {char.repeat(count)}
    </div>
  );

  const Row = ({ label, value, bold = false, accent = false }) => (
    <div
      className={`flex justify-between font-mono text-[11px] leading-5 ${
        accent
          ? "text-gray-900 font-bold text-[13px]"
          : bold
            ? "text-gray-800 font-semibold"
            : "text-gray-600"
      }`}
    >
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );

  return createPortal(
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&display=swap');
        .thermal-font { font-family: 'Share Tech Mono', 'Courier New', monospace; }
        .receipt-paper {
          background: #fafaf8;
          background-image:
            repeating-linear-gradient(
              0deg,
              transparent,
              transparent 23px,
              rgba(0,0,0,0.015) 23px,
              rgba(0,0,0,0.015) 24px
            );
        }
        .torn-top {
          background: #fafaf8;
          clip-path: polygon(
            0% 8px, 1.5% 0%, 3% 8px, 4.5% 0%, 6% 8px, 7.5% 0%, 9% 8px,
            10.5% 0%, 12% 8px, 13.5% 0%, 15% 8px, 16.5% 0%, 18% 8px,
            19.5% 0%, 21% 8px, 22.5% 0%, 24% 8px, 25.5% 0%, 27% 8px,
            28.5% 0%, 30% 8px, 31.5% 0%, 33% 8px, 34.5% 0%, 36% 8px,
            37.5% 0%, 39% 8px, 40.5% 0%, 42% 8px, 43.5% 0%, 45% 8px,
            46.5% 0%, 48% 8px, 49.5% 0%, 51% 8px, 52.5% 0%, 54% 8px,
            55.5% 0%, 57% 8px, 58.5% 0%, 60% 8px, 61.5% 0%, 63% 8px,
            64.5% 0%, 66% 8px, 67.5% 0%, 69% 8px, 70.5% 0%, 72% 8px,
            73.5% 0%, 75% 8px, 76.5% 0%, 78% 8px, 79.5% 0%, 81% 8px,
            82.5% 0%, 84% 8px, 85.5% 0%, 87% 8px, 88.5% 0%, 90% 8px,
            91.5% 0%, 93% 8px, 94.5% 0%, 96% 8px, 97.5% 0%, 99% 8px,
            100% 0%, 100% 100%, 0% 100%
          );
        }
        .torn-bottom {
          background: #fafaf8;
          clip-path: polygon(
            0% 0%, 100% 0%, 100% calc(100% - 8px),
            99% 100%, 97.5% calc(100% - 8px), 96% 100%, 94.5% calc(100% - 8px),
            93% 100%, 91.5% calc(100% - 8px), 90% 100%, 88.5% calc(100% - 8px),
            87% 100%, 85.5% calc(100% - 8px), 84% 100%, 82.5% calc(100% - 8px),
            81% 100%, 79.5% calc(100% - 8px), 78% 100%, 76.5% calc(100% - 8px),
            75% 100%, 73.5% calc(100% - 8px), 72% 100%, 70.5% calc(100% - 8px),
            69% 100%, 67.5% calc(100% - 8px), 66% 100%, 64.5% calc(100% - 8px),
            63% 100%, 61.5% calc(100% - 8px), 60% 100%, 58.5% calc(100% - 8px),
            57% 100%, 55.5% calc(100% - 8px), 54% 100%, 52.5% calc(100% - 8px),
            51% 100%, 49.5% calc(100% - 8px), 48% 100%, 46.5% calc(100% - 8px),
            45% 100%, 43.5% calc(100% - 8px), 42% 100%, 40.5% calc(100% - 8px),
            39% 100%, 37.5% calc(100% - 8px), 36% 100%, 34.5% calc(100% - 8px),
            33% 100%, 31.5% calc(100% - 8px), 30% 100%, 28.5% calc(100% - 8px),
            27% 100%, 25.5% calc(100% - 8px), 24% 100%, 22.5% calc(100% - 8px),
            21% 100%, 19.5% calc(100% - 8px), 18% 100%, 16.5% calc(100% - 8px),
            15% 100%, 13.5% calc(100% - 8px), 12% 100%, 10.5% calc(100% - 8px),
            9% 100%, 7.5% calc(100% - 8px), 6% 100%, 4.5% calc(100% - 8px),
            3% 100%, 1.5% calc(100% - 8px), 0% 100%
          );
        }
      `}</style>

      <div className="fixed inset-0 z-[200] flex items-center justify-center px-4 overflow-y-auto">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal shell */}
        <div className="relative w-full max-w-md flex flex-col my-6 z-10">
          {/* ── Modal header (outside the receipt) ── */}
          <div className="bg-gray-900 rounded-t-xl px-5 py-3.5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <span className="text-white font-semibold text-sm tracking-wide">
                Payment Complete
              </span>
              <span className="text-gray-400 text-xs font-mono">
                #{transaction.transactionId?.slice(-8) || "N/A"}
              </span>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors p-1 rounded"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* ── Scrollable receipt area ── */}
          <div className="overflow-y-auto max-h-[70vh] bg-gray-800 px-6 py-2">
            {/* Torn top edge */}
            <div className="torn-top h-3 w-full shadow-md" />

            {/* Receipt body */}
            <div className="receipt-paper thermal-font px-5 py-4 shadow-xl">
              {/* Store name */}
              <div className="text-center mb-1">
                <div className="font-mono font-bold text-[15px] text-gray-900 tracking-widest uppercase">
                  {storeDetails?.name || "STORE"}
                </div>
                {storeDetails?.address && (
                  <div className="font-mono text-[10px] text-gray-500 mt-0.5 leading-4">
                    {formatAddress(storeDetails.address)}
                  </div>
                )}
                {storeDetails?.phone && (
                  <div className="font-mono text-[10px] text-gray-500">
                    Tel: {storeDetails.phone}
                  </div>
                )}
                {storeDetails?.website && (
                  <div className="font-mono text-[10px] text-gray-500">
                    {storeDetails.website}
                  </div>
                )}
              </div>

              <Divider char="=" count={32} />

              {/* Receipt label */}
              <div className="text-center font-mono text-[11px] text-gray-700 font-bold tracking-[0.2em] my-1">
                ** SALES RECEIPT **
              </div>

              <Divider count={32} />

              {/* Meta */}
              <div className="space-y-0.5 my-1.5">
                <div className="flex justify-between font-mono text-[10.5px] text-gray-600">
                  <span>Date</span>
                  <span>{format(safeDate, "dd/MM/yyyy HH:mm")}</span>
                </div>
                <div className="flex justify-between font-mono text-[10.5px] text-gray-600">
                  <span>Receipt#</span>
                  <span className="font-bold text-gray-800">
                    {transaction.transactionId?.slice(-10) || "N/A"}
                  </span>
                </div>
                <div className="flex justify-between font-mono text-[10.5px] text-gray-600">
                  <span>Cashier</span>
                  <span>
                    {transaction.soldBy?.name ||
                      transaction.soldBy?.username ||
                      "N/A"}
                  </span>
                </div>
                {transaction.customerName && (
                  <div className="flex justify-between font-mono text-[10.5px] text-gray-600">
                    <span>Customer</span>
                    <span className="max-w-[160px] truncate text-right">
                      {transaction.customerName}
                    </span>
                  </div>
                )}
                {transaction.customerPhone && (
                  <div className="flex justify-between font-mono text-[10.5px] text-gray-600">
                    <span>Phone</span>
                    <span>{transaction.customerPhone}</span>
                  </div>
                )}
              </div>

              <Divider count={32} />

              {/* Column headers */}
              <div className="flex font-mono text-[10px] text-gray-500 font-bold tracking-wide my-1">
                <span className="flex-1">ITEM</span>
                <span className="w-8 text-center">QTY</span>
                <span className="w-16 text-right">PRICE</span>
                <span className="w-20 text-right">AMOUNT</span>
              </div>

              <Divider count={32} />

              {/* Items */}
              <div className="space-y-1.5 my-1.5">
                {items.map((item, i) => {
                  const price = item.unitPrice || item.product?.price || 0;
                  const lineTotal = price * item.quantity;
                  const name = item.product?.name || "Item";
                  return (
                    <div key={i}>
                      {/* Name row — truncate if too long */}
                      <div className="font-mono text-[10.5px] text-gray-800 font-semibold truncate">
                        {name.length > 22 ? name.substring(0, 22) + "…" : name}
                      </div>
                      {/* Price row */}
                      <div className="flex font-mono text-[10.5px] text-gray-600">
                        <span className="flex-1 text-gray-400 text-[10px] pl-1">
                          @ {formatCurrency(price)}
                        </span>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <span className="w-20 text-right font-semibold text-gray-800">
                          {formatCurrency(lineTotal)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <Divider count={32} />

              {/* Totals */}
              <div className="space-y-0.5 my-1.5">
                <Row label="Subtotal" value={formatCurrency(subtotal)} />
                {discount > 0 && (
                  <Row
                    label="Discount"
                    value={`- ${formatCurrency(discount)}`}
                    bold
                  />
                )}
              </div>

              <Divider char="=" count={32} />

              {/* Grand total */}
              <div className="flex justify-between font-mono text-[14px] font-bold text-gray-900 my-1.5 tracking-wide">
                <span>TOTAL</span>
                <span>{formatCurrency(total)}</span>
              </div>

              <Divider char="=" count={32} />

              {/* Payment method */}
              <div className="my-1.5 space-y-0.5">
                <div className="flex justify-between font-mono text-[10.5px] text-gray-600">
                  <span>Payment</span>
                  <span className="font-bold text-gray-900 uppercase tracking-widest">
                    {transaction.paymentMethod || "—"}
                  </span>
                </div>

                {transaction.paymentMethod === "cash" &&
                  transaction.cashPayment && (
                    <>
                      <div className="flex justify-between font-mono text-[10.5px] text-gray-600">
                        <span>Cash Given</span>
                        <span>
                          {formatCurrency(transaction.cashPayment.amountGiven)}
                        </span>
                      </div>
                      <div className="flex justify-between font-mono text-[10.5px] font-bold text-gray-900">
                        <span>Change</span>
                        <span>
                          {formatCurrency(transaction.cashPayment.change)}
                        </span>
                      </div>
                    </>
                  )}

                {transaction.paymentMethod === "mpesa" && (
                  <>
                    <div className="flex justify-between font-mono text-[10.5px] text-gray-600">
                      <span>M-Pesa Ref</span>
                      <span className="font-bold text-gray-900">
                        {transaction.mpesaPayment?.transactionCode || "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between font-mono text-[10.5px] text-gray-600">
                      <span>Phone</span>
                      <span>
                        {transaction.mpesaPayment?.phoneNumber ||
                          transaction.customerPhone ||
                          "N/A"}
                      </span>
                    </div>
                  </>
                )}
              </div>

              <Divider count={32} />

              {/* Footer */}
              <div className="text-center mt-2 mb-1 space-y-0.5">
                <div className="font-mono text-[11px] font-bold text-gray-800 tracking-wide">
                  * THANK YOU FOR YOUR PURCHASE *
                </div>
                <div className="font-mono text-[10px] text-gray-400">
                  Goods sold are not returnable.
                </div>
                <div className="font-mono text-[10px] text-gray-400">
                  Printed: {format(new Date(), "dd/MM/yyyy HH:mm:ss")}
                </div>
                {storeDetails?.website && (
                  <div className="font-mono text-[10px] text-gray-500 mt-1">
                    {storeDetails.website}
                  </div>
                )}
              </div>
            </div>

            {/* Torn bottom edge */}
            <div className="torn-bottom h-3 w-full shadow-md" />
          </div>

          {/* ── Controls footer ── */}
          <div className="bg-gray-900 rounded-b-xl px-5 py-3.5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <label className="text-xs text-gray-400 font-medium whitespace-nowrap">
                Size:
              </label>
              <select
                value={paperSize}
                onChange={(e) => setPaperSize(e.target.value)}
                className="text-xs bg-gray-800 border border-gray-700 rounded px-2.5 py-1.5 text-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="80mm">80mm Thermal</option>
                <option value="a4">A4 Full Page</option>
              </select>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handlePrint}
                disabled={isGenerating}
                className="flex items-center gap-1.5 px-4 py-2 rounded bg-gray-700 hover:bg-gray-600 text-gray-200 text-xs font-semibold transition-colors disabled:opacity-40"
              >
                <Printer className="h-3.5 w-3.5" />
                Print
              </button>
              <button
                onClick={handleDownload}
                disabled={isGenerating}
                className="flex items-center gap-1.5 px-4 py-2 rounded bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-colors disabled:opacity-40 shadow"
              >
                {isGenerating ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Download className="h-3.5 w-3.5" />
                )}
                Download PDF
              </button>
            </div>
          </div>
        </div>
      </div>
    </>,
    document.body,
  );
};

export default ReceiptPDF;
