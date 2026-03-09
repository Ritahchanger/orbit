import React from 'react';
import { formatDisplayDate } from "../consultationUtils";

const RenderBookingSummary = ({
    selectedDate,
    availableTimeSlots = [],
    selectedConsultation,
    selectedTime,
    isWeekend = false
}) => {
    return (
        <div className="bg-gray-900/50 rounded-sm p-4 mb-6">
            <h4 className="font-bold text-white mb-3">Booking Summary</h4>
            <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                    <span className="text-gray-400">Date:</span>
                    <span className="text-white">{formatDisplayDate(selectedDate)}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-gray-400">Time:</span>
                    <span className="text-white">
                        {availableTimeSlots.find(s => s.value === selectedTime)?.display || selectedTime}
                    </span>
                </div>
                <div className="flex justify-between">
                    <span className="text-gray-400">Consultation:</span>
                    <span className="text-white">{selectedConsultation?.title || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-gray-400">Duration:</span>
                    <span className="text-white">{selectedConsultation?.duration || 'N/A'}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-gray-800">
                    <span className="text-gray-400">Price:</span>
                    <span className="text-lg font-bold text-white">{selectedConsultation?.price || 'N/A'}</span>
                </div>
            </div>
            {isWeekend && (
                <div className="mt-3 p-2 bg-amber-900/20 border border-amber-700 rounded-sm">
                    <p className="text-amber-300 text-xs">
                        ⚠️ Note: This is a weekend booking. Please confirm availability.
                    </p>
                </div>
            )}
        </div>
    );
};

export default RenderBookingSummary;