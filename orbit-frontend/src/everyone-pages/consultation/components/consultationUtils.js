// src/components/consultation/consultationUtils.js

import { bookedConsultations, storeSchedule, generateTimeSlots } from './consultationData'

// Check if a date is valid for booking (Monday-Friday)
export const isValidBookingDate = (dateString) => {
  const date = new Date(dateString)
  const dayOfWeek = date.getDay() // 0 = Sunday, 1 = Monday, etc.

  // Return true for Monday (1) through Friday (5)
  return dayOfWeek >= 1 && dayOfWeek <= 5
}

// Get available time slots for a specific date
export const getAvailableTimeSlots = (dateString) => {
  if (!isValidBookingDate(dateString)) {
    return []
  }

  // Get all time slots
  const allSlots = generateTimeSlots()

  // Find booked consultations for this date
  const bookedForDate = bookedConsultations.find(booking =>
    booking.date === dateString
  )

  // If no bookings for this date, all slots are available
  if (!bookedForDate) {
    return allSlots.map(slot => ({
      ...slot,
      available: true
    }))
  }

  // Mark booked slots as unavailable
  return allSlots.map(slot => {
    const isBooked = bookedForDate.times.includes(slot.value)
    return {
      ...slot,
      available: !isBooked
    }
  })
}

// Check if a specific time slot is available
export const isTimeSlotAvailable = (dateString, timeString) => {
  const availableSlots = getAvailableTimeSlots(dateString)
  const slot = availableSlots.find(s => s.value === timeString)
  return slot ? slot.available : false
}



// Get next available business day
export const getNextBusinessDay = () => {
  const today = new Date()
  let nextDay = new Date(today)

  // Find next Monday-Friday
  do {
    nextDay.setDate(nextDay.getDate() + 1)
  } while (!isValidBookingDate(nextDay.toISOString().split('T')[0]))

  return nextDay.toISOString().split('T')[0]
}


export const getDateString = (date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}




// src/components/consultation/consultationUtils.js

// Parse date string without timezone issues
export const parseDateString = (dateString) => {
  // Handle Date objects
  if (dateString instanceof Date) {
    return dateString;
  }

  // Handle string date
  if (typeof dateString === 'string') {
    // Check if it's already in YYYY-MM-DD format
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      const [year, month, day] = dateString.split('-').map(Number);
      return new Date(year, month - 1, day);
    }

    // Try parsing as ISO string
    const date = new Date(dateString);
    if (!isNaN(date.getTime())) {
      return date;
    }
  }

  console.error('Invalid date string in parseDateString:', dateString);
  return new Date(); // Return current date as fallback
}

// Format date for display
export const formatDisplayDate = (dateString) => {
  try {
    const date = parseDateString(dateString);

    if (isNaN(date.getTime())) {
      console.error('Invalid date:', dateString);
      return 'Invalid date';
    }

    return date.toLocaleDateString('en-KE', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch (error) {
    console.error('Error formatting date:', error, 'Date string:', dateString);
    return 'Date not available';
  }
}

// Rest of your functions remain the same...