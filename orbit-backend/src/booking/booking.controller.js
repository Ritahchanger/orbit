// controllers/bookingController.js
const bookingService = require('./booking.service');

exports.createBooking = async (req, res) => {

    const { date, timeSlot, consultationType, user } = req.body; // Change from consultationTypeId to consultationType

    console.log('Creating booking:', req.body);

    if (!date || !timeSlot || !consultationType || !user) { // Change from consultationTypeId to consultationType
        return res.status(400).json({
            success: false,
            message: 'Missing required fields: date, timeSlot, consultationType, user' // Update error message
        });
    }

    const data = await bookingService.createBooking({
        date,
        timeSlot,
        consultationType, // Pass as consultationType (not consultationTypeId)
        user
    });

    res.status(201).json({
        success: true,
        message: 'Booking created successfully',
        data
    });
};
exports.getBooking = async (req, res) => {
    const { referenceNumber } = req.params;

    const data = await bookingService.getBooking(referenceNumber);

    res.json({
        success: true,
        data
    });
};

exports.cancelBooking = async (req, res) => {
    const { referenceNumber } = req.params;
    const { reason } = req.body;

    const data = await bookingService.cancelBooking(referenceNumber, reason);

    res.json({
        success: true,
        message: 'Booking cancelled successfully',
        data
    });
};

exports.getAllBookings = async (req, res) => {
    const { startDate, endDate, status } = req.query;

    const data = await bookingService.getAllBookings({
        startDate,
        endDate,
        status
    });

    res.json({
        success: true,
        data,
        count: data.length
    });
};