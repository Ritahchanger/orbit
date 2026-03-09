import { api } from "../../api/axios-conf";
const otpApi = {
  // ============ REGISTRATION OTP ============
  sendVerificationOTP: async (contactInfo) => {
    const response = await api.post("/otp/send-verification", contactInfo);
    return response.data;
  },
  verifyRegistrationOTP: async (verificationData) => {
    const response = await api.post(
      "/otp/verify-registration",
      verificationData,
    );
    return response.data;
  },
  // ============ PASSWORD RESET OTP ============
  sendPasswordResetOTP: async (email) => {
    const response = await api.post("/otp/send-password-reset", { email });
    return response.data;
  },
  verifyPasswordResetOTP: async (resetData) => {
    const response = await api.post("/otp/verify-password-reset", resetData);
    return response.data;
  },

  validateResetToken: async (token) => {
    const response = await api.post("/otp/validate-reset-token", { token });
    return response.data;
  },
  // ============ LOGIN OTP ============
  sendLoginOTP: async (contactInfo) => {
    const response = await api.post("/otp/send-login", contactInfo);
    return response.data;
  },
  verifyLoginOTP: async (loginData) => {
    const response = await api.post("/otp/verify-login", loginData);
    return response.data;
  },
  // ============ GENERAL OTP OPERATIONS ============
  resendOTP: async (resendData) => {
    const response = await api.post("/otp/resend", resendData);
    return response.data;
  },
  checkOTPStatus: async (params = {}) => {
    const response = await api.get("/otp/status", { params });
    return response.data;
  },
  resetPassword: async (resetData) => {
    const response = await api.post("/otp/reset-password", resetData);
    return response.data;
  },
};

export default otpApi;
