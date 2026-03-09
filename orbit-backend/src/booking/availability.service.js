// services/availabilityService.js
const Availability = require('./availability.model');
const Booking = require('./booking.model');

class AvailabilityService {
    // Helper function to check if date is a weekend
    isWeekend(date) {
        const dayOfWeek = date.getDay();
        return dayOfWeek === 0 || dayOfWeek === 6; // Sunday or Saturday
    }

    // Helper function to get default time slots
    getDefaultTimeSlots() {
        return {
            '08:30': true,
            '09:30': true,
            '10:30': true,
            '11:30': true,
            '13:00': true,
            '14:00': true,
            '15:00': true,
            '16:00': true
        };
    }

    // Helper function to generate availability for a date
    generateDefaultAvailability(date) {
        const isWeekend = this.isWeekend(date);

        return {
            date,
            timeSlots: this.getDefaultTimeSlots(),
            isHoliday: false,
            notes: isWeekend ? 'Weekend - No consultations' : '',
            isWeekend,
            // Mark weekend slots as unavailable
            ...(isWeekend && {
                timeSlots: Object.keys(this.getDefaultTimeSlots()).reduce((acc, slot) => {
                    acc[slot] = false;
                    return acc;
                }, {})
            })
        };
    }

    async getAvailability({ startDate, endDate }) {
        const query = {};
        if (startDate && endDate) {
            query.date = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        } else {
            const today = new Date();
            const nextMonth = new Date();
            nextMonth.setDate(today.getDate() + 30);

            query.date = {
                $gte: today,
                $lte: nextMonth
            };
        }

        // Get existing availability records from database
        const dbAvailabilities = await Availability.find(query);

        // Create a map for quick lookup
        const availabilityMap = new Map();
        dbAvailabilities.forEach(avail => {
            availabilityMap.set(avail.date.toISOString().split('T')[0], avail);
        });

        const start = query.date.$gte;
        const end = query.date.$lte;
        const result = [];

        // Generate dates in the range
        const currentDate = new Date(start);
        while (currentDate <= end) {
            const dateStr = currentDate.toISOString().split('T')[0];
            const existing = availabilityMap.get(dateStr);

            if (existing) {
                // Use existing record from database
                result.push({
                    date: existing.date,
                    timeSlots: existing.timeSlots,
                    isHoliday: existing.isHoliday,
                    notes: existing.notes,
                    isWeekend: this.isWeekend(existing.date)
                });
            } else {
                // Generate default availability
                const generated = this.generateDefaultAvailability(new Date(currentDate));
                result.push(generated);
            }

            // Move to next day
            currentDate.setDate(currentDate.getDate() + 1);
        }

        return result;
    }

    async checkDateValidity(date) {
        const checkDate = new Date(date);

        // Check if weekend
        const isWeekend = this.isWeekend(checkDate);

        // Check if past date
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const isPast = checkDate < today;

        // Check availability record
        const availability = await Availability.findOne({ date: checkDate });

        // If no record exists in DB, use default rules
        const isHoliday = availability ? availability.isHoliday : false;

        // Date is valid if it's not weekend, not past, and not a holiday
        const isValid = !isWeekend && !isPast && !isHoliday;

        return {
            isValid,
            isWeekend,
            isPast,
            isHoliday,
            notes: availability?.notes || (isWeekend ? 'Weekend - No consultations' : '')
        };
    }

    // services/availabilityService.js
    async getTimeSlots(date) {
        // Parse date string correctly (YYYY-MM-DD format)
        const [year, month, day] = date.split('-').map(Number);

        // Create date in local timezone at midnight
        const selectedDate = new Date(year, month - 1, day);
        selectedDate.setHours(0, 0, 0, 0);

        // Also create UTC date for comparison
        const selectedDateUTC = new Date(Date.UTC(year, month - 1, day));

        // Try to find availability by matching date strings
        // First, get all availabilities for the day (using multiple date formats)
        const availability = await Availability.findOne({
            $or: [
                { date: selectedDate },
                { date: selectedDateUTC },
                {
                    date: {
                        $gte: new Date(selectedDate.setHours(0, 0, 0, 0)),
                        $lt: new Date(selectedDate.setHours(23, 59, 59, 999))
                    }
                }
            ]
        });

        // Get bookings for the date
        const bookings = await Booking.find({
            $or: [
                {
                    date: {
                        $gte: new Date(selectedDate.setHours(0, 0, 0, 0)),
                        $lt: new Date(selectedDate.setHours(23, 59, 59, 999))
                    }
                },
                {
                    date: {
                        $gte: new Date(selectedDateUTC.setHours(0, 0, 0, 0)),
                        $lt: new Date(selectedDateUTC.setHours(23, 59, 59, 999))
                    }
                }
            ],
            status: { $in: ['pending', 'confirmed'] }
        });

        // Use availability from DB or generate default
        const timeSlots = availability?.timeSlots || this.getDefaultTimeSlots();
        const isWeekend = this.isWeekend(selectedDate);
        const isHoliday = availability?.isHoliday || false;

        // If weekend, all slots should be false
        if (isWeekend) {
            Object.keys(timeSlots).forEach(slot => {
                timeSlots[slot] = false;
            });
        }

        // Format time slots
        const allSlots = [
            '08:30', '09:30', '10:30', '11:30',
            '13:00', '14:00', '15:00', '16:00'
        ];

        const formattedSlots = allSlots.map(slot => {
            const isAvailable = timeSlots[slot] !== false;
            const isBooked = bookings.some(booking => booking.timeSlot === slot);

            return {
                value: slot,
                display: slot,
                available: isAvailable && !isBooked
            };
        });

        return {
            date: selectedDate,
            timeSlots: formattedSlots,
            isHoliday,
            isWeekend,
            notes: availability?.notes || (isWeekend ? 'Weekend - No consultations' : '')
        };
    }

    async updateAvailability({ date, timeSlots, isHoliday, notes }) {
        const availability = await Availability.findOneAndUpdate(
            { date: new Date(date) },
            {
                timeSlots,
                isHoliday,
                notes,
                $setOnInsert: { date: new Date(date) }
            },
            { upsert: true, new: true }
        );

        return availability;
    }
}

module.exports = new AvailabilityService();