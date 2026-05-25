const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema(
  {
    equipmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Equipment',
      required: true,
    },
    renterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    totalDays: {
      type: Number,
      required: true,
    },
    rentPerDay: {
      type: Number,
      required: true,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    pickupAddress: {
      type: String,
      default: '',
    },
    purpose: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'cancelled', 'active', 'completed', 'disputed'],
      default: 'pending',
    },
    ownerResponseMessage: {
      type: String,
      default: '',
    },
    cancellationReason: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
BookingSchema.index({ equipmentId: 1, startDate: 1, endDate: 1 });
BookingSchema.index({ renterId: 1, status: 1 });
BookingSchema.index({ ownerId: 1, status: 1 });

module.exports = mongoose.model('Booking', BookingSchema);
