// models/Availability.js
const mongoose = require('mongoose');

const availabilitySchema = new mongoose.Schema({
    date: {
        type: Date,
        required: true,
        unique: true
    },
    // Time slots: true = available, false = not available
    timeSlots: {
        '08:30': { type: Boolean, default: true },
        '09:30': { type: Boolean, default: true },
        '10:30': { type: Boolean, default: true },
        '11:30': { type: Boolean, default: true },
        '13:00': { type: Boolean, default: true },
        '14:00': { type: Boolean, default: true },
        '15:00': { type: Boolean, default: true },
        '16:00': { type: Boolean, default: true }
    },
    // Special days (holidays, maintenance, etc.)
    isHoliday: {
        type: Boolean,
        default: false
    },
    notes: {
        type: String,
        default: ''
    }
});

// Pre-save middleware to update based on day of week
availabilitySchema.pre('save', function (next) {
    const dayOfWeek = this.date.getDay();

    // Set weekends as unavailable
    if (dayOfWeek === 0 || dayOfWeek === 6) { // Sunday or Saturday
        Object.keys(this.timeSlots).forEach(slot => {
            this.timeSlots[slot] = false;
        });
        this.notes = 'Weekend - No consultations';
    }

    next();
});

const Availability = mongoose.model('Availability', availabilitySchema);

module.exports = Availability;