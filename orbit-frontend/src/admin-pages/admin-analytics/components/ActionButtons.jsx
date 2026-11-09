import { Download, Printer, CheckCircle, Copy, Mail } from "lucide-react"

const ActionButtons = ({ downloadAsText, printPurchaseOrder, copyToClipboard, emailPurchaseOrder, setPurchaseOrder, copied }) => {
    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            <button
                onClick={downloadAsText}
                className="py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-sm flex items-center justify-center gap-2 transition-all duration-200"
            >
                <Download size={18} />
                Download
            </button>
            <button
                onClick={printPurchaseOrder}
                className="py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-sm flex items-center justify-center gap-2 transition-all duration-200"
            >
                <Printer size={18} />
                Print
            </button>
            <button
                onClick={copyToClipboard}
                className="py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-sm flex items-center justify-center gap-2 transition-all duration-200"
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
                className="py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-sm flex items-center justify-center gap-2 transition-all duration-200"
            >
                <Mail size={18} />
                Email
            </button>
            <button
                onClick={() => setPurchaseOrder(null)}
                className="py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-sm flex items-center justify-center gap-2 transition-all duration-200"
            >
                New Order
            </button>
        </div>
    );
}

export default ActionButtons;