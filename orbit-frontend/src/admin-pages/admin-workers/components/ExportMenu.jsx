const ExportMenu = ({ setShowExportMenu, filteredUsers, handleExportAllUsers, handleExportCSV, handleExportPDF, handlePrintView }) => {
    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 z-40"
                onClick={() => setShowExportMenu(false)}
            />

            {/* Export Menu */}
            <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-sm shadow-xl z-50">
                <div className="p-2">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2 px-2">
                        Export Options
                    </h3>

                    {/* Current View Export */}
                    <div className="mb-2">
                        <p className="text-xs text-gray-600 dark:text-gray-400 px-2 mb-1">
                            Current View ({filteredUsers.length} users)
                        </p>

                        <button
                            onClick={handleExportCSV}
                            className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded-sm flex items-center gap-2 text-gray-800 dark:text-gray-200 transition-colors"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4 text-green-600 dark:text-green-400"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                            >
                                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                            Export as CSV
                        </button>

                        <button
                            onClick={handleExportPDF}
                            className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded-sm flex items-center gap-2 text-gray-800 dark:text-gray-200 transition-colors"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4 text-red-600 dark:text-red-400"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                            >
                                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                            </svg>
                            Export as PDF
                        </button>

                        <button
                            onClick={handlePrintView}
                            className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded-sm flex items-center gap-2 text-gray-800 dark:text-gray-200 transition-colors"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4 text-blue-600 dark:text-blue-400"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                            >
                                <path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a2 2 0 002 2h6a2 2 0 002-2v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z" clipRule="evenodd" />
                            </svg>
                            Print View
                        </button>
                    </div>

                    {/* Divider */}
                    <div className="border-t border-gray-300 dark:border-gray-700 pt-2">
                        <p className="text-xs text-gray-600 dark:text-gray-400 px-2 mb-1">
                            All Users
                        </p>

                        <button
                            onClick={() => handleExportAllUsers('csv')}
                            className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded-sm flex items-center gap-2 text-gray-800 dark:text-gray-200 transition-colors"
                            title="Export all users (may take longer)"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4 text-green-600 dark:text-green-400"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                            >
                                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                            Export All as CSV
                        </button>

                        <button
                            onClick={() => handleExportAllUsers('pdf')}
                            className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded-sm flex items-center gap-2 text-gray-800 dark:text-gray-200 transition-colors"
                            title="Export all users (may take longer)"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4 text-red-600 dark:text-red-400"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                            >
                                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                            </svg>
                            Export All as PDF
                        </button>
                    </div>
                </div>
            </div>
        </>
    )
}

export default ExportMenu