import {
    Send,
    FileText,
    Loader2,
    Eye,
} from 'lucide-react';
const FooterActions = ({consultation,selectedTemplate,onClose,isSending,activeTab,handleSendEmail,isValidating,emailSubject,emailContent}) => {
    return (
        <div className="border-t border-gray-800 p-6">
            <div className="flex items-center justify-between">
                <div className="text-sm text-gray-400">
                    <div className="flex items-center gap-2">
                        <span>Template:</span>
                        <span className="text-white font-medium">{selectedTemplate?.name}</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                        Status: {consultation.status} • Reference: {consultation.referenceNumber}
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={onClose}
                        disabled={isSending}
                        className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-sm transition-colors disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => setActiveTab(activeTab === 'compose' ? 'preview' : 'compose')}
                        className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-sm transition-colors flex items-center gap-2"
                    >
                        {activeTab === 'compose' ? <Eye className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
                        {activeTab === 'compose' ? 'Preview' : 'Edit'}
                    </button>
                    <button
                        onClick={handleSendEmail}
                        disabled={isSending || isValidating || !emailSubject.trim() || !emailContent.trim()}
                        className="px-6 py-2 bg-primary hover:bg-blue-700 text-white rounded-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {isSending ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Sending...
                            </>
                        ) : isValidating ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Validating...
                            </>
                        ) : (
                            <>
                                <Send className="h-4 w-4" />
                                Send Email
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default FooterActions