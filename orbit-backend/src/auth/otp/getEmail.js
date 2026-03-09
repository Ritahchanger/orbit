require("dotenv").config();
const getEmailTemplate = (purpose, data) => {
  const { otp } = data;
  const purposeText = purpose.replace("_", " ");

  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${purposeText}</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            background-color: #f4f6f8;
            font-family: Arial, Helvetica, sans-serif;
            color: #333333;
        }

        .container {
            max-width: 600px;
            margin: 24px auto;
            background-color: #ffffff;
            border: 1px solid #e5e7eb;
            border-radius: 2px;
        }

        .header {
            padding: 24px;
            border-bottom: 1px solid #e5e7eb;
            text-align: center;
        }

        .header h1 {
            margin: 0;
            font-size: 22px;
            font-weight: 600;
            color: #111827;
        }

        .header p {
            margin: 6px 0 0;
            font-size: 14px;
            color: #6b7280;
            text-transform: capitalize;
        }

        .content {
            padding: 32px 24px;
        }

        .content p {
            font-size: 15px;
            line-height: 1.6;
            margin: 0 0 16px;
            color: #374151;
        }

        .otp-box {
            margin: 24px 0;
            padding: 16px;
            text-align: center;
            border: 1px solid #d1d5db;
            background-color: #f9fafb;
            border-radius: 2px;
            font-size: 28px;
            font-weight: 700;
            letter-spacing: 6px;
            color: #111827;
        }

        .notice {
            background-color: #fff7ed;
            border: 1px solid #fed7aa;
            padding: 12px;
            border-radius: 2px;
            font-size: 14px;
            color: #92400e;
            margin-bottom: 20px;
        }

        .footer {
            padding: 20px 24px;
            border-top: 1px solid #e5e7eb;
            font-size: 12px;
            color: #6b7280;
            text-align: center;
            background-color: #fafafa;
            border-radius: 0 0 2px 2px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Mega Gamers</h1>
            <p>${purposeText}</p>
        </div>

        <div class="content">
            <p>Hello,</p>

            <p>
                You requested to complete the following action:
                <strong>${purposeText}</strong>.
                Please use the one-time password (OTP) below to proceed.
            </p>

            <div class="otp-box">${otp}</div>

            <div class="notice">
                This OTP is valid for <strong>10 minutes</strong>.
                For security reasons, do not share this code with anyone.
            </div>

            <p>
                If you did not initiate this request, you can safely ignore this email
                or contact our support team if you have concerns.
            </p>

            <p>
                Regards,<br />
                <strong>Mega Gamers Support Team</strong>
            </p>
        </div>

        <div class="footer">
            <p>© ${new Date().getFullYear()} Mega Gamers. All rights reserved.</p>
            <p>This is an automated message. Please do not reply.</p>
            <p>Support: ${process.env.SUPPORT_EMAIL || "support@megagamers.com"}</p>
        </div>
    </div>
</body>
</html>
    `;
};

module.exports = { getEmailTemplate };
