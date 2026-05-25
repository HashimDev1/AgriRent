const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema(
  {
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
    },
    equipmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Equipment',
      required: true,
    },
    reviewerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Static method to calculate average rating of equipment
ReviewSchema.statics.calculateAverageRating = async function (equipmentId) {
  const stats = await this.aggregate([
    {
      $match: { equipmentId: equipmentId },
    },
    {
      $group: {
        _id: '$equipmentId',
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 },
      },
    },
  ]);

  if (stats.length > 0) {
    await mongoose.model('Equipment').findByIdAndUpdate(equipmentId, {
      averageRating: Math.round(stats[0].averageRating * 10) / 10,
      totalReviews: stats[0].totalReviews,
    });
  } else {
    await mongoose.model('Equipment').findByIdAndUpdate(equipmentId, {
      averageRating: 0,
      totalReviews: 0,
    });
  }
};

// Call calculateAverageRating after save
ReviewSchema.post('save', function () {
  this.constructor.calculateAverageRating(this.equipmentId);
});

// Call calculateAverageRating after remove/delete
ReviewSchema.post('remove', function () {
  this.constructor.calculateAverageRating(this.equipmentId);
});

module.exports = mongoose.model('Review', ReviewSchema);
