import { Search, RefreshCw, CheckSquare, Square, UserX, Users, Mail, Copy } from "lucide-react"

const Subscribers = ({ 
    searchEmail, 
    setSearchEmail, 
    setFilterStatus, 
    refetchSubscribers, 
    handleUnsubscribe, 
    setSelectedSubscribers, 
    isLoadingSubscribers, 
    filteredSubscribers, 
    expandedSubscriber, 
    selectedSubscribers, 
    isUnsubscribing, 
    filterStatus, 
    isRefetchingSubscribers, 
    selectAllSubscribers, 
    formatDate, 
    copyToClipboard,
    toggleSubscriberSelection // Added missing function
}) => {
    return (
        <div className="space-y-6">
            {/* Controls */}
            <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-sm border border-gray-300 dark:border-gray-700">
                <div className="flex flex-col md:flex-row gap-4">
                    {/* Search */}
                    <div className="flex-1">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400" size={18} />
                            <input
                                type="text"
                                value={searchEmail}
                                onChange={(e) => setSearchEmail(e.target.value)}
                                placeholder="Search by email..."
                                className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-400/20"
                            />
                        </div>
                    </div>

                    {/* Filter */}
                    <div className="flex gap-2">
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-sm text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-400/20"
                        >
                            <option value="all">All Subscribers</option>
                            <option value="subscribed">Active Only</option>
                            <option value="unsubscribed">Unsubscribed</option>
                        </select>

                        <button
                            onClick={() => refetchSubscribers()}
                            className="px-4 py-2.5 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-sm hover:border-blue-500 dark:hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400 transition-all hover:bg-gray-50 dark:hover:bg-gray-800"
                        >
                            <RefreshCw size={18} className={isRefetchingSubscribers ? 'animate-spin' : ''} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Subscribers List */}
            <div className="bg-white dark:bg-gray-800 rounded-sm border border-gray-300 dark:border-gray-700 overflow-hidden">
                {/* Header */}
                <div className="px-4 py-3 bg-gray-50 dark:bg-gray-900 border-b border-gray-300 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <button
                                onClick={selectAllSubscribers}
                                className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                            >
                                {selectedSubscribers.length === filteredSubscribers.length && filteredSubscribers.length > 0 ? (
                                    <CheckSquare size={20} className="text-blue-600 dark:text-blue-400" />
                                ) : (
                                    <Square size={20} />
                                )}
                            </button>
                            <span className="text-gray-900 dark:text-white font-medium">
                                {filteredSubscribers.length} {filterStatus === 'subscribed' ? 'Active' : filterStatus === 'unsubscribed' ? 'Unsubscribed' : ''} Subscribers
                            </span>
                        </div>
                        {selectedSubscribers.length > 0 && (
                            <button
                                onClick={() => {
                                    if (confirm(`Unsubscribe ${selectedSubscribers.length} selected subscribers?`)) {
                                        selectedSubscribers.forEach(email => handleUnsubscribe(email));
                                        setSelectedSubscribers([]);
                                    }
                                }}
                                className="flex items-center gap-1 px-3 py-1 text-sm text-orange-600 dark:text-orange-500 hover:text-orange-700 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-500/10 rounded-sm transition-colors"
                            >
                                <UserX size={16} />
                                Unsubscribe Selected
                            </button>
                        )}
                    </div>
                </div>

                {/* List */}
                <div className="max-h-[500px] overflow-y-auto">
                    {isLoadingSubscribers ? (
                        <div className="p-8 text-center text-gray-600 dark:text-gray-400">
                            <RefreshCw className="animate-spin mx-auto mb-2" size={24} />
                            <p>Loading subscribers...</p>
                        </div>
                    ) : filteredSubscribers.length === 0 ? (
                        <div className="p-8 text-center text-gray-600 dark:text-gray-400">
                            <Users className="mx-auto mb-2" size={32} />
                            <p>No subscribers found</p>
                        </div>
                    ) : (
                        filteredSubscribers.map((subscriber, index) => (
                            <div
                                key={subscriber._id || subscriber.email}
                                className={`p-4 border-b border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors ${expandedSubscriber === subscriber.email ? 'bg-gray-50 dark:bg-gray-900' : ''
                                    }`}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3 flex-1">
                                        <button
                                            onClick={() => toggleSubscriberSelection(subscriber.email)}
                                            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                                        >
                                            {selectedSubscribers.includes(subscriber.email) ? (
                                                <CheckSquare size={18} className="text-green-600 dark:text-green-400" />
                                            ) : (
                                                <Square size={18} />
                                            )}
                                        </button>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <Mail size={14} className="text-gray-500 dark:text-gray-400" />
                                                <span className="text-gray-900 dark:text-white font-medium truncate">
                                                    {subscriber.email}
                                                </span>
                                                {subscriber.subscribed ? (
                                                    <span className="px-2 py-0.5 text-xs bg-green-100 dark:bg-green-500/10 text-green-600 dark:text-green-400 rounded-full">
                                                        Active
                                                    </span>
                                                ) : (
                                                    <span className="px-2 py-0.5 text-xs bg-orange-100 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 rounded-full">
                                                        Unsubscribed
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-4 mt-1 text-xs text-gray-600 dark:text-gray-400">
                                                <span>Joined: {formatDate(subscriber.createdAt)}</span>
                                                {subscriber.subscribedAt && (
                                                    <span>Subscribed: {formatDate(subscriber.subscribedAt)}</span>
                                                )}
                                                {subscriber.unsubscribedAt && (
                                                    <span>Unsubscribed: {formatDate(subscriber.unsubscribedAt)}</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => copyToClipboard(subscriber.email)}
                                            className="p-1.5 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-sm transition-colors"
                                            title="Copy email"
                                        >
                                            <Copy size={16} />
                                        </button>

                                        {subscriber.subscribed && (
                                            <button
                                                onClick={() => handleUnsubscribe(subscriber.email)}
                                                disabled={isUnsubscribing}
                                                className="p-1.5 text-gray-600 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-500/10 rounded-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                title="Unsubscribe"
                                            >
                                                <UserX size={16} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    )
}

export default Subscribers