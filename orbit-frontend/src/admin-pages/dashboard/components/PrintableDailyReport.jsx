import { useRef, useState } from "react";
import {
  Printer,
  Download,
  FileText,
  ChevronDown,
  ChevronUp,
  Loader2,
} from "lucide-react";
import { format } from "date-fns";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// ─── Colour Palette (shared) ──────────────────────────────────────────────────
const BLUE = [37, 99, 235];
const GRAY = [75, 85, 99];
const GREEN = [16, 185, 129];
const RED = [220, 38, 38];
const LIGHT = [245, 247, 255];

// ─── PDF Builder ──────────────────────────────────────────────────────────────
const buildDailySalesPDF = (
  itemsSold,
  totals,
  summary,
  storeLabel,
  selectedDate,
  formatCurrency,
  options,
  storeDetails,
) => {
  const orientation =
    options.paperSize === "80mm" ? "portrait" : options.orientation;
  const format80mm = options.paperSize === "80mm";

  const doc = new jsPDF({
    orientation,
    unit: "mm",
    format: format80mm ? [80, 297] : options.paperSize.toLowerCase(),
  });

  const pw = doc.internal.pageSize.getWidth();
  const ph = doc.internal.pageSize.getHeight();
  const margin = format80mm ? 5 : 20;
  const cw = pw - margin * 2;

  // ── Header bar ────────────────────────────────────────────────────────────
  doc.setFillColor(...BLUE);
  doc.rect(0, 0, pw, 2.5, "F");

  doc.setFillColor(...LIGHT);
  doc.rect(0, 2.5, pw, 38, "F");

  const storeName = storeDetails?.name || "MEGAGAMERS254";

  doc.setFontSize(format80mm ? 14 : 20);
  doc.setFont("times", "bold");
  doc.setTextColor(...BLUE);
  doc.text(storeName, pw / 2, 14, { align: "center" });

  doc.setFontSize(8);
  doc.setFont("times", "italic");
  doc.setTextColor(...GRAY);
  doc.text("Your Ultimate Gaming Destination", pw / 2, 19, { align: "center" });

  if (!format80mm) {
    doc.setFontSize(7.5);
    doc.setFont("times", "normal");

    const contactLine = [
      storeDetails?.address || "Tom Mboya Street, Shamara Mall 3F62, Nairobi",
      storeDetails?.phone || "+254 700 000 000",
      storeDetails?.email || "info@megagamers254.co.ke",
    ].join("  ·  ");

    doc.text(contactLine, pw / 2, 24, { align: "center" });
    doc.text(
      "www.megagamers254.co.ke   ·   PIN: P051234567X   ·   Reg. No: CPR/2023/00001",
      pw / 2,
      29,
      { align: "center" },
    );
  }

  doc.setDrawColor(...BLUE);
  doc.setLineWidth(0.5);
  doc.line(margin, 33, pw - margin, 33);

  doc.setFontSize(13);
  doc.setFont("times", "bold");
  doc.setTextColor(...BLUE);
  doc.text("DAILY SALES REPORT", pw / 2, 40, { align: "center" });

  // ── Report meta row ───────────────────────────────────────────────────────
  let y = 46;

  doc.setFillColor(249, 249, 252);
  doc.roundedRect(margin, y, cw, 22, 3, 3, "F");

  doc.setFontSize(8.5);
  doc.setTextColor(...GRAY);

  doc.setFont("times", "bold");
  doc.text("Store:", margin + 5, y + 7);
  doc.setFont("times", "normal");
  doc.text(storeLabel, margin + 22, y + 7);

  doc.setFont("times", "bold");
  doc.text("Report Date:", margin + 5, y + 14);
  doc.setFont("times", "normal");
  const reportDateStr = format(new Date(selectedDate), "EEEE, MMMM d, yyyy");
  doc.text(reportDateStr, margin + 30, y + 14);

  const reportId = `DS-${format(new Date(), "yyyyMMddHHmm")}`;
  doc.setFont("times", "bold");
  doc.text("Report ID:", pw - margin - 60, y + 7);
  doc.setFont("times", "normal");
  doc.text(reportId, pw - margin - 5, y + 7, { align: "right" });

  doc.setFont("times", "bold");
  doc.text("Generated:", pw - margin - 60, y + 14);
  doc.setFont("times", "normal");
  doc.text(format(new Date(), "MMM d, yyyy h:mm a"), pw - margin - 5, y + 14, {
    align: "right",
  });

  y += 28;

  // ── Summary boxes ─────────────────────────────────────────────────────────
  if (options.includeSummary) {
    const boxes = [
      {
        label: "Total Products",
        value: itemsSold.length.toString(),
        color: BLUE,
      },
      { label: "Items Sold", value: totals.quantity.toString(), color: BLUE },
      {
        label: "Total Revenue",
        value: formatCurrency(totals.revenue),
        color: GREEN,
      },
      ...(options.includeProfit
        ? [
            {
              label: "Total Profit",
              value: formatCurrency(totals.profit),
              color: totals.profit >= 0 ? GREEN : RED,
            },
            {
              label: "Avg. Margin",
              value: `${totals.avgMargin.toFixed(1)}%`,
              color: BLUE,
            },
          ]
        : []),
    ];

    const boxCount = boxes.length;
    const gap = 4;
    const boxW = (cw - gap * (boxCount - 1)) / boxCount;

    boxes.forEach((box, i) => {
      const bx = margin + i * (boxW + gap);

      doc.setDrawColor(...BLUE);
      doc.setLineWidth(0.15);
      doc.roundedRect(bx, y, boxW, 20, 3, 3, "D");

      doc.setFontSize(7);
      doc.setFont("times", "normal");
      doc.setTextColor(...GRAY);
      doc.text(box.label, bx + boxW / 2, y + 7, { align: "center" });

      doc.setFontSize(format80mm ? 9 : 11);
      doc.setFont("times", "bold");
      doc.setTextColor(...box.color);
      doc.text(box.value, bx + boxW / 2, y + 16, { align: "center" });
    });

    y += 26;
  }

  // ── Payment methods strip ─────────────────────────────────────────────────
  const paymentMethods = summary?.paymentMethods || [];
  if (paymentMethods.length > 0) {
    doc.setFontSize(8);
    doc.setFont("times", "bold");
    doc.setTextColor(...GRAY);
    doc.text("PAYMENT BREAKDOWN:", margin, y + 5);

    let px = margin + 42;
    paymentMethods.forEach((pm) => {
      const label = `${(pm.paymentMethod || "Cash").toUpperCase()}: ${formatCurrency(pm.totalAmount || 0)} (${pm.transactionCount || 0} txns)`;
      doc.setFont("times", "normal");
      doc.setTextColor(...BLUE);
      doc.text(label, px, y + 5);
      px += doc.getTextWidth(label) + 10;
    });

    y += 12;
  }

  // ── Items table ───────────────────────────────────────────────────────────
  const headCols = [
    "#",
    "Product",
    "SKU",
    "Qty",
    ...(options.includeCost ? ["Unit Cost"] : []),
    "Unit Price",
    "Revenue",
    ...(options.includeProfit ? ["Profit", "Margin"] : []),
  ];

  const bodyRows = itemsSold.map((item, idx) => [
    idx + 1,
    item.productName +
      (item.category
        ? `\n${item.category.replace("gaming-", "").replace(/-/g, " ")}`
        : ""),
    item.sku || "N/A",
    item.totalQuantitySold || 0,
    ...(options.includeCost
      ? [formatCurrency(item.buyingPrice).replace("KSh ", "")]
      : []),
    formatCurrency(item.sellingPrice).replace("KSh ", ""),
    formatCurrency(item.totalRevenue).replace("KSh ", ""),
    ...(options.includeProfit
      ? [
          formatCurrency(item.totalProfit).replace("KSh ", ""),
          `${parseFloat(item.profitMargin || 0).toFixed(1)}%`,
        ]
      : []),
  ]);

  // Totals footer row
  const totalCols = headCols.length;
  const footerRow = new Array(totalCols).fill("");
  footerRow[0] = "TOTALS";
  footerRow[3] = totals.quantity.toString(); // Qty

  let ci = 4;
  if (options.includeCost) {
    footerRow[ci] = formatCurrency(totals.cost).replace("KSh ", "");
    ci++;
  }
  ci++; // Unit Price — blank
  footerRow[ci] = formatCurrency(totals.revenue).replace("KSh ", "");
  ci++;
  if (options.includeProfit) {
    footerRow[ci] = formatCurrency(totals.profit).replace("KSh ", "");
    ci++;
    footerRow[ci] = `${totals.avgMargin.toFixed(1)}%`;
  }

  // Column widths
  const skuW = format80mm ? 16 : 28;
  const qtyW = 12;
  const moneyW = format80mm ? 18 : 26;
  const marginW = 16;
  const fixedW =
    12 +
    skuW +
    qtyW +
    (options.includeCost ? moneyW : 0) +
    moneyW +
    moneyW +
    (options.includeProfit ? moneyW + marginW : 0);
  const prodW = Math.max(cw * 0.9 - fixedW, 35);

  const colStyles = {
    0: { cellWidth: 12, halign: "center" },
    1: { cellWidth: prodW, halign: "left" },
    2: { cellWidth: skuW, halign: "center" },
    3: { cellWidth: qtyW, halign: "center" },
  };

  let csi = 4;
  if (options.includeCost) {
    colStyles[csi] = { cellWidth: moneyW, halign: "right" };
    csi++;
  }
  colStyles[csi] = { cellWidth: moneyW, halign: "right" };
  csi++;
  colStyles[csi] = { cellWidth: moneyW, halign: "right" };
  csi++;
  if (options.includeProfit) {
    colStyles[csi] = { cellWidth: moneyW, halign: "right" };
    csi++;
    colStyles[csi] = { cellWidth: marginW, halign: "right" };
  }

  const tableWidth = Object.values(colStyles).reduce(
    (s, c) => s + c.cellWidth,
    0,
  );
  const tableStartX = (pw - tableWidth) / 2;

  autoTable(doc, {
    head: [headCols],
    body: bodyRows,
    foot: [footerRow],
    startY: y,
    theme: "striped",
    styles: {
      fontSize: format80mm ? 7 : 8,
      font: "times",
      cellPadding: { top: 3, bottom: 3, left: 3, right: 3 },
      textColor: [50, 50, 50],
      lineColor: [220, 220, 220],
      lineWidth: 0.1,
    },
    headStyles: {
      fillColor: BLUE,
      textColor: 255,
      fontStyle: "bold",
      font: "times",
      halign: "center",
      fontSize: format80mm ? 7 : 8.5,
    },
    footStyles: {
      fillColor: [235, 240, 255],
      textColor: [...BLUE],
      fontStyle: "bold",
      font: "times",
      fontSize: format80mm ? 7 : 8.5,
    },
    alternateRowStyles: { fillColor: [248, 250, 255] },
    columnStyles: colStyles,
    margin: { left: tableStartX, right: pw - tableStartX - tableWidth },
    tableWidth,
    didParseCell(data) {
      // Colour profit cells in body
      if (options.includeProfit && data.section === "body") {
        const profitColIdx = 4 + (options.includeCost ? 1 : 0) + 1 + 1; // after #, prod, sku, qty, [cost], price, rev
        if (data.column.index === profitColIdx) {
          const item = itemsSold[data.row.index];
          if (item) {
            data.cell.styles.textColor =
              (item.totalProfit || 0) >= 0 ? [...GREEN] : [...RED];
          }
        }
      }
      // Footer profit colour
      if (options.includeProfit && data.section === "foot") {
        const profitColIdx = 4 + (options.includeCost ? 1 : 0) + 1 + 1;
        if (data.column.index === profitColIdx) {
          data.cell.styles.textColor =
            totals.profit >= 0 ? [...GREEN] : [...RED];
        }
      }
    },
  });

  y = doc.lastAutoTable.finalY + 10;

  // ── Signature section ─────────────────────────────────────────────────────
  if (!format80mm) {
    const sigY = Math.max(y + 4, ph - 52);

    doc.setDrawColor(210, 210, 210);
    doc.setLineWidth(0.1);
    doc.line(margin, sigY, pw - margin, sigY);

    const colW = (cw - 14) / 2;
    const leftX = margin;
    const rightX = margin + colW + 14;

    // Prepared By
    doc.setFontSize(8);
    doc.setFont("times", "bold");
    doc.setTextColor(...GRAY);
    doc.text("Prepared By:", leftX, sigY + 8);
    doc.setDrawColor(170, 170, 170);
    doc.setLineWidth(0.2);
    doc.line(leftX, sigY + 21, leftX + colW, sigY + 21);
    doc.setFontSize(7);
    doc.setFont("times", "italic");
    doc.setTextColor(160, 160, 160);
    doc.text("Signature & Date", leftX, sigY + 25.5);

    // Authorised By
    doc.setFontSize(8);
    doc.setFont("times", "bold");
    doc.setTextColor(...GRAY);
    doc.text("Authorised By Sally Mwende:", rightX, sigY + 8);
    doc.setDrawColor(170, 170, 170);
    doc.setLineWidth(0.2);
    doc.line(rightX, sigY + 21, rightX + colW, sigY + 21);
    doc.setFontSize(7);
    doc.setFont("times", "italic");
    doc.setTextColor(160, 160, 160);
    doc.text(
      `${storeDetails?.ownerName || "Sally Mwende"}  ·  Owner / Proprietor — ${storeName}`,
      rightX,
      sigY + 25.5,
    );
  }

  // ── Footer ────────────────────────────────────────────────────────────────
  const footerY = ph - 10;

  doc.setFillColor(...BLUE);
  doc.rect(0, footerY - 5, pw, 0.5, "F");

  doc.setFontSize(7.5);
  doc.setFont("times", "bold");
  doc.setTextColor(...BLUE);
  doc.text("END OF DAILY SALES REPORT", pw / 2, footerY, { align: "center" });

  doc.setFontSize(6.5);
  doc.setFont("times", "normal");
  doc.setTextColor(160, 160, 160);
  doc.text(
    `Generated: ${format(new Date(), "MMM d, yyyy h:mm:ss a")}   ·   This is a computer-generated report and does not require a signature.   ·   Confidential — Internal use only.`,
    pw / 2,
    footerY + 5,
    { align: "center" },
  );

  return doc;
};

// ─── Component ────────────────────────────────────────────────────────────────
const PrintDailySales = ({
  itemsSold,
  summary,
  storeLabel,
  selectedDate,
  formatCurrency,
  storeDetails = null,
}) => {
  const printRef = useRef();
  const [isPrintView, setIsPrintView] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [printOptions, setPrintOptions] = useState({
    includeSummary: true,
    includeProfit: true,
    includeCost: true,
    includeStoreInfo: true,
    paperSize: "A4",
    orientation: "portrait",
  });

  // ── Derived totals ──────────────────────────────────────────────────────
  const totals = {
    quantity: itemsSold.reduce((s, i) => s + (i.totalQuantitySold || 0), 0),
    revenue: itemsSold.reduce((s, i) => s + (i.totalRevenue || 0), 0),
    profit: itemsSold.reduce((s, i) => s + (i.totalProfit || 0), 0),
    cost: itemsSold.reduce(
      (s, i) => s + (i.buyingPrice || 0) * (i.totalQuantitySold || 0),
      0,
    ),
    avgMargin:
      itemsSold.reduce((s, i) => s + parseFloat(i.profitMargin || 0), 0) /
      (itemsSold.length || 1),
  };

  const formatReceiptDate = (date) =>
    date ? format(new Date(date), "EEEE, MMMM d, yyyy 'at' h:mm a") : "";

  // ── PDF download ────────────────────────────────────────────────────────
  const handleDownloadPDF = () => {
    setIsGeneratingPDF(true);
    try {
      const doc = buildDailySalesPDF(
        itemsSold,
        totals,
        summary,
        storeLabel,
        selectedDate,
        formatCurrency,
        printOptions,
        storeDetails,
      );
      const slug = storeLabel.replace(/\s+/g, "-");
      const day = format(new Date(selectedDate), "yyyy-MM-dd");
      doc.save(`daily-sales-${slug}-${day}.pdf`);
    } catch (err) {
      console.error("PDF generation error:", err);
      alert("Error generating PDF. Please try again.");
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  // ── Browser print (fallback) ────────────────────────────────────────────
  const handleSimplePrint = () => {
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Daily Sales Report - ${storeLabel}</title>
        <style>
          @page { size: ${printOptions.paperSize} ${printOptions.orientation}; margin: 10mm; }
          body   { font-family: Arial, sans-serif; color: black; background: white; }
          h1, h2 { color: #2563eb; }
          table  { width: 100%; border-collapse: collapse; margin: 16px 0; }
          th, td { border: 1px solid #ddd; padding: 7px 10px; }
          th     { background: #2563eb; color: white; font-weight: bold; }
          tr:nth-child(even) { background: #f8faff; }
          .total-row { background: #ebf0ff; font-weight: bold; color: #2563eb; }
          .summary-grid { display:grid; grid-template-columns: repeat(4,1fr); gap:16px; margin:16px 0; }
          .box   { border:1px solid #2563eb; border-radius:4px; padding:10px; }
          .box small { color:#666; display:block; font-size:11px; }
          .box strong { font-size:20px; }
          footer { border-top:2px solid #2563eb; margin-top:24px; padding-top:12px; font-size:11px; color:#555; }
        </style>
      </head>
      <body>
        <h1>${storeDetails?.name || "DAILY SALES REPORT"}</h1>
        <p><strong>Store:</strong> ${storeLabel} &nbsp;|&nbsp; <strong>Date:</strong> ${formatReceiptDate(selectedDate)}</p>

        ${
          printOptions.includeSummary
            ? `
        <h2>Daily Summary</h2>
        <div class="summary-grid">
          <div class="box"><small>Items Sold</small><strong>${totals.quantity}</strong></div>
          <div class="box"><small>Total Revenue</small><strong>${formatCurrency(totals.revenue)}</strong></div>
          ${
            printOptions.includeProfit
              ? `
          <div class="box"><small>Total Profit</small><strong style="color:${totals.profit >= 0 ? "#10b981" : "#dc2626"}">${formatCurrency(totals.profit)}</strong></div>
          <div class="box"><small>Avg. Margin</small><strong>${totals.avgMargin.toFixed(1)}%</strong></div>`
              : ""
          }
        </div>`
            : ""
        }

        <h2>Products Sold</h2>
        <table>
          <thead>
            <tr>
              <th>#</th><th>Product</th><th>SKU</th><th>Qty</th>
              ${printOptions.includeCost ? "<th>Unit Cost</th>" : ""}
              <th>Unit Price</th><th>Revenue</th>
              ${printOptions.includeProfit ? "<th>Profit</th><th>Margin</th>" : ""}
            </tr>
          </thead>
          <tbody>
            ${itemsSold
              .map(
                (item, i) => `
            <tr>
              <td style="text-align:center">${i + 1}</td>
              <td>${item.productName}</td>
              <td style="font-family:monospace;font-size:11px">${item.sku || "N/A"}</td>
              <td style="text-align:center">${item.totalQuantitySold || 0}</td>
              ${printOptions.includeCost ? `<td style="text-align:right">${formatCurrency(item.buyingPrice)}</td>` : ""}
              <td style="text-align:right">${formatCurrency(item.sellingPrice)}</td>
              <td style="text-align:right;font-weight:bold">${formatCurrency(item.totalRevenue)}</td>
              ${
                printOptions.includeProfit
                  ? `
              <td style="text-align:right;color:${(item.totalProfit || 0) >= 0 ? "#10b981" : "#dc2626"}">${formatCurrency(item.totalProfit)}</td>
              <td style="text-align:right">${parseFloat(item.profitMargin || 0).toFixed(1)}%</td>`
                  : ""
              }
            </tr>`,
              )
              .join("")}
          </tbody>
          <tfoot>
            <tr class="total-row">
              <td colspan="${3 + (printOptions.includeCost ? 1 : 0)}" style="text-align:right">TOTALS</td>
              <td style="text-align:center">${totals.quantity}</td>
              ${printOptions.includeCost ? `<td style="text-align:right">${formatCurrency(totals.cost)}</td>` : ""}
              <td></td>
              <td style="text-align:right">${formatCurrency(totals.revenue)}</td>
              ${
                printOptions.includeProfit
                  ? `
              <td style="text-align:right;color:${totals.profit >= 0 ? "#10b981" : "#dc2626"}">${formatCurrency(totals.profit)}</td>
              <td style="text-align:right">${totals.avgMargin.toFixed(1)}%</td>`
                  : ""
              }
            </tr>
          </tfoot>
        </table>

        <footer>
          <p><strong>END OF DAILY SALES REPORT</strong></p>
          <p>Generated: ${format(new Date(), "MMM d, yyyy h:mm:ss a")}</p>
          <p>This is a computer-generated report. &nbsp;|&nbsp; Confidential — Internal use only.</p>
        </footer>
      </body></html>
    `);
    printWindow.document.close();
    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
    }, 400);
  };

  // ── Text export ─────────────────────────────────────────────────────────
  const handleExportText = () => {
    const lines = [];
    if (printOptions.includeStoreInfo) {
      lines.push(`STORE: ${storeLabel}`);
      lines.push(`DATE:  ${formatReceiptDate(selectedDate)}`);
      lines.push("=".repeat(60));
    }
    if (printOptions.includeSummary) {
      lines.push("DAILY SUMMARY");
      lines.push(
        `Items Sold: ${totals.quantity}   Revenue: ${formatCurrency(totals.revenue)}`,
      );
      if (printOptions.includeProfit)
        lines.push(
          `Profit: ${formatCurrency(totals.profit)}   Avg Margin: ${totals.avgMargin.toFixed(1)}%`,
        );
      lines.push("=".repeat(60));
    }
    lines.push("PRODUCTS SOLD");
    lines.push("─".repeat(80));
    itemsSold.forEach((item, i) => {
      lines.push(
        `${String(i + 1).padEnd(3)} ${item.productName.substring(0, 24).padEnd(24)} ` +
          `Qty:${String(item.totalQuantitySold || 0).padEnd(4)} ` +
          `Rev:${formatCurrency(item.totalRevenue)}` +
          (printOptions.includeProfit
            ? `  Profit:${formatCurrency(item.totalProfit)}  ${parseFloat(item.profitMargin || 0).toFixed(1)}%`
            : ""),
      );
    });
    lines.push("─".repeat(80));
    lines.push(
      `TOTAL: ${totals.quantity} items  |  ${formatCurrency(totals.revenue)} revenue`,
    );
    lines.push(
      `Generated: ${format(new Date(), "MMM d, yyyy h:mm:ss a")}  —  Confidential`,
    );

    const blob = new Blob([lines.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `daily-sales-${storeLabel.replace(/\s+/g, "-")}-${format(new Date(selectedDate), "yyyy-MM-dd")}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const opt = (key) => (e) =>
    setPrintOptions((p) => ({
      ...p,
      [key]: e.target.type === "checkbox" ? e.target.checked : e.target.value,
    }));

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="print-component space-y-4">
      {/* ── Options Panel ─────────────────────────────────────────────────── */}
      <div className="no-print bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-sm p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <Printer className="h-4 w-4 text-gray-700 dark:text-gray-300" />
            Export Options
          </h3>
          <button
            onClick={() => setIsPrintView((v) => !v)}
            className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white flex items-center gap-1"
          >
            {isPrintView ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
            {isPrintView ? "Hide Preview" : "Show Preview"}
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          {[
            { key: "includeSummary", label: "Include Summary" },
            { key: "includeProfit", label: "Include Profit" },
            { key: "includeCost", label: "Include Cost" },
            { key: "includeStoreInfo", label: "Store Info" },
          ].map(({ key, label }) => (
            <label
              key={key}
              className="flex items-center gap-2 text-sm cursor-pointer"
            >
              <input
                type="checkbox"
                checked={printOptions[key]}
                onChange={opt(key)}
                className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 bg-white dark:bg-gray-700"
              />
              <span className="text-gray-700 dark:text-gray-300">{label}</span>
            </label>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
              Paper Size
            </label>
            <select
              value={printOptions.paperSize}
              onChange={opt("paperSize")}
              className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-sm px-3 py-2 text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="A4">A4 (Standard)</option>
              <option value="Letter">Letter (US)</option>
              <option value="80mm">80mm (Receipt)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
              Orientation
            </label>
            <select
              value={printOptions.orientation}
              onChange={opt("orientation")}
              disabled={printOptions.paperSize === "80mm"}
              className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-sm px-3 py-2 text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              <option value="portrait">Portrait</option>
              <option value="landscape">Landscape</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── Action Buttons ───────────────────────────────────────────────── */}
      <div className="no-print flex flex-wrap gap-2">
        <button
          onClick={handleDownloadPDF}
          disabled={isGeneratingPDF}
          className="px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-sm hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-60"
        >
          {isGeneratingPDF ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Download className="h-4 w-4" />
          )}
          {isGeneratingPDF ? "Generating…" : "Download PDF"}
        </button>

        <button
          onClick={handleSimplePrint}
          className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2"
        >
          <Printer className="h-4 w-4" />
          Print
        </button>

        <button
          onClick={handleExportText}
          className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2"
        >
          <FileText className="h-4 w-4" />
          Export as Text
        </button>
      </div>

      {/* ── Live Preview (screen-only) ───────────────────────────────────── */}
      {isPrintView && (
        <div className="no-print">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold text-gray-800 dark:text-white">
              Print Preview
            </h3>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {printOptions.paperSize} · {printOptions.orientation}
            </span>
          </div>

          <div className="border border-gray-300 dark:border-gray-700 rounded-sm bg-gray-50 dark:bg-gray-800/50 p-4 overflow-auto">
            <div
              ref={printRef}
              className="bg-white text-black mx-auto shadow"
              style={{
                fontFamily: "Times New Roman, serif",
                width: printOptions.paperSize === "80mm" ? "302px" : "794px",
                padding: "28px",
                minHeight: "400px",
              }}
            >
              {/* Store header */}
              <div className="border-b-2 border-blue-600 pb-4 mb-4 text-center">
                <h1 className="text-2xl font-bold text-blue-700">
                  {storeDetails?.name || "MEGAGAMERS254"}
                </h1>
                {printOptions.includeStoreInfo && (
                  <>
                    {storeDetails?.address && (
                      <p className="text-sm text-gray-600">
                        {storeDetails.address}
                      </p>
                    )}
                    {storeDetails?.phone && (
                      <p className="text-sm text-gray-600">
                        Tel: {storeDetails.phone}
                      </p>
                    )}
                    {storeDetails?.email && (
                      <p className="text-sm text-gray-600">
                        {storeDetails.email}
                      </p>
                    )}
                  </>
                )}
                <p className="mt-2 text-base font-bold tracking-wide text-blue-700">
                  DAILY SALES REPORT
                </p>
              </div>

              {/* Meta */}
              <div className="grid grid-cols-2 text-sm mb-4">
                <div>
                  <p>
                    <strong>Store:</strong> {storeLabel}
                  </p>
                  <p>
                    <strong>Date:</strong>{" "}
                    {format(new Date(selectedDate), "EEEE, MMMM d, yyyy")}
                  </p>
                </div>
                <div className="text-right">
                  <p>
                    <strong>Report ID:</strong> DS-
                    {format(new Date(), "yyyyMMddHHmm")}
                  </p>
                  <p>
                    <strong>Generated:</strong>{" "}
                    {format(new Date(), "MMM d, yyyy h:mm a")}
                  </p>
                </div>
              </div>

              {/* Summary */}
              {printOptions.includeSummary && (
                <div className="grid grid-cols-4 gap-3 mb-4 text-sm">
                  {[
                    {
                      label: "Items Sold",
                      value: totals.quantity,
                      fmt: (v) => v,
                      color: "text-blue-700",
                    },
                    {
                      label: "Revenue",
                      value: formatCurrency(totals.revenue),
                      fmt: (v) => v,
                      color: "text-green-600",
                    },
                    ...(printOptions.includeProfit
                      ? [
                          {
                            label: "Profit",
                            value: formatCurrency(totals.profit),
                            fmt: (v) => v,
                            color:
                              totals.profit >= 0
                                ? "text-green-600"
                                : "text-red-600",
                          },
                          {
                            label: "Margin",
                            value: `${totals.avgMargin.toFixed(1)}%`,
                            fmt: (v) => v,
                            color: "text-blue-700",
                          },
                        ]
                      : []),
                  ].map(({ label, value, color }) => (
                    <div
                      key={label}
                      className="border border-blue-200 rounded p-2"
                    >
                      <p className="text-gray-500 text-xs">{label}</p>
                      <p className={`font-bold text-lg ${color}`}>{value}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Table */}
              <table className="w-full text-xs border-collapse mb-4">
                <thead>
                  <tr className="bg-blue-600 text-white">
                    <th className="p-2 text-left">#</th>
                    <th className="p-2 text-left">Product</th>
                    <th className="p-2 text-center">SKU</th>
                    <th className="p-2 text-center">Qty</th>
                    {printOptions.includeCost && (
                      <th className="p-2 text-right">Cost</th>
                    )}
                    <th className="p-2 text-right">Price</th>
                    <th className="p-2 text-right">Revenue</th>
                    {printOptions.includeProfit && (
                      <th className="p-2 text-right">Profit</th>
                    )}
                    {printOptions.includeProfit && (
                      <th className="p-2 text-right">Margin</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {itemsSold.map((item, i) => (
                    <tr
                      key={`${item.productId}-${i}`}
                      className={i % 2 === 0 ? "bg-white" : "bg-blue-50"}
                    >
                      <td className="p-2 border border-gray-200">{i + 1}</td>
                      <td className="p-2 border border-gray-200">
                        <div className="font-medium">{item.productName}</div>
                        {item.category && (
                          <div className="text-gray-400 text-[10px]">
                            {item.category
                              .replace("gaming-", "")
                              .replace(/-/g, " ")}
                          </div>
                        )}
                      </td>
                      <td className="p-2 border border-gray-200 text-center font-mono">
                        {item.sku || "N/A"}
                      </td>
                      <td className="p-2 border border-gray-200 text-center">
                        {item.totalQuantitySold || 0}
                      </td>
                      {printOptions.includeCost && (
                        <td className="p-2 border border-gray-200 text-right">
                          {formatCurrency(item.buyingPrice)}
                        </td>
                      )}
                      <td className="p-2 border border-gray-200 text-right">
                        {formatCurrency(item.sellingPrice)}
                      </td>
                      <td className="p-2 border border-gray-200 text-right font-semibold">
                        {formatCurrency(item.totalRevenue)}
                      </td>
                      {printOptions.includeProfit && (
                        <td
                          className={`p-2 border border-gray-200 text-right font-semibold ${(item.totalProfit || 0) >= 0 ? "text-green-600" : "text-red-600"}`}
                        >
                          {formatCurrency(item.totalProfit)}
                        </td>
                      )}
                      {printOptions.includeProfit && (
                        <td className="p-2 border border-gray-200 text-right">
                          {parseFloat(item.profitMargin || 0).toFixed(1)}%
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-blue-100 font-bold text-blue-700">
                    <td
                      colSpan={3 + (printOptions.includeCost ? 1 : 0)}
                      className="p-2 border border-gray-200 text-right"
                    >
                      TOTALS
                    </td>
                    <td className="p-2 border border-gray-200 text-center">
                      {totals.quantity}
                    </td>
                    {printOptions.includeCost && (
                      <td className="p-2 border border-gray-200 text-right">
                        {formatCurrency(totals.cost)}
                      </td>
                    )}
                    <td className="p-2 border border-gray-200"></td>
                    <td className="p-2 border border-gray-200 text-right">
                      {formatCurrency(totals.revenue)}
                    </td>
                    {printOptions.includeProfit && (
                      <td
                        className={`p-2 border border-gray-200 text-right ${totals.profit >= 0 ? "text-green-600" : "text-red-600"}`}
                      >
                        {formatCurrency(totals.profit)}
                      </td>
                    )}
                    {printOptions.includeProfit && (
                      <td className="p-2 border border-gray-200 text-right">
                        {totals.avgMargin.toFixed(1)}%
                      </td>
                    )}
                  </tr>
                </tfoot>
              </table>

              {/* Footer */}
              <div className="border-t-2 border-blue-600 pt-3 text-center text-xs text-gray-500">
                <p className="font-bold text-blue-700">
                  END OF DAILY SALES REPORT
                </p>
                <p className="mt-1">
                  Generated: {format(new Date(), "MMM d, yyyy h:mm:ss a")}
                </p>
                <p className="mt-1">
                  This is a computer-generated report — Confidential, internal
                  use only.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PrintDailySales;
