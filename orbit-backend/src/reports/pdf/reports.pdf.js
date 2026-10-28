const path = require("path");
const fs = require("fs");
const PDFDocument = require("pdfkit");

/**
 * Vector PDF reports built with PDFKit.
 *
 * Every builder receives (doc, data, ctx) where ctx carries the business name,
 * currency, scope (store / period) and formatting helpers. Layout is A4
 * landscape: masthead → KPI cards → charts drawn as shapes → paginated tables
 * (header row repeated on every page) → "Page x of y" footers.
 */

const FONT_DIR = path.join(__dirname, "..", "..", "assets", "fonts");
const FONTS = {
  body: path.join(FONT_DIR, "NotoSans-Regular.ttf"),
  bold: path.join(FONT_DIR, "NotoSans-Bold.ttf"),
};

const C = {
  brand: "#1E3A8A",
  ink: "#111827",
  muted: "#6B7280",
  line: "#E5E7EB",
  stripe: "#F9FAFB",
  card: "#F3F4F6",
  blue: "#2563EB",
  green: "#16A34A",
  purple: "#9333EA",
  orange: "#EA580C",
  red: "#DC2626",
  amber: "#D97706",
  teal: "#0D9488",
};

const MARGIN = 36;
const MASTHEAD_H = 64;
const FOOTER_SPACE = 40;

const STATUS_COLORS = {
  "In Stock": C.green,
  "Low Stock": C.amber,
  "Out of Stock": C.red,
  active: C.green,
  inactive: C.muted,
  maintenance: C.amber,
  closed: C.red,
};

// ───────────────────────── formatting ─────────────────────────

function makeFormatters(currency = "KES") {
  let money;
  try {
    money = new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    });
  } catch {
    money = new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
      maximumFractionDigits: 0,
    });
  }
  const num = new Intl.NumberFormat("en-KE", { maximumFractionDigits: 0 });
  return {
    money: (v) => money.format(Number(v) || 0),
    num: (v) => num.format(Number(v) || 0),
    pct: (v) => `${(Number(v) || 0).toFixed(1)}%`,
    date: (v) =>
      v
        ? new Date(v).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })
        : "—",
    dateTime: (v) =>
      v
        ? new Date(v).toLocaleString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })
        : "—",
  };
}

const isHex = (v) => typeof v === "string" && /^#[0-9a-f]{6}$/i.test(v);

// ───────────────────────── primitives ─────────────────────────

const contentWidth = (doc) => doc.page.width - MARGIN * 2;
const pageBottom = (doc) => doc.page.height - FOOTER_SPACE;

function truncate(doc, text, width) {
  const s = String(text ?? "");
  if (doc.widthOfString(s) <= width) return s;
  let lo = 0;
  let hi = s.length;
  while (lo < hi) {
    const mid = Math.ceil((lo + hi) / 2);
    if (doc.widthOfString(s.slice(0, mid) + "…") <= width) lo = mid;
    else hi = mid - 1;
  }
  return s.slice(0, lo) + "…";
}

function put(doc, text, x, y, opts = {}) {
  const { font = "Body", size = 9, color = C.ink, width, align = "left" } = opts;
  doc.font(font).fontSize(size).fillColor(color);
  const str = width ? truncate(doc, text, width) : String(text ?? "");
  doc.text(str, x, y, {
    width,
    align: width ? align : undefined,
    lineBreak: false,
  });
}

function masthead(doc, ctx, compact = false) {
  const h = compact ? 36 : MASTHEAD_H;
  doc.rect(0, 0, doc.page.width, h).fill(ctx.brand);
  if (compact) {
    put(doc, `${ctx.businessName} · ${ctx.title}`, MARGIN, 12, {
      font: "Bold",
      size: 10,
      color: "#FFFFFF",
    });
    return h + 16;
  }
  put(doc, ctx.businessName.toUpperCase(), MARGIN, 12, {
    font: "Bold",
    size: 8,
    color: "#C7D2FE",
  });
  put(doc, ctx.title, MARGIN, 23, { font: "Bold", size: 18, color: "#FFFFFF" });
  put(doc, ctx.scopeLine, MARGIN, 46, { size: 8.5, color: "#E0E7FF" });
  return h + 20;
}

function newPage(doc, ctx) {
  doc.addPage();
  return masthead(doc, ctx, true);
}

function ensureSpace(doc, ctx, y, needed) {
  return y + needed > pageBottom(doc) ? newPage(doc, ctx) : y;
}

function sectionTitle(doc, title, x, y, subtitle) {
  put(doc, title, x, y, { font: "Bold", size: 11.5 });
  if (subtitle) {
    doc.font("Bold").fontSize(11.5);
    const tw = doc.widthOfString(title);
    put(doc, subtitle, x + tw + 8, y + 2.5, { size: 8, color: C.muted });
  }
  return y + 20;
}

/** KPI cards; wraps at 4 per row. items: [{label, value, hint?, color}] */
function cards(doc, ctx, items, y) {
  const perRow = Math.min(4, items.length);
  const gap = 10;
  const h = 58;
  const w = (contentWidth(doc) - gap * (perRow - 1)) / perRow;
  for (let i = 0; i < items.length; i += perRow) {
    y = ensureSpace(doc, ctx, y, h + gap);
    items.slice(i, i + perRow).forEach((card, j) => {
      const x = MARGIN + j * (w + gap);
      doc.rect(x, y, w, h).fill(C.card);
      doc.rect(x, y, 3.5, h).fill(card.color || ctx.brand);
      put(doc, card.label.toUpperCase(), x + 12, y + 9, {
        font: "Bold",
        size: 7,
        color: C.muted,
        width: w - 20,
      });
      put(doc, card.value, x + 12, y + 21, {
        font: "Bold",
        size: 16,
        width: w - 20,
      });
      if (card.hint) {
        put(doc, card.hint, x + 12, y + 42, {
          size: 7.5,
          color: C.muted,
          width: w - 20,
        });
      }
    });
    y += h + gap;
  }
  return y + 6;
}

/** Horizontal bar chart. rows: [{label, value}] → returns bottom y. */
function barChart(doc, { title, subtitle, rows, x, y, width, fmt, color }) {
  y = sectionTitle(doc, title, x, y, subtitle);
  if (!rows.length) {
    put(doc, "No data for this period.", x, y, { size: 8.5, color: C.muted });
    return y + 18;
  }
  const max = Math.max(1, ...rows.map((r) => Number(r.value) || 0));
  const labelW = Math.min(130, width * 0.34);
  const valueW = 70;
  const barMax = width - labelW - valueW - 8;
  const barH = 12;
  rows.forEach((r, i) => {
    const ry = y + i * (barH + 6);
    put(doc, r.label, x, ry + 1.5, { size: 8, width: labelW - 8 });
    doc.rect(x + labelW, ry, barMax, barH).fill(C.stripe);
    const bw = Math.max(1, barMax * ((Number(r.value) || 0) / max));
    doc.rect(x + labelW, ry, bw, barH).fill(r.color || color || C.blue);
    put(doc, fmt(r.value), x + labelW + barMax + 6, ry + 1.5, {
      size: 8,
      color: C.muted,
      width: valueW,
    });
  });
  return y + rows.length * (barH + 6) + 8;
}

/** Vertical column chart for time series. points: [{label, value}] */
function columnChart(doc, { title, subtitle, points, x, y, width, height = 140, fmt, color }) {
  y = sectionTitle(doc, title, x, y, subtitle);
  if (!points.length) {
    put(doc, "No data for this period.", x, y, { size: 8.5, color: C.muted });
    return y + 18;
  }
  const axisW = 62;
  const plotX = x + axisW;
  const plotW = width - axisW;
  const max = Math.max(1, ...points.map((p) => Number(p.value) || 0));

  // gridlines + y-axis labels
  for (let i = 0; i <= 4; i++) {
    const gy = y + height - (height * i) / 4;
    doc
      .moveTo(plotX, gy)
      .lineTo(plotX + plotW, gy)
      .lineWidth(0.5)
      .strokeColor(C.line)
      .stroke();
    put(doc, fmt((max * i) / 4), x, gy - 4, {
      size: 6.5,
      color: C.muted,
      width: axisW - 6,
      align: "right",
    });
  }

  const slot = plotW / points.length;
  const bw = Math.max(1.5, Math.min(26, slot * 0.7));
  const labelEvery = Math.ceil(points.length / Math.floor(plotW / 48));
  points.forEach((p, i) => {
    const bh = height * ((Number(p.value) || 0) / max);
    const bx = plotX + i * slot + (slot - bw) / 2;
    if (bh > 0) doc.rect(bx, y + height - bh, bw, bh).fill(color || C.blue);
    if (i % labelEvery === 0) {
      put(doc, p.label, plotX + i * slot - 10, y + height + 4, {
        size: 6.5,
        color: C.muted,
        width: slot * labelEvery + 20 > 70 ? 70 : slot * labelEvery + 20,
      });
    }
  });
  return y + height + 22;
}

/**
 * Paginated table. columns: [{header, w (relative), align, value(row), color?(row)}]
 * Header row repeats on every page; optional totals row at the end.
 */
function table(doc, ctx, { title, subtitle, columns, rows, y, totals, emptyText }) {
  const x = MARGIN;
  const w = contentWidth(doc);
  const rowH = 17;
  const totalWeight = columns.reduce((s, c) => s + (c.w || 1), 0);
  const widths = columns.map((c) => (w * (c.w || 1)) / totalWeight);
  const xs = widths.map((_, i) => x + widths.slice(0, i).reduce((a, b) => a + b, 0));

  const header = (hy) => {
    doc.rect(x, hy, w, rowH + 2).fill(ctx.brand);
    columns.forEach((c, i) =>
      put(doc, c.header, xs[i] + 6, hy + 5, {
        font: "Bold",
        size: 7.5,
        color: "#FFFFFF",
        width: widths[i] - 12,
        align: c.align || "left",
      }),
    );
    return hy + rowH + 2;
  };

  y = ensureSpace(doc, ctx, y, 20 + rowH * 3);
  y = sectionTitle(doc, title, x, y, subtitle);
  y = header(y);

  if (!rows.length) {
    put(doc, emptyText || "No records found.", x + 6, y + 6, {
      size: 8.5,
      color: C.muted,
    });
    return y + rowH + 16;
  }

  rows.forEach((row, n) => {
    if (y + rowH > pageBottom(doc)) {
      y = newPage(doc, ctx);
      put(doc, `${title} (continued)`, x, y, { font: "Bold", size: 9, color: C.muted });
      y = header(y + 16);
    }
    if (n % 2) doc.rect(x, y, w, rowH).fill(C.stripe);
    columns.forEach((c, i) =>
      put(doc, c.value(row), xs[i] + 6, y + 4.5, {
        size: 8,
        color: c.color ? c.color(row) || C.ink : C.ink,
        font: c.bold ? "Bold" : "Body",
        width: widths[i] - 12,
        align: c.align || "left",
      }),
    );
    y += rowH;
  });

  if (totals) {
    if (y + rowH > pageBottom(doc)) y = header(newPage(doc, ctx));
    doc
      .moveTo(x, y)
      .lineTo(x + w, y)
      .lineWidth(1)
      .strokeColor(C.ink)
      .stroke();
    columns.forEach((c, i) => {
      if (totals[i] == null) return;
      put(doc, totals[i], xs[i] + 6, y + 4.5, {
        font: "Bold",
        size: 8,
        width: widths[i] - 12,
        align: c.align || "left",
      });
    });
    y += rowH;
  }
  return y + 16;
}

function footers(doc, ctx) {
  const { start, count } = doc.bufferedPageRange();
  for (let i = start; i < start + count; i++) {
    doc.switchToPage(i);
    // Footer sits inside the bottom margin; drop it so PDFKit doesn't auto-paginate.
    const prevBottom = doc.page.margins.bottom;
    doc.page.margins.bottom = 0;
    const fy = doc.page.height - 26;
    doc
      .moveTo(MARGIN, fy - 6)
      .lineTo(doc.page.width - MARGIN, fy - 6)
      .lineWidth(0.5)
      .strokeColor(C.line)
      .stroke();
    put(doc, `${ctx.businessName} · ${ctx.title} · Generated ${ctx.fmt.dateTime(new Date())}`, MARGIN, fy, {
      size: 7,
      color: C.muted,
      width: contentWidth(doc) - 80,
    });
    put(doc, `Page ${i + 1} of ${count}`, MARGIN, fy, {
      size: 7,
      color: C.muted,
      width: contentWidth(doc),
      align: "right",
    });
    doc.page.margins.bottom = prevBottom;
  }
}

/** Two charts side by side; returns the lower bottom y. */
function sideBySide(doc, ctx, y, height, left, right) {
  y = ensureSpace(doc, ctx, y, height);
  const gap = 28;
  const half = (contentWidth(doc) - gap) / 2;
  const a = left(MARGIN, y, half);
  const b = right(MARGIN + half + gap, y, half);
  return Math.max(a, b) + 6;
}

// ───────────────────────── report builders ─────────────────────────

const storeName = (s) => s?.storeId?.name || s?.store?.name || "—";

function buildDashboard(doc, d, ctx) {
  const { fmt } = ctx;
  const s = d.salesSummary || {};
  const o = d.overview || {};
  const a = d.inventoryAlerts || {};
  let y = masthead(doc, ctx);

  y = cards(doc, ctx, [
    { label: "Revenue today", value: fmt.money(s.today?.revenue), hint: `${fmt.num(s.today?.count)} sales · ${fmt.money(s.today?.profit)} profit`, color: C.blue },
    { label: "Revenue this month", value: fmt.money(s.thisMonth?.revenue), hint: `${fmt.num(s.thisMonth?.count)} sales · ${fmt.money(s.thisMonth?.profit)} profit`, color: C.green },
    { label: "Revenue this year", value: fmt.money(s.thisYear?.revenue), hint: `${fmt.num(s.thisYear?.count)} sales · ${fmt.money(s.thisYear?.profit)} profit`, color: C.purple },
    { label: "Inventory value", value: fmt.money(o.inventoryValue), hint: `${fmt.num(o.totalItemsInInventory)} units on hand`, color: C.teal },
    { label: "Active stores", value: fmt.num(o.totalStores), color: C.orange },
    { label: "Products", value: fmt.num(o.totalProducts), color: C.blue },
    { label: "Low stock", value: fmt.num(a.lowStockCount), hint: "store/product lines", color: C.amber },
    { label: "Out of stock", value: fmt.num(a.outOfStockCount), hint: "store/product lines", color: C.red },
  ], y);

  const top = (d.topProducts || []).slice(0, 8);
  y = sideBySide(doc, ctx, y, 190,
    (x, yy, w) => barChart(doc, { title: "Top products this month", subtitle: "by revenue", rows: [...top].sort((p, q) => q.totalRevenue - p.totalRevenue).map((p) => ({ label: p.productName, value: p.totalRevenue })), x, y: yy, width: w, fmt: fmt.money, color: C.green }),
    (x, yy, w) => barChart(doc, { title: "Top products this month", subtitle: "by units sold", rows: top.map((p) => ({ label: p.productName, value: p.totalQuantity })), x, y: yy, width: w, fmt: fmt.num, color: C.blue }),
  );

  y = table(doc, ctx, {
    title: "Low stock alerts",
    y,
    columns: [
      { header: "Product", w: 3, value: (r) => r.product?.name || "—" },
      { header: "SKU", w: 1.5, value: (r) => r.product?.sku || "—" },
      { header: "Store", w: 2, value: (r) => r.store?.name || "—" },
      { header: "In stock", w: 1, align: "right", value: (r) => fmt.num(r.currentStock), color: () => C.amber, bold: true },
      { header: "Min. level", w: 1, align: "right", value: (r) => fmt.num(r.minStock) },
    ],
    rows: a.lowStockProducts || [],
    emptyText: "No low-stock items.",
  });

  table(doc, ctx, {
    title: "Recent sales",
    y,
    columns: [
      { header: "Date", w: 1.6, value: (r) => fmt.dateTime(r.saleDate) },
      { header: "Product", w: 3, value: (r) => r.productName },
      { header: "Store", w: 1.8, value: storeName },
      { header: "Customer", w: 1.8, value: (r) => r.customerName || "Walk-in" },
      { header: "Payment", w: 1.2, value: (r) => r.paymentMethod || "—" },
      { header: "Qty", w: 0.7, align: "right", value: (r) => fmt.num(r.quantity) },
      { header: "Total", w: 1.3, align: "right", value: (r) => fmt.money(r.total) },
    ],
    rows: d.recentSales || [],
  });
}

function buildSales(doc, d, ctx) {
  const { fmt } = ctx;
  const s = d.summary || {};
  let y = masthead(doc, ctx);

  y = cards(doc, ctx, [
    { label: "Total revenue", value: fmt.money(s.totalSales), color: C.blue },
    { label: "Gross profit", value: fmt.money(s.totalProfit), hint: s.totalSales ? `${fmt.pct((s.totalProfit / s.totalSales) * 100)} margin` : undefined, color: C.green },
    { label: "Transactions", value: fmt.num(s.totalTransactions), hint: `${fmt.num(s.totalItemsSold)} items sold`, color: C.purple },
    { label: "Average sale", value: fmt.money(s.averageSaleValue), hint: `Largest ${fmt.money(s.maxSale)}`, color: C.orange },
  ], y);

  y = ensureSpace(doc, ctx, y, 190);
  y = columnChart(doc, {
    title: "Revenue trend",
    subtitle: "daily",
    points: (d.trend || []).map((t) => ({ label: t._id, value: t.totalSales })),
    x: MARGIN,
    y,
    width: contentWidth(doc),
    fmt: fmt.money,
    color: C.blue,
  });

  y = sideBySide(doc, ctx, y, 150,
    (x, yy, w) => barChart(doc, { title: "Revenue by payment method", rows: (d.paymentMethods || []).map((p) => ({ label: p._id || "Unknown", value: p.amount })), x, y: yy, width: w, fmt: fmt.money, color: C.purple }),
    (x, yy, w) => barChart(doc, { title: "Revenue by store", rows: (d.byStore || []).slice(0, 8).map((p) => ({ label: p.storeName, value: p.totalSales })), x, y: yy, width: w, fmt: fmt.money, color: C.orange }),
  );

  const sales = d.sales || [];
  const truncated = d.pagination?.totalCount > sales.length;
  table(doc, ctx, {
    title: "Transactions",
    subtitle: truncated
      ? `showing latest ${fmt.num(sales.length)} of ${fmt.num(d.pagination.totalCount)}`
      : `${fmt.num(sales.length)} records`,
    y,
    columns: [
      { header: "Date", w: 1.6, value: (r) => fmt.dateTime(r.saleDate) },
      { header: "Product", w: 2.8, value: (r) => r.productName },
      { header: "SKU", w: 1.2, value: (r) => r.sku },
      { header: "Store", w: 1.6, value: storeName },
      { header: "Customer", w: 1.6, value: (r) => r.customerName || "Walk-in" },
      { header: "Payment", w: 1.1, value: (r) => r.paymentMethod || "—" },
      { header: "Qty", w: 0.6, align: "right", value: (r) => fmt.num(r.quantity) },
      { header: "Total", w: 1.2, align: "right", value: (r) => fmt.money(r.total) },
      { header: "Profit", w: 1.2, align: "right", value: (r) => fmt.money(r.profit), color: (r) => (r.profit < 0 ? C.red : null) },
    ],
    rows: sales,
    totals: truncated
      ? null
      : ["Total", null, null, null, null, null, fmt.num(s.totalItemsSold), fmt.money(s.totalSales), fmt.money(s.totalProfit)],
  });
}

function buildInventory(doc, d, ctx) {
  const { fmt } = ctx;
  const s = d.summary || {};
  const rows = d.inventory || [];
  let y = masthead(doc, ctx);

  y = cards(doc, ctx, [
    { label: "Units on hand", value: fmt.num(s.totalItems), hint: `${fmt.num(s.uniqueProductCount)} distinct products`, color: C.blue },
    { label: "Retail value", value: fmt.money(s.totalValue), color: C.green },
    { label: "Cost value", value: fmt.money(s.totalCostValue), color: C.purple },
    { label: "Potential profit", value: fmt.money(s.potentialProfit), hint: `${fmt.pct(s.profitMargin)} markup on cost`, color: C.teal },
    { label: "Low stock lines", value: fmt.num(s.lowStockCount), color: C.amber },
    { label: "Out of stock lines", value: fmt.num(s.outOfStockCount), color: C.red },
  ], y);

  const byStore = {};
  const byCategory = {};
  const byStatus = { "In Stock": 0, "Low Stock": 0, "Out of Stock": 0 };
  rows.forEach((r) => {
    const value = (r.stock || 0) * (r.product?.price || 0);
    const sn = r.store?.name || "—";
    const cat = r.product?.category || "Uncategorised";
    byStore[sn] = (byStore[sn] || 0) + value;
    byCategory[cat] = (byCategory[cat] || 0) + value;
    if (r.status in byStatus) byStatus[r.status] += 1;
  });
  const top = (obj, n = 8) =>
    Object.entries(obj)
      .sort((a, b) => b[1] - a[1])
      .slice(0, n)
      .map(([label, value]) => ({ label, value }));

  y = sideBySide(doc, ctx, y, 190,
    (x, yy, w) => barChart(doc, { title: "Stock value by store", rows: top(byStore), x, y: yy, width: w, fmt: fmt.money, color: C.blue }),
    (x, yy, w) => barChart(doc, { title: "Stock value by category", rows: top(byCategory), x, y: yy, width: w, fmt: fmt.money, color: C.purple }),
  );
  y = barChart(doc, {
    title: "Stock health",
    subtitle: "store/product lines",
    rows: Object.entries(byStatus).map(([label, value]) => ({ label, value, color: STATUS_COLORS[label] })),
    x: MARGIN,
    y: ensureSpace(doc, ctx, y, 90),
    width: contentWidth(doc) / 2,
    fmt: fmt.num,
  });

  table(doc, ctx, {
    title: "Stock register",
    subtitle: d.pagination?.totalCount > rows.length ? `showing ${fmt.num(rows.length)} of ${fmt.num(d.pagination.totalCount)}` : `${fmt.num(rows.length)} lines`,
    y,
    columns: [
      { header: "Product", w: 2.8, value: (r) => r.product?.name },
      { header: "SKU", w: 1.3, value: (r) => r.product?.sku },
      { header: "Category", w: 1.5, value: (r) => r.product?.category || "—" },
      { header: "Store", w: 1.6, value: (r) => r.store?.name },
      { header: "Stock", w: 0.8, align: "right", value: (r) => fmt.num(r.stock), bold: true },
      { header: "Min", w: 0.7, align: "right", value: (r) => fmt.num(r.minStock) },
      { header: "Price", w: 1.1, align: "right", value: (r) => fmt.money(r.product?.price) },
      { header: "Value", w: 1.2, align: "right", value: (r) => fmt.money((r.stock || 0) * (r.product?.price || 0)) },
      { header: "Status", w: 1.1, value: (r) => r.status, color: (r) => STATUS_COLORS[r.status], bold: true },
    ],
    rows,
  });
}

function buildProducts(doc, rows, ctx) {
  const { fmt } = ctx;
  rows = rows || [];
  const sum = (k) => rows.reduce((t, r) => t + (Number(r[k]) || 0), 0);
  const revenue = sum("totalRevenue");
  const profit = sum("totalProfit");
  let y = masthead(doc, ctx);

  y = cards(doc, ctx, [
    { label: "Products ranked", value: fmt.num(rows.length), color: C.blue },
    { label: "Revenue", value: fmt.money(revenue), color: C.green },
    { label: "Profit", value: fmt.money(profit), hint: revenue ? `${fmt.pct((profit / revenue) * 100)} margin` : undefined, color: C.purple },
    { label: "Units sold", value: fmt.num(sum("totalSold")), color: C.orange },
  ], y);

  const top = rows.slice(0, 10);
  y = sideBySide(doc, ctx, y, 220,
    (x, yy, w) => barChart(doc, { title: "Top products", subtitle: "by revenue", rows: top.map((p) => ({ label: p.productName, value: p.totalRevenue })), x, y: yy, width: w, fmt: fmt.money, color: C.green }),
    (x, yy, w) => barChart(doc, { title: "Top products", subtitle: "by profit", rows: [...rows].sort((a, b) => b.totalProfit - a.totalProfit).slice(0, 10).map((p) => ({ label: p.productName, value: p.totalProfit, color: p.totalProfit < 0 ? C.red : undefined })), x, y: yy, width: w, fmt: fmt.money, color: C.purple }),
  );

  table(doc, ctx, {
    title: "Product performance",
    y,
    columns: [
      { header: "#", w: 0.4, align: "right", value: (r) => String(rows.indexOf(r) + 1) },
      { header: "Product", w: 2.8, value: (r) => r.productName },
      { header: "SKU", w: 1.2, value: (r) => r.sku },
      { header: "Category", w: 1.4, value: (r) => r.category || "—" },
      { header: "Sold", w: 0.8, align: "right", value: (r) => fmt.num(r.totalSold) },
      { header: "Revenue", w: 1.3, align: "right", value: (r) => fmt.money(r.totalRevenue) },
      { header: "Profit", w: 1.3, align: "right", value: (r) => fmt.money(r.totalProfit), color: (r) => (r.totalProfit < 0 ? C.red : null) },
      { header: "Margin", w: 0.9, align: "right", value: (r) => fmt.pct(r.profitMargin) },
      { header: "In stock", w: 0.9, align: "right", value: (r) => fmt.num(r.currentStock), color: (r) => (r.currentStock <= 0 ? C.red : null) },
    ],
    rows,
    totals: [null, "Total", null, null, fmt.num(sum("totalSold")), fmt.money(revenue), fmt.money(profit), revenue ? fmt.pct((profit / revenue) * 100) : null, null],
  });
}

function buildStores(doc, rows, ctx) {
  const { fmt } = ctx;
  rows = rows || [];
  const sum = (k) => rows.reduce((t, r) => t + (Number(r[k]) || 0), 0);
  const revenue = sum("totalSales");
  const profit = sum("totalProfit");
  let y = masthead(doc, ctx);

  y = cards(doc, ctx, [
    { label: "Stores with sales", value: fmt.num(rows.length), color: C.orange },
    { label: "Revenue", value: fmt.money(revenue), color: C.blue },
    { label: "Profit", value: fmt.money(profit), hint: revenue ? `${fmt.pct((profit / revenue) * 100)} margin` : undefined, color: C.green },
    { label: "Transactions", value: fmt.num(sum("transactionCount")), hint: `${fmt.num(sum("totalItemsSold"))} items sold`, color: C.purple },
  ], y);

  const top = rows.slice(0, 10);
  y = sideBySide(doc, ctx, y, 220,
    (x, yy, w) => barChart(doc, { title: "Revenue by store", rows: top.map((s) => ({ label: s.storeName, value: s.totalSales })), x, y: yy, width: w, fmt: fmt.money, color: C.blue }),
    (x, yy, w) => barChart(doc, { title: "Transactions by store", rows: top.map((s) => ({ label: s.storeName, value: s.transactionCount })), x, y: yy, width: w, fmt: fmt.num, color: C.orange }),
  );

  table(doc, ctx, {
    title: "Store performance",
    y,
    columns: [
      { header: "Store", w: 2.2, value: (r) => r.storeName },
      { header: "Code", w: 0.9, value: (r) => r.storeCode || "—" },
      { header: "City", w: 1.2, value: (r) => r.address?.city || "—" },
      { header: "Status", w: 0.9, value: (r) => r.storeStatus || "—", color: (r) => STATUS_COLORS[r.storeStatus] },
      { header: "Txns", w: 0.8, align: "right", value: (r) => fmt.num(r.transactionCount) },
      { header: "Customers", w: 0.9, align: "right", value: (r) => fmt.num(r.uniqueCustomersCount) },
      { header: "Revenue", w: 1.3, align: "right", value: (r) => fmt.money(r.totalSales) },
      { header: "Profit", w: 1.3, align: "right", value: (r) => fmt.money(r.totalProfit) },
      { header: "Margin", w: 0.8, align: "right", value: (r) => fmt.pct(r.profitMargin) },
      { header: "Avg sale", w: 1.1, align: "right", value: (r) => fmt.money(r.averageTransaction) },
    ],
    rows,
    totals: ["Total", null, null, null, fmt.num(sum("transactionCount")), null, fmt.money(revenue), fmt.money(profit), revenue ? fmt.pct((profit / revenue) * 100) : null, null],
  });
}

function buildFinancial(doc, d, ctx) {
  const { fmt } = ctx;
  const s = d.summary || {};
  let y = masthead(doc, ctx);

  y = cards(doc, ctx, [
    { label: "Revenue", value: fmt.money(s.totalRevenue), color: C.blue },
    { label: "Cost of goods", value: fmt.money(s.totalCost), color: C.orange },
    { label: "Gross profit", value: fmt.money(s.totalProfit), hint: `${fmt.pct(s.profitMargin)} margin`, color: C.green },
    { label: "Transactions", value: fmt.num(s.totalTransactions), hint: `Avg ${fmt.money(s.avgTransactionValue)} · ${fmt.money(s.avgProfitPerTransaction)} profit`, color: C.purple },
  ], y);

  y = ensureSpace(doc, ctx, y, 190);
  y = columnChart(doc, {
    title: "Daily revenue",
    subtitle: "last 30 days",
    points: (d.dailyBreakdown || []).map((p) => ({ label: p._id, value: p.revenue })),
    x: MARGIN,
    y,
    width: contentWidth(doc),
    fmt: fmt.money,
    color: C.green,
  });

  y = sideBySide(doc, ctx, y, 200,
    (x, yy, w) => barChart(doc, { title: "Revenue by payment method", rows: (d.paymentMethods || []).map((p) => ({ label: p._id || "Unknown", value: p.amount })), x, y: yy, width: w, fmt: fmt.money, color: C.purple }),
    (x, yy, w) => barChart(doc, { title: "Top products", subtitle: "by revenue", rows: (d.topProducts || []).map((p) => ({ label: p.productName, value: p.revenue })), x, y: yy, width: w, fmt: fmt.money, color: C.blue }),
  );

  y = table(doc, ctx, {
    title: "Payment methods",
    y,
    columns: [
      { header: "Method", w: 2, value: (r) => r._id || "Unknown" },
      { header: "Transactions", w: 1, align: "right", value: (r) => fmt.num(r.count) },
      { header: "Amount", w: 1.3, align: "right", value: (r) => fmt.money(r.amount) },
      { header: "Average", w: 1.3, align: "right", value: (r) => fmt.money(r.averageAmount) },
      { header: "Share", w: 1, align: "right", value: (r) => (s.totalRevenue ? fmt.pct((r.amount / s.totalRevenue) * 100) : "—") },
    ],
    rows: d.paymentMethods || [],
  });

  table(doc, ctx, {
    title: "Daily breakdown",
    subtitle: "last 30 days",
    y,
    columns: [
      { header: "Date", w: 1.5, value: (r) => fmt.date(r._id) },
      { header: "Transactions", w: 1, align: "right", value: (r) => fmt.num(r.transactions) },
      { header: "Revenue", w: 1.3, align: "right", value: (r) => fmt.money(r.revenue) },
      { header: "Profit", w: 1.3, align: "right", value: (r) => fmt.money(r.profit) },
      { header: "Margin", w: 1, align: "right", value: (r) => (r.revenue ? fmt.pct((r.profit / r.revenue) * 100) : "—") },
    ],
    rows: d.dailyBreakdown || [],
  });
}

const TXN_STATUS_COLORS = {
  completed: C.green,
  paid: C.green,
  pending: C.amber,
  partial: C.amber,
  cancelled: C.muted,
  failed: C.red,
  refunded: C.red,
};

const txnRef = (t) => t.transactionId || String(t._id || "").slice(-8).toUpperCase();

function buildTransactions(doc, d, ctx) {
  const { fmt } = ctx;
  const rows = d.transactions || [];
  const s = d.summary || {};
  const refunded = rows.reduce((t, r) => t + (r.refundedAmount || 0), 0);
  let y = masthead(doc, ctx);

  y = cards(doc, ctx, [
    { label: "Transactions", value: fmt.num(rows.length), hint: `${fmt.num(s.totalItems)} items`, color: C.blue },
    { label: "Gross sales", value: fmt.money(s.totalRevenue), hint: `Avg ${fmt.money(rows.length ? s.totalRevenue / rows.length : 0)}`, color: C.green },
    { label: "Profit", value: fmt.money(s.totalProfit), hint: s.totalRevenue ? `${fmt.pct((s.totalProfit / s.totalRevenue) * 100)} margin` : undefined, color: C.purple },
    { label: "Refunded", value: fmt.money(refunded), hint: `Net ${fmt.money((s.totalRevenue || 0) - refunded)}`, color: C.red },
  ], y);

  // Daily totals in the business timezone
  const byDay = {};
  const byMethod = {};
  const byStore = {};
  rows.forEach((r) => {
    const day = new Date(r.createdAt).toLocaleDateString("en-CA", { timeZone: ctx.timezone });
    byDay[day] = (byDay[day] || 0) + (r.total || 0);
    const m = r.paymentMethod || "other";
    byMethod[m] = (byMethod[m] || 0) + (r.total || 0);
    const sn = r.storeId?.name || "—";
    byStore[sn] = (byStore[sn] || 0) + (r.total || 0);
  });
  const ranked = (obj) =>
    Object.entries(obj)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([label, value]) => ({ label, value }));

  y = ensureSpace(doc, ctx, y, 190);
  y = columnChart(doc, {
    title: "Sales per day",
    points: Object.keys(byDay).sort().map((k) => ({ label: k, value: byDay[k] })),
    x: MARGIN,
    y,
    width: contentWidth(doc),
    fmt: fmt.money,
    color: C.green,
  });

  y = sideBySide(doc, ctx, y, 150,
    (x, yy, w) => barChart(doc, { title: "By payment method", rows: ranked(byMethod), x, y: yy, width: w, fmt: fmt.money, color: C.purple }),
    (x, yy, w) => barChart(doc, { title: "By store", rows: ranked(byStore), x, y: yy, width: w, fmt: fmt.money, color: C.orange }),
  );

  table(doc, ctx, {
    title: "Transactions",
    subtitle: d.truncatedFrom ? `showing latest ${fmt.num(rows.length)} of ${fmt.num(d.truncatedFrom)}` : `${fmt.num(rows.length)} records`,
    y,
    columns: [
      { header: "Date", w: 1.5, value: (r) => fmt.dateTime(r.createdAt) },
      { header: "Txn #", w: 1.4, value: txnRef },
      { header: "Store", w: 1.5, value: (r) => r.storeId?.name || "—" },
      { header: "Customer", w: 1.7, value: (r) => r.customerName || "Walk-in" },
      { header: "Served by", w: 1.3, value: (r) => r.soldBy?.name || "—" },
      { header: "Items", w: 0.6, align: "right", value: (r) => fmt.num(r.itemsCount) },
      { header: "Payment", w: 1, value: (r) => r.paymentMethod || "—" },
      { header: "Status", w: 1, value: (r) => r.status, color: (r) => TXN_STATUS_COLORS[r.status], bold: true },
      { header: "Total", w: 1.2, align: "right", value: (r) => fmt.money(r.total), bold: true },
      { header: "Refunded", w: 1.1, align: "right", value: (r) => (r.refundedAmount ? fmt.money(r.refundedAmount) : "—"), color: (r) => (r.refundedAmount ? C.red : C.muted) },
    ],
    rows,
    totals: d.truncatedFrom
      ? null
      : ["Total", null, null, null, null, fmt.num(s.totalItems), null, null, fmt.money(s.totalRevenue), refunded ? fmt.money(refunded) : null],
  });
}

function buildDailySales(doc, d, ctx) {
  const { fmt } = ctx;
  const items = d.itemsSold || [];
  const showProfit = !!ctx.showProfit;
  const multiStore = new Set(items.map((i) => String(i.storeId || ""))).size > 1;
  let y = masthead(doc, ctx);

  y = cards(doc, ctx, [
    { label: "Revenue", value: fmt.money(d.totalSales), hint: `${fmt.num(d.totalTransactions)} transactions`, color: C.blue },
    showProfit
      ? { label: "Profit", value: fmt.money(d.totalProfit), hint: `${d.metrics?.profitMargin ?? "0.0"}% margin`, color: C.green }
      : { label: "Products sold", value: fmt.num(items.length), color: C.green },
    { label: "Items sold", value: fmt.num(d.totalItemsSold), hint: `${d.metrics?.itemsPerTransaction ?? "0.0"} per transaction`, color: C.purple },
    { label: "Average sale", value: fmt.money(d.averageTransaction), color: C.orange },
  ], y);

  y = sideBySide(doc, ctx, y, 190,
    (x, yy, w) => barChart(doc, { title: "Top products", subtitle: "by units sold", rows: items.slice(0, 8).map((i) => ({ label: i.productName, value: i.totalQuantitySold })), x, y: yy, width: w, fmt: fmt.num, color: C.blue }),
    (x, yy, w) => barChart(doc, { title: "Payment methods", rows: (d.paymentMethods || []).map((p) => ({ label: p.paymentMethod || "other", value: p.totalAmount })), x, y: yy, width: w, fmt: fmt.money, color: C.purple }),
  );

  const columns = [
    { header: "#", w: 0.4, align: "right", value: (r) => String(items.indexOf(r) + 1) },
    { header: "Product", w: 3, value: (r) => r.productName },
    { header: "SKU", w: 1.2, value: (r) => r.sku || "—" },
    ...(multiStore ? [{ header: "Store", w: 1.5, value: (r) => r.storeName || "—" }] : []),
    { header: "Category", w: 1.3, value: (r) => r.category || "—" },
    { header: "Qty", w: 0.6, align: "right", value: (r) => fmt.num(r.totalQuantitySold), bold: true },
    { header: "Avg price", w: 1.1, align: "right", value: (r) => fmt.money(r.sellingPrice) },
    { header: "Revenue", w: 1.2, align: "right", value: (r) => fmt.money(r.totalRevenue), bold: true },
    ...(showProfit
      ? [
          { header: "Profit", w: 1.1, align: "right", value: (r) => fmt.money(r.totalProfit), color: (r) => (r.totalProfit < 0 ? C.red : C.green) },
          { header: "Margin", w: 0.8, align: "right", value: (r) => `${r.profitMargin}%` },
        ]
      : []),
  ];
  const totals = columns.map((c) => {
    if (c.header === "Product") return "Total";
    if (c.header === "Qty") return fmt.num(d.totalItemsSold);
    if (c.header === "Revenue") return fmt.money(d.totalSales);
    if (c.header === "Profit") return fmt.money(d.totalProfit);
    return null;
  });

  table(doc, ctx, {
    title: "Products sold",
    subtitle: `${fmt.num(items.length)} products`,
    y,
    columns,
    rows: items,
    totals: items.length ? totals : null,
    emptyText: "No sales recorded for this day.",
  });
}

const BUILDERS = {
  dashboard: { title: "Business Dashboard", build: buildDashboard },
  sales: { title: "Sales Report", build: buildSales },
  inventory: { title: "Inventory Report", build: buildInventory },
  products: { title: "Product Performance", build: buildProducts },
  stores: { title: "Store Performance", build: buildStores },
  financial: { title: "Financial Summary", build: buildFinancial },
  transactions: { title: "Transactions Report", build: buildTransactions },
  dailySales: { title: "Daily Product Sales", build: buildDailySales },
};

function createDoc(layout, title, businessName) {
  const doc = new PDFDocument({
    size: "A4",
    layout,
    margin: MARGIN,
    bufferPages: true,
    info: { Title: `${businessName} – ${title}`, Author: businessName, Creator: "Orbit" },
  });
  // Embedded TTFs give full Unicode (₦, é, ñ, Cyrillic etc.).
  const haveFonts = fs.existsSync(FONTS.body) && fs.existsSync(FONTS.bold);
  doc.registerFont("Body", haveFonts ? FONTS.body : "Helvetica");
  doc.registerFont("Bold", haveFonts ? FONTS.bold : "Helvetica-Bold");
  return doc;
}

function toBuffer(doc, draw) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    doc.on("data", (c) => chunks.push(c));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);
    try {
      draw();
      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

function baseCtx(meta, title) {
  return {
    fmt: makeFormatters(meta.currency),
    title,
    businessName: meta.businessName || "Orbit",
    brand: isHex(meta.brandColor) ? meta.brandColor : C.brand,
    timezone: meta.timezone || "Africa/Nairobi",
    showProfit: meta.showProfit,
  };
}

/**
 * Render a report to a PDF Buffer.
 * @param {string} type     one of BUILDERS keys
 * @param {object} data     report data as returned by ReportService
 * @param {object} meta     { businessName, currency, brandColor, timezone, storeName, startDate, endDate }
 */
function renderReportPdf(type, data, meta = {}) {
  const spec = BUILDERS[type];
  if (!spec) throw new Error(`No PDF layout for report type "${type}"`);

  const ctx = baseCtx(meta, spec.title);
  const { fmt } = ctx;
  const period =
    // Dashboard and inventory are point-in-time snapshots, not period reports.
    type === "dashboard" || type === "inventory"
      ? `As of ${fmt.date(new Date())}`
      : meta.startDate && meta.endDate && fmt.date(meta.startDate) === fmt.date(meta.endDate)
        ? fmt.date(meta.startDate)
        : meta.startDate && meta.endDate
        ? `${fmt.date(meta.startDate)} – ${fmt.date(meta.endDate)}`
        : meta.startDate
          ? `From ${fmt.date(meta.startDate)}`
          : meta.endDate
            ? `Up to ${fmt.date(meta.endDate)}`
            : "All time";
  ctx.scopeLine = [meta.storeName || "All stores", period, ...(meta.extraScope || []), `Currency ${meta.currency || "KES"}`].join("  ·  ");

  const doc = createDoc("landscape", spec.title, ctx.businessName);
  return toBuffer(doc, () => {
    spec.build(doc, data, ctx);
    footers(doc, ctx);
  });
}

// ───────────────────────── receipt ─────────────────────────

function infoGrid(doc, pairs, x, y, width) {
  const colW = width / 2;
  const rowH = 30;
  const rows = Math.ceil(pairs.length / 2);
  doc.rect(x, y, width, rows * rowH + 8).fill(C.card);
  pairs.forEach(([label, value, color], i) => {
    const cx = x + 12 + (i % 2) * colW;
    const cy = y + 8 + Math.floor(i / 2) * rowH;
    put(doc, label.toUpperCase(), cx, cy, { font: "Bold", size: 6.5, color: C.muted, width: colW - 24 });
    put(doc, value || "—", cx, cy + 10, { size: 9.5, width: colW - 24, color: color || C.ink, font: color ? "Bold" : "Body" });
  });
  return y + rows * rowH + 8 + 18;
}

function summaryLines(doc, lines, x, y, width) {
  lines.forEach(([label, value, opts = {}]) => {
    if (opts.rule) {
      doc.moveTo(x, y - 3).lineTo(x + width, y - 3).lineWidth(0.8).strokeColor(C.ink).stroke();
    }
    const size = opts.big ? 12 : 9;
    put(doc, label, x, y, { size, font: opts.big ? "Bold" : "Body", color: opts.color || C.muted, width: width / 2 });
    put(doc, value, x + width / 2, y, { size, font: "Bold", color: opts.color || C.ink, width: width / 2, align: "right" });
    y += opts.big ? 22 : 16;
  });
  return y;
}

/**
 * Customer receipt for a single POS transaction (A4 portrait).
 * @param {object} tx    transaction with salesDetails (or populated saleIds) and refunds
 * @param {object} meta  { businessName, currency, brandColor, timezone, business, store }
 */
function renderReceiptPdf(tx, meta = {}) {
  const ctx = baseCtx(meta, "Receipt");
  const { fmt } = ctx;
  const b = meta.business || {};
  const store = meta.store || tx.storeId || {};
  const ref = txnRef(tx);
  const doc = createDoc("portrait", `Receipt ${ref}`, ctx.businessName);
  const W = doc.page.width;
  const CW = W - MARGIN * 2;

  return toBuffer(doc, () => {
    // ── Letterhead
    doc.rect(0, 0, W, 104).fill(ctx.brand);
    put(doc, ctx.businessName, MARGIN, 22, { font: "Bold", size: 20, color: "#FFFFFF", width: CW - 170 });
    const contact = [
      [b.businessAddress, b.city, b.country].filter(Boolean).join(", "),
      [b.businessPhone, b.businessEmail, b.website].filter(Boolean).join("  ·  "),
      [b.taxId && `PIN ${b.taxId}`, b.registrationNumber && `Reg. ${b.registrationNumber}`].filter(Boolean).join("  ·  "),
    ].filter(Boolean);
    contact.forEach((line, i) =>
      put(doc, line, MARGIN, 50 + i * 12, { size: 8, color: "#E0E7FF", width: CW - 170 }),
    );
    put(doc, "RECEIPT", W - MARGIN - 160, 22, { font: "Bold", size: 20, color: "#FFFFFF", width: 160, align: "right" });
    put(doc, `# ${ref}`, W - MARGIN - 160, 50, { font: "Bold", size: 9, color: "#E0E7FF", width: 160, align: "right" });
    put(doc, fmt.dateTime(tx.createdAt), W - MARGIN - 160, 62, { size: 8, color: "#E0E7FF", width: 160, align: "right" });

    // ── Status pill
    const status = tx.refundStatus === "partial" ? "partially refunded" : tx.status || "completed";
    const statusColor = tx.refundStatus === "partial" ? C.amber : TXN_STATUS_COLORS[tx.status] || C.green;
    let y = 122;
    doc.font("Bold").fontSize(8);
    const pillW = doc.widthOfString(status.toUpperCase()) + 20;
    doc.roundedRect(MARGIN, y, pillW, 18, 9).fill(statusColor);
    put(doc, status.toUpperCase(), MARGIN + 10, y + 4.5, { font: "Bold", size: 8, color: "#FFFFFF" });
    y += 32;

    // ── Details
    const storeLine = [store.name, store.address?.street, store.address?.city].filter(Boolean).join(", ");
    const pairs = [
      ["Customer", tx.customerName || "Walk-in customer"],
      ["Phone", tx.customerPhone],
      ["Store", storeLine],
      ["Served by", tx.soldBy?.name],
      ["Payment method", (tx.paymentMethod || "cash").toUpperCase()],
      ["Payment status", tx.paymentStatus, TXN_STATUS_COLORS[tx.paymentStatus]],
    ];
    if (tx.mpesaReceipt) pairs.push(["M-Pesa receipt", tx.mpesaReceipt, C.green]);
    if (tx.mpesaPhone) pairs.push(["M-Pesa phone", tx.mpesaPhone]);
    y = infoGrid(doc, pairs, MARGIN, y, CW);

    // ── Items
    const items = (tx.salesDetails?.length ? tx.salesDetails : tx.saleIds || []).filter((i) => i && typeof i === "object");
    y = table(doc, ctx, {
      title: "Items",
      subtitle: `${fmt.num(items.length)} line${items.length === 1 ? "" : "s"}`,
      y,
      columns: [
        { header: "#", w: 0.35, align: "right", value: (r) => String(items.indexOf(r) + 1) },
        { header: "Description", w: 3, value: (r) => r.productName || "Product" },
        { header: "SKU", w: 1.1, value: (r) => r.sku || "—" },
        { header: "Qty", w: 0.5, align: "right", value: (r) => fmt.num(r.quantity) },
        { header: "Unit price", w: 1.1, align: "right", value: (r) => fmt.money(r.unitPrice) },
        { header: "Discount", w: 0.9, align: "right", value: (r) => (r.discount ? `-${fmt.money(r.discount)}` : "—") },
        { header: "Amount", w: 1.1, align: "right", value: (r) => fmt.money(r.total), bold: true },
      ],
      rows: items,
      emptyText: "No line items recorded for this transaction.",
    });

    // ── Totals (right) + payment details (left)
    y = ensureSpace(doc, ctx, y, 140);
    const boxW = 230;
    const boxX = W - MARGIN - boxW;
    const lines = [["Subtotal", fmt.money(tx.subtotal ?? tx.total)]];
    if (tx.discount > 0) lines.push(["Discount", `-${fmt.money(tx.discount)}`, { color: C.red }]);
    if (tx.tax > 0) lines.push(["Tax", fmt.money(tx.tax)]);
    lines.push(["Total", fmt.money(tx.total), { big: true, rule: true, color: ctx.brand }]);
    if (tx.refundedAmount > 0) {
      lines.push(["Refunded", `-${fmt.money(tx.refundedAmount)}`, { color: C.red }]);
      lines.push(["Net paid", fmt.money((tx.total || 0) - tx.refundedAmount), { rule: true }]);
    }
    const totalsBottom = summaryLines(doc, lines, boxX, y, boxW);

    let py = y;
    const leftW = CW - boxW - 30;
    if (tx.paymentMethod === "cash" && (tx.amountGiven || tx.change)) {
      py = sectionTitle(doc, "Cash payment", MARGIN, py);
      py = summaryLines(doc, [
        ["Amount tendered", fmt.money(tx.amountGiven)],
        ["Change given", fmt.money(tx.change), { color: C.green }],
      ], MARGIN, py, leftW);
    } else if (tx.paymentMethod === "mpesa" && tx.mpesaReceipt) {
      py = sectionTitle(doc, "M-Pesa payment", MARGIN, py);
      py = summaryLines(doc, [
        ["Receipt no.", tx.mpesaReceipt, { color: C.green }],
        ["Amount", fmt.money(tx.mpesaAmount ?? tx.total)],
      ], MARGIN, py, leftW);
    }
    y = Math.max(totalsBottom, py) + 14;

    // ── Refunds
    const refunds = (tx.refunds || []).filter((r) => r && typeof r === "object");
    if (refunds.length) {
      y = table(doc, ctx, {
        title: "Refunds",
        y,
        columns: [
          { header: "Refund #", w: 1.3, value: (r) => r.refundId || "—" },
          { header: "Date", w: 1.4, value: (r) => fmt.dateTime(r.processedAt) },
          { header: "Method", w: 0.9, value: (r) => r.method || "—" },
          { header: "Reason", w: 2.2, value: (r) => r.reasonText || r.reason || "—" },
          { header: "Processed by", w: 1.3, value: (r) => r.processedBy?.name || "—" },
          { header: "Amount", w: 1, align: "right", value: (r) => fmt.money(r.amount), color: () => C.red, bold: true },
        ],
        rows: refunds,
      });
    }

    // ── Thank-you note
    y = ensureSpace(doc, ctx, y, 50);
    doc.moveTo(MARGIN, y).lineTo(W - MARGIN, y).lineWidth(0.5).strokeColor(C.line).stroke();
    put(doc, `Thank you for shopping with ${ctx.businessName}!`, MARGIN, y + 12, { font: "Bold", size: 10, width: CW, align: "center" });
    put(doc, "Please keep this receipt for returns and warranty claims.", MARGIN, y + 27, { size: 8, color: C.muted, width: CW, align: "center" });

    footers(doc, { ...ctx, title: `Receipt ${ref}` });
  });
}

module.exports = {
  renderReportPdf,
  renderReceiptPdf,
  PDF_REPORT_TYPES: Object.keys(BUILDERS),
};
