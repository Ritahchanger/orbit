import jsPDF from "jspdf";

const PrintContent = ({
  item,
  getCurrentDate,
  formatCurrency,
  canSeeProfit = false,
}) => {
  const downloadPDF = () => {
    const doc = new jsPDF();

    // Add content to PDF
    doc.setFontSize(18);
    doc.text("Product Sales Summary", 20, 20);

    doc.setFontSize(12);
    doc.text(`Product: ${item.productName}`, 20, 40);
    doc.text(`SKU: ${item.sku || "N/A"}`, 20, 50);
    doc.text(`Quantity: ${item.totalQuantitySold || 0}`, 20, 60);
    doc.text(`Revenue: ${formatCurrency(item.totalRevenue)}`, 20, 70);

    if (canSeeProfit) {
      doc.text(`Profit: ${formatCurrency(item.totalProfit)}`, 20, 80);
      doc.text(
        `Margin: ${parseFloat(item.profitMargin || 0).toFixed(1)}%`,
        20,
        90,
      );
    }

    doc.save(`${item.productName}-summary.pdf`);
  };

  return (
    <button
      className="text-xs px-2 py-1 bg-gray-700/50 text-gray-300 hover:bg-gray-700 rounded-sm transition-colors"
      onClick={downloadPDF}
    >
      📄 PDF
    </button>
  );
};

export default PrintContent;
