// utils/pdfGenerator.js
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const generateTransactionPDF = (
  transaction,
  formatCurrency,
  formatDate,
  options = {},
) => {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 25;

  // ─── Company Details ──────────────────────────────────────────────────────────
  const company = {
    name: "MEGAGAMERS254",
    tagline: "Your Ultimate Gaming Destination",
    address: "Tom Mboya Street, Shamara Mall — 3rd Floor, Shop 3F62",
    city: "Nairobi, Kenya",
    phone: "+254 700 000 000",
    phone2: "+254 711 000 000",
    email: "info@megagamers254.co.ke",
    website: "www.megagamers254.co.ke",
    pin: "PIN: P051234567X",
    reg: "Reg. No: CPR/2023/00001",
    owner: "Jane Doe",
  };

  // ─── Colour Palette ───────────────────────────────────────────────────────────
  const blue = [37, 99, 235];
  const gray = [75, 85, 99];
  const green = [16, 185, 129];
  const lightBg = [245, 247, 255];

  // ════════════════════════════════════════════════════════════════════════════
  //  HEADER
  // ════════════════════════════════════════════════════════════════════════════

  doc.setFillColor(...lightBg);
  doc.rect(0, 0, pageWidth, 60, "F");

  doc.setFillColor(...blue);
  doc.rect(0, 0, pageWidth, 2.5, "F");

  doc.setFontSize(26);
  doc.setTextColor(...blue);
  doc.setFont("times", "bold");
  doc.text(company.name, pageWidth / 2, 16, { align: "center" });

  doc.setFontSize(8);
  doc.setTextColor(...gray);
  doc.setFont("times", "italic");
  doc.text(company.tagline, pageWidth / 2, 22, { align: "center" });

  doc.setFont("times", "normal");
  doc.setFontSize(8);
  doc.text(`${company.address}, ${company.city}`, pageWidth / 2, 28, {
    align: "center",
  });
  doc.text(
    `Tel: ${company.phone}  |  ${company.phone2}  |  ${company.email}`,
    pageWidth / 2,
    33,
    { align: "center" },
  );
  doc.text(
    `${company.website}   ·   ${company.pin}   ·   ${company.reg}`,
    pageWidth / 2,
    38,
    { align: "center" },
  );

  doc.setDrawColor(...blue);
  doc.setLineWidth(0.6);
  doc.line(margin, 44, pageWidth - margin, 44);

  doc.setFontSize(11);
  doc.setFont("times", "bold");
  doc.setTextColor(...blue);
  doc.text("OFFICIAL RECEIPT", pageWidth / 2, 53, { align: "center" });

  // ════════════════════════════════════════════════════════════════════════════
  //  TRANSACTION META
  // ════════════════════════════════════════════════════════════════════════════

  let yPos = 67;

  doc.setFillColor(249, 249, 252);
  doc.roundedRect(margin, yPos - 5, pageWidth - margin * 2, 34, 3, 3, "F");

  doc.setFontSize(9);
  doc.setTextColor(...gray);

  // Row 1 — Transaction ID | Date
  doc.setFont("times", "bold");
  doc.text("Transaction ID:", margin + 5, yPos + 2);
  doc.setFont("times", "normal");
  doc.text(
    transaction.transactionId ||
      transaction._id?.slice(-8).toUpperCase() ||
      "N/A",
    margin + 38,
    yPos + 2,
  );
  doc.setFont("times", "bold");
  doc.text("Date & Time:", pageWidth - margin - 60, yPos + 2);
  doc.setFont("times", "normal");
  doc.text(
    formatDate(transaction.createdAt),
    pageWidth - margin - 5,
    yPos + 2,
    { align: "right" },
  );

  yPos += 9;

  // Row 2 — Customer | Phone
  doc.setFont("times", "bold");
  doc.text("Customer:", margin + 5, yPos + 2);
  doc.setFont("times", "normal");
  doc.text(
    transaction.customerName || "Walk-in Customer",
    margin + 38,
    yPos + 2,
  );
  if (transaction.customerPhone) {
    doc.setFont("times", "bold");
    doc.text("Phone:", pageWidth - margin - 60, yPos + 2);
    doc.setFont("times", "normal");
    doc.text(transaction.customerPhone, pageWidth - margin - 5, yPos + 2, {
      align: "right",
    });
  }

  yPos += 9;

  // Row 3 — Store | Payment
  if (transaction.storeId?.name) {
    doc.setFont("times", "bold");
    doc.text("Store:", margin + 5, yPos + 2);
    doc.setFont("times", "normal");
    doc.text(transaction.storeId.name, margin + 38, yPos + 2);
  }
  doc.setFont("times", "bold");
  doc.text("Payment Method:", pageWidth - margin - 65, yPos + 2);
  doc.setFont("times", "normal");
  doc.text(
    transaction.paymentMethod?.toUpperCase() || "CASH",
    pageWidth - margin - 5,
    yPos + 2,
    { align: "right" },
  );

  yPos += 14;

  // M-Pesa receipt ref
  if (transaction.paymentMethod === "mpesa" && transaction.mpesaReceipt) {
    doc.setFont("times", "bold");
    doc.setTextColor(...gray);
    doc.text("M-Pesa Ref:", margin + 5, yPos);
    doc.setFont("times", "normal");
    doc.setTextColor(...green);
    doc.text(transaction.mpesaReceipt, margin + 38, yPos);
    doc.setTextColor(...gray);
    yPos += 8;
  }

  doc.setDrawColor(220, 220, 220);
  doc.setLineWidth(0.1);
  doc.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 5;

  // ════════════════════════════════════════════════════════════════════════════
  //  ITEMS TABLE
  // ════════════════════════════════════════════════════════════════════════════

  const tableWidth = Math.min((pageWidth - margin * 2) * 0.92, 158);
  const tableStartX = (pageWidth - tableWidth) / 2;

  autoTable(doc, {
    head: [["#", "Description", "Unit Price", "Qty", "Total"]],
    body:
      transaction.items?.map((item, i) => [
        i + 1,
        item.productName || item.name || "Product",
        formatCurrency(item.price || item.sellingPrice || 0).replace(
          "KSh ",
          "",
        ),
        item.quantity || 1,
        formatCurrency(
          (item.price || item.sellingPrice || 0) * (item.quantity || 1),
        ).replace("KSh ", ""),
      ]) || [],
    startY: yPos,
    theme: "grid",
    styles: {
      fontSize: 9,
      font: "times",
      cellPadding: { top: 4, bottom: 4, left: 4, right: 4 },
      lineColor: [220, 220, 220],
      lineWidth: 0.1,
      textColor: [50, 50, 50],
    },
    headStyles: {
      fillColor: blue,
      textColor: 255,
      fontStyle: "bold",
      font: "times",
      halign: "center",
      fontSize: 9,
    },
    columnStyles: {
      0: { cellWidth: 12, halign: "center" },
      1: { cellWidth: 70, halign: "left" },
      2: { cellWidth: 28, halign: "right" },
      3: { cellWidth: 18, halign: "center" },
      4: { cellWidth: 30, halign: "right" },
    },
    margin: { left: tableStartX, right: pageWidth - tableStartX - tableWidth },
    tableWidth: tableWidth,
  });

  yPos = doc.lastAutoTable.finalY + 8;

  // ════════════════════════════════════════════════════════════════════════════
  //  PAYMENT SUMMARY BOX
  // ════════════════════════════════════════════════════════════════════════════

  const summaryW = 115;
  const summaryX = (pageWidth - summaryW) / 2;
  const hasDiscount = transaction.discount > 0;
  const hasTax = transaction.tax > 0;
  const extraRows = (hasDiscount ? 1 : 0) + (hasTax ? 1 : 0);
  const summaryH = 22 + extraRows * 10 + 18;

  doc.setDrawColor(...blue);
  doc.setLineWidth(0.25);
  doc.roundedRect(summaryX, yPos, summaryW, summaryH, 3, 3, "D");

  doc.setFillColor(...blue);
  doc.rect(summaryX, yPos, summaryW, 8, "F");
  doc.setFontSize(8);
  doc.setFont("times", "bold");
  doc.setTextColor(255, 255, 255);
  doc.text("PAYMENT SUMMARY", summaryX + summaryW / 2, yPos + 5.5, {
    align: "center",
  });

  const labelX = summaryX + 10;
  const valueX = summaryX + summaryW - 10;
  let sy = yPos + 16;

  doc.setFontSize(9.5);
  doc.setTextColor(...gray);

  doc.setFont("times", "normal");
  doc.text("Subtotal:", labelX, sy);
  doc.text(
    formatCurrency(transaction.subtotal || transaction.total || 0),
    valueX,
    sy,
    { align: "right" },
  );
  sy += 10;

  if (hasDiscount) {
    doc.setTextColor(200, 30, 30);
    doc.text("Discount:", labelX, sy);
    doc.text(`-${formatCurrency(transaction.discount)}`, valueX, sy, {
      align: "right",
    });
    doc.setTextColor(...gray);
    sy += 10;
  }

  if (hasTax) {
    doc.text("Tax (VAT):", labelX, sy);
    doc.text(`+${formatCurrency(transaction.tax)}`, valueX, sy, {
      align: "right",
    });
    sy += 10;
  }

  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.1);
  doc.line(summaryX + 5, sy - 3, summaryX + summaryW - 5, sy - 3);

  doc.setFontSize(12);
  doc.setFont("times", "bold");
  doc.setTextColor(...blue);
  doc.text("TOTAL DUE:", labelX, sy + 6);
  doc.text(formatCurrency(transaction.total || 0), valueX, sy + 6, {
    align: "right",
  });

  yPos = yPos + summaryH + 8;

  // ════════════════════════════════════════════════════════════════════════════
  //  PAYMENT DETAILS
  // ════════════════════════════════════════════════════════════════════════════

  if (transaction.paymentMethod === "cash") {
    const cashW = 115;
    const cashX = (pageWidth - cashW) / 2;

    doc.setDrawColor(...green);
    doc.setLineWidth(0.2);
    doc.roundedRect(cashX, yPos, cashW, 36, 3, 3, "D");

    doc.setFillColor(...green);
    doc.rect(cashX, yPos, cashW, 7, "F");
    doc.setFontSize(7.5);
    doc.setFont("times", "bold");
    doc.setTextColor(255, 255, 255);
    doc.text("CASH PAYMENT DETAILS", cashX + cashW / 2, yPos + 5, {
      align: "center",
    });

    const cLX = cashX + 10;
    const cVX = cashX + cashW - 10;

    doc.setFontSize(9.5);
    doc.setFont("times", "normal");
    doc.setTextColor(...gray);
    doc.text("Amount Tendered:", cLX, yPos + 17);
    doc.text(formatCurrency(transaction.amountGiven || 0), cVX, yPos + 17, {
      align: "right",
    });

    doc.setFont("times", "bold");
    doc.setTextColor(...green);
    doc.text("Change Given:", cLX, yPos + 28);
    doc.text(formatCurrency(transaction.change || 0), cVX, yPos + 28, {
      align: "right",
    });

    yPos += 45;
  }

  if (transaction.paymentMethod === "mpesa") {
    const mpesaW = 130;
    const mpesaX = (pageWidth - mpesaW) / 2;
    const mpesaRows =
      (transaction.mpesaPhone ? 1 : 0) +
      (transaction.mpesaTransactionDate ? 1 : 0) +
      (transaction.mpesaReceipt ? 1 : 0);
    const mpesaH = 14 + mpesaRows * 11;

    doc.setDrawColor(...green);
    doc.setLineWidth(0.2);
    doc.roundedRect(mpesaX, yPos, mpesaW, mpesaH, 3, 3, "D");

    doc.setFillColor(...green);
    doc.rect(mpesaX, yPos, mpesaW, 7, "F");
    doc.setFontSize(7.5);
    doc.setFont("times", "bold");
    doc.setTextColor(255, 255, 255);
    doc.text("M-PESA PAYMENT DETAILS", mpesaX + mpesaW / 2, yPos + 5, {
      align: "center",
    });

    const mLX = mpesaX + 10;
    const mVX = mpesaX + mpesaW - 10;
    let my = yPos + 15;

    doc.setFontSize(9.5);
    doc.setFont("times", "normal");
    doc.setTextColor(...gray);

    if (transaction.mpesaPhone) {
      doc.text("Phone:", mLX, my);
      doc.text(transaction.mpesaPhone, mVX, my, { align: "right" });
      my += 11;
    }
    if (transaction.mpesaTransactionDate) {
      doc.text("Transaction Date:", mLX, my);
      const d = transaction.mpesaTransactionDate;
      const fmtD = `${d.slice(0, 4)}-${d.slice(4, 6)}-${d.slice(6, 8)} ${d.slice(8, 10)}:${d.slice(10, 12)}:${d.slice(12, 14)}`;
      doc.text(fmtD, mVX, my, { align: "right" });
      my += 11;
    }
    if (transaction.mpesaReceipt) {
      doc.setFont("times", "bold");
      doc.text("Receipt No:", mLX, my);
      doc.setTextColor(...green);
      doc.text(transaction.mpesaReceipt, mVX, my, { align: "right" });
    }

    yPos += mpesaH + 8;
  }

  // ════════════════════════════════════════════════════════════════════════════
  //  SIGNATURE SECTION
  // ════════════════════════════════════════════════════════════════════════════

  const sigY = Math.max(yPos + 6, pageHeight - 72);

  doc.setDrawColor(210, 210, 210);
  doc.setLineWidth(0.15);
  doc.line(margin, sigY, pageWidth - margin, sigY);

  const colW = (pageWidth - margin * 2 - 14) / 2;
  const leftX = margin;
  const rightX = margin + colW + 14;

  // ── Left: Authorised Signatory ──
  doc.setFontSize(8);
  doc.setFont("times", "bold");
  doc.setTextColor(...gray);
  doc.text("Authorised Signatory", leftX, sigY + 8);

  doc.setDrawColor(180, 180, 180);
  doc.setLineWidth(0.15);
  doc.roundedRect(leftX, sigY + 11, colW, 24, 3, 3, "D");

  doc.setDrawColor(160, 160, 160);
  doc.setLineWidth(0.25);
  doc.line(leftX + 6, sigY + 27, leftX + colW - 6, sigY + 27);

  doc.setFontSize(7);
  doc.setFont("times", "italic");
  doc.setTextColor(170, 170, 170);
  doc.text("Signature", leftX + 6, sigY + 31);
  doc.text("Date: ____________________", leftX + colW - 6, sigY + 31, {
    align: "right",
  });

  doc.setFontSize(8);
  doc.setFont("times", "bold");
  doc.setTextColor(...gray);
  doc.text(company.owner, leftX, sigY + 41);
  doc.setFontSize(7);
  doc.setFont("times", "normal");
  doc.setTextColor(160, 160, 160);
  doc.text("Owner / Proprietor — MEGAGAMERS254", leftX, sigY + 45.5);

  // ── Right: Customer Acknowledgement ──
  doc.setFontSize(8);
  doc.setFont("times", "bold");
  doc.setTextColor(...gray);
  doc.text("Customer Acknowledgement", rightX, sigY + 8);

  doc.setDrawColor(180, 180, 180);
  doc.setLineWidth(0.15);
  doc.roundedRect(rightX, sigY + 11, colW, 24, 3, 3, "D");

  doc.setDrawColor(160, 160, 160);
  doc.setLineWidth(0.25);
  doc.line(rightX + 6, sigY + 27, rightX + colW - 6, sigY + 27);

  doc.setFontSize(7);
  doc.setFont("times", "italic");
  doc.setTextColor(170, 170, 170);
  doc.text("Signature", rightX + 6, sigY + 31);
  doc.text("Date: ____________________", rightX + colW - 6, sigY + 31, {
    align: "right",
  });

  doc.setFontSize(7.5);
  doc.setFont("times", "normal");
  doc.setTextColor(150, 150, 150);
  doc.text("I confirm receipt of the above items in good", rightX, sigY + 41);
  doc.text("condition and am satisfied with my purchase.", rightX, sigY + 45.5);

  // ════════════════════════════════════════════════════════════════════════════
  //  FOOTER
  // ════════════════════════════════════════════════════════════════════════════

  const footerY = pageHeight - 14;

  doc.setFillColor(...blue);
  doc.rect(0, footerY - 5, pageWidth, 0.6, "F");

  doc.setFontSize(8.5);
  doc.setFont("times", "bold");
  doc.setTextColor(...blue);
  doc.text(
    "Thank you for shopping with MEGAGAMERS254!",
    pageWidth / 2,
    footerY,
    { align: "center" },
  );

  doc.setFontSize(6.5);
  doc.setFont("times", "normal");
  doc.setTextColor(160, 160, 160);
  doc.text(
    `Generated: ${new Date().toLocaleString()}   ·   This is a computer-generated receipt and does not require a stamp.`,
    pageWidth / 2,
    footerY + 6,
    { align: "center" },
  );

  return doc;
};

// ══════════════════════════════════════════════════════════════════════════════
//  MULTIPLE TRANSACTIONS REPORT
// ══════════════════════════════════════════════════════════════════════════════

export const generateMultipleTransactionsPDF = (
  transactions,
  formatCurrency,
  formatDate,
  title = "Transactions Report",
) => {
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;

  const blue = [37, 99, 235];
  const gray = [75, 85, 99];
  const green = [16, 185, 129];

  // ─── Header ───────────────────────────────────────────────────────────────────

  doc.setFillColor(...blue);
  doc.rect(0, 0, pageWidth, 2.5, "F");

  doc.setFillColor(245, 247, 255);
  doc.rect(0, 2.5, pageWidth, 38, "F");

  doc.setFontSize(20);
  doc.setTextColor(...blue);
  doc.setFont("times", "bold");
  doc.text("MEGAGAMERS254", pageWidth / 2, 14, { align: "center" });

  doc.setFontSize(8);
  doc.setFont("times", "italic");
  doc.setTextColor(...gray);
  doc.text("Your Ultimate Gaming Destination", pageWidth / 2, 19, {
    align: "center",
  });

  doc.setFontSize(7.5);
  doc.setFont("times", "normal");
  doc.text(
    "Tom Mboya Street, Shamara Mall 3F62, Nairobi  ·  +254 700 000 000  ·  +254 711 000 000  ·  info@megagamers254.co.ke",
    pageWidth / 2,
    24,
    { align: "center" },
  );
  doc.text(
    "www.megagamers254.co.ke   ·   PIN: P051234567X   ·   Reg. No: CPR/2023/00001",
    pageWidth / 2,
    29,
    { align: "center" },
  );

  doc.setDrawColor(...blue);
  doc.setLineWidth(0.5);
  doc.line(margin, 33, pageWidth - margin, 33);

  doc.setFontSize(13);
  doc.setFont("times", "bold");
  doc.setTextColor(...blue);
  doc.text(title.toUpperCase(), pageWidth / 2, 40, { align: "center" });

  // ─── Summary Boxes ────────────────────────────────────────────────────────────

  const totalRevenue = transactions.reduce((s, t) => s + (t.total || 0), 0);
  const totalProfit = transactions.reduce(
    (s, t) => s + (t.totalProfit || t.profit || 0),
    0,
  );
  const boxW = 52;
  const gap = 8;
  const totalW = boxW * 3 + gap * 2;
  const bx = (pageWidth - totalW) / 2;
  const by = 45;

  const drawBox = (x, label, value, valueColor) => {
    doc.setDrawColor(...blue);
    doc.setLineWidth(0.15);
    doc.roundedRect(x, by, boxW, 20, 3, 3, "D");
    doc.setFontSize(7.5);
    doc.setFont("times", "normal");
    doc.setTextColor(...gray);
    doc.text(label, x + boxW / 2, by + 7, { align: "center" });
    doc.setFontSize(11);
    doc.setFont("times", "bold");
    doc.setTextColor(...valueColor);
    doc.text(value, x + boxW / 2, by + 16, { align: "center" });
  };

  drawBox(bx, "Total Transactions", transactions.length.toString(), blue);
  drawBox(
    bx + boxW + gap,
    "Total Revenue",
    formatCurrency(totalRevenue),
    green,
  );
  drawBox(
    bx + (boxW + gap) * 2,
    "Total Profit",
    formatCurrency(totalProfit),
    blue,
  );

  doc.setFontSize(7);
  doc.setFont("times", "normal");
  doc.setTextColor(160, 160, 160);
  doc.text(
    `Generated: ${new Date().toLocaleString()}`,
    pageWidth - margin,
    by + 20,
    { align: "right" },
  );

  // ─── Table ────────────────────────────────────────────────────────────────────

  const tableWidth = Math.min(contentWidth * 0.97, 260);
  const tableStartX = (pageWidth - tableWidth) / 2;

  autoTable(doc, {
    head: [
      [
        "ID",
        "Date",
        "Customer",
        "Items",
        "Payment",
        "Amount (KSh)",
        "Profit (KSh)",
        "Status",
      ],
    ],
    body: transactions.map((t) => [
      t.transactionId || t._id?.slice(-8) || "N/A",
      formatDate(t.createdAt),
      t.customerName || "Walk-in",
      t.itemsCount || t.items?.length || 0,
      (t.paymentMethod || "Cash").toUpperCase(),
      formatCurrency(t.total || 0).replace("KSh ", ""),
      formatCurrency(t.totalProfit || t.profit || 0).replace("KSh ", ""),
      t.status || "Completed",
    ]),
    startY: 70,
    theme: "striped",
    styles: {
      fontSize: 8,
      font: "times",
      halign: "center",
      cellPadding: 3,
      textColor: [50, 50, 50],
    },
    headStyles: {
      fillColor: blue,
      textColor: 255,
      fontStyle: "bold",
      font: "times",
      halign: "center",
      fontSize: 8.5,
    },
    alternateRowStyles: { fillColor: [248, 250, 255] },
    columnStyles: {
      0: { cellWidth: 38, halign: "center" }, // ID - INCREASED from 28 to 38
      1: { cellWidth: 36, halign: "center" },
      2: { cellWidth: 38, halign: "left" },   // Customer - REDUCED from 48 to 38
      3: { cellWidth: 16, halign: "center" },
      4: { cellWidth: 26, halign: "center" },
      5: { cellWidth: 32, halign: "right" },
      6: { cellWidth: 32, halign: "right" },
      7: { cellWidth: 26, halign: "center" },
    },
    margin: { left: tableStartX, right: pageWidth - tableStartX - tableWidth },
    tableWidth: tableWidth,
  });

  // ─── Signature Section ────────────────────────────────────────────────────────

  const sigY = doc.lastAutoTable.finalY + 8;

  if (sigY + 32 < pageHeight - 18) {
    doc.setDrawColor(210, 210, 210);
    doc.setLineWidth(0.1);
    doc.line(margin, sigY, pageWidth - margin, sigY);

    const sColW = 85;
    const sLeftX = margin;
    const sRightX = pageWidth - margin - sColW;

    // Prepared by
    doc.setFontSize(8);
    doc.setFont("times", "bold");
    doc.setTextColor(...gray);
    doc.text("Prepared By:", sLeftX, sigY + 8);
    doc.setDrawColor(170, 170, 170);
    doc.setLineWidth(0.2);
    doc.line(sLeftX, sigY + 21, sLeftX + sColW, sigY + 21);
    doc.setFontSize(7);
    doc.setFont("times", "italic");
    doc.setTextColor(160, 160, 160);
    doc.text("Signature & Date", sLeftX, sigY + 25.5);

    // Authorised by
    doc.setFontSize(8);
    doc.setFont("times", "bold");
    doc.setTextColor(...gray);
    doc.text("Authorised By (Owner):", sRightX, sigY + 8);
    doc.setDrawColor(170, 170, 170);
    doc.setLineWidth(0.2);
    doc.line(sRightX, sigY + 21, sRightX + sColW, sigY + 21);
    doc.setFontSize(7);
    doc.setFont("times", "italic");
    doc.setTextColor(160, 160, 160);
    doc.text(
      "Jane Doe  ·  Owner / Proprietor — MEGAGAMERS254",
      sRightX,
      sigY + 25.5,
    );
  }

  // ─── Footer ───────────────────────────────────────────────────────────────────

  const footerY = pageHeight - 10;

  doc.setFillColor(...blue);
  doc.rect(0, footerY - 5, pageWidth, 0.5, "F");

  doc.setFontSize(7.5);
  doc.setFont("times", "normal");
  doc.setTextColor(140, 140, 140);
  doc.text(
    "MEGAGAMERS254  ·  Tom Mboya Street, Shamara Mall 3F62  ·  Nairobi, Kenya  ·  www.megagamers254.co.ke",
    pageWidth / 2,
    footerY,
    { align: "center" },
  );

  return doc;
};
