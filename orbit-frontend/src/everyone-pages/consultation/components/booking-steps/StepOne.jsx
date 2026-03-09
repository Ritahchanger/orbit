import { AlertCircle, Loader2, X, Info } from "lucide-react"
import { toast } from "react-hot-toast"
const RenderStep1 = ({ timeSlotsError, isLoadingTimeSlots, availableTimeSlots, isWeekend, isHoliday, availableSlotsCount, setSelectedTime, refetchTimeSlots, renderDateStatusMessage, selectedTime }) => {
    return (
        <div>
            <h3 className="text-lg font-bold text-white mb-4">Select Time Slot</h3>
            {renderDateStatusMessage()}
            {timeSlotsError ? (
                <div className="p-4 bg-red-900/20 border border-red-700 rounded-sm">
                    <div className="flex items-center gap-2 text-red-400 mb-2">
                        <AlertCircle size={20} />
                        <span className="font-medium">Error loading time slots</span>
                    </div>
                    <p className="text-red-300 text-sm">
                        Could not load availability. Please try again.
                    </p>
                    <button
                        onClick={() => refetchTimeSlots()}
                        className="mt-2 px-3 py-1 bg-red-800 hover:bg-red-700 rounded-sm text-sm text-white"
                    >
                        Retry
                    </button>
                </div>
            ) : isLoadingTimeSlots ? (
                <div className="flex flex-col items-center justify-center py-12">
                    <Loader2 size={32} className="animate-spin text-primary mb-3" />
                    <p className="text-gray-400">Checking availability...</p>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-6">
                        {availableTimeSlots.map((slot) => (
                            <button
                                key={slot.value}
                                onClick={() => {
                                    if (slot.available) {
                                        setSelectedTime(slot.value)
                                        toast.success(`Selected ${slot.display}`)
                                    } else {
                                        toast.error(`Time slot ${slot.display} is not available`)
                                    }
                                }}
                                disabled={!slot.available}
                                className={`
                                    p-3 rounded-sm border text-center transition relative
                                    ${selectedTime === slot.value
                                        ? 'border-primary bg-primary/10 text-white ring-2 ring-primary/50'
                                        : slot.available
                                            ? 'border-gray-700 text-gray-300 hover:border-gray-600 hover:bg-gray-800'
                                            : 'border-gray-800 bg-gray-900/50 text-gray-500 cursor-not-allowed'
                                    }
                                `}
                            >
                                <div className="font-medium">{slot.display}</div>
                                <div className="text-xs mt-1">
                                    {slot.available ? (
                                        <span className="text-[#00FF88]">Available</span>
                                    ) : (
                                        <span className="text-red-400">Unavailable</span>
                                    )}
                                </div>
                                {!slot.available && (
                                    <div className="absolute top-1 right-1">
                                        <X size={12} className="text-red-500" />
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>

                    {!isWeekend && !isHoliday && availableSlotsCount === 0 && (
                        <div className="p-4 bg-gray-900/50 rounded-sm border border-gray-700">
                            <div className="flex items-center gap-2 text-amber-400">
                                <Info size={20} />
                                <span className="font-medium">All slots booked</span>
                            </div>
                            <p className="text-gray-400 text-sm mt-2">
                                All time slots for this day have been booked. Please select another date or try again later.
                            </p>
                        </div>
                    )}

                    {!isWeekend && !isHoliday && availableSlotsCount > 0 && (
                        <div className="flex items-center gap-2 text-sm text-gray-400 mt-4">
                            <Info size={14} />
                            <span>
                                {availableSlotsCount} time slot{availableSlotsCount !== 1 ? 's' : ''} available
                            </span>
                        </div>
                    )}
                </>
            )}
        </div>
    )

}

export default RenderStep1