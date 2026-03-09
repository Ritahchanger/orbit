// services/bookingService.js
const Booking = require('./booking.model');
const ConsultationType = require("./consultation.model")
const Availability = require("./availability.model")
class BookingService {
    // services/booking.service.js

    async createBooking({ date, timeSlot, consultationType, consultationTypeId, user }) {
        const selectedDate = new Date(date);
        const today = new Date();

        // Validate date
        if (selectedDate < today) {
            throw new Error('Cannot book past dates');
        }

        // Determine consultation type ID (handle both parameter names)
        const typeId = consultationTypeId || consultationType;

        if (!typeId) {
            throw new Error('Consultation type is required');
        }

        // Find consultation type
        console.log('Looking for consultation type with ID:', typeId);
        const consultationTypeDoc = await ConsultationType.findOne({
            id: typeId,
            isActive: true
        });

        if (!consultationTypeDoc) {
            // Get available types for better error message
            const availableTypes = await ConsultationType.find({ isActive: true }).select('id title');
            throw new Error(`Invalid consultation type: ${typeId}. Available types: ${availableTypes.map(t => t.id).join(', ')}`);
        }

        // Create or find availability for this date
        const availability = await Availability.findOneAndUpdate(
            { date: selectedDate },
            { $setOnInsert: { date: selectedDate } }, // Create if doesn't exist
            { upsert: true, new: true }
        );

        // Check if time slot is available in availability
        if (availability.timeSlots[timeSlot] === false) {
            throw new Error('Time slot is not available for booking');
        }

        // Check if time slot is already booked
        const existingBooking = await Booking.findOne({
            date: selectedDate,
            timeSlot,
            status: { $in: ['pending', 'confirmed'] }
        });

        if (existingBooking) {
            throw new Error('Time slot already booked');
        }

        // Mark the time slot as unavailable in availability
        availability.timeSlots[timeSlot] = false;
        await availability.save();

        // Extract needed consultation type data
        const consultationTypeData = {
            id: consultationTypeDoc.id,
            title: consultationTypeDoc.title,
            duration: consultationTypeDoc.duration,
            price: {
                amount: consultationTypeDoc.price.amount,
                currency: consultationTypeDoc.price.currency
            }
        };

        // Create booking
        const booking = new Booking({
            date: selectedDate,
            timeSlot,
            consultationType: consultationTypeData,
            user,
            status: 'pending'
        });

        await booking.save();

        return booking.toDisplayFormat();
    }

    async getBooking(referenceNumber) {
        const booking = await Booking.findOne({ referenceNumber });

        if (!booking) {
            throw new Error('Booking not found');
        }

        return booking.toDisplayFormat();
    }

    async cancelBooking(referenceNumber, reason) {
        const booking = await Booking.findOne({ referenceNumber });

        if (!booking) {
            throw new Error('Booking not found');
        }

        // Check if booking is already cancelled
        if (booking.status === 'cancelled') {
            throw new Error('Booking is already cancelled');
        }

        // Check if booking can be cancelled (24-hour rule)
        const bookingDateTime = new Date(`${booking.date.toISOString().split('T')[0]}T${booking.timeSlot}`);
        const now = new Date();
        const hoursDifference = (bookingDateTime - now) / (1000 * 60 * 60);

        if (hoursDifference < 24) {
            throw new Error('Bookings can only be cancelled 24 hours in advance');
        }

        // Update booking status
        booking.status = 'cancelled';
        booking.cancellationReason = reason || 'No reason provided';
        booking.updatedAt = new Date();
        await booking.save();

        const bookingDate = new Date(booking.date);
        bookingDate.setHours(0, 0, 0, 0);

        const endOfDay = new Date(bookingDate);
        endOfDay.setHours(23, 59, 59, 999);

        // Find availability for the booking date
        const availability = await Availability.findOne({
            date: {
                $gte: bookingDate,
                $lt: endOfDay
            }
        });

        if (availability) {
            // Mark the slot as available again
            availability.timeSlots[booking.timeSlot] = true;
            await availability.save();
            console.log(`✅ Time slot ${booking.timeSlot} marked as available for ${bookingDate.toISOString().split('T')[0]}`);
        } else {
            // If no availability record exists, create one with the slot available
            const newAvailability = new Availability({
                date: booking.date,
                timeSlots: {
                    '08:30': booking.timeSlot === '08:30',
                    '09:30': booking.timeSlot === '09:30',
                    '10:30': booking.timeSlot === '10:30',
                    '11:30': booking.timeSlot === '11:30',
                    '13:00': booking.timeSlot === '13:00',
                    '14:00': booking.timeSlot === '14:00',
                    '15:00': booking.timeSlot === '15:00',
                    '16:00': booking.timeSlot === '16:00'
                }
            });
            // Set the cancelled slot to true, others to default
            newAvailability.timeSlots[booking.timeSlot] = true;
            await newAvailability.save();
            console.log(`✅ Created availability record and marked ${booking.timeSlot} as available`);
        }

        return booking.toDisplayFormat();
    }
    async getAllBookings({ startDate, endDate, status }) {
        const query = {};

        if (startDate && endDate) {
            query.date = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        if (status) {
            query.status = status;
        }

        const bookings = await Booking.find(query)
            .sort({ date: 1, timeSlot: 1 })
            .limit(100);

        return bookings;
    }
}

module.exports = new BookingService();