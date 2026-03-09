import { Calculator, ArrowLeft, ArrowRight, ChevronUp, ChevronDown } from "lucide-react";

const AdminGlobalButtons = ({
    handleCalculatorOpen,
    historyState,
    handleForward,
    handleBack
}) => {

    const handleScrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    const handleScrollToBottom = () => {
        window.scrollTo({
            top: document.body.scrollHeight,
            behavior: 'smooth'
        });
    };

    return (
        <>
            {/* Calculator Button - Bottom Left */}
            <button
                onClick={handleCalculatorOpen}
                className="fixed left-4 bottom-4 z-40 p-3 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-full shadow-lg hover:shadow-xl shadow-blue-500/25 dark:shadow-blue-500/50 transition-all duration-300 hover:scale-110 group"
                aria-label="Open calculator"
                title="Quick Calculator"
            >
                <Calculator size={24} />
                <span className="absolute left-full ml-2 px-2 py-1 bg-gray-900 dark:bg-gray-800 text-white text-xs rounded-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
                    Calculator
                </span>
            </button>

            {/* Navigation Buttons Container - Bottom Right */}
            <div className="fixed right-4 bottom-4 z-40 flex flex-col gap-3">
                {/* Scroll to Top Button */}
                <button
                    onClick={handleScrollToTop}
                    className="p-2 bg-linear-to-br from-gray-800 to-gray-900 dark:from-gray-700 dark:to-gray-800 hover:from-gray-700 hover:to-gray-800 dark:hover:from-gray-600 dark:hover:to-gray-700 text-white rounded-full shadow-lg hover:shadow-xl shadow-gray-500/20 dark:shadow-gray-900/50 transition-all duration-300 hover:scale-110 group"
                    aria-label="Scroll to top"
                    title="Scroll to Top"
                >
                    <ChevronUp size={24} />
                    <span className="absolute right-full mr-2 px-2 py-1 bg-gray-900 dark:bg-gray-800 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap top-1/2 -translate-y-1/2 pointer-events-none">
                        Top
                    </span>
                </button>

                {/* Scroll to Bottom Button */}
                <button
                    onClick={handleScrollToBottom}
                    className="p-2 bg-linear-to-br from-gray-800 to-gray-900 dark:from-gray-700 dark:to-gray-800 hover:from-gray-700 hover:to-gray-800 dark:hover:from-gray-600 dark:hover:to-gray-700 text-white rounded-full shadow-lg hover:shadow-xl shadow-gray-500/20 dark:shadow-gray-900/50 transition-all duration-300 hover:scale-110 group"
                    aria-label="Scroll to bottom"
                    title="Scroll to Bottom"
                >
                    <ChevronDown size={24} />
                    <span className="absolute right-full mr-2 px-2 py-1 bg-gray-900 dark:bg-gray-800 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap top-1/2 -translate-y-1/2 pointer-events-none">
                        Bottom
                    </span>
                </button>

                {/* Back Button - Always visible but disabled when can't go back */}
                <button
                    onClick={handleBack}
                    disabled={!historyState.canGoBack}
                    className={`p-2 rounded-full shadow-lg transition-all duration-300 group ${historyState.canGoBack
                        ? 'bg-linear-to-br from-gray-800 to-gray-900 dark:from-gray-700 dark:to-gray-800 hover:from-gray-700 hover:to-gray-800 dark:hover:from-gray-600 dark:hover:to-gray-700 text-white hover:shadow-xl hover:scale-110 cursor-pointer shadow-gray-500/20 dark:shadow-gray-900/50'
                        : 'bg-linear-to-br from-gray-300 to-gray-400 dark:from-gray-800 dark:to-gray-900 text-gray-500 dark:text-gray-600 cursor-not-allowed'
                        }`}
                    aria-label="Go back"
                    title={historyState.canGoBack ? "Go Back" : "Cannot go back"}
                >
                    <ArrowLeft size={24} />
                    <span className={`absolute right-full mr-2 px-2 py-1 bg-gray-900 dark:bg-gray-800 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap top-1/2 -translate-y-1/2 pointer-events-none ${!historyState.canGoBack && 'hidden'
                        }`}>
                        Back
                    </span>
                </button>

                {/* Forward Button - Always visible but disabled when can't go forward */}
                <button
                    onClick={handleForward}
                    disabled={!historyState.canGoForward}
                    className={`p-2 rounded-full shadow-lg transition-all duration-300 group ${historyState.canGoForward
                        ? 'bg-linear-to-br from-gray-800 to-gray-900 dark:from-gray-700 dark:to-gray-800 hover:from-gray-700 hover:to-gray-800 dark:hover:from-gray-600 dark:hover:to-gray-700 text-white hover:shadow-xl hover:scale-110 cursor-pointer shadow-gray-500/20 dark:shadow-gray-900/50'
                        : 'bg-linear-to-br from-gray-300 to-gray-400 dark:from-gray-800 dark:to-gray-900 text-gray-500 dark:text-gray-600 cursor-not-allowed'
                        }`}
                    aria-label="Go forward"
                    title={historyState.canGoForward ? "Go Forward" : "Cannot go forward"}
                >
                    <ArrowRight size={24} />
                    <span className={`absolute right-full mr-2 px-2 py-1 bg-gray-900 dark:bg-gray-800 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap top-1/2 -translate-y-1/2 pointer-events-none ${!historyState.canGoForward && 'hidden'
                        }`}>
                        Forward
                    </span>
                </button>
            </div>
        </>
    );
};

export default AdminGlobalButtons;