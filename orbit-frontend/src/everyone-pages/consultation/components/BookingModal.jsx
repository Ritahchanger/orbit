// src/components/consultation/BookingModal.jsx
import { useState, useEffect } from 'react'
import {
    X, Calendar, Clock,
    CheckCircle, Shield, AlertCircle, Loader2, Info
} from 'lucide-react'

import { formatDisplayDate } from './consultationUtils'

import { useQuery } from '@tanstack/react-query'

import { useBookingMutations } from '../../../admin-pages/hooks/bookings.mutations'

import bookingApi from '../../../admin-pages/services/booking-api'

import toast from 'react-hot-toast'

import RenderStep2 from './booking-steps/StepTwo'

import RenderStep1 from './booking-steps/StepOne'

import RenderStep3 from './booking-steps/StepThree'

import RenderBookingSummary from './booking-steps/RenderBookingSummary'

const BookingModal = ({ isOpen, onClose, selectedDate }) => {
    const [step, setStep] = useState(1)
    const [selectedTime, setSelectedTime] = useState('')
    const [selectedType, setSelectedType] = useState('beginner')
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        message: ''
    })

    const [errors, setErrors] = useState({})
    const [bookingConfirmed, setBookingConfirmed] = useState(false)

    // Get booking mutations
    const {
        createBookingWithValidation,
        isCreatingBookingWithValidation,
        createBookingWithValidationError
    } = useBookingMutations()

    // Fetch consultation types from API
    const { data: consultationTypesData, isLoading: isLoadingTypes } = useQuery({
        queryKey: ['consultationTypes'],
        queryFn: () => bookingApi.getConsultationTypes(),
        staleTime: 5 * 60 * 1000,
        onError: (error) => {
            toast.error('Failed to load consultation types')
        }
    })

    // Fetch time slots for the selected date
    const {
        data: timeSlotsData,
        isLoading: isLoadingTimeSlots,
        refetch: refetchTimeSlots,
        error: timeSlotsError
    } = useQuery({
        queryKey: ['timeSlots', selectedDate],
        queryFn: () => bookingApi.getTimeSlots(selectedDate),
        enabled: !!selectedDate,
        staleTime: 2 * 60 * 1000,
        onError: (error) => {
            toast.error('Failed to load time slots')
        }
    })

    useEffect(() => {
        if (isOpen && selectedDate) {
            refetchTimeSlots()
        }
    }, [isOpen, selectedDate, refetchTimeSlots])

    // Debug logging
    useEffect(() => {
        if (timeSlotsData) {
            console.log('Time slots data:', timeSlotsData)
            console.log('Available slots:', timeSlotsData?.timeSlots?.filter(s => s.available).length)
        }
    }, [timeSlotsData])

    if (!isOpen || !selectedDate) return null

    const availableTimeSlots = timeSlotsData?.timeSlots || []
    const isWeekend = timeSlotsData?.isWeekend
    const isHoliday = timeSlotsData?.isHoliday
    const dateNotes = timeSlotsData?.notes
    const selectedConsultation = consultationTypesData?.data?.find(ct => ct.id === selectedType)

    // Calculate available slots
    const availableSlots = availableTimeSlots.filter(slot => slot.available)
    const availableSlotsCount = availableSlots.length

    console.log('Modal state:', {
        availableTimeSlots,
        availableSlotsCount,
        isWeekend,
        isHoliday
    })

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))

        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }))
        }
    }

    const validateForm = () => {
        const newErrors = {}

        if (!formData.name.trim()) newErrors.name = 'Name is required'
        if (!formData.email.trim()) {
            newErrors.email = 'Email is required'
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email'
        }
        if (!formData.phone.trim()) {
            newErrors.phone = 'Phone number is required'
        } else if (!/^[0-9+\-\s()]{10,15}$/.test(formData.phone.replace(/\s/g, ''))) {
            newErrors.phone = 'Please enter a valid phone number'
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            toast.error('Please fix the errors in the form');
            return;
        }

        const bookingData = {
            date: selectedDate,
            timeSlot: selectedTime,
            consultationType: selectedType,
            user: {
                name: formData.name.trim(),
                email: formData.email.trim(),
                phone: formData.phone.trim(),
                notes: formData.message.trim()
            }
        };

        // Use mutate with callbacks
        createBookingWithValidation(bookingData, {
            onSuccess: (data) => {
                console.log('Booking success:', data);
                if (data.success) {
                    toast.success(data.message || 'Booking created successfully!');
                    setBookingConfirmed(true);

                    setTimeout(() => {
                        handleClose();
                    }, 5000);
                } else {
                    toast.error(data.message || 'Booking failed');
                }
            },
            onError: (error) => {
                console.error('Booking error:', error);

                // Extract error from different possible formats
                let errorMessage = 'Failed to create booking';

                // Check for axios-style error
                if (error.response?.data?.message) {
                    errorMessage = error.response.data.message;
                }
                // Check for fetch-style error
                else if (error.message) {
                    errorMessage = error.message;
                }
                // Check if error has a custom message property
                else if (error.error?.message) {
                    errorMessage = error.error.message;
                }

                toast.error(errorMessage);
            }
        });
    };
    const handleClose = () => {
        setBookingConfirmed(false)
        onClose()
        setStep(1)
        setSelectedTime('')
        setSelectedType('beginner')
        setFormData({
            name: '',
            email: '',
            phone: '',
            message: ''
        })
        setErrors({})
    }

    const renderDateStatusMessage = () => {
        if (isWeekend) {
            return (
                <div className="mb-6 p-4 bg-amber-900/20 border border-amber-700 rounded-sm">
                    <div className="flex items-center gap-2 text-amber-300 mb-2">
                        <AlertCircle size={18} />
                        <span className="font-bold">Weekend Notice</span>
                    </div>
                    <p className="text-amber-200 text-sm">
                        {dateNotes || 'Consultations are not available on weekends.'}
                    </p>
                    <p className="text-amber-300 text-xs mt-2">
                        Please select a weekday (Monday to Friday) for consultations.
                    </p>
                </div>
            )
        }

        if (isHoliday) {
            return (
                <div className="mb-6 p-4 bg-amber-900/20 border border-amber-700 rounded-sm">
                    <div className="flex items-center gap-2 text-amber-300 mb-2">
                        <AlertCircle size={18} />
                        <span className="font-bold">Holiday Notice</span>
                    </div>
                    <p className="text-amber-200 text-sm">
                        {dateNotes || 'Consultations are not available on this holiday.'}
                    </p>
                </div>
            )
        }

        return null
    }

    const nextStep = () => {
        if (step === 1 && !selectedTime) {
            toast.error('Please select a time slot')
            return
        }

        if (step === 1 && selectedTime) {
            const selectedSlot = availableTimeSlots.find(s => s.value === selectedTime)
            if (!selectedSlot?.available) {
                toast.error('This time slot is no longer available. Please select another.')
                refetchTimeSlots()
                return
            }

            // Check if it's a weekend but user selected anyway
            if (isWeekend && !window.confirm('You are booking for a weekend. Are you sure you want to proceed?')) {
                return
            }
        }

        setStep(step + 1)
        toast.success(`Proceeding to step ${step + 1}`)
    }

    const prevStep = () => {
        setStep(step - 1)
        toast.success(`Returned to step ${step - 1}`)
    }

    const isSubmitting = isCreatingBookingWithValidation

    // Check if date is weekend or holiday
    const isDateUnavailable = isWeekend || isHoliday

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={handleClose} />

            {/* Modal */}
            <div className="flex min-h-full items-center justify-center p-4">
                <div className="relative w-full max-w-2xl bg-dark rounded-sm border border-gray-800 shadow-2xl">

                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-gray-800">
                        <div>
                            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                                {bookingConfirmed ? (
                                    <>
                                        <CheckCircle className="text-[#00FF88]" />
                                        Booking Confirmed!
                                    </>
                                ) : (
                                    <>
                                        <Calendar size={24} />
                                        Book Consultation
                                    </>
                                )}
                            </h2>
                            <p className="text-gray-400 mt-1 flex items-center gap-2">
                                <Clock size={14} />
                                {formatDisplayDate(selectedDate)}
                                {isWeekend && (
                                    <span className="text-xs px-2 py-0.5 bg-amber-900/30 text-amber-300 rounded">
                                        Weekend
                                    </span>
                                )}
                                {isHoliday && (
                                    <span className="text-xs px-2 py-0.5 bg-red-900/30 text-red-300 rounded">
                                        Holiday
                                    </span>
                                )}
                            </p>
                        </div>
                        <button
                            onClick={handleClose}
                            className="p-2 hover:bg-gray-800 rounded-sm transition"
                            disabled={isSubmitting && !bookingConfirmed}
                        >
                            <X size={24} className="text-gray-400" />
                        </button>
                    </div>

                    {/* Progress Steps */}
                    {!bookingConfirmed && (
                        <div className="px-6 pt-6">
                            <div className="flex items-center justify-between mb-8">
                                {[1, 2, 3].map((stepNum) => (
                                    <div key={stepNum} className="flex items-center">
                                        <div className={`
                                            w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                                            ${step === stepNum
                                                ? 'bg-primary text-white'
                                                : step > stepNum
                                                    ? 'bg-[#00FF88] text-dark'
                                                    : 'bg-gray-800 text-gray-400'
                                            }
                                        `}>
                                            {stepNum}
                                        </div>
                                        {stepNum < 3 && (
                                            <div className={`
                                                w-16 h-0.5 mx-2
                                                ${step > stepNum ? 'bg-[#00FF88]' : 'bg-gray-800'}
                                            `} />
                                        )}
                                    </div>
                                ))}
                                <div className="text-sm text-gray-400">
                                    Step {step} of 3
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Content */}
                    <div className="p-6">
                        {bookingConfirmed ? (
                            <div className="text-center py-8">
                                <CheckCircle size={64} className="text-[#00FF88] mx-auto mb-4" />
                                <h3 className="text-2xl font-bold text-white mb-2">Booking Successful!</h3>
                                <p className="text-gray-300 mb-6">
                                    Your consultation has been scheduled. You will receive a confirmation email shortly.
                                </p>
                                <div className="bg-gray-900/50 rounded-sm p-4 max-w-md mx-auto">
                                    <p className="text-sm text-gray-400">
                                        Remember to bring your current setup details and any specific questions you have.
                                    </p>
                                </div>
                                <p className="text-sm text-gray-500 mt-4">
                                    This window will close automatically in 5 seconds...
                                </p>
                            </div>
                        ) : (
                            <>
                                {createBookingWithValidationError && (
                                    <div className="mb-4 p-3 bg-red-900/20 border border-red-700 rounded-sm">
                                        <div className="flex items-center gap-2 text-red-400">
                                            <AlertCircle size={16} />
                                            <span className="font-medium">Booking Failed</span>
                                        </div>
                                        <p className="text-red-300 text-sm mt-1">
                                            {createBookingWithValidationError.message || 'Unable to create booking. Please try again.'}
                                        </p>
                                    </div>
                                )}

                                {step === 1 &&
                                    <RenderStep1 timeSlotsError={timeSlotsError} isLoadingTimeSlots={isLoadingTimeSlots} availableTimeSlots={availableTimeSlots} isWeekend={isWeekend} isHoliday={isHoliday} availableSlotsCount={availableSlotsCount} setSelectedTime={setSelectedTime} refetchTimeSlots={refetchTimeSlots} renderDateStatusMessage={renderDateStatusMessage} selectedTime={selectedTime} />
                                }
                                {step === 2 &&
                                    <RenderStep2 isLoadingTypes={isLoadingTypes} consultationTypesData={consultationTypesData} selectedType={selectedType} setSelectedType={setSelectedType} />
                                }
                                {step === 3 && (
                                    <>
                                        {
                                            <RenderBookingSummary selectedDate={selectedDate} availableTimeSlots={availableTimeSlots} selectedConsultation={selectedConsultation} selectedTime={selectedTime} />
                                        }
                                        {
                                            <RenderStep3 formData={formData} handleInputChange={handleInputChange} errors={errors} />
                                        }
                                    </>
                                )}

                                {/* Navigation Buttons */}
                                <div className="flex justify-between mt-8 pt-6 border-t border-gray-800">
                                    {step > 1 ? (
                                        <button
                                            onClick={prevStep}
                                            className="px-6 py-3 border border-gray-700 text-gray-300 rounded-sm hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                            disabled={isSubmitting}
                                        >
                                            ← Back
                                        </button>
                                    ) : (
                                        <div></div>
                                    )}

                                    {step < 3 ? (
                                        <button
                                            onClick={nextStep}
                                            disabled={
                                                (step === 1 && !selectedTime) ||
                                                isLoadingTimeSlots ||
                                                (step === 1 && isDateUnavailable && !selectedTime)
                                            }
                                            className="px-6 py-3 bg-primary text-white rounded-sm hover:bg-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                        >
                                            {isLoadingTimeSlots && step === 1 ? (
                                                <>
                                                    <Loader2 size={16} className="animate-spin" />
                                                    Loading...
                                                </>
                                            ) : (
                                                'Next Step →'
                                            )}
                                        </button>
                                    ) : (
                                        <button
                                            onClick={handleSubmit}
                                            disabled={isSubmitting}
                                            className="px-6 py-3 bg-gradient-to-r from-primary to-[#00D4FF] text-white rounded-sm hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                        >
                                            {isSubmitting ? (
                                                <>
                                                    <Loader2 size={16} className="animate-spin" />
                                                    Processing...
                                                </>
                                            ) : (
                                                'Confirm Booking'
                                            )}
                                        </button>
                                    )}
                                </div>
                            </>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="p-6 border-t border-gray-800 bg-dark-light/50">
                        <div className="flex flex-col items-center gap-2 text-sm text-gray-500">
                            <div className="flex items-center gap-2">
                                <Shield size={16} />
                                <span>Your data is secure. We don't share your information.</span>
                            </div>
                            {dateNotes && (
                                <div className="text-center text-xs text-amber-500 mt-2 bg-amber-900/20 px-3 py-1 rounded">
                                    <Info size={12} className="inline mr-1" />
                                    {dateNotes}
                                </div>
                            )}
                            {!isWeekend && !isHoliday && availableSlotsCount > 0 && (
                                <div className="text-center text-xs text-[#00FF88] mt-1">
                                    {availableSlotsCount} time slot{availableSlotsCount !== 1 ? 's' : ''} available
                                </div>
                            )}
                            {/* Debug info (remove in production) */}
                           
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default BookingModal