import { useState, useEffect, useRef } from "react";
import {
  X,
  Mail,
  Phone,
  Calendar,
  Clock,
  FileText,
  CheckCircle,
  XCircle,
  RefreshCw,
  Paperclip,
  Eye,
  EyeOff,
  Copy,
} from "lucide-react";
import { SimpleEditor } from "@/components/tiptap-templates/simple/simple-editor";
import { toast } from "react-hot-toast";
import {
  CONSULTATION_EMAIL_TEMPLATES,
  fillTemplate,
} from "../components/consultation-email-templates";
import FooterActions from "./FooterActions";
import { useSendConsultationEmailWithAttachments } from "../../hooks/consultation-emails.hook";
const ConsultationEmailModal = ({ isOpen, onClose, consultation }) => {
  const [selectedTemplateId, setSelectedTemplateId] = useState("accept");
  const [emailSubject, setEmailSubject] = useState("");
  const [emailContent, setEmailContent] = useState("");
  const [attachments, setAttachments] = useState([]);
  const [isSending, setIsSending] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [activeTab, setActiveTab] = useState("compose"); // 'compose' or 'preview'
  const [ccEmails, setCcEmails] = useState("");
  const [bccEmails, setBccEmails] = useState("");
  const [isValidating, setIsValidating] = useState(false);

  const fileInputRef = useRef(null);

  const sendEmailMutation = useSendConsultationEmailWithAttachments();

  // Initialize with consultation data
  useEffect(() => {
    if (consultation && isOpen) {
      const selectedTemplate = CONSULTATION_EMAIL_TEMPLATES.find(
        (t) => t.id === selectedTemplateId,
      );
      if (selectedTemplate) {
        const filled = fillTemplate(selectedTemplate, consultation);
        setEmailSubject(filled.subject);
        setEmailContent(filled.content);
      }
    }
  }, [consultation, isOpen, selectedTemplateId]);

  // Handle template selection
  const handleTemplateSelect = (templateId) => {
    setSelectedTemplateId(templateId);
    const selectedTemplate = CONSULTATION_EMAIL_TEMPLATES.find(
      (t) => t.id === templateId,
    );
    if (selectedTemplate) {
      const filled = fillTemplate(selectedTemplate, consultation);
      setEmailSubject(filled.subject);
      setEmailContent(filled.content);

      // If using custom template, clear content
      if (templateId === "custom") {
        setEmailSubject("");
        setEmailContent("");
      }
    }
  };

  // Handle file attachment
  const handleFileAttach = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter((file) => file.size <= 10 * 1024 * 1024); // 10MB limit

    if (validFiles.length !== files.length) {
      toast.error("Some files exceed 10MB limit");
    }

    setAttachments((prev) => [...prev, ...validFiles]);
    e.target.value = null; // Reset input
  };

  const removeAttachment = (index) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  // Validate email before sending
  const validateEmail = () => {
    if (!emailSubject.trim()) {
      toast.error("Please enter an email subject");
      return false;
    }

    if (!emailContent.trim()) {
      toast.error("Please enter email content");
      return false;
    }

    if (!consultation.customerEmail) {
      toast.error("Customer email is required");
      return false;
    }

    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(consultation.customerEmail)) {
      toast.error("Invalid customer email format");
      return false;
    }

    return true;
  };

  // Send email
  const handleSendEmail = async () => {
    if (!validateEmail()) return;

    setIsValidating(true);
    await new Promise((resolve) => setTimeout(resolve, 500)); // optional validation delay
    setIsValidating(false);

    const emailData = {
      to: consultation.customerEmail,
      cc: ccEmails
        .split(",")
        .map((email) => email.trim())
        .filter(Boolean),
      bcc: bccEmails
        .split(",")
        .map((email) => email.trim())
        .filter(Boolean),
      subject: emailSubject,
      content: emailContent,
      consultationId: consultation.id,
      templateUsed: selectedTemplateId,
      status: consultation.status,
      sentAt: new Date().toISOString(),
    };

    setIsSending(true);
    try {
      await sendEmailMutation.mutateAsync({ emailData, attachments });
      onClose();
    } catch (error) {
      toast.error(
        `Failed to send email: ${error.response?.data?.message || error.message}`,
      );
    } finally {
      setIsSending(false);
    }
  };

  // Copy content to clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard
      .writeText(text)
      .then(() => toast.success("Copied to clipboard"))
      .catch(() => toast.error("Failed to copy"));
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  if (!isOpen) return null;

  const selectedTemplate = CONSULTATION_EMAIL_TEMPLATES.find(
    (t) => t.id === selectedTemplateId,
  );

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 z-[200] flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 m-8 h-[calc(100vh-4rem)] overflow-hidden overflow-y-auto animate-fadeIn">
        {/* Modal Header */}
        <div className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-800 p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-start gap-6">
                {/* Customer Avatar & Info */}
                <div className="shrink-0">
                  <div className="h-16 w-16 bg-gradient-to-br from-blue-600 to-blue-500 dark:from-primary dark:to-blue-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                    {consultation.customerName.charAt(0)}
                  </div>
                </div>

                {/* Customer Details */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Mail className="h-5 w-5 text-blue-600 dark:text-primary" />
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      Send Email to {consultation.customerName}
                    </h2>
                  </div>

                  {/* Consultation Info Cards */}
                  <div className="flex flex-wrap items-center gap-3 mb-4">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-800/50 rounded-md">
                      <Calendar className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {new Date(
                          consultation.consultationDate,
                        ).toLocaleDateString("en-US", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-800/50 rounded-md">
                      <Clock className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {consultation.consultationTime}
                      </span>
                    </div>

                    <div className="px-3 py-1.5 bg-blue-50 dark:bg-primary/10 border border-blue-200 dark:border-primary/30 rounded-md">
                      <code className="text-sm font-mono text-blue-700 dark:text-primary">
                        #{consultation.referenceNumber}
                      </code>
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-lg">
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                        Recipient Email
                      </label>
                      <div className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-900/30 rounded border border-gray-300 dark:border-gray-700">
                        <Mail className="h-4 w-4 text-gray-500 dark:text-gray-500 shrink-0" />
                        <div className="min-w-0">
                          <p className="text-sm text-gray-900 dark:text-white truncate">
                            {consultation.customerEmail}
                          </p>
                          <p className="text-xs text-gray-600 dark:text-gray-500 truncate">
                            {consultation.customerName}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                        Contact Phone
                      </label>
                      <div className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-900/30 rounded border border-gray-300 dark:border-gray-700">
                        <Phone className="h-4 w-4 text-gray-500 dark:text-gray-500 shrink-0" />
                        <p className="text-sm text-gray-900 dark:text-white">
                          {consultation.customerPhone}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="shrink-0 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white p-2 hover:bg-gray-100 dark:hover:bg-gray-800/50 rounded-lg transition-all duration-200 ml-4"
              aria-label="Close modal"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="flex flex-1 min-h-0">
          {/* Left Sidebar - Templates */}
          <div className="w-64 border-r border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/20 p-4 overflow-y-auto">
            <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-3">
              Email Templates
            </h3>
            <div className="space-y-2">
              {CONSULTATION_EMAIL_TEMPLATES.map((template) => (
                <button
                  key={template.id}
                  onClick={() => handleTemplateSelect(template.id)}
                  className={`w-full text-left p-3 rounded-sm transition-colors ${
                    selectedTemplateId === template.id
                      ? "bg-blue-100 dark:bg-primary/20 border border-blue-300 dark:border-primary/30"
                      : "hover:bg-gray-100 dark:hover:bg-gray-800/50 border border-transparent"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={`font-medium ${selectedTemplateId === template.id ? "text-gray-900 dark:text-white" : "text-gray-700 dark:text-gray-300"}`}
                    >
                      {template.name}
                    </span>
                    {template.category === "accept" && (
                      <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-500" />
                    )}
                    {template.category === "decline" && (
                      <XCircle className="h-4 w-4 text-red-600 dark:text-red-500" />
                    )}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-500">
                    {template.category === "accept"
                      ? "Accept booking"
                      : template.category === "decline"
                        ? "Decline booking"
                        : template.category === "reschedule"
                          ? "Request reschedule"
                          : "Custom message"}
                  </div>
                </button>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-800">
              <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-3">
                Quick Actions
              </h3>
              <div className="space-y-2">
                <button
                  onClick={() => setPreviewMode(!previewMode)}
                  className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white w-full p-2 hover:bg-gray-100 dark:hover:bg-gray-800/50 rounded-sm"
                >
                  {previewMode ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                  {previewMode ? "Hide Preview" : "Show Preview"}
                </button>
                <button
                  onClick={() => copyToClipboard(emailContent)}
                  className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white w-full p-2 hover:bg-gray-100 dark:hover:bg-gray-800/50 rounded-sm"
                >
                  <Copy className="h-4 w-4" />
                  Copy Content
                </button>
                <button
                  onClick={() => {
                    const filled = fillTemplate(selectedTemplate, consultation);
                    setEmailSubject(filled.subject);
                    setEmailContent(filled.content);
                    toast.success("Template refreshed");
                  }}
                  className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white w-full p-2 hover:bg-gray-100 dark:hover:bg-gray-800/50 rounded-sm"
                >
                  <RefreshCw className="h-4 w-4" />
                  Refresh Template
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
            {/* Tab Navigation */}
            <div className="border-b border-gray-200 dark:border-gray-800">
              <div className="flex">
                <button
                  onClick={() => setActiveTab("compose")}
                  className={`px-6 py-3 text-sm font-medium ${
                    activeTab === "compose"
                      ? "text-blue-600 dark:text-primary border-b-2 border-blue-600 dark:border-primary"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300"
                  }`}
                >
                  Compose Email
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 min-h-0">
              {activeTab === "compose" ? (
                <>
                  <div className="mb-6">
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2 block">
                      Subject
                      <span className="text-red-500 ml-1">*</span>
                    </label>
                    <input
                      type="text"
                      value={emailSubject}
                      onChange={(e) => setEmailSubject(e.target.value)}
                      className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-sm text-gray-900 dark:text-white text-lg placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-primary"
                      placeholder="Enter email subject..."
                    />
                  </div>

                  {/* Content Editor */}
                  <div className="mb-6">
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2 block">
                      Email Content
                      <span className="text-red-500 ml-1">*</span>
                    </label>
                    <div className="border border-gray-300 dark:border-gray-700 rounded-sm overflow-hidden consultation-email-modal">
                      <SimpleEditor
                        initialContent={emailContent}
                        onContentChange={setEmailContent}
                        editable={true}
                        placeholder="Write your email content here..."
                        showToolbar={true}
                        contentClassName="min-h-[300px]"
                      />
                    </div>
                  </div>

                  {/* Attachments */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-3">
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Attachments
                      </label>
                      <span className="text-xs text-gray-600 dark:text-gray-500">
                        Max 10MB per file • {attachments.length} file(s)
                      </span>
                    </div>

                    <div className="space-y-3">
                      {/* Attachment List */}
                      {attachments.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/50 rounded-sm border border-gray-300 dark:border-gray-700"
                        >
                          <div className="flex items-center gap-3">
                            <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            <div>
                              <div className="text-sm text-gray-900 dark:text-white">
                                {file.name}
                              </div>
                              <div className="text-xs text-gray-600 dark:text-gray-500">
                                {formatFileSize(file.size)}
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => removeAttachment(index)}
                            className="text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 p-1"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}

                      {/* Add Attachment Button */}
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full p-4 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-sm hover:border-blue-400 dark:hover:border-primary/50 transition-colors text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white"
                      >
                        <div className="flex flex-col items-center">
                          <Paperclip className="h-6 w-6 mb-2" />
                          <span className="text-sm">
                            Click to add attachments
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-500">
                            or drag and drop files
                          </span>
                        </div>
                      </button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        onChange={handleFileAttach}
                        className="hidden"
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt"
                      />
                    </div>
                  </div>
                </>
              ) : (
                <></>
              )}
            </div>

            {/* Footer Actions */}
            <FooterActions
              consultation={consultation}
              selectedTemplate={selectedTemplate}
              onClose={onClose}
              isSending={isSending}
              activeTab={activeTab}
              handleSendEmail={handleSendEmail}
              isValidating={isValidating}
              emailSubject={emailSubject}
              emailContent={emailContent}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConsultationEmailModal;
