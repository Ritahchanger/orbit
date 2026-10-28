const { transporter } = require("../../utils/transporter");
const sendConsultationEmail = async ({
  to,
  cc = [],
  bcc = [],
  subject,
  content,
  attachments = [],
}) => {
  const mailOptions = {
    from: `"Consultation Team" <${process.env.COMPANY_EMAIL}>`,
    to,
    cc: cc.length ? cc : undefined,
    bcc: bcc.length ? bcc : undefined,
    subject,
    html: content,
    attachments: attachments.map((file) => ({
      filename: file.originalname,
      content: file.buffer,
      contentType: file.mimetype,
    })),
  };
  return transporter.sendMail(mailOptions);
};
module.exports = {
  sendConsultationEmail,
};
