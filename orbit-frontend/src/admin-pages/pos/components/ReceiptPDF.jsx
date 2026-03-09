import { useState } from "react";
import { createPortal } from "react-dom";
import {
  Printer,
  Download,
  X,
  Loader2,
  CheckCircle2,
  Receipt,
} from "lucide-react";
import { format } from "date-fns";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// ─── PDF Colour Palette ───────────────────────────────────────────────
const INK = [15, 23, 42];
const ACCENT = [37, 99, 235];
const ACCENT_LIGHT = [219, 234, 254];
const MUTED = [100, 116, 139];
const RULE = [226, 232, 240];
const WHITE = [255, 255, 255];
const GREEN_INK = [22, 163, 74];

const formatAddressStr = (address) => {
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
      .join(", ") || "Address not available"
  );
};

// ─── PDF Builder ──────────────────────────────────────────────────────
const buildReceiptPDF = (
  transaction,
  items,
  storeDetails,
  formatCurrency,
  options = { paperSize: "80mm" },
) => {
  const is80 = options.paperSize === "80mm";
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: is80 ? [80, 297] : "a4",
  });

  const pw = doc.internal.pageSize.getWidth();
  const mg = is80 ? 5 : 20;
  const cw = pw - mg * 2;
  let y = 0;

  const storeName = storeDetails?.name || "Store";
  const storeWebsite = storeDetails?.website || storeDetails?.websiteUrl || "";
  const receiptNo =
    transaction?.transactionId || `TRX-${format(new Date(), "yyyyMMddHHmmss")}`;
  const dateStr = format(
    new Date(transaction?.timestamp || new Date()),
    "dd/MM/yyyy HH:mm:ss",
  );
  const cashier =
    transaction?.soldBy?.name || transaction?.soldBy?.username || "Cashier";

  // ── Full-width header band ──────────────────────────────────────
  const headerH = is80 ? 22 : 30;
  doc.setFillColor(...ACCENT);
  doc.rect(0, 0, pw, headerH, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(is80 ? 13 : 20);
  doc.setTextColor(...WHITE);
  doc.text(storeName.toUpperCase(), pw / 2, is80 ? 10 : 14, {
    align: "center",
  });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(is80 ? 6 : 8);
  doc.setTextColor(219, 234, 254);
  const subParts = [
    storeDetails?.address ? formatAddressStr(storeDetails.address) : null,
    storeDetails?.phone ? `Tel: ${storeDetails.phone}` : null,
  ]
    .filter(Boolean)
    .join("  •  ");
  if (subParts) doc.text(subParts, pw / 2, is80 ? 16 : 22, { align: "center" });

  y = headerH + (is80 ? 5 : 8);

  // ── SALES RECEIPT label ─────────────────────────────────────────
  doc.setFont("helvetica", "bold");
  doc.setFontSize(is80 ? 9 : 12);
  doc.setTextColor(...MUTED);
  doc.text("SALES RECEIPT", pw / 2, y, { align: "center" });
  const labelW = doc.getTextWidth("SALES RECEIPT");
  const ruleY = y - 1.5;
  doc.setDrawColor(...RULE);
  doc.setLineWidth(0.3);
  doc.line(mg, ruleY, pw / 2 - labelW / 2 - 2, ruleY);
  doc.line(pw / 2 + labelW / 2 + 2, ruleY, pw - mg, ruleY);
  y += is80 ? 6 : 9;

  // ── Meta info box ───────────────────────────────────────────────
  const boxH = is80
    ? transaction?.customerName
      ? 26
      : 21
    : transaction?.customerName
      ? 32
      : 26;
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(...RULE);
  doc.setLineWidth(0.3);
  doc.roundedRect(mg, y, cw, boxH, 1.5, 1.5, "FD");

  const col2x = mg + cw / 2 + 2;
  let my = y + (is80 ? 5 : 7);
  const lineH = is80 ? 4.5 : 5.5;

  const metaRow = (label, value, x, bold = false) => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(is80 ? 6.5 : 8.5);
    doc.setTextColor(...MUTED);
    doc.text(label, x, my);
    doc.setFont("helvetica", bold ? "bold" : "normal");
    doc.setTextColor(...INK);
    doc.text(String(value || ""), x + (is80 ? 14 : 18), my);
  };

  metaRow("Receipt #", receiptNo.slice(-12), mg + 3, true);
  metaRow("Cashier", cashier, col2x);
  my += lineH;
  metaRow("Date", dateStr, mg + 3);
  if (transaction?.customerName) {
    metaRow("Customer", transaction.customerName, col2x);
    my += lineH;
    if (transaction?.customerPhone)
      metaRow("Phone", transaction.customerPhone, mg + 3);
  }

  y += boxH + (is80 ? 5 : 7);

  // ── Items Table ─────────────────────────────────────────────────
  const tableRows = items.map((item) => [
    item.product?.name?.substring(0, is80 ? 18 : 32) || "Item",
    item.quantity.toString(),
    formatCurrency(item.unitPrice || item.product?.price || 0).replace(
      "KSh ",
      "",
    ),
    formatCurrency(
      (item.unitPrice || item.product?.price || 0) * item.quantity,
    ).replace("KSh ", ""),
  ]);

  const subtotal = items.reduce(
    (s, i) => s + (i.unitPrice || i.product?.price || 0) * i.quantity,
    0,
  );
  const discount = transaction?.discount || 0;
  const total = subtotal - discount;

  autoTable(doc, {
    head: [["ITEM", "QTY", "PRICE", "TOTAL"]],
    body: tableRows,
    startY: y,
    theme: "plain",
    styles: {
      fontSize: is80 ? 7 : 9,
      font: "helvetica",
      cellPadding: {
        top: is80 ? 2.5 : 3.5,
        bottom: is80 ? 2.5 : 3.5,
        left: 2,
        right: 2,
      },
      textColor: INK,
    },
    headStyles: {
      fillColor: ACCENT,
      textColor: WHITE,
      fontStyle: "bold",
      fontSize: is80 ? 6.5 : 8,
      cellPadding: {
        top: is80 ? 3 : 4,
        bottom: is80 ? 3 : 4,
        left: 2,
        right: 2,
      },
    },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    columnStyles: {
      0: { cellWidth: is80 ? 32 : 65, halign: "left" },
      1: { cellWidth: is80 ? 10 : 18, halign: "center" },
      2: { cellWidth: is80 ? 17 : 30, halign: "right" },
      3: { cellWidth: is80 ? 17 : 30, halign: "right", fontStyle: "bold" },
    },
    margin: { left: mg, right: mg },
  });

  y = doc.lastAutoTable.finalY + (is80 ? 3 : 5);

  // ── Totals ──────────────────────────────────────────────────────
  const totalsX = is80 ? mg + 30 : pw - mg - 70;
  const totalsW = is80 ? cw - 30 : 70;

  [
    [`Subtotal`, formatCurrency(subtotal)],
    ...(discount > 0 ? [[`Discount`, `- ${formatCurrency(discount)}`]] : []),
  ].forEach(([label, value]) => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(is80 ? 7 : 9);
    doc.setTextColor(...MUTED);
    doc.text(label, totalsX, y);
    doc.setTextColor(...INK);
    doc.text(value, totalsX + totalsW, y, { align: "right" });
    y += is80 ? 4.5 : 6;
  });

  // Total highlight bar
  const totalBarH = is80 ? 7 : 9;
  doc.setFillColor(...ACCENT);
  doc.roundedRect(
    totalsX - 2,
    y - (is80 ? 5 : 6.5),
    totalsW + 4,
    totalBarH,
    1,
    1,
    "F",
  );
  doc.setFont("helvetica", "bold");
  doc.setFontSize(is80 ? 8.5 : 11);
  doc.setTextColor(...WHITE);
  doc.text("TOTAL", totalsX + 1, y - (is80 ? 0.5 : 0));
  doc.text(
    formatCurrency(total).replace("KSh ", "KES "),
    totalsX + totalsW,
    y - (is80 ? 0.5 : 0),
    { align: "right" },
  );
  y += is80 ? 5 : 8;

  // ── Payment ─────────────────────────────────────────────────────
  doc.setDrawColor(...RULE);
  doc.setLineWidth(0.3);
  doc.line(mg, y, pw - mg, y);
  y += is80 ? 4 : 6;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(is80 ? 7 : 9);
  doc.setTextColor(...ACCENT);
  doc.text("PAYMENT", mg, y);
  y += is80 ? 4 : 5.5;

  const pmLabel = (transaction?.paymentMethod || "").toUpperCase();
  doc.setFont("helvetica", "bold");
  doc.setFontSize(is80 ? 7.5 : 10);
  const pmW = doc.getTextWidth(pmLabel) + (is80 ? 6 : 8);
  doc.setFillColor(...ACCENT_LIGHT);
  doc.roundedRect(mg, y - (is80 ? 3.5 : 4.5), pmW, is80 ? 5 : 6.5, 1, 1, "F");
  doc.setTextColor(...ACCENT);
  doc.text(pmLabel, mg + (is80 ? 3 : 4), y);
  y += is80 ? 5 : 7;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(is80 ? 7 : 9);

  if (transaction?.paymentMethod === "cash" && transaction?.cashPayment) {
    doc.setTextColor(...INK);
    doc.text(
      `Amount Given: ${formatCurrency(transaction.cashPayment.amountGiven)}`,
      mg,
      y,
    );
    y += is80 ? 4 : 5.5;
    doc.setTextColor(...GREEN_INK);
    doc.text(
      `Change Given: ${formatCurrency(transaction.cashPayment.change)}`,
      mg,
      y,
    );
    y += is80 ? 5 : 7;
  }

  if (transaction?.paymentMethod === "mpesa" && transaction?.mpesaPayment) {
    doc.setTextColor(...INK);
    doc.text(
      `M-Pesa Ref: ${transaction.mpesaPayment.transactionCode || "N/A"}`,
      mg,
      y,
    );
    y += is80 ? 4 : 5.5;
    doc.text(
      `Phone: ${transaction.mpesaPayment.phoneNumber || transaction.customerPhone || "N/A"}`,
      mg,
      y,
    );
    y += is80 ? 5 : 7;
  }

  // ── Footer ───────────────────────────────────────────────────────
  doc.setDrawColor(...RULE);
  doc.line(mg, y, pw - mg, y);
  y += is80 ? 4 : 6;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(is80 ? 7 : 9);
  doc.setTextColor(...ACCENT);
  doc.text("Thank you for your purchase!", pw / 2, y, { align: "center" });
  y += is80 ? 4 : 5.5;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(is80 ? 5.5 : 7.5);
  doc.setTextColor(...MUTED);

  if (!is80) {
    doc.text(
      "Goods sold are not returnable. Warranty applies as per store policy.",
      pw / 2,
      y,
      { align: "center" },
    );
    y += 5;
  }

  doc.text(`Printed: ${format(new Date(), "dd/MM/yyyy HH:mm:ss")}`, pw / 2, y, {
    align: "center",
  });

  if (storeWebsite) {
    y += is80 ? 3.5 : 5;
    doc.setTextColor(...ACCENT);
    doc.text(storeWebsite, pw / 2, y, { align: "center" });
  }

  // Bottom accent strip
  const ph = doc.internal.pageSize.getHeight();
  doc.setFillColor(...ACCENT);
  doc.rect(0, ph - (is80 ? 2.5 : 3.5), pw, is80 ? 2.5 : 3.5, "F");

  return doc;
};

// ─── Modal Component ───────────────────────────────────────────────────
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
        .join(", ") || "Address not available"
    );
  };

  if (!isOpen || !transaction) return null;

  const subtotal = items.reduce(
    (s, i) => s + (i.unitPrice || i.product?.price || 0) * i.quantity,
    0,
  );
  const discount = transaction?.discount || 0;
  const total = subtotal - discount;

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

  return createPortal(
    <div className="fixed inset-0 z-[200] flex items-center justify-center px-4 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Card */}
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-sm shadow-2xl overflow-hidden flex flex-col my-4">
        {/* Header */}
        <div className="bg-blue-600 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 rounded-xl p-2">
              <Receipt className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-blue-200 text-[10px] font-semibold tracking-widest uppercase">
                Transaction Complete
              </p>
              <h3 className="text-white font-bold text-base">
                Receipt #{transaction.transactionId?.slice(-8) || "N/A"}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-blue-200 hover:text-white transition-colors rounded-sm p-1.5 hover:bg-white/10"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Success banner */}
        <div className="bg-emerald-50 dark:bg-emerald-900/20 border-b border-emerald-100 dark:border-emerald-800 px-5 py-2.5 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
          <p className="text-emerald-700 dark:text-emerald-300 text-xs font-medium">
            Payment of {formatCurrency(total)} received via{" "}
            <span className="uppercase font-bold">
              {transaction.paymentMethod || "—"}
            </span>
          </p>
        </div>

        <div className="p-5 space-y-4 overflow-y-auto max-h-[75vh]">
          {/* Receipt Preview */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden text-[11px]">
            {/* Store header */}
            <div className="bg-blue-600 px-4 py-3 text-center">
              <p className="text-white font-bold tracking-wide">
                {storeDetails?.name || "Store"}
              </p>
              {storeDetails?.address && (
                <p className="text-blue-200 text-[10px] mt-0.5">
                  {formatAddress(storeDetails.address)}
                </p>
              )}
              {storeDetails?.phone && (
                <p className="text-blue-200 text-[10px]">
                  Tel: {storeDetails.phone}
                </p>
              )}
            </div>

            {/* Meta */}
            <div className="bg-slate-50 dark:bg-slate-800/60 px-4 py-2.5 grid grid-cols-2 gap-x-4 gap-y-1 border-b border-slate-200 dark:border-slate-700">
              {[
                ["Receipt #", transaction.transactionId?.slice(-10)],
                ["Cashier", transaction.soldBy?.name || "N/A"],
                [
                  "Date",
                  format(
                    new Date(transaction.timestamp || new Date()),
                    "dd/MM/yyyy HH:mm",
                  ),
                ],
                ...(transaction.customerName
                  ? [["Customer", transaction.customerName]]
                  : []),
              ].map(([label, value]) => (
                <div key={label}>
                  <span className="text-slate-400 dark:text-slate-500">
                    {label}:{" "}
                  </span>
                  <span className="text-slate-700 dark:text-slate-100 font-semibold">
                    {value}
                  </span>
                </div>
              ))}
            </div>

            {/* Items */}
            <div className="px-4 py-2">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700">
                    <th className="text-left py-1.5 text-slate-400 dark:text-slate-500 font-semibold">
                      Item
                    </th>
                    <th className="text-center text-slate-400 dark:text-slate-500 font-semibold w-8">
                      Qty
                    </th>
                    <th className="text-right text-slate-400 dark:text-slate-500 font-semibold">
                      Price
                    </th>
                    <th className="text-right text-slate-400 dark:text-slate-500 font-semibold">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {items.map((item, i) => (
                    <tr key={i}>
                      <td className="py-1.5 text-slate-700 dark:text-slate-200 max-w-[130px] truncate">
                        {item.product?.name || "Item"}
                      </td>
                      <td className="text-center text-slate-500 dark:text-slate-400">
                        {item.quantity}
                      </td>
                      <td className="text-right text-slate-500 dark:text-slate-400">
                        {formatCurrency(
                          item.unitPrice || item.product?.price || 0,
                        )}
                      </td>
                      <td className="text-right font-semibold text-slate-800 dark:text-slate-100">
                        {formatCurrency(
                          (item.unitPrice || item.product?.price || 0) *
                            item.quantity,
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="bg-slate-50 dark:bg-slate-800/60 border-t border-slate-200 dark:border-slate-700 px-4 py-2.5 space-y-1">
              <div className="flex justify-between text-slate-500 dark:text-slate-400">
                <span>Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-red-500">
                  <span>Discount</span>
                  <span>− {formatCurrency(discount)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-sm border-t border-slate-200 dark:border-slate-700 pt-1.5 text-blue-600 dark:text-blue-400">
                <span>TOTAL</span>
                <span>{formatCurrency(total)}</span>
              </div>
            </div>

            {/* Cash details */}
            {transaction.paymentMethod === "cash" &&
              transaction.cashPayment && (
                <div className="px-4 py-2 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 space-y-0.5">
                  <div className="flex justify-between text-slate-500 dark:text-slate-400">
                    <span>Amount Given</span>
                    <span>
                      {formatCurrency(transaction.cashPayment.amountGiven)}
                    </span>
                  </div>
                  <div className="flex justify-between font-semibold text-emerald-600 dark:text-emerald-400">
                    <span>Change</span>
                    <span>
                      {formatCurrency(transaction.cashPayment.change)}
                    </span>
                  </div>
                </div>
              )}

            {/* M-Pesa details */}
            {transaction.paymentMethod === "mpesa" && (
              <div className="px-4 py-2 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 space-y-0.5 text-slate-600 dark:text-slate-300">
                <div className="flex justify-between">
                  <span>M-Pesa Ref</span>
                  <span className="font-semibold">
                    {transaction.mpesaPayment?.transactionCode || "N/A"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Phone</span>
                  <span>
                    {transaction.mpesaPayment?.phoneNumber ||
                      transaction.customerPhone ||
                      "N/A"}
                  </span>
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="bg-blue-600 py-2 text-center">
              <p className="text-blue-100 text-[10px] font-medium tracking-wide">
                Thank you for shopping with us!
              </p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between gap-3 pt-1">
            <div className="flex items-center gap-2">
              <label className="text-xs text-slate-500 dark:text-slate-400 font-medium whitespace-nowrap">
                Paper size:
              </label>
              <select
                value={paperSize}
                onChange={(e) => setPaperSize(e.target.value)}
                className="text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-sm px-2.5 py-1.5 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="80mm">80mm Receipt</option>
                <option value="a4">A4 Full Page</option>
              </select>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handlePrint}
                disabled={isGenerating}
                className="flex items-center gap-1.5 px-4 py-2 rounded-sm border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
              >
                <Printer className="h-3.5 w-3.5" />
                Print
              </button>
              <button
                onClick={handleDownload}
                disabled={isGenerating}
                className="flex items-center gap-1.5 px-4 py-2 rounded-sm bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors disabled:opacity-50 shadow-sm"
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
    </div>,
    document.body,
  );
};

export default ReceiptPDF;
