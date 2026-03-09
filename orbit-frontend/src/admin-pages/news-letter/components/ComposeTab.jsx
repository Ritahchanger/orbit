import { AlertCircle, RefreshCw, Hash, Send } from "lucide-react"
import { SimpleEditor } from '@/components/tiptap-templates/simple/simple-editor';
const ComposeTab = ({
    subject,
    setSubject,
    setCampaignId,
    generateCampaignId,
    campaignId,
    handleContentChange,
    handleSendNewsletter,
    isSendingNewsletter,
    stats,
    content,
    setContent
}) => {
    return (
        <div className="space-y-2">
            {/* Subject Input */}
            <div className="bg-white dark:bg-gray-800/50 p-4 rounded-sm border border-gray-200 dark:border-gray-700">
                <label className="block text-gray-900 dark:text-white font-medium mb-2">
                    Newsletter Subject
                </label>
                <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Enter newsletter subject..."
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-medium transition-all"
                />
                <div className="flex items-center gap-2 mt-2 text-sm text-gray-600 dark:text-gray-400">
                    <AlertCircle size={14} />
                    <span>This will appear as the email subject line</span>
                </div>
            </div>

            {/* Campaign ID */}
            <div className="bg-white dark:bg-gray-800/50 p-4 rounded-sm border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-2">
                    <label className="block text-gray-900 dark:text-white font-medium">
                        Campaign ID
                    </label>
                    <button
                        onClick={() => setCampaignId(generateCampaignId())}
                        className="flex items-center gap-1 px-3 py-1 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                    >
                        <RefreshCw size={14} />
                        Generate
                    </button>
                </div>
                <input
                    type="text"
                    value={campaignId}
                    onChange={(e) => setCampaignId(e.target.value)}
                    placeholder="campaign-20240101-abc123"
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                />
                <div className="flex items-center gap-2 mt-2 text-sm text-gray-600 dark:text-gray-400">
                    <Hash size={14} />
                    <span>Optional: Used for tracking and analytics</span>
                </div>
            </div>

            {/* Editor */}
            <div className="bg-white dark:bg-gray-800/50 rounded-sm border border-gray-200 dark:border-gray-700">
                <label className="block text-gray-900 dark:text-white px-4 pt-4 font-medium mb-2">
                    Newsletter Content
                </label>
                <div className="border border-gray-300 dark:border-gray-700 rounded-sm overflow-hidden">
                    <SimpleEditor onContentChange={handleContentChange}

                        showThemeToggle={false} // Disable theme toggle

                    />
                </div>
            </div>

            {/* Send Action */}
            <div className="bg-white dark:bg-gray-800/50 p-4 rounded-sm border border-gray-200 dark:border-gray-700">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="text-gray-600 dark:text-gray-400">
                        <p className="font-medium">Ready to send newsletter</p>
                        <p className="text-sm mt-1">
                            Will be sent to <span className="text-green-600 dark:text-green-400 font-bold">{stats?.subscribed || 0}</span> active subscribers
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => {
                                setSubject('');
                                setContent('');
                                setCampaignId('');
                            }}
                            className="px-5 py-2.5 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-sm hover:border-yellow-500 hover:text-yellow-600 dark:hover:text-yellow-400 transition-all"
                        >
                            Clear
                        </button>
                        <button
                            onClick={handleSendNewsletter}
                            disabled={isSendingNewsletter || !subject.trim() || !content.trim() || stats?.subscribed === 0}
                            className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-sm font-medium hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            {isSendingNewsletter ? (
                                <>
                                    <RefreshCw className="animate-spin" size={18} />
                                    Sending...
                                </>
                            ) : (
                                <>
                                    <Send size={18} />
                                    Send Newsletter
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ComposeTab