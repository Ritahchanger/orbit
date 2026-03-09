import { useState, useMemo } from 'react';
import {
  FileText,
  Download,
  Printer,
  Copy,
  Mail,
  CheckCircle,
  ShoppingBag,
  Calendar,
  User,
  Building,
  AlertTriangle
} from 'lucide-react';
import ActionButtons from './ActionButtons';
import PreviewPurchaseOrder from './PreviewPurchaseOrder';

const PurchaseOrderGenerator = ({
  lowStockAlerts,
  storeInfo = {},
  supplierInfo = {}
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [purchaseOrder, setPurchaseOrder] = useState(null);
  const [copied, setCopied] = useState(false);

  // Default store information
  const defaultStoreInfo = {
    name: 'Mega Gamers',
    address: 'Tom Mboya Street, Nairobi, Kenya',
    phone: '+254 700 000 000',
    email: 'purchasing@megagamers.co.ke',
    contactPerson: 'Purchasing Manager',
    taxId: 'P0510000000'
  };

  // Default supplier information
  const defaultSupplierInfo = {
    name: 'Mega Gamers',
    address: 'Industrial Area, Nairobi, Kenya',
    phone: '+254 711 000 000',
    email: 'megagamers@info.com',
    contactPerson: 'Sales Department',
    paymentTerms: 'Net 30 Days',
    deliveryLeadTime: '3-5 Business Days'
  };

  const store = { ...defaultStoreInfo, ...storeInfo };
  const supplier = { ...defaultSupplierInfo, ...supplierInfo };

  // Calculate totals
  const purchaseOrderSummary = useMemo(() => {
    if (!lowStockAlerts?.length) return null;

    let totalQuantity = 0;
    let totalCost = 0;
    let subtotal = 0;
    const vatRate = 0.16; // 16% VAT in Kenya
    let categories = {};

    lowStockAlerts.forEach(product => {
      const quantity = product.recommendation?.quantity || product.deficit || 1;
      const unitPrice = product.costPrice || 0;
      const lineTotal = quantity * unitPrice;

      totalQuantity += quantity;
      totalCost += lineTotal;

      // Group by category
      const category = product.category || 'Uncategorized';
      if (!categories[category]) {
        categories[category] = {
          count: 0,
          quantity: 0,
          total: 0
        };
      }
      categories[category].count += 1;
      categories[category].quantity += quantity;
      categories[category].total += lineTotal;
    });

    subtotal = totalCost;
    const vatAmount = subtotal * vatRate;
    const totalAmount = subtotal + vatAmount;

    return {
      totalQuantity,
      subtotal,
      vatRate: vatRate * 100,
      vatAmount,
      totalAmount,
      categories,
      itemCount: lowStockAlerts.length
    };
  }, [lowStockAlerts]);

  // Generate purchase order number
  const generatePONumber = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `PO-${year}${month}${day}-${random}`;
  };

  // Generate purchase order
  const generatePurchaseOrder = () => {
    setIsGenerating(true);

    // Simulate API call
    setTimeout(() => {
      const poNumber = generatePONumber();
      const orderDate = new Date();
      const expectedDelivery = new Date();
      expectedDelivery.setDate(orderDate.getDate() + 5); // 5 days from now

      const po = {
        poNumber,
        orderDate: orderDate.toISOString(),
        expectedDelivery: expectedDelivery.toISOString(),
        store: store,
        supplier: supplier,
        items: lowStockAlerts.map((product, index) => ({
          id: index + 1,
          productId: product._id,
          name: product.name,
          sku: product.sku,
          category: product.category,
          description: `Gaming ${product.category.replace('-', ' ')} - ${product.brand || 'Generic Brand'}`,
          quantity: product.recommendation?.quantity || product.deficit || 1,
          unit: 'pcs',
          unitPrice: product.costPrice || 0,
          lineTotal: (product.recommendation?.quantity || product.deficit || 1) * (product.costPrice || 0),
          urgency: product.urgency || 0,
          severity: product.severity || 'medium',
          lastRestock: product.lastRestock,
          notes: product.recommendation?.message || `Restock required - Current stock: ${product.stock}, Minimum: ${product.minStock}`
        })),
        summary: purchaseOrderSummary,
        terms: [
          'Prices are quoted in Kenyan Shillings (KES)',
          'Payment terms: Net 30 days from date of invoice',
          'Delivery to be made within 5 business days',
          'All goods must be in original packaging',
          'Late deliveries subject to 5% penalty per day',
          'Returns accepted within 7 days of delivery',
          'Minimum order quantity applies'
        ],
        notes: [
          'Please ensure all items are properly packaged for gaming retail',
          'Include warranty cards and user manuals where applicable',
          'Priority shipping required for high urgency items',
          'Email confirmation required upon dispatch',
          'Contact purchasing department for any queries'
        ],
        status: 'pending'
      };

      setPurchaseOrder(po);
      setIsGenerating(false);
    }, 1500);
  };

  // Copy purchase order to clipboard
  const copyToClipboard = () => {
    if (!purchaseOrder) return;

    const poText = formatPurchaseOrderText(purchaseOrder);
    navigator.clipboard.writeText(poText)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(err => console.error('Failed to copy:', err));
  };

  // Format purchase order as text
  const formatPurchaseOrderText = (po) => {
    return `============================================
PURCHASE ORDER
============================================

Order Number: ${po.poNumber}
Order Date: ${new Date(po.orderDate).toLocaleDateString('en-KE')}
Expected Delivery: ${new Date(po.expectedDelivery).toLocaleDateString('en-KE')}

FROM:
${po.store.name}
${po.store.address}
Phone: ${po.store.phone}
Email: ${po.store.email}
Contact: ${po.store.contactPerson}
Tax ID: ${po.store.taxId}

TO:
${po.supplier.name}
${po.supplier.address}
Phone: ${po.supplier.phone}
Email: ${po.supplier.email}
Contact: ${po.supplier.contactPerson}

============================================
ORDER ITEMS
============================================

${po.items.map(item => `
${item.id}. ${item.name}
   SKU: ${item.sku}
   Category: ${item.category}
   Quantity: ${item.quantity} ${item.unit}
   Unit Price: KES ${item.unitPrice.toLocaleString('en-KE')}
   Line Total: KES ${item.lineTotal.toLocaleString('en-KE')}
   Urgency: ${item.urgency}% (${item.severity})
   Notes: ${item.notes}
`).join('\n')}

============================================
ORDER SUMMARY
============================================

Total Items: ${po.summary.itemCount}
Total Quantity: ${po.summary.totalQuantity} units
Subtotal: KES ${po.summary.subtotal.toLocaleString('en-KE')}
VAT (${po.summary.vatRate}%): KES ${po.summary.vatAmount.toLocaleString('en-KE')}
TOTAL AMOUNT: KES ${po.summary.totalAmount.toLocaleString('en-KE')}

============================================
TERMS & CONDITIONS
============================================

${po.terms.map((term, i) => `${i + 1}. ${term}`).join('\n')}

============================================
SPECIAL NOTES
============================================

${po.notes.join('\n')}

============================================
AUTHORIZATION
============================================

Authorized By: _________________________
Date: _________________________
Signature: _________________________

Supplier Acknowledgment: _________________________
Date Received: _________________________
`;
  };

  // Download as text file
  const downloadAsText = () => {
    if (!purchaseOrder) return;

    const poText = formatPurchaseOrderText(purchaseOrder);
    const blob = new Blob([poText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${purchaseOrder.poNumber}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Print purchase order
  const printPurchaseOrder = () => {
    if (!purchaseOrder) return;

    const printWindow = window.open('', '_blank');
    const poText = formatPurchaseOrderText(purchaseOrder);

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Purchase Order - ${purchaseOrder.poNumber}</title>
        <style>
          body {
            font-family: 'Courier New', monospace;
            line-height: 1.6;
            margin: 40px;
            color: #333;
          }
          .header {
            text-align: center;
            border-bottom: 3px double #000;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .section {
            margin-bottom: 30px;
          }
          .section-title {
            border-bottom: 1px solid #000;
            padding-bottom: 5px;
            margin-bottom: 15px;
            font-weight: bold;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
          }
          th, td {
            border: 1px solid #000;
            padding: 8px;
            text-align: left;
          }
          th {
            background-color: #f0f0f0;
            font-weight: bold;
          }
          .total-row {
            font-weight: bold;
            background-color: #f8f8f8;
          }
          .urgent {
            color: #d32f2f;
            font-weight: bold;
          }
          .signature-area {
            margin-top: 50px;
            padding-top: 20px;
            border-top: 1px solid #000;
          }
          @media print {
            body {
              margin: 0;
              padding: 20px;
            }
            .no-print {
              display: none !important;
            }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>PURCHASE ORDER</h1>
          <h2>${purchaseOrder.poNumber}</h2>
          <p>Date: ${new Date(purchaseOrder.orderDate).toLocaleDateString('en-KE')}</p>
          <p>Expected Delivery: ${new Date(purchaseOrder.expectedDelivery).toLocaleDateString('en-KE')}</p>
        </div>

        <div class="section">
          <div style="display: flex; justify-content: space-between;">
            <div>
              <h3>FROM:</h3>
              <p><strong>${purchaseOrder.store.name}</strong></p>
              <p>${purchaseOrder.store.address}</p>
              <p>Phone: ${purchaseOrder.store.phone}</p>
              <p>Email: ${purchaseOrder.store.email}</p>
              <p>Contact: ${purchaseOrder.store.contactPerson}</p>
              <p>Tax ID: ${purchaseOrder.store.taxId}</p>
            </div>
            <div>
              <h3>TO:</h3>
              <p><strong>${purchaseOrder.supplier.name}</strong></p>
              <p>${purchaseOrder.supplier.address}</p>
              <p>Phone: ${purchaseOrder.supplier.phone}</p>
              <p>Email: ${purchaseOrder.supplier.email}</p>
              <p>Contact: ${purchaseOrder.supplier.contactPerson}</p>
            </div>
          </div>
        </div>

        <div class="section">
          <h3 class="section-title">ORDER ITEMS</h3>
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Product Description</th>
                <th>SKU</th>
                <th>Quantity</th>
                <th>Unit Price</th>
                <th>Line Total</th>
                <th>Urgency</th>
              </tr>
            </thead>
            <tbody>
              ${purchaseOrder.items.map(item => `
                <tr>
                  <td>${item.id}</td>
                  <td>
                    <strong>${item.name}</strong><br>
                    <small>${item.description}</small>
                  </td>
                  <td>${item.sku}</td>
                  <td>${item.quantity} ${item.unit}</td>
                  <td>KES ${item.unitPrice.toLocaleString('en-KE')}</td>
                  <td>KES ${item.lineTotal.toLocaleString('en-KE')}</td>
                  <td class="${item.urgency >= 80 ? 'urgent' : ''}">
                    ${item.urgency}% (${item.severity})
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <div class="section">
          <h3 class="section-title">ORDER SUMMARY</h3>
          <table>
            <tr>
              <td>Total Items:</td>
              <td>${purchaseOrder.summary.itemCount}</td>
            </tr>
            <tr>
              <td>Total Quantity:</td>
              <td>${purchaseOrder.summary.totalQuantity} units</td>
            </tr>
            <tr>
              <td>Subtotal:</td>
              <td>KES ${purchaseOrder.summary.subtotal.toLocaleString('en-KE')}</td>
            </tr>
            <tr>
              <td>VAT (${purchaseOrder.summary.vatRate}%):</td>
              <td>KES ${purchaseOrder.summary.vatAmount.toLocaleString('en-KE')}</td>
            </tr>
            <tr class="total-row">
              <td><strong>TOTAL AMOUNT:</strong></td>
              <td><strong>KES ${purchaseOrder.summary.totalAmount.toLocaleString('en-KE')}</strong></td>
            </tr>
          </table>
        </div>

        <div class="section">
          <h3 class="section-title">TERMS & CONDITIONS</h3>
          <ol>
            ${purchaseOrder.terms.map(term => `<li>${term}</li>`).join('')}
          </ol>
        </div>

        <div class="section">
          <h3 class="section-title">SPECIAL NOTES</h3>
          <ul>
            ${purchaseOrder.notes.map(note => `<li>${note}</li>`).join('')}
          </ul>
        </div>

        <div class="signature-area">
          <div style="display: flex; justify-content: space-between;">
            <div style="width: 45%;">
              <p><strong>Authorized By:</strong></p>
              <p>Name: _________________________</p>
              <p>Title: Purchasing Manager</p>
              <p>Date: _________________________</p>
              <p>Signature: _________________________</p>
            </div>
            <div style="width: 45%;">
              <p><strong>Supplier Acknowledgment:</strong></p>
              <p>Received By: _________________________</p>
              <p>Title: _________________________</p>
              <p>Date Received: _________________________</p>
              <p>Signature: _________________________</p>
            </div>
          </div>
        </div>

        <div class="no-print" style="margin-top: 50px; text-align: center;">
          <button onclick="window.print()" style="padding: 10px 20px; background: #007bff; color: white; border: none; cursor: pointer; margin: 10px;">
            Print Purchase Order
          </button>
          <button onclick="window.close()" style="padding: 10px 20px; background: #6c757d; color: white; border: none; cursor: pointer; margin: 10px;">
            Close Window
          </button>
        </div>

        <script>
          window.onload = function() {
            window.print();
          };
        </script>
      </body>
      </html>
    `);

    printWindow.document.close();
  };

  // Email purchase order
  const emailPurchaseOrder = () => {
    if (!purchaseOrder) return;

    const subject = `Purchase Order ${purchaseOrder.poNumber} - ${store.name}`;
    const body = `Dear ${supplier.contactPerson},

Please find attached our purchase order ${purchaseOrder.poNumber}.

Order Summary:
- Total Items: ${purchaseOrder.summary.itemCount}
- Total Quantity: ${purchaseOrder.summary.totalQuantity} units
- Total Amount: KES ${purchaseOrder.summary.totalAmount.toLocaleString('en-KE')}
- Expected Delivery: ${new Date(purchaseOrder.expectedDelivery).toLocaleDateString('en-KE')}

Please acknowledge receipt of this order and confirm the delivery timeline.

Best regards,
${store.contactPerson}
${store.name}
${store.phone}
${store.email}`;

    const mailtoLink = `mailto:${supplier.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailtoLink, '_blank');
  };

  if (!lowStockAlerts?.length) {
    return (
      <div className="p-6 bg-gray-100 dark:bg-gray-700/30 rounded-sm border border-gray-300 dark:border-gray-600">
        <div className="text-center">
          <ShoppingBag className="w-12 h-12 mx-auto text-gray-500 dark:text-gray-600 mb-4" />
          <p className="text-gray-600 dark:text-gray-400">No low stock items to generate purchase order</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {!purchaseOrder ? (
        <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-sm p-6">
          <div className="flex items-center gap-3 mb-6">
            <FileText className="w-8 h-8 text-blue-600 dark:text-blue-500" />
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Generate Purchase Order</h3>
              <p className="text-gray-600 dark:text-gray-400">Create a professional purchase order for restocking</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-sm border border-gray-300 dark:border-gray-600">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <Building size={16} />
                Order Summary
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Total Items:</span>
                  <span className="text-gray-900 dark:text-white font-medium">{purchaseOrderSummary?.itemCount || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Total Quantity:</span>
                  <span className="text-gray-900 dark:text-white font-medium">{purchaseOrderSummary?.totalQuantity || 0} units</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Estimated Cost:</span>
                  <span className="text-green-700 dark:text-green-400 font-bold">
                    KES {purchaseOrderSummary?.subtotal?.toLocaleString('en-KE') || '0'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">VAT ({purchaseOrderSummary?.vatRate || 16}%):</span>
                  <span className="text-yellow-700 dark:text-yellow-400 font-medium">
                    KES {purchaseOrderSummary?.vatAmount?.toLocaleString('en-KE') || '0'}
                  </span>
                </div>
                <div className="pt-2 border-t border-gray-300 dark:border-gray-700">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400 font-medium">Total Amount:</span>
                    <span className="text-blue-600 dark:text-blue-500 font-bold text-lg">
                      KES {purchaseOrderSummary?.totalAmount?.toLocaleString('en-KE') || '0'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-sm border border-gray-300 dark:border-gray-600">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                  <User size={16} />
                  Supplier Information
                </h4>
                <div className="space-y-1">
                  <p className="text-gray-900 dark:text-white">{supplier.name}</p>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">{supplier.address}</p>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">{supplier.phone}</p>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">{supplier.email}</p>
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-sm border border-gray-300 dark:border-gray-600">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                  <Calendar size={16} />
                  Delivery Information
                </h4>
                <div className="space-y-1">
                  <p className="text-gray-600 dark:text-gray-400 text-sm">Lead Time: {supplier.deliveryLeadTime}</p>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">Payment Terms: {supplier.paymentTerms}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-yellow-100 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-800/30 rounded-sm p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-yellow-700 dark:text-yellow-500 font-medium mb-1">Important Notes</p>
                <ul className="text-gray-700 dark:text-gray-300 text-sm space-y-1">
                  <li>• This purchase order will be generated based on current stock deficits</li>
                  <li>• Quantities are calculated based on minimum stock requirements</li>
                  <li>• Urgent items (80%+) will be prioritized for immediate dispatch</li>
                  <li>• All prices are in Kenyan Shillings (KES)</li>
                  <li>• VAT at 16% is included in the total amount</li>
                </ul>
              </div>
            </div>
          </div>

          <button
            onClick={generatePurchaseOrder}
            disabled={isGenerating}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-500 dark:to-blue-600 hover:from-blue-700 hover:to-blue-800 dark:hover:from-blue-600 dark:hover:to-blue-700 text-white font-semibold rounded-sm transition-all duration-200 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Generating Purchase Order...
              </>
            ) : (
              <>
                <FileText size={20} />
                Generate Purchase Order
              </>
            )}
          </button>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <FileText className="w-8 h-8 text-green-600 dark:text-green-500" />
                Purchase Order Generated
              </h3>
              <p className="text-gray-600 dark:text-gray-400">Order Number: <span className="text-gray-900 dark:text-white font-medium">{purchaseOrder.poNumber}</span></p>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-sm text-sm">
                Ready for Submission
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-gray-100 dark:bg-gray-700/50 p-4 rounded-sm border border-gray-300 dark:border-gray-600">
              <p className="text-gray-600 dark:text-gray-400 text-sm">Order Date</p>
              <p className="text-gray-900 dark:text-white font-medium">
                {new Date(purchaseOrder.orderDate).toLocaleDateString('en-KE')}
              </p>
            </div>
            <div className="bg-gray-100 dark:bg-gray-700/50 p-4 rounded-sm border border-gray-300 dark:border-gray-600">
              <p className="text-gray-600 dark:text-gray-400 text-sm">Expected Delivery</p>
              <p className="text-gray-900 dark:text-white font-medium">
                {new Date(purchaseOrder.expectedDelivery).toLocaleDateString('en-KE')}
              </p>
            </div>
            <div className="bg-gray-100 dark:bg-gray-700/50 p-4 rounded-sm border border-gray-300 dark:border-gray-600">
              <p className="text-gray-600 dark:text-gray-400 text-sm">Total Amount</p>
              <p className="text-blue-600 dark:text-blue-500 font-bold text-lg">
                KES {purchaseOrder.summary.totalAmount.toLocaleString('en-KE')}
              </p>
            </div>
          </div>

          {/* Preview of Purchase Order */}
          <PreviewPurchaseOrder purchaseOrder={purchaseOrder} />

          {/* Action Buttons */}
          <ActionButtons
            copied={copied}
            downloadAsText={downloadAsText}
            printPurchaseOrder={printPurchaseOrder}
            copyToClipboard={copyToClipboard}
            emailPurchaseOrder={emailPurchaseOrder}
            setPurchaseOrder={setPurchaseOrder}
          />
        </div>
      )}
    </div>
  );
};

export default PurchaseOrderGenerator;