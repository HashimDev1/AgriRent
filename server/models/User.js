const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      enum: ['farmer', 'owner', 'admin'],
      default: 'farmer',
    },
    profileImage: {
      type: mongoose.Schema.Types.Mixed,
      default: '',
    },
    cnicNumber: {
      type: String,
      default: '',
    },
    cnicFrontImage: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    cnicBackImage: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    address: {
      type: String,
      default: '',
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
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// 2dsphere index for location based queries
UserSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('User', UserSchema);
