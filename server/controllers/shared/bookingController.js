const Booking = require('../../models/Booking');
const Payment = require('../../models/Payment');

// @desc    Get booking details by ID
// @route   GET /api/bookings/:id
// @access  Private
const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('equipmentId')
      .populate('renterId', 'name email phone profileImage cnicNumber address location')
      .populate('ownerId', 'name email phone profileImage address location');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Verify authorized user: farmer, owner, or admin
    if (
      booking.renterId._id.toString() !== req.user.id &&
      booking.ownerId._id.toString() !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ message: 'Not authorized to view this booking' });
    }

    // Fetch related payment
    const payment = await Payment.findOne({ bookingId: booking._id });

    res.json({ booking, payment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getBookingById,
};
