import {
    UserPlus,
    RefreshCw,
    Globe,
    User as UserIcon,
} from 'lucide-react';
import { openRegistrationModal } from '../../slices/userRegistrationSlice';
import { useDispatch } from 'react-redux';
import ExportMenu from './ExportMenu';
const Header = ({ canExportUsers, exportLoading, showExportMenu, setShowExportMenu, filteredUsers, handleExportCSV, handlePrintView, canManageUsers, handleRefresh, usersLoading, statsLoading, handleExportAllUsers, handleExportPDF }) => {
    const dispatch = useDispatch();
    return (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-2">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Workers Management</h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                    Manage all users, roles, and store assignments
                </p>
            </div>

            <div className="flex items-center space-x-4">
                {/* Global View Badge */}
                <div className="px-3 py-2 bg-purple-50 dark:bg-purple-500/10 border border-purple-200 dark:border-purple-500/20 rounded-sm">
                    <div className="flex items-center space-x-2">
                        <Globe size={16} className="text-purple-600 dark:text-purple-400" />
                        <span className="text-purple-600 dark:text-purple-400 font-medium text-sm md:text-base hidden sm:block">Global View</span>
                        <span className="text-purple-600 dark:text-purple-400 font-medium text-sm md:text-base  block sm:hidden ">Global</span>
                    </div>
                </div>

                {/* Export Dropdown */}
                {canExportUsers && (
                    <div className="relative">
                        <button
                            onClick={() => setShowExportMenu(!showExportMenu)}
                            disabled={exportLoading || filteredUsers.length === 0}
                            className="flex md:hidden items-center space-x-2 px-4 py-2 bg-green-600 dark:bg-green-500 hover:bg-green-700 dark:hover:bg-green-600 text-white rounded-sm transition-colors text-sm md:text-base disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {exportLoading ? (
                                <RefreshCw size={18} className="animate-spin" />
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                            )}
                            <span>{exportLoading ? 'Exporting...' : 'Export'}</span>
                        </button>
                        <button
                            onClick={() => setShowExportMenu(!showExportMenu)}
                            disabled={exportLoading || filteredUsers.length === 0}
                            className="hidden md:flex items-center space-x-2 px-4 py-2 bg-green-600 dark:bg-green-500 hover:bg-green-700 dark:hover:bg-green-600 text-white rounded-sm transition-colors text-sm md:text-base disabled:opacity-50 disabled:cursor-not-allowed "
                        >
                            {exportLoading ? (
                                <RefreshCw size={18} className="animate-spin" />
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                            )}
                            <span>{exportLoading ? 'Exporting...' : 'Export Users'}</span>
                        </button>


                        {showExportMenu && (
                            <ExportMenu setShowExportMenu={setShowExportMenu} filteredUsers={filteredUsers} handleExportAllUsers={handleExportAllUsers} handleExportCSV={handleExportCSV} handleExportPDF={handleExportPDF} handlePrintView={handlePrintView} />
                        )}
                    </div>
                )}

                {/* Add User Button */}
                {canManageUsers && (
                    <>
                        <button
                            className="block md:hidden items-center space-x-2 px-4 py-2 bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600 text-white rounded-sm transition-colors text-sm md:text-base"
                            onClick={() => {
                                dispatch(openRegistrationModal())
                            }}
                        >
                            <span className='block'>+User</span>
                        </button>
                        <button
                            className="hidden md:flex items-center space-x-2 px-4 py-2 bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600 text-white rounded-sm transition-colors text-sm md:text-base"
                            onClick={() => {
                                dispatch(openRegistrationModal())
                            }}
                        >
                            <UserPlus size={18} />
                            <span>Add User</span>
                        </button>
                    </>
                )}

                {/* Refresh Button */}
                <button
                    onClick={handleRefresh}
                    disabled={usersLoading || statsLoading}
                    className="flex items-center space-x-2 px-4 py-2 bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 text-gray-800 dark:text-white rounded-sm disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base"
                >
                    <RefreshCw size={18} className={usersLoading ? 'animate-spin' : ''} />
                    <span>Refresh</span>
                </button>
            </div>
        </div>
    )
}

export default Header