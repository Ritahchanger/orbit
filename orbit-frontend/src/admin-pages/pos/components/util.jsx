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
export const buildReceiptPDF = (
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
