// src/components/consultation/ConsultationCalendar.jsx
import { useState, useEffect } from 'react'
import { Calendar, Clock, AlertCircle, Loader2 } from 'lucide-react'
import { formatDisplayDate } from './consultationUtils'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import bookingApi from '../../../admin-pages/services/booking-api'
import toast from 'react-hot-toast'

const ConsultationCalendar = ({ onDateSelect, selectedDate }) => {
  const [currentDate, setCurrentDate] = useState(new Date())
  const queryClient = useQueryClient()

  // Helper function to get date string in YYYY-MM-DD format (timezone safe)
  const getDateString = (date) => {
    // Get local date parts to avoid timezone issues
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  // Helper function to parse date string without timezone issues
  const parseDateString = (dateString) => {
    const [year, month, day] = dateString.split('-').map(Number)
    return new Date(year, month - 1, day) // Create date in local timezone
  }

  // Fetch availability for the current month
  const { data: availabilityData, isLoading: isLoadingAvailability } = useQuery({
    queryKey: ['availability', currentDate.getFullYear(), currentDate.getMonth() + 1],
    queryFn: () => {
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
      const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)

      return bookingApi.getAvailability(
        getDateString(startOfMonth),
        getDateString(endOfMonth)
      )
    },
    onError: (error) => {
      toast.error('Failed to load availability')
    }
  })

  // Today's date for comparison (timezone safe)
  const today = new Date()
  const todayString = getDateString(today)

  // Function to check if a date is valid for booking
  const isValidBookingDate = (dateString) => {
    if (!availabilityData?.data) return false

    const date = parseDateString(dateString)
    const dayOfWeek = date.getDay()
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6

    if (isWeekend) return false

    // Check if date is in availability data and not a holiday
    const availabilityForDate = availabilityData.data.find(
      avail => {
        const availDate = new Date(avail.date)
        return getDateString(availDate) === dateString
      }
    )

    if (availabilityForDate?.isHoliday) return false

    return true
  }

  // Generate calendar days for current month
  const generateCalendarDays = () => {
    if (isLoadingAvailability) return []

    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()

    const days = []

    // Add days of the month
    for (let day = 1; day <= 31; day++) {
      try {
        const date = new Date(year, month, day)

        // Check if we're still in the correct month
        if (date.getMonth() !== month) break

        const dateString = getDateString(date)
        const isWeekend = date.getDay() === 0 || date.getDay() === 6
        const isPast = dateString < todayString

        // Get availability for this date
        const availabilityForDate = availabilityData?.data?.find(
          avail => {
            const availDate = new Date(avail.date)
            return getDateString(availDate) === dateString
          }
        )

        const isHoliday = availabilityForDate?.isHoliday || false
        const isBookable = !isWeekend && !isPast && !isHoliday
        const isSelected = selectedDate === dateString

        // Count available time slots
        const availableSlots = availabilityForDate?.timeSlots
          ? Object.entries(availabilityForDate.timeSlots)
            .filter(([_, isAvailable]) => isAvailable)
            .length
          : 0

        days.push({
          date,
          dateString,
          day,
          isWeekend,
          isPast,
          isHoliday,
          isBookable,
          isSelected,
          availableSlots,
          availability: availabilityForDate
        })
      } catch (error) {
        console.error('Error generating day:', day, error)
      }
    }

    return days
  }

  const calendarDays = generateCalendarDays()

  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate)
    newDate.setMonth(newDate.getMonth() + direction)
    setCurrentDate(newDate)
  }

  const handleDateClick = (day) => {
    if (day.isBookable) {
      console.log('Selected date string:', day.dateString) // Debug log
      onDateSelect(day.dateString)
      toast.success(`Selected ${formatDisplayDate(day.dateString)}`)
    } else {
      let reason = 'This date is not available for booking.'
      if (day.isWeekend) reason = 'Weekends are not available for bookings.'
      if (day.isHoliday) reason = 'This date is a holiday.'
      if (day.isPast) reason = 'Cannot book past dates.'
      toast.error(reason)
    }
  }

  const monthYear = currentDate.toLocaleDateString('en-KE', {
    month: 'long',
    year: 'numeric'
  })

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  // Refresh availability when month changes
  useEffect(() => {
    queryClient.invalidateQueries({
      queryKey: ['availability', currentDate.getFullYear(), currentDate.getMonth() + 1]
    })
  }, [currentDate, queryClient])

  return (
    <div className="bg-dark-light rounded-sm border border-gray-800 p-6">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigateMonth(-1)}
          disabled={isLoadingAvailability}
          className="p-2 hover:bg-gray-800 rounded-sm transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          &larr;
        </button>
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <Calendar size={20} />
          {monthYear}
          {isLoadingAvailability && (
            <Loader2 size={16} className="animate-spin text-primary" />
          )}
        </h3>
        <button
          onClick={() => navigateMonth(1)}
          disabled={isLoadingAvailability}
          className="p-2 hover:bg-gray-800 rounded-sm transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          &rarr;
        </button>
      </div>

      {/* Day Names */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayNames.map((name, index) => (
          <div key={name} className="text-center">
            <span className={`text-xs font-medium ${index === 0 || index === 6 ? 'text-gray-500' : 'text-gray-400'}`}>
              {name}
            </span>
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {isLoadingAvailability ? (
          // Loading skeleton
          Array.from({ length: 35 }).map((_, index) => (
            <div
              key={index}
              className="h-10 bg-gray-800/50 rounded-sm animate-pulse"
            />
          ))
        ) : (
          calendarDays.map((day) => (
            <button
              key={day.dateString}
              onClick={() => handleDateClick(day)}
              disabled={!day.isBookable}
              title={!day.isBookable ?
                (day.isWeekend ? 'Weekend' :
                  day.isHoliday ? 'Holiday' :
                    day.isPast ? 'Past date' : 'Not available') :
                `${day.availableSlots} slots available`}
              className={`
                relative p-2 rounded-sm text-center transition min-h-[40px]
                ${day.isSelected
                  ? 'bg-primary text-white'
                  : day.isBookable
                    ? 'bg-gray-900 text-white hover:bg-gray-800'
                    : 'bg-gray-900/50 text-gray-500 cursor-not-allowed'
                }
              `}
            >
              <div className="text-sm font-medium">{day.day}</div>

              {/* Today indicator */}
              {day.dateString === todayString && (
                <div className="absolute top-0 left-0 w-2 h-2 bg-blue-500 rounded-full"></div>
              )}

              {/* Indicator for available days with slot count */}
              {day.isBookable && !day.isWeekend && (
                <div className="absolute bottom-1 right-1 flex items-center gap-0.5">
                  <div className="w-1.5 h-1.5 bg-[#00FF88] rounded-full"></div>
                  {day.availableSlots > 0 && (
                    <span className="text-xs text-[#00FF88] font-medium">
                      {day.availableSlots}
                    </span>
                  )}
                </div>
              )}

              {/* Weekend indicator */}
              {day.isWeekend && (
                <div className="absolute top-1 right-1 text-xs text-gray-500">✗</div>
              )}

              {/* Holiday indicator */}
              {day.isHoliday && (
                <div className="absolute top-1 left-1 text-xs text-amber-500">✹</div>
              )}

              {/* Past date indicator */}
              {day.isPast && !day.isWeekend && !day.isHoliday && (
                <div className="absolute top-1 left-1 text-xs text-gray-500">↶</div>
              )}
            </button>
          ))
        )}
      </div>

      {/* Legend */}
      <div className="mt-6 pt-6 border-t border-gray-800">
        <div className="flex flex-wrap gap-4 text-sm mb-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-primary rounded-sm"></div>
            <span className="text-gray-300">Selected Day</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-[#00FF88] rounded-sm"></div>
            <span className="text-gray-300">Available for Booking</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-gray-900 rounded-sm"></div>
            <span className="text-gray-300">Unavailable</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-sm"></div>
            <span className="text-gray-300">Today</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-amber-500 rounded-sm"></div>
            <span className="text-gray-300">Holiday</span>
          </div>
        </div>

        {/* Schedule Info */}
        <div className="p-3 bg-gray-900/50 rounded-sm">
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Clock size={14} />
            <span>Consultations: Mon-Fri, 8:30 AM - 4:00 PM (No lunch 12-1 PM)</span>
          </div>

          {/* Loading/Error states */}
          {isLoadingAvailability && (
            <div className="flex items-center gap-2 mt-2 text-sm text-primary">
              <Loader2 size={14} className="animate-spin" />
              <span>Loading availability...</span>
            </div>
          )}

          {availabilityData?.data && (
            <div className="flex items-center gap-2 mt-2 text-sm text-[#00FF88]">
              <AlertCircle size={14} />
              <span>
                {calendarDays.filter(d => d.isBookable).length}
                working days available this month
              </span>
            </div>
          )}

          {/* Debug info (remove in production) */}
          <div className="mt-2 text-xs text-gray-600">
            <div>Today: {todayString}</div>
            <div>Selected: {selectedDate || 'None'}</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-4 flex gap-2">
          <button
            onClick={() => setCurrentDate(new Date())}
            className="text-xs px-3 py-1 bg-gray-800 hover:bg-gray-700 rounded-sm transition text-gray-300"
          >
            Jump to Today
          </button>
          <button
            onClick={() => {
              const nextMonth = new Date(currentDate)
              nextMonth.setMonth(nextMonth.getMonth() + 1)
              setCurrentDate(nextMonth)
            }}
            className="text-xs px-3 py-1 bg-gray-800 hover:bg-gray-700 rounded-sm transition text-gray-300"
          >
            Next Month
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConsultationCalendar