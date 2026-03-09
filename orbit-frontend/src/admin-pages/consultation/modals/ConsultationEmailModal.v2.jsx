import { useState, useEffect, useRef } from 'react';
import {
    X,
    Mail,
    Phone,
    Calendar,
    Clock,
    FileText,
    CheckCircle,
    XCircle,
    ChevronDown,
    RefreshCw,
    Paperclip,
    Copy,
    Menu,
} from 'lucide-react';
import { SimpleEditor } from '@/components/tiptap-templates/simple/simple-editor';
import { toast } from 'react-hot-toast';
import { CONSULTATION_EMAIL_TEMPLATES, fillTemplate, getTemplatesByCategory } from '../components/consultation-email-templates';

import FooterActions from './FooterActions';

const ConsultationEmailModal = ({
    isOpen,
    onClose,
    consultation,
    onSendEmail,
}) => {
    const [selectedTemplateId, setSelectedTemplateId] = useState('accept');
    const [emailSubject, setEmailSubject] = useState('');
    const [emailContent, setEmailContent] = useState('');
    const [attachments, setAttachments] = useState([]);
    const [isSending, setIsSending] = useState(false);
    const [ccEmails, setCcEmails] = useState('');
    const [bccEmails, setBccEmails] = useState('');
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [isValidating, setIsValidating] = useState(false);
    const [sidebarVisible, setSidebarVisible] = useState(false);

    const fileInputRef = useRef(null);
    const editorRef = useRef(null);

    // Initialize with consultation data
    useEffect(() => {
        if (consultation && isOpen) {
            const selectedTemplate = CONSULTATION_EMAIL_TEMPLATES.find(t => t.id === selectedTemplateId);
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
        const selectedTemplate = CONSULTATION_EMAIL_TEMPLATES.find(t => t.id === templateId);
        if (selectedTemplate) {
            const filled = fillTemplate(selectedTemplate, consultation);
            setEmailSubject(filled.subject);
            setEmailContent(filled.content);

            // If using custom template, clear content
            if (templateId === 'custom') {
                setEmailSubject('');
                setEmailContent('');
            }
        }
        setSidebarVisible(false);
    };

    // Handle file attachment
    const handleFileAttach = (e) => {
        const files = Array.from(e.target.files);
        const validFiles = files.filter(file => file.size <= 10 * 1024 * 1024); // 10MB limit

        if (validFiles.length !== files.length) {
            toast.error('Some files exceed 10MB limit');
        }

        setAttachments(prev => [...prev, ...validFiles]);
        e.target.value = null; // Reset input
    };

    const removeAttachment = (index) => {
        setAttachments(prev => prev.filter((_, i) => i !== index));
    };

    // Validate email before sending
    const validateEmail = () => {
        if (!emailSubject.trim()) {
            toast.error('Please enter an email subject');
            return false;
        }

        if (!emailContent.trim()) {
            toast.error('Please enter email content');
            return false;
        }

        if (!consultation.customerEmail) {
            toast.error('Customer email is required');
            return false;
        }

        // Simple email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(consultation.customerEmail)) {
            toast.error('Invalid customer email format');
            return false;
        }

        return true;
    };

    // Send email
    const handleSendEmail = async () => {
        if (!validateEmail()) return;

        setIsValidating(true);
        await new Promise(resolve => setTimeout(resolve, 500)); // Simulate validation
        setIsValidating(false);

        const emailData = {
            to: consultation.customerEmail,
            cc: ccEmails.split(',').map(email => email.trim()).filter(email => email),
            bcc: bccEmails.split(',').map(email => email.trim()).filter(email => email),
            subject: emailSubject,
            content: emailContent,
            attachments: attachments,
            consultationId: consultation.id,
            templateUsed: selectedTemplateId,
            status: consultation.status,
            sentAt: new Date().toISOString()
        };

        setIsSending(true);
        try {
            await onSendEmail(emailData);
            toast.success(`Email sent successfully to ${consultation.customerName}`);
            onClose();
        } catch (error) {
            toast.error(`Failed to send email: ${error.message}`);
        } finally {
            setIsSending(false);
        }
    };

    // Copy content to clipboard
    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text)
            .then(() => toast.success('Copied to clipboard'))
            .catch(() => toast.error('Failed to copy'));
    };

    // Format file size
    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    if (!isOpen) return null;

    const selectedTemplate = CONSULTATION_EMAIL_TEMPLATES.find(t => t.id === selectedTemplateId);

    return (
        <div className="fixed inset-0 bg-black/70 z-[200] flex items-center justify-center p-4">
            <div className="bg-dark-light border border-gray-700 m-8 h-[calc(100vh-4rem)] overflow-hidden overflow-y-auto animate-fadeIn relative">
                {/* Modal Header */}
                <div className="bg-gray-900/50 border-b border-gray-800 p-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setSidebarVisible(!sidebarVisible)}
                                className="text-gray-400 hover:text-white p-2 hover:bg-gray-800 rounded-sm transition-colors"
                                aria-label="Toggle sidebar"
                            >
                                <Menu className="h-5 w-5" />
                            </button>
                            <Mail className="h-7 w-7 text-primary" />
                            <div>
                                <h2 className="text-2xl font-bold text-white">
                                    Send Email to {consultation.customerName}
                                </h2>
                                <div className="flex items-center gap-4 mt-1 text-sm text-gray-400">
                                    <span className="flex items-center gap-1">
                                        <Calendar className="h-3 w-3" />
                                        {new Date(consultation.consultationDate).toLocaleDateString()}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Clock className="h-3 w-3" />
                                        {consultation.consultationTime}
                                    </span>
                                    <span className="px-2 py-0.5 bg-gray-800 rounded-sm">
                                        {consultation.referenceNumber}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-white p-2 hover:bg-gray-800 rounded-sm transition-colors"
                            aria-label="Close modal"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                <div className="flex flex-1 min-h-0 relative">
                    {/* Left Sidebar - Templates (Toggleable) */}
                    {sidebarVisible && (
                        <>
                            <div 
                                className="fixed inset-0 bg-black/50 z-10"
                                onClick={() => setSidebarVisible(false)}
                            />
                            <div className="absolute left-0 top-0 bottom-0 w-64 border-r border-gray-800 bg-gray-900 p-4 overflow-y-auto z-20 shadow-2xl">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="text-sm font-semibold text-gray-400">Email Templates</h3>
                                    <button
                                        onClick={() => setSidebarVisible(false)}
                                        className="text-gray-400 hover:text-white p-1"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>
                                <div className="space-y-2">
                                    {CONSULTATION_EMAIL_TEMPLATES.map((template) => (
                                        <button
                                            key={template.id}
                                            onClick={() => handleTemplateSelect(template.id)}
                                            className={`w-full text-left p-3 rounded-sm transition-colors ${selectedTemplateId === template.id
                                                ? 'bg-primary/20 border border-primary/30'
                                                : 'hover:bg-gray-800/50 border border-transparent'
                                                }`}
                                        >
                                            <div className="flex items-center justify-between mb-1">
                                                <span className={`font-medium ${selectedTemplateId === template.id ? 'text-white' : 'text-gray-300'}`}>
                                                    {template.name}
                                                </span>
                                                {template.category === 'accept' && (
                                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                                )}
                                                {template.category === 'decline' && (
                                                    <XCircle className="h-4 w-4 text-red-500" />
                                                )}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {template.category === 'accept' ? 'Accept booking' :
                                                    template.category === 'decline' ? 'Decline booking' :
                                                        template.category === 'reschedule' ? 'Request reschedule' :
                                                            'Custom message'}
                                            </div>
                                        </button>
                                    ))}
                                </div>

                                {/* Quick Actions */}
                                <div className="mt-6 pt-6 border-t border-gray-800">
                                    <h3 className="text-sm font-semibold text-gray-400 mb-3">Quick Actions</h3>
                                    <div className="space-y-2">
                                        <button
                                            onClick={() => copyToClipboard(emailContent)}
                                            className="flex items-center gap-2 text-sm text-gray-300 hover:text-white w-full p-2 hover:bg-gray-800/50 rounded-sm"
                                        >
                                            <Copy className="h-4 w-4" />
                                            Copy Content
                                        </button>
                                        <button
                                            onClick={() => {
                                                const filled = fillTemplate(selectedTemplate, consultation);
                                                setEmailSubject(filled.subject);
                                                setEmailContent(filled.content);
                                                toast.success('Template refreshed');
                                            }}
                                            className="flex items-center gap-2 text-sm text-gray-300 hover:text-white w-full p-2 hover:bg-gray-800/50 rounded-sm"
                                        >
                                            <RefreshCw className="h-4 w-4" />
                                            Refresh Template
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {/* Main Content */}
                    <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
                        <div className="flex-1 overflow-y-auto p-6 min-h-0">
                            {/* Recipient Info */}
                            <div className="mb-6 p-4 bg-gray-900/30 rounded-sm">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm text-gray-400 mb-1 block">To</label>
                                        <div className="flex items-center gap-2">
                                            <Mail className="h-4 w-4 text-gray-500" />
                                            <span className="text-white">{consultation.customerEmail}</span>
                                            <span className="text-xs text-gray-500">({consultation.customerName})</span>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-sm text-gray-400 mb-1 block">Phone</label>
                                        <div className="flex items-center gap-2">
                                            <Phone className="h-4 w-4 text-gray-500" />
                                            <span className="text-white">{consultation.customerPhone}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Advanced Options */}
                            <button
                                onClick={() => setShowAdvanced(!showAdvanced)}
                                className="flex items-center gap-2 text-sm text-gray-400 hover:text-white mb-4"
                            >
                                <ChevronDown className={`h-4 w-4 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
                                Advanced Options
                            </button>

                            {showAdvanced && (
                                <div className="mb-6 p-4 bg-gray-900/30 rounded-sm space-y-4">
                                    <div>
                                        <label className="text-sm text-gray-400 mb-2 block">CC</label>
                                        <input
                                            type="text"
                                            value={ccEmails}
                                            onChange={(e) => setCcEmails(e.target.value)}
                                            placeholder="cc1@example.com, cc2@example.com"
                                            className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-sm text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-primary"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">Separate multiple emails with commas</p>
                                    </div>
                                    <div>
                                        <label className="text-sm text-gray-400 mb-2 block">BCC</label>
                                        <input
                                            type="text"
                                            value={bccEmails}
                                            onChange={(e) => setBccEmails(e.target.value)}
                                            placeholder="bcc1@example.com, bcc2@example.com"
                                            className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-sm text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-primary"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Subject */}
                            <div className="mb-6">
                                <label className="text-sm font-medium text-gray-400 mb-2 block">
                                    Subject
                                    <span className="text-red-500 ml-1">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={emailSubject}
                                    onChange={(e) => setEmailSubject(e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-sm text-white text-lg placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary"
                                    placeholder="Enter email subject..."
                                />
                            </div>

                            {/* Content Editor */}
                            <div className="mb-6">
                                <label className="text-sm font-medium text-gray-400 mb-2 block">
                                    Email Content
                                    <span className="text-red-500 ml-1">*</span>
                                </label>
                                <div className="border border-gray-700 rounded-sm overflow-hidden consultation-email-modal">
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
                                    <label className="text-sm font-medium text-gray-400">Attachments</label>
                                    <span className="text-xs text-gray-500">
                                        Max 10MB per file • {attachments.length} file(s)
                                    </span>
                                </div>

                                <div className="space-y-3">
                                    {/* Attachment List */}
                                    {attachments.map((file, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center justify-between p-3 bg-gray-900/50 rounded-sm border border-gray-700"
                                        >
                                            <div className="flex items-center gap-3">
                                                <FileText className="h-5 w-5 text-blue-400" />
                                                <div>
                                                    <div className="text-sm text-white">{file.name}</div>
                                                    <div className="text-xs text-gray-500">{formatFileSize(file.size)}</div>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => removeAttachment(index)}
                                                className="text-gray-400 hover:text-red-400 p-1"
                                            >
                                                <X className="h-4 w-4" />
                                            </button>
                                        </div>
                                    ))}

                                    {/* Add Attachment Button */}
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        className="w-full p-4 border-2 border-dashed border-gray-700 rounded-sm hover:border-primary/50 transition-colors text-gray-400 hover:text-white"
                                    >
                                        <div className="flex flex-col items-center">
                                            <Paperclip className="h-6 w-6 mb-2" />
                                            <span className="text-sm">Click to add attachments</span>
                                            <span className="text-xs text-gray-500">or drag and drop files</span>
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
                        </div>
                        
                        {/* Footer Actions */}
                        <FooterActions 
                            consultation={consultation} 
                            selectedTemplate={selectedTemplate} 
                            onClose={onClose} 
                            isSending={isSending} 
                            activeTab="compose"
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