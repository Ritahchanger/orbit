import { Download, Printer, CheckCircle, Copy, Mail } from "lucide-react"

const ActionButtons = ({ downloadAsText, printPurchaseOrder, copyToClipboard, emailPurchaseOrder, setPurchaseOrder, copied }) => {
    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            <button
                onClick={downloadAsText}
                className="py-3 bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-500 dark:to-blue-600 hover:from-blue-700 hover:to-blue-800 dark:hover:from-blue-600 dark:hover:to-blue-700 text-white rounded-sm flex items-center justify-center gap-2 transition-all duration-200"
            >
                <Download size={18} />
                Download
            </button>
            <button
                onClick={printPurchaseOrder}
                className="py-3 bg-gradient-to-r from-gray-600 to-gray-700 dark:from-gray-500 dark:to-gray-600 hover:from-gray-700 hover:to-gray-800 dark:hover:from-gray-600 dark:hover:to-gray-700 text-white rounded-sm flex items-center justify-center gap-2 transition-all duration-200"
            >
                <Printer size={18} />
                Print
            </button>
            <button
                onClick={copyToClipboard}
                className="py-3 bg-gradient-to-r from-purple-600 to-purple-700 dark:from-purple-500 dark:to-purple-600 hover:from-purple-700 hover:to-purple-800 dark:hover:from-purple-600 dark:hover:to-purple-700 text-white rounded-sm flex items-center justify-center gap-2 transition-all duration-200"
            >
                {copied ? (
                    <>
                        <CheckCircle size={18} className="text-green-300" />
                        Copied!
                    </>
                ) : (
                    <>
                        <Copy size={18} />
                        Copy
                    </>
                )}
            </button>
            <button
                onClick={emailPurchaseOrder}
                className="py-3 bg-gradient-to-r from-green-600 to-green-700 dark:from-green-500 dark:to-green-600 hover:from-green-700 hover:to-green-800 dark:hover:from-green-600 dark:hover:to-green-700 text-white rounded-sm flex items-center justify-center gap-2 transition-all duration-200"
            >
                <Mail size={18} />
                Email
            </button>
            <button
                onClick={() => setPurchaseOrder(null)}
                className="py-3 bg-gradient-to-r from-gray-700 to-gray-800 dark:from-gray-600 dark:to-gray-700 hover:from-gray-800 hover:to-gray-900 dark:hover:from-gray-700 dark:hover:to-gray-800 text-white rounded-sm flex items-center justify-center gap-2 transition-all duration-200"
            >
                New Order
            </button>
        </div>
    );
}

export default ActionButtons;