const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema(
  {
    value: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    label: {
      type: String,
      required: true,
    },
    subtitle: {
      type: String,
      default: '',
    },
    icon: {
      type: String,
      default: '',
    },
    img: {
      type: mongoose.Schema.Types.Mixed, // Stores string URL or Cloudinary object { url, public_id }
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Category', CategorySchema);
