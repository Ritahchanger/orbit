import jsPDF from "jspdf";
import { format } from 'date-fns';
import autoTable from "jspdf-autotable";
// ─── PDF Colour Palette ───────────────────────────────────────────────
const INK = [15, 23, 42];
const ACCENT = [37, 99, 235];
const ACCENT_LIGHT = [219, 234, 254];
const MUTED = [100, 116, 139];
const RULE = [226, 232, 240];
const WHITE = [255, 255, 255];
const GREEN_INK = [22, 163, 74];

export const formatAddressStr = (address) => {
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
// Amount without the currency prefix (Intl gives "Ksh 2,500" with a
// non-breaking space), for table columns whose header names the currency.
const bareAmount = (formatted) => String(formatted).replace(/^[^\d-]+/, "");

const drawReceipt = (doc, transaction, items, storeDetails, formatCurrency, is80) => {
  const pw = doc.internal.pageSize.getWidth();
  const mg = is80 ? 5 : 20;
  const cw = pw - mg * 2;
  const f = (small, large) => (is80 ? small : large);

  const storeName = storeDetails?.name || "Store";
  const storeWebsite = storeDetails?.website || storeDetails?.websiteUrl || "";
  const receiptNo =
    transaction?.transactionId || `TRX-${format(new Date(), "yyyyMMddHHmmss")}`;
  const dateStr = format(
    new Date(transaction?.timestamp || new Date()),
    "dd/MM/yyyy HH:mm",
  );
  const cashier =
    transaction?.soldBy?.name || transaction?.soldBy?.username || "Cashier";

  // ── Header band (height follows the wrapped text) ───────────────
  doc.setFont("helvetica", "bold");
  doc.setFontSize(f(12, 20));
  const nameLines = doc.splitTextToSize(storeName.toUpperCase(), cw);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(f(6.5, 8.5));
  const subParts = [
    storeDetails?.address ? formatAddressStr(storeDetails.address) : null,
    storeDetails?.phone ? `Tel: ${storeDetails.phone}` : null,
  ].filter(Boolean);
  // Narrow roll: address and phone on their own lines so numbers never split
  const subLines = is80
    ? subParts.flatMap((part) => doc.splitTextToSize(part, cw))
    : doc.splitTextToSize(subParts.join("  •  "), cw);
  const nameLH = f(5, 8);
  const subLH = f(3, 4);
  const headerH =
    f(6, 9) + nameLines.length * nameLH + (subLines[0] ? subLines.length * subLH + f(1, 2) : 0) + f(2, 3);
  doc.setFillColor(...ACCENT);
  doc.rect(0, 0, pw, headerH, "F");

  let y = f(9, 14);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(f(12, 20));
  doc.setTextColor(...WHITE);
  nameLines.forEach((line) => {
    doc.text(line, pw / 2, y, { align: "center" });
    y += nameLH;
  });
  if (subLines[0]) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(f(6.5, 8.5));
    doc.setTextColor(...ACCENT_LIGHT);
    y += f(0, 1) - f(1.5, 2);
    subLines.forEach((line) => {
      doc.text(line, pw / 2, y, { align: "center" });
      y += subLH;
    });
  }
  y = headerH + f(6, 9);

  // ── SALES RECEIPT label ─────────────────────────────────────────
  doc.setFont("helvetica", "bold");
  doc.setFontSize(f(8.5, 12));
  doc.setTextColor(...MUTED);
  doc.text("SALES RECEIPT", pw / 2, y, { align: "center" });
  const labelW = doc.getTextWidth("SALES RECEIPT");
  doc.setDrawColor(...RULE);
  doc.setLineWidth(0.3);
  doc.line(mg, y - 1.2, pw / 2 - labelW / 2 - 2, y - 1.2);
  doc.line(pw / 2 + labelW / 2 + 2, y - 1.2, pw - mg, y - 1.2);
  y += f(5, 8);

  // ── Details: one column on 80mm, two on A4 ──────────────────────
  const meta = [
    ["Receipt #", receiptNo],
    ["Date", dateStr],
    ["Cashier", cashier],
    ...(transaction?.customerName ? [["Customer", transaction.customerName]] : []),
    ...(transaction?.customerPhone ? [["Phone", transaction.customerPhone]] : []),
  ];
  const cols = is80 ? 1 : 2;
  const colW = cw / cols;
  const labelCol = f(15, 22);
  const lineH = f(4, 5.5);
  const rows = Math.ceil(meta.length / cols);
  const boxPad = f(3, 4);
  const boxH = rows * lineH + boxPad * 2 - f(1, 1.5);
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(...RULE);
  doc.roundedRect(mg, y, cw, boxH, 1.5, 1.5, "FD");
  doc.setFontSize(f(6.5, 8.5));
  meta.forEach(([label, value], i) => {
    const x = mg + boxPad + (i % cols) * colW;
    const ry = y + boxPad + f(1.5, 2) + Math.floor(i / cols) * lineH;
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...MUTED);
    doc.text(label, x, ry);
    doc.setFont("helvetica", label === "Receipt #" ? "bold" : "normal");
    doc.setTextColor(...INK);
    const maxW = colW - labelCol - boxPad * 2;
    const [fit] = doc.splitTextToSize(String(value || ""), maxW);
    doc.text(fit || "", x + labelCol, ry);
  });
  y += boxH + f(4, 7);

  // ── Items table (widths add up to the content width) ────────────
  const price = (i) => i.unitPrice || i.product?.price || 0;
  const subtotal = items.reduce((s, i) => s + price(i) * i.quantity, 0);
  const discount = transaction?.discount || 0;
  const total = Math.max(0, subtotal - discount);
  const widths = is80 ? [cw - 36, 8, 14, 14] : [cw - 84, 18, 33, 33];

  autoTable(doc, {
    head: [
      [
        "ITEM",
        { content: "QTY", styles: { halign: "center" } },
        { content: "PRICE", styles: { halign: "right" } },
        { content: "AMOUNT", styles: { halign: "right" } },
      ],
    ],
    body: items.map((item) => [
      item.product?.name || item.name || "Item",
      String(item.quantity),
      bareAmount(formatCurrency(price(item))),
      bareAmount(formatCurrency(price(item) * item.quantity)),
    ]),
    startY: y,
    theme: "plain",
    styles: {
      fontSize: f(6.5, 9),
      font: "helvetica",
      cellPadding: { top: f(1.6, 3), bottom: f(1.6, 3), left: f(1, 2), right: f(1, 2) },
      textColor: INK,
      overflow: "linebreak",
    },
    headStyles: {
      fillColor: ACCENT,
      textColor: WHITE,
      fontStyle: "bold",
      fontSize: f(6, 8),
    },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    columnStyles: {
      0: { cellWidth: widths[0], halign: "left" },
      1: { cellWidth: widths[1], halign: "center" },
      2: { cellWidth: widths[2], halign: "right" },
      3: { cellWidth: widths[3], halign: "right", fontStyle: "bold" },
    },
    margin: { left: mg, right: mg },
  });
  y = doc.lastAutoTable.finalY + f(4, 6);

  // ── Totals (right-aligned block) ────────────────────────────────
  const totalsW = is80 ? cw : 80;
  const totalsX = pw - mg - totalsW;
  const line = (label, value, color = INK) => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(f(7, 9));
    doc.setTextColor(...MUTED);
    doc.text(label, totalsX, y);
    doc.setTextColor(...color);
    doc.text(value, totalsX + totalsW, y, { align: "right" });
    y += f(4, 5.5);
  };
  line("Subtotal", formatCurrency(subtotal));
  if (discount > 0) line("Discount", `- ${formatCurrency(discount)}`, [220, 38, 38]);

  const barH = f(7, 9);
  doc.setFillColor(...ACCENT);
  doc.roundedRect(totalsX - 1, y - f(1, 1.5), totalsW + 2, barH, 1, 1, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(f(8.5, 11));
  doc.setTextColor(...WHITE);
  const ty = y - f(1, 1.5) + barH / 2 + f(1.1, 1.4);
  doc.text("TOTAL", totalsX + 1.5, ty);
  doc.text(formatCurrency(total), totalsX + totalsW - 1.5, ty, { align: "right" });
  y += barH + f(4, 6);

  // ── Payment ─────────────────────────────────────────────────────
  const method = (transaction?.paymentMethod || "cash").toUpperCase();
  const paymentRows = [["Paid by", method]];
  if (transaction?.paymentMethod === "cash" && transaction?.cashPayment) {
    paymentRows.push(["Amount given", formatCurrency(transaction.cashPayment.amountGiven)]);
    paymentRows.push(["Change", formatCurrency(transaction.cashPayment.change), GREEN_INK]);
  }
  if (transaction?.paymentMethod === "mpesa" && transaction?.mpesaPayment) {
    paymentRows.push(["M-Pesa ref", transaction.mpesaPayment.transactionCode || "N/A"]);
    const phone = transaction.mpesaPayment.phoneNumber || transaction.customerPhone;
    if (phone) paymentRows.push(["Phone", phone]);
  }
  doc.setDrawColor(...RULE);
  doc.setLineWidth(0.3);
  doc.line(mg, y - f(2, 3), pw - mg, y - f(2, 3));
  y += f(1, 1.5);
  paymentRows.forEach(([label, value, color]) => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(f(7, 9));
    doc.setTextColor(...MUTED);
    doc.text(label, mg, y);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...(color || INK));
    doc.text(String(value), pw - mg, y, { align: "right" });
    y += f(4, 5.5);
  });

  // ── Footer ───────────────────────────────────────────────────────
  y += f(1, 2);
  doc.line(mg, y, pw - mg, y);
  y += f(5, 7);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(f(7.5, 10));
  doc.setTextColor(...ACCENT);
  doc.text("Thank you for your purchase!", pw / 2, y, { align: "center" });
  y += f(3.5, 5);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(f(5.5, 7.5));
  doc.setTextColor(...MUTED);
  doc.text("Keep this receipt for returns and warranty claims.", pw / 2, y, { align: "center" });
  y += f(3, 4.5);
  doc.text(`Printed ${format(new Date(), "dd/MM/yyyy HH:mm")}`, pw / 2, y, { align: "center" });
  if (storeWebsite) {
    y += f(3, 4.5);
    doc.setTextColor(...ACCENT);
    doc.text(storeWebsite, pw / 2, y, { align: "center" });
  }
  return y + f(5, 10);
};

export const buildReceiptPDF = (
  transaction,
  items,
  storeDetails,
  formatCurrency,
  options = { paperSize: "80mm" },
) => {
  const is80 = options.paperSize === "80mm";
  const args = [transaction, items || [], storeDetails, formatCurrency, is80];

  if (!is80) {
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    drawReceipt(doc, ...args);
    return doc;
  }

  // Thermal roll: measure on a tall page, then draw on a page cut to fit,
  // so there is no long blank tail.
  const probe = new jsPDF({ unit: "mm", format: [80, 2000] });
  const height = Math.ceil(drawReceipt(probe, ...args));
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: [80, Math.max(height, 100)] });
  drawReceipt(doc, ...args);
  const ph = doc.internal.pageSize.getHeight();
  doc.setFillColor(...ACCENT);
  doc.rect(0, ph - 2, 80, 2, "F");
  return doc;
};
