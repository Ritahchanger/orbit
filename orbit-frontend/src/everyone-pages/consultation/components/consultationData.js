// src/components/consultation/consultationData.js

// Mock data simulating booked consultations from backend
export const bookedConsultations = [
    {
        id: 1,
        date: '2024-03-11', // Monday
        times: ['09:00', '10:30', '14:00'],
        customerName: 'John Kimani',
        consultationType: 'beginner'
    },
    {
        id: 2,
        date: '2024-03-12', // Tuesday
        times: ['08:30', '11:00', '15:30'],
        customerName: 'Sarah Wanjiku',
        consultationType: 'streaming'
    },
    {
        id: 3,
        date: '2024-03-13', // Wednesday
        times: ['10:00', '13:00', '16:00'],
        customerName: 'David Omondi',
        consultationType: 'esports'
    },
    {
        id: 4,
        date: '2024-03-14', // Thursday
        times: ['09:30', '14:30'],
        customerName: 'Grace Akinyi',
        consultationType: 'premium'
    },
    {
        id: 5,
        date: '2024-03-18', // Monday next week
        times: ['08:30', '12:00', '15:00'],
        customerName: 'Brian Mwangi',
        consultationType: 'beginner'
    }
]

// Consultation types
export const consultationTypes = [
    {
        id: 'beginner',
        title: 'Beginner Gaming Setup',
        duration: '1 hour',
        price: 'FREE',
        icon: '🎮'
    },
    {
        id: 'streaming',
        title: 'Streaming Setup',
        duration: '2 hours',
        price: 'KSh 2,000',
        icon: '📹'
    },
    {
        id: 'esports',
        title: 'Competitive Esports',
        duration: '1.5 hours',
        price: 'KSh 3,500',
        icon: '🏆'
    },
    {
        id: 'premium',
        title: 'Premium Gaming Suite',
        duration: '3 hours',
        price: 'KSh 10,000',
        icon: '👑'
    }
]

// Store operating hours
export const storeSchedule = {
    operatingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], // Mon-Fri only
    startTime: '08:30',
    endTime: '16:00',
    lunchBreak: {
        start: '12:00',
        end: '13:00'
    }
}

// Generate time slots from 8:30 AM to 4:00 PM (excluding lunch)
export const generateTimeSlots = () => {
    const slots = []
    const start = 8.5 // 8:30 AM
    const end = 16 // 4:00 PM

    for (let hour = start; hour < end; hour += 0.5) { // 30-minute intervals
        // Skip lunch time (12:00 - 1:00 PM)
        if (hour >= 12 && hour < 13) continue

        const hourInt = Math.floor(hour)
        const minutes = hour % 1 === 0 ? '00' : '30'
        const timeString = `${hourInt.toString().padStart(2, '0')}:${minutes}`
        const displayTime = `${hourInt}:${minutes} ${hourInt < 12 ? 'AM' : 'PM'}`

        slots.push({
            value: timeString,
            display: displayTime,
            available: true
        })
    }

    return slots
}