import { api } from "../../api/axios-conf";

const consultationEmailApi = {
  sendEmail: async (emailData) => {
    const response = await api.post("/consultations/send-email", emailData);
    return response.data;
  },

  sendEmailWithAttachments: async (emailData, attachments = []) => {
    const formData = new FormData();
    Object.entries(emailData).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach((v) => formData.append(key, v));
      } else if (value !== undefined && value !== null) {
        formData.append(key, value);
      }
    });

    attachments.forEach((file) => {
      formData.append("attachments", file);
    });

    const response = await api.post("/consultations/send-email", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  // ✅ Get all emails (filtering done on frontend)
  getAllEmails: async () => {
    const response = await api.get("/consultations/emails");
    return response.data;
  },

  resendEmail: async (emailLogId) => {
    const response = await api.post(
      `/consultations/emails/${emailLogId}/resend`,
    );
    return response.data;
  },

  deleteEmail: async (emailId) => {
    const response = await api.delete(`/consultations/email/${emailId}`);
    return response.data;
  },

  deleteMultipleEmails: async (emailIds = []) => {
    const response = await api.delete(`/consultations/emails`, {
      data: { ids: emailIds },
    });
    return response.data;
  },
};

export default consultationEmailApi;
