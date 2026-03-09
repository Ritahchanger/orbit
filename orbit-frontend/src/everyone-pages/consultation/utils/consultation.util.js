// src/components/consultation/consultationUtils.js

// Format date for display
export const formatDisplayDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-KE', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    })
}

// Format time for display
export const formatTime = (timeString) => {
    return timeString // Already in 24-hour format, e.g., "14:00"
}

// Get day name
export const getDayName = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-KE', { weekday: 'long' })
}

// Check if date is in the past
export const isPastDate = (dateString) => {
    const date = new Date(dateString)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return date < today
}

// Check if date is weekend
export const isWeekend = (dateString) => {
    const date = new Date(dateString)
    const day = date.getDay()
    return day === 0 || day === 6 // Sunday or Saturday
}

// Generate time slots for a day (client-side helper)
export const generateTimeSlots = () => {
    return [
        '08:30', '09:30', '10:30', '11:30',
        '13:00', '14:00', '15:00', '16:00'
    ]
}

// Calculate end time based on duration
export const calculateEndTime = (startTime, duration) => {
    const [hours, minutes] = startTime.split(':').map(Number)
    const durationMinutes = parseInt(duration) * 60
    const totalMinutes = hours * 60 + minutes + durationMinutes

    const endHours = Math.floor(totalMinutes / 60)
    const endMinutes = totalMinutes % 60

    return `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`
}

// Note: isValidBookingDate function is now integrated into the component
// to use real-time API data