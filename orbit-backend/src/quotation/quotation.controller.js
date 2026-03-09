const quotationSchema = require("../validators/quotation.validator");

const quoteRequestService = require("./quotation.service");

const puppeteer = require("puppeteer");

const { isValidObjectId } = require("mongoose");

const QuotationRequest = require("./quotation.model");

const quotationEmail = require("./quotation.email")

// Configuration
const PUPPETEER_OPTIONS = {
  headless: "new",
  args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
};

const PDF_OPTIONS = {
  format: "A4",
  printBackground: true,
  margin: {
    top: "20px",
    right: "20px",
    bottom: "20px",
    left: "20px",
  },
  preferCSSPageSize: true,
};

// Utility: Sanitize filename
const sanitizeFilename = (filename) => {
  return filename.replace(/[^a-zA-Z0-9.-]/g, "_").slice(0, 100);
};

// Utility: Validate HTML size
const validateHtmlSize = (html, maxSize = 5 * 1024 * 1024) => {
  const size = Buffer.byteLength(html, "utf8");
  if (size > maxSize) {
    throw new Error(`HTML content too large: ${size} bytes (max: ${maxSize})`);
  }
};

const addQuoteRequest = async (req, res) => {
  try {
    const { error } = quotationSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }

    const quoteRequest = await quoteRequestService.createQuoteRequest(req.body);

    res.status(201).json({
      success: true,
      message: "Quote Request submitted successfully",
      quoteRequest,
    });
  } catch (error) {
    console.error("Add quote request error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const getAllQuoteRequests = async (req, res) => {
  try {
    const quoteRequests = await quoteRequestService.fetchAllQuoteRequests();

    res.status(200).json({
      success: true,
      count: quoteRequests.length,
      quoteRequests,
    });
  } catch (error) {
    console.error("Get quote requests error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const deleteQuoteRequest = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid quote ID format",
      });
    }

    const deletedQuote = await quoteRequestService.deleteQuoteRequestById(id);

    if (!deletedQuote) {
      return res.status(404).json({
        success: false,
        message: "Quote Request not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Quote Request deleted successfully",
    });
  } catch (error) {
    console.error("Delete quote request error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Generate PDF from HTML (use with caution - security risk if HTML not sanitized)
const generatePdf = async (req, res) => {
  let browser = null;

  try {
    const { html, filename, quotationId } = req.body;

    if (!html) {
      return res.status(400).json({
        success: false,
        message: "HTML content is required",
      });
    }


    if(!quotationId){

      return res.status(400).json({
        success:false,
        message:"Quotation ID is required"
      })

    }
    // Validate HTML size
    validateHtmlSize(html);

    // Sanitize filename
    const safeFilename = sanitizeFilename(filename);

    console.log("Starting PDF generation...");

    const quotation = await QuotationRequest.findById(quotationId);

    if(!quotation){

      return res.status(404).json({

        success:false,

        message:"Quotation request not found",

      })

    }

    console.log("✅ Quotation found:", {
      id: quotation._id,
      email: quotation.email,
      service: quotation.serviceNeeded
    });

    browser = await puppeteer.launch(PUPPETEER_OPTIONS);

    const page = await browser.newPage();

    // Set timeout
    await page.setDefaultNavigationTimeout(60000);

    // Listen for console messages
    page.on("console", (msg) => console.log("Puppeteer:", msg.text()));

    // Set content and wait for everything to load
    await page.setContent(html, {
      waitUntil: ["networkidle0", "load", "domcontentloaded"],
    });

    // Wait for dynamic content (using non-deprecated method)
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Generate PDF
    const pdf = await page.pdf(PDF_OPTIONS);

    console.log("PDF generated successfully, size:", pdf.length);

    
    // Send email with PDF attachment
    console.log("📧 Sending quotation email...");
    await quotationEmail.sendQuotationEmail(quotation, pdf, safeFilename);

    // Update quotation as responded
    await QuotationRequest.findByIdAndUpdate(quotationId, { responded: true });

    console.log("📤 Sending PDF response...");

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${safeFilename}"`
    );
    res.setHeader("Content-Length", pdf.length);
    res.send(pdf);
  } catch (error) {
    console.error("PDF generation error:", error);
    res.status(500).json({
      success: false,
      message: `Failed to generate PDF: ${error.message}`,
    });
  } finally {
    if (browser) {
      await browser.close();
    }
  }
};

// Generate PDF from quote ID (RECOMMENDED APPROACH)
const generatePdfFromQuote = async (req, res) => {
  let browser = null;

  try {
    const { id } = req.params;

    // Validate MongoDB ObjectId
    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid quote ID format",
      });
    }

    // Fetch quote data
    const quote = await quoteRequestService.getQuoteRequestById(id);
    if (!quote) {
      return res.status(404).json({
        success: false,
        message: "Quote not found",
      });
    }

    // Generate HTML template with quote data
    const html = generateQuotationTemplate(quote);

    browser = await puppeteer.launch(PUPPETEER_OPTIONS);
    const page = await browser.newPage();

    await page.setViewport({ width: 1200, height: 800 });
    await page.setContent(html, {
      waitUntil: ["networkidle0"],
    });

    const pdf = await page.pdf(PDF_OPTIONS);
    const filename = `quotation-${quote.quoteNumber || id}.pdf`;

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename="${filename}"`);
    res.send(pdf);
  } catch (error) {
    console.error("PDF from quote error:", error);
    res.status(500).json({
      success: false,
      message: `Failed to generate PDF from quote: ${error.message}`,
    });
  } finally {
    if (browser) {
      await browser.close();
    }
  }
};

// Enhanced HTML Template Generator
const generateQuotationTemplate = (quote) => {
  // Escape HTML to prevent XSS
  const escape = (str) => {
    if (!str) return "N/A";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  };

  // Calculate totals
  const items = quote.items || [];
  const subtotal = items.reduce(
    (sum, item) => sum + (item.quantity * item.price || 0),
    0
  );
  const tax = subtotal * 0.16; // Example: 16% tax
  const total = subtotal + tax;

  // Generate items rows
  const itemsRows = items
    .map(
      (item) => `
    <tr>
      <td>${escape(item.description)}</td>
      <td style="text-align: center;">${escape(item.quantity)}</td>
      <td style="text-align: right;">$${(item.price || 0).toFixed(2)}</td>
      <td style="text-align: right;">$${(
        item.quantity * item.price || 0
      ).toFixed(2)}</td>
    </tr>
  `
    )
    .join("");

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        * { box-sizing: border-box; }
        body { 
          font-family: 'Segoe UI', Arial, sans-serif; 
          margin: 0; 
          padding: 20px; 
          color: #333;
          line-height: 1.6;
        }
        .header { 
          display: flex; 
          justify-content: space-between; 
          margin-bottom: 30px;
          border-bottom: 3px solid #2c3e50;
          padding-bottom: 20px;
        }
        .company-info h1 { 
          margin: 0 0 10px 0; 
          color: #2c3e50;
          font-size: 28px;
        }
        .company-info p { margin: 5px 0; }
        .quotation-title h2 { 
          margin: 0 0 10px 0;
          color: #2c3e50;
        }
        .quotation-title p { margin: 5px 0; }
        .quotation-details { 
          background: #f8f9fa; 
          padding: 20px; 
          border-radius: 8px;
          margin-bottom: 30px;
          border-left: 4px solid #2c3e50;
        }
        .quotation-details h3 {
          margin-top: 0;
          color: #2c3e50;
        }
        .quotation-details p { margin: 8px 0; }
        table { 
          width: 100%; 
          border-collapse: collapse; 
          margin: 20px 0;
        }
        th, td { 
          border: 1px solid #ddd; 
          padding: 12px; 
          text-align: left;
        }
        th { 
          background-color: #2c3e50; 
          color: white;
          font-weight: 600;
        }
        tr:nth-child(even) { background-color: #f9f9f9; }
        tr:hover { background-color: #f5f5f5; }
        .totals { 
          margin-top: 20px;
          float: right;
          width: 300px;
        }
        .totals table {
          margin: 0;
        }
        .totals td {
          border: none;
          padding: 8px;
        }
        .totals .total-row {
          font-weight: bold;
          font-size: 1.2em;
          border-top: 2px solid #2c3e50;
          background-color: #f8f9fa;
        }
        .footer { 
          clear: both;
          margin-top: 80px; 
          padding-top: 20px;
          border-top: 2px solid #ddd;
          text-align: center; 
          color: #666;
          font-size: 0.9em;
        }
        .terms {
          margin-top: 30px;
          padding: 15px;
          background: #fff9e6;
          border-radius: 5px;
          font-size: 0.9em;
        }
        .terms h4 { margin-top: 0; }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="company-info">
          <h1>Your Company Name</h1>
          <p>123 Business Street</p>
          <p>City, State 12345</p>
          <p>Phone: +1 (234) 567-8900</p>
          <p>Email: info@yourcompany.com</p>
        </div>
        <div class="quotation-title">
          <h2>QUOTATION</h2>
          <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
          <p><strong>Quote #:</strong> ${escape(quote.quoteNumber) || "N/A"}</p>
          <p><strong>Valid Until:</strong> ${new Date(
            Date.now() + 30 * 24 * 60 * 60 * 1000
          ).toLocaleDateString()}</p>
        </div>
      </div>
      
      <div class="quotation-details">
        <h3>Customer Information</h3>
        <p><strong>Name:</strong> ${escape(quote.customerName)}</p>
        <p><strong>Email:</strong> ${escape(quote.customerEmail)}</p>
        <p><strong>Phone:</strong> ${escape(quote.customerPhone)}</p>
        ${
          quote.customerAddress
            ? `<p><strong>Address:</strong> ${escape(
                quote.customerAddress
              )}</p>`
            : ""
        }
      </div>
      
      <h3>Items</h3>
      <table>
        <thead>
          <tr>
            <th>Description</th>
            <th style="width: 100px; text-align: center;">Quantity</th>
            <th style="width: 120px; text-align: right;">Unit Price</th>
            <th style="width: 120px; text-align: right;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${
            itemsRows ||
            '<tr><td colspan="4" style="text-align: center;">No items</td></tr>'
          }
        </tbody>
      </table>
      
      <div class="totals">
        <table>
          <tr>
            <td>Subtotal:</td>
            <td style="text-align: right;">$${subtotal.toFixed(2)}</td>
          </tr>
          <tr>
            <td>Tax (16%):</td>
            <td style="text-align: right;">$${tax.toFixed(2)}</td>
          </tr>
          <tr class="total-row">
            <td>Total:</td>
            <td style="text-align: right;">$${total.toFixed(2)}</td>
          </tr>
        </table>
      </div>
      
      <div class="terms">
        <h4>Terms & Conditions</h4>
        <ul style="margin: 10px 0; padding-left: 20px;">
          <li>This quotation is valid for 30 days from the date of issue</li>
          <li>Payment terms: 50% deposit, balance on completion</li>
          <li>Delivery time: 2-4 weeks from order confirmation</li>
          <li>Prices are subject to change without notice</li>
        </ul>
      </div>
      
      <div class="footer">
        <p><strong>Thank you for your business!</strong></p>
        <p>For questions, please contact us at info@yourcompany.com</p>
      </div>
    </body>
    </html>
  `;
};

module.exports = {
  addQuoteRequest,
  getAllQuoteRequests,
  deleteQuoteRequest,
  generatePdf,
  generatePdfFromQuote,
};
