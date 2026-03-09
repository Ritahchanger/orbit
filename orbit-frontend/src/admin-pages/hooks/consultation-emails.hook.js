import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import consultationEmailApi from "../services/consultation-email-api";
import { toast } from "react-hot-toast";

// ================= MUTATIONS ==================

/**
 * Send consultation email (no attachments)
 */
export const useSendConsultationEmail = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (emailData) => consultationEmailApi.sendEmail(emailData),
    onSuccess: (data) => {
      toast.success(data.message || "Email sent successfully");
      queryClient.invalidateQueries({ queryKey: ["consultationEmails"] });
      return data;
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to send email");
      throw error;
    },
  });
};

/**
 * Send consultation email with attachments
 */
export const useSendConsultationEmailWithAttachments = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ emailData, attachments }) =>
      consultationEmailApi.sendEmailWithAttachments(emailData, attachments),
    onSuccess: (data) => {
      toast.success(data.message || "Email with attachments sent successfully");
      queryClient.invalidateQueries({ queryKey: ["consultationEmails"] });
      return data;
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message ||
          "Failed to send email with attachments",
      );
      throw error;
    },
  });
};

/**
 * Resend consultation email by email log ID
 */
export const useResendConsultationEmail = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (emailLogId) => consultationEmailApi.resendEmail(emailLogId),
    onSuccess: (data, emailLogId) => {
      toast.success(data.message || "Email resent successfully");
      queryClient.invalidateQueries({ queryKey: ["consultationEmails"] });
      return data;
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to resend email");
      throw error;
    },
  });
};

/**
 * Delete a single consultation email by ID
 */
export const useDeleteConsultationEmail = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (emailId) => consultationEmailApi.deleteEmail(emailId),
    onSuccess: (data) => {
      toast.success(data.message || "Email deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["consultationEmails"] });
      return data;
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to delete email");
      throw error;
    },
  });
};

/**
 * Delete multiple consultation emails by IDs
 */
export const useDeleteMultipleConsultationEmails = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (emailIds) =>
      consultationEmailApi.deleteMultipleEmails(emailIds),
    onSuccess: (data) => {
      toast.success(data.message || "Emails deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["consultationEmails"] });
      return data;
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to delete emails");
      throw error;
    },
  });
};

// ================= QUERIES ==================

/**
 * Get all consultation emails
 */
export const useGetAllConsultationEmails = () => {
  return useQuery({
    queryKey: ["consultationEmails"],
    queryFn: () => consultationEmailApi.getAllEmails(),
    staleTime: 5 * 60 * 1000, // cache for 5 minutes
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to fetch emails");
    },
  });
};
