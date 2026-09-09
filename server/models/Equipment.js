const mongoose = require('mongoose');

const EquipmentSchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: ['tractor', 'harvester', 'seed_drill', 'sprayer', 'water_pump', 'cultivator', 'plough', 'other'],
      required: true,
    },
    brand: {
      type: String,
      default: '',
    },
    model: {
      type: String,
      default: '',
    },
    rentPerDay: {
      type: Number,
      required: true,
    },
    securityDeposit: {
      type: Number,
      default: 0,
    },
    images: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        default: [0, 0],
      },
      address: {
        type: String,
        default: '',
      },
      city: {
        type: String,
        default: '',
      },
    },
    availability: {
      startDate: {
        type: Date,
        default: Date.now,
      },
      endDate: {
        type: Date,
        default: () => new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // Default 1 year from now
      },
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    status: {
      type: String,
      enum: ['pending_verification', 'approved', 'rejected', 'blocked'],
      default: 'pending_verification',
    },
    averageRating: {
      type: Number,
      default: 0,
    },
    totalReviews: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
EquipmentSchema.index({ location: '2dsphere' });
EquipmentSchema.index({ category: 1 });
EquipmentSchema.index({ rentPerDay: 1 });
EquipmentSchema.index({ status: 1 });

module.exports = mongoose.model('Equipment', EquipmentSchema);
