// controllers/availabilityController.js
const availabilityService = require('./availability.service');

exports.getAvailability = async (req, res) => {
    const { startDate, endDate } = req.query;

    const data = await availabilityService.getAvailability({ startDate, endDate });

    res.json({
        success: true,
        data,
        count: data.length
    });
};

exports.checkDateValidity = async (req, res) => {
    const { date } = req.params;

    const data = await availabilityService.checkDateValidity(date);

    res.json({
        success: true,
        ...data
    });
};

exports.getTimeSlots = async (req, res) => {
    const { date } = req.params;

    const data = await availabilityService.getTimeSlots(date);

    res.json({
        success: true,
        ...data
    });
};

exports.updateAvailability = async (req, res) => {
    const { date, timeSlots, isHoliday, notes } = req.body;

    const data = await availabilityService.updateAvailability({
        date,
        timeSlots,
        isHoliday,
        notes
    });

    res.json({
        success: true,
        message: 'Availability updated successfully',
        data
    });
};