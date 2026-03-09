import AvailablePermissions from "./AvailablePermissions"
import PermissionBadge from "./PemissionBadge"
import { useState, useRef, useEffect } from 'react'
import { ChevronUp, ChevronDown } from 'lucide-react'

const AdminUserPermission = ({ userPermissions, updateAvailablePermissionsProps, handleRevokePermission }) => {
    const [showScrollButtons, setShowScrollButtons] = useState(false)
    const [canScrollUp, setCanScrollUp] = useState(false)
    const [canScrollDown, setCanScrollDown] = useState(false)
    const scrollContainerRef = useRef(null)

    // Check if we need scroll buttons
    useEffect(() => {
        const checkScroll = () => {
            if (!scrollContainerRef.current) return

            const container = scrollContainerRef.current
            const hasVerticalScroll = container.scrollHeight > container.clientHeight
            setShowScrollButtons(hasVerticalScroll)

            setCanScrollUp(container.scrollTop > 0)
            setCanScrollDown(
                container.scrollTop < (container.scrollHeight - container.clientHeight)
            )
        }

        checkScroll()
        window.addEventListener('resize', checkScroll)

        // Cleanup
        return () => window.removeEventListener('resize', checkScroll)
    }, [userPermissions])

    const scrollUp = () => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollBy({ top: -150, behavior: 'smooth' })
        }
    }

    const scrollDown = () => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollBy({ top: 150, behavior: 'smooth' })
        }
    }

    const handleScroll = () => {
        if (!scrollContainerRef.current) return

        const container = scrollContainerRef.current
        setCanScrollUp(container.scrollTop > 0)
        setCanScrollDown(
            container.scrollTop < (container.scrollHeight - container.clientHeight - 1)
        )
    }

    return (
        <div className="space-y-6">
            {/* User's Current Permissions */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Current Permissions
                        </h3>
                        {userPermissions?.length > 0 && (
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                {userPermissions.length} custom permissions assigned
                            </p>
                        )}
                    </div>

                    {userPermissions?.length > 0 && (
                        <span className="px-3 py-1 text-xs font-medium rounded-full bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300">
                            {userPermissions.length} permissions
                        </span>
                    )}
                </div>

                {/* Vertical Scroll Container with 4-column Grid */}
                <div className="relative">
                    {/* Top Scroll Button */}
                    {showScrollButtons && canScrollUp && (
                        <button
                            onClick={scrollUp}
                            className="absolute left-1/2 -translate-x-1/2 top-0 z-10 p-2 bg-gray-800 dark:bg-gray-700 hover:bg-gray-700 dark:hover:bg-gray-600 text-gray-300 dark:text-gray-200 rounded-b-lg shadow-lg transition-all border border-gray-700 dark:border-gray-600"
                            aria-label="Scroll up"
                        >
                            <ChevronUp size={16} />
                        </button>
                    )}

                    {/* Scrollable Grid Container */}
                    <div
                        ref={scrollContainerRef}
                        onScroll={handleScroll}
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 max-h-80 overflow-y-auto  scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-gray-100 dark:scrollbar-track-gray-800 rounded-md  dark:border-gray-700 bg-gray-50 dark:bg-gray-900/30"
                    >
                        {userPermissions && userPermissions.length > 0 ? (
                            userPermissions.map((perm) => (
                                <div key={perm._id} className="h-fit">
                                    <PermissionBadge
                                        permission={perm.permission}
                                        scope={perm.scope}
                                        store={perm.store}
                                        onRevoke={() => handleRevokePermission(perm)}
                                    />
                                </div>
                            ))
                        ) : (
                            <div className="col-span-4 text-center py-10 px-4 text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-900/20 rounded-lg border border-gray-200 dark:border-gray-700">
                                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 mb-3">
                                    <div className="h-5 w-5 rounded-full border-2 border-gray-300 dark:border-gray-600 border-t-transparent dark:border-t-transparent animate-spin"></div>
                                </div>
                                <p className="font-medium text-gray-700 dark:text-gray-300">No custom permissions assigned</p>
                                <p className="text-sm mt-1">User only has role-based permissions</p>
                            </div>
                        )}
                    </div>

                    {/* Bottom Scroll Button */}
                    {showScrollButtons && canScrollDown && (
                        <button
                            onClick={scrollDown}
                            className="absolute left-1/2 -translate-x-1/2 bottom-0 z-10 p-2 bg-gray-800 dark:bg-gray-700 hover:bg-gray-700 dark:hover:bg-gray-600 text-gray-300 dark:text-gray-200 rounded-t-lg shadow-lg transition-all border border-gray-700 dark:border-gray-600"
                            aria-label="Scroll down"
                        >
                            <ChevronDown size={16} />
                        </button>
                    )}
                </div>

                {/* Summary Stats */}
                {userPermissions && userPermissions.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Permission Summary</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3 text-center">
                                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Global</div>
                                <div className="text-lg font-bold text-gray-900 dark:text-white">
                                    {userPermissions.filter(p => p.scope === 'global').length}
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">permissions</div>
                            </div>

                            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3 text-center">
                                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Store-specific</div>
                                <div className="text-lg font-bold text-gray-900 dark:text-white">
                                    {userPermissions.filter(p => p.scope === 'store').length}
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">permissions</div>
                            </div>

                            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3 text-center">
                                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Role-based</div>
                                <div className="text-lg font-bold text-gray-900 dark:text-white">
                                    {userPermissions.filter(p => p.source === 'role').length}
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">permissions</div>
                            </div>

                            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3 text-center">
                                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Custom</div>
                                <div className="text-lg font-bold text-gray-900 dark:text-white">
                                    {userPermissions.filter(p => p.source === 'user').length}
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">permissions</div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Available Permissions */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Available Permissions
                </h3>
                <AvailablePermissions {...updateAvailablePermissionsProps} />
            </div>
        </div>
    )
}

export default AdminUserPermission