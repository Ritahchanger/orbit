// Email Templates Utility
const getWelcomeEmailTemplate = ({
    firstName,
    lastName,
    email,
    password,
    loginUrl = `${process.env.FRONTEND_URL}/login`
}) => {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Welcome to Mega Gamers</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            background-color: #f4f6f8;
            color: #111827;
            font-family:
  -apple-system,
  BlinkMacSystemFont,
  "Segoe UI",
  Roboto,
  Helvetica,
  Arial,
  sans-serif;

        }

        .container {
            max-width: 600px;
            margin: 24px auto;
            background-color: #ffffff;
            border: 1px solid #e5e7eb;
            border-radius: 2px;
        }

        .header {
            padding: 28px 24px;
            text-align: center;
            border-bottom: 1px solid #e5e7eb;
            background-color: #111827;
            border-radius: 2px 2px 0 0;
        }

        .header h1 {
            margin: 0;
            font-size: 22px;
            font-weight: 600;
            color: #ffffff;
        }

        .header p {
            margin-top: 6px;
            font-size: 14px;
            color: #d1d5db;
        }

        .content {
            padding: 32px 24px;
        }

        .content p {
            font-size: 15px;
            line-height: 1.6;
            margin-bottom: 16px;
            color: #374151;
        }

        .credentials {
            margin: 24px 0;
            border: 1px solid #e5e7eb;
            border-radius: 2px;
            background-color: #f9fafb;
        }

        .credentials h3 {
            margin: 0;
            padding: 14px 16px;
            font-size: 16px;
            font-weight: 600;
            border-bottom: 1px solid #e5e7eb;
            background-color: #f3f4f6;
        }

        .credential-row {
            display: flex;
            padding: 12px 16px;
            font-size: 14px;
        }

        .credential-label {
            width: 90px;
            font-weight: 500;
            color: #6b7280;
        }

        .credential-value {
            font-weight: 600;
            color: #111827;
        }

        .password {
            color: #b91c1c;
            letter-spacing: 0.5px;
        }

        .notice {
            margin-top: 24px;
            padding: 14px 16px;
            background-color: #fff7ed;
            border: 1px solid #fed7aa;
            border-radius: 2px;
            font-size: 14px;
            color: #92400e;
        }

        .cta {
            margin: 32px 0;
            text-align: center;
        }

        .cta a {
            display: inline-block;
            padding: 12px 28px;
            background-color: #111827;
            color: #ffffff;
            text-decoration: none;
            font-size: 15px;
            font-weight: 600;
            border-radius: 2px;
        }

        .footer {
            padding: 20px 24px;
            text-align: center;
            font-size: 12px;
            color: #6b7280;
            border-top: 1px solid #e5e7eb;
            background-color: #fafafa;
            border-radius: 0 0 2px 2px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Mega Gamers</h1>
            <p>Administrator Account Created</p>
        </div>

        <div class="content">
            <p>Hello <strong>${firstName} ${lastName}</strong>,</p>

            <p>
                Your administrator account has been successfully created.
                You can now access the Mega Gamers management system using the credentials below.
            </p>

            <div class="credentials">
                <h3>Login Details</h3>

                <div class="credential-row">
                    <div class="credential-label">Email</div>
                    <div class="credential-value">${email}</div>
                </div>

                <div class="credential-row">
                    <div class="credential-label">Password</div>
                    <div class="credential-value password">${password}</div>
                </div>
            </div>

            <div class="notice">
                For security reasons, please change your password immediately after your first login
                and keep your credentials confidential.
            </div>

            <div class="cta">
                <a href="${loginUrl}">Log in to your account</a>
            </div>

            <p>
                If you did not expect this email or believe this account was created in error,
                please contact the support team immediately.
            </p>

            <p>
                Regards,<br />
                <strong>Mega Gamers Support Team</strong>
            </p>
        </div>

        <div class="footer">
            <p>© ${new Date().getFullYear()} Mega Gamers. All rights reserved.</p>
            <p>This is an automated message. Please do not reply.</p>
        </div>
    </div>
</body>
</html>
    `;
};

module.exports = {
    getWelcomeEmailTemplate
};
