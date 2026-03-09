// models/Booking.js
const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
    index: true,
  },
  timeSlot: {
    type: String,
    required: true,
    enum: [
      "08:30",
      "09:30",
      "10:30",
      "11:30",
      "13:00",
      "14:00",
      "15:00",
      "16:00",
    ],
  },
  consultationType: {
    id: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    duration: {
      type: String,
      required: true,
    },
    price: {
      amount: {
        type: Number,
        required: true,
      },
      currency: {
        type: String,
        default: "KES",
      },
    },
  },
  user: {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    notes: {
      type: String,
      default: "",
    },
  },
  status: {
    type: String,
    enum: ["pending", "confirmed", "cancelled", "completed"],
    default: "pending",
  },
  referenceNumber: {
    type: String,
    unique: true,
    default: () => `CONS${Date.now()}${Math.floor(Math.random() * 1000)}`,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  responded: {
    type: Boolean,
    default: false,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Compound index to prevent double bookings for same time slot
bookingSchema.index({ date: 1, timeSlot: 1 }, { unique: true });

// Method to check if booking is in the past
bookingSchema.methods.isPast = function () {
  const bookingDateTime = new Date(
    `${this.date.toISOString().split("T")[0]}T${this.timeSlot}`,
  );
  return bookingDateTime < new Date();
};

// Method to format booking for display
bookingSchema.methods.toDisplayFormat = function () {
  return {
    id: this._id,
    date: this.date,
    timeSlot: this.timeSlot,
    consultationType: this.consultationType,
    user: this.user,
    status: this.status,
    referenceNumber: this.referenceNumber,
    createdAt: this.createdAt,
  };
};

const Booking = mongoose.model("Booking", bookingSchema);

module.exports = Booking;
