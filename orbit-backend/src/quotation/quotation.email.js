const { transporter }= require("../utils/transporter");

const sendQuotationEmail = async (quote, pdfBuffer, filename) => {
  try {


    const { fullName, email, serviceNeeded, message, location } = quote;

    const emailTemplate = `
  <!DOCTYPE html>
  <html>
  <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Your Quotation from Ampalax</title>
      <style>
          body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              line-height: 1.6;
              color: #333;
              margin: 0;
              padding: 0;
              background-color: #f4f4f4;
          }
          .container {
              max-width: 600px;
              margin: 0 auto;
              background: #ffffff;
              border-radius:2px;
              overflow: hidden;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          .header {
              background: linear-gradient(135deg, #10b981, #059669);
              color: white;
              padding: 30px 20px;
              text-align: center;
          }
          .header h1 {
              margin: 0;
              font-size: 28px;
              font-weight: 700;
          }
          .header p {
              margin: 10px 0 0 0;
              opacity: 0.9;
              font-size: 16px;
          }
          .content {
              padding: 30px;
          }
          .greeting {
              font-size: 18px;
              font-weight: 600;
              color: #111827;
              margin-bottom: 20px;
          }
          .message {
              background: #f8fafc;
              padding: 20px;
              border-radius:2px;
              border-left: 4px solid #10b981;
              margin: 20px 0;
          }
          .details {
              background: #f0fdf4;
              border: 1px solid #bbf7d0;
              border-radius: 2px;
              padding: 20px;
              margin: 20px 0;
          }
          .detail-item {
              margin-bottom: 10px;
              display: flex;
          }
          .detail-label {
              font-weight: 600;
              color: #065f46;
              min-width: 120px;
          }
          .detail-value {
              color: #374151;
          }
          .cta {
              text-align: center;
              margin: 30px 0;
          }
          .cta-button {
              display: inline-block;
              background: #10b981;
              color: white;
              padding: 14px 28px;
              text-decoration: none;
              border-radius: 2px;
              font-weight: 600;
              font-size: 16px;
          }
          .footer {
              background: #f8fafc;
              padding: 20px;
              text-align: center;
              color: #6b7280;
              font-size: 14px;
              border-top: 1px solid #e5e7eb;
          }
          .contact-info {
              margin: 15px 0;
          }
          .contact-item {
              margin: 5px 0;
          }
          .logo {
              font-size: 24px;
              font-weight: bold;
              color: #10b981;
              margin-bottom: 10px;
          }
      </style>
  </head>
  <body>
      <div class="container">
          <div class="header">
              <h1>Your Quotation is Ready!</h1>
              <p>Ampalax - Professional ${serviceNeeded} Services</p>
          </div>
          
          <div class="content">
              <div class="greeting">
                  Dear ${fullName},
              </div>
              
              <p>Thank you for your interest in our ${serviceNeeded} services. We appreciate the opportunity to serve you and have prepared a detailed quotation based on your requirements.</p>
              
              <div class="message">
                  <strong>Your Message:</strong><br>
                  "${message}"
              </div>
              
              <div class="details">
                  <div class="detail-item">
                      <span class="detail-label">Service:</span>
                      <span class="detail-value">${serviceNeeded}</span>
                  </div>
                  <div class="detail-item">
                      <span class="detail-label">Location:</span>
                      <span class="detail-value">${location}</span>
                  </div>
                  <div class="detail-item">
                      <span class="detail-label">Reference ID:</span>
                      <span class="detail-value">${quote._id}</span>
                  </div>
                  <div class="detail-item">
                      <span class="detail-label">Date Prepared:</span>
                      <span class="detail-value">${new Date().toLocaleDateString()}</span>
                  </div>
              </div>
              
              <p>We have attached the detailed quotation in PDF format for your review. This document includes:</p>
              <ul>
                  <li>Detailed breakdown of services</li>
                  <li>Pricing information</li>
                  <li>Project timeline</li>
                  <li>Terms and conditions</li>
                  <li>Next steps to proceed</li>
              </ul>
              
              <div class="cta">
                  <p><strong>Ready to move forward?</strong></p>
                  <p>Reply to this email or call us directly to discuss the quotation or make any adjustments.</p>
              </div>
              
              <p>We're committed to providing you with the highest quality service and look forward to the opportunity to work with you.</p>
              
              <p>Best regards,<br>
              <strong>The Ampalax Team</strong></p>
          </div>
          
          <div class="footer">
              <div class="logo">AMPALAX</div>
              <div class="contact-info">
                  <div class="contact-item">📍 ${location}</div>
                  <div class="contact-item">📞 +254 712 345 678</div>
                  <div class="contact-item">📧 info@ampalax.com</div>
                  <div class="contact-item">🌐 www.ampalax.com</div>
              </div>
              <p>&copy; ${new Date().getFullYear()} Ampalax. All rights reserved.</p>
              <p style="font-size: 12px; color: #9ca3af;">
                  This quotation is valid for 30 days from the date of issue.
              </p>
          </div>
      </div>
  </body>
  </html>
      `;

    const mailOptions = {
      from:
        process.env.EMAIL_FROM ||
        '"Ampalax Quotations" <quotations@ampalax.com>',
      to: email,
      subject: `Your ${serviceNeeded} Quotation - Ampalax`,
      html: emailTemplate,
      attachments: [
        {
          filename: filename,
          content: pdfBuffer,
          contentType: "application/pdf",
        },
      ],
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Quotation email sent successfully to ${email}`);
  } catch (error) {
    console.error("❌ Error sending quotation email:", error);
    throw new Error(`Failed to send quotation email: ${error.message}`);
  }
};




module.exports = { sendQuotationEmail }