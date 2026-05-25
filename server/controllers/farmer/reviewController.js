const Review = require('../../models/Review');
const Booking = require('../../models/Booking');
const Notification = require('../../models/Notification');

// @desc    Create a review for a booking
// @route   POST /api/reviews
// @access  Private (Farmer only)
const createReview = async (req, res) => {
  try {
    const { bookingId, rating, comment } = req.body;

    if (!bookingId || !rating) {
      return res.status(400).json({ message: 'Booking ID and star rating are required' });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Authorization check
    if (booking.renterId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only the renter can review this booking' });
    }

    // Business Logic: Only allow reviews for completed bookings
    if (booking.status !== 'completed') {
      return res.status(400).json({ message: 'You can only review equipment after the booking is completed' });
    }

    // Check if review already exists
    const reviewExists = await Review.findOne({ bookingId });
    if (reviewExists) {
      return res.status(400).json({ message: 'You have already reviewed this booking' });
    }

    const review = new Review({
      bookingId,
      equipmentId: booking.equipmentId,
      reviewerId: req.user.id,
      ownerId: booking.ownerId,
      rating: Number(rating),
      comment: comment || '',
    });

    const savedReview = await review.save();

    // Notify equipment owner
    await Notification.create({
      userId: booking.ownerId,
      title: 'Review Received',
      message: `Your equipment has received a new ${rating}-star review from ${req.user.name}.`,
      type: 'review_received',
      relatedEntityId: savedReview._id,
    });

    res.status(201).json(savedReview);
  } catch (error) {
    console.error('Create Review Error:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createReview,
};
