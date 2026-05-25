const Booking = require('../../models/Booking');
const Notification = require('../../models/Notification');
const Payment = require('../../models/Payment');

// @desc    Get bookings for equipment owned by user
// @route   GET /api/bookings/owner
// @access  Private (Owner only)
const getOwnerBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ ownerId: req.user.id })
      .populate('equipmentId')
      .populate('renterId', 'name email phone cnicNumber address')
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Owner approves booking request
// @route   PUT /api/bookings/:id/approve
// @access  Private (Owner only)
const approveBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('equipmentId');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.ownerId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only the equipment owner can approve this request' });
    }

    if (booking.status !== 'pending') {
      return res.status(400).json({ message: `Cannot approve booking that is currently ${booking.status}` });
    }

    // Secondary check for double-booking overlaps upon approval
    const conflict = await Booking.findOne({
      _id: { $ne: booking._id },
      equipmentId: booking.equipmentId._id,
      status: { $in: ['approved', 'active'] },
      startDate: { $lte: booking.endDate },
      endDate: { $gte: booking.startDate },
    });

    if (conflict) {
      booking.status = 'rejected';
      booking.ownerResponseMessage = 'Automatically rejected due to scheduling conflict with another approved booking.';
      await booking.save();
      return res.status(400).json({ message: 'Another booking overlaps this timeframe. Rejection auto-applied.' });
    }

    booking.status = 'approved';
    if (req.body.message) {
      booking.ownerResponseMessage = req.body.message;
    }
    const updatedBooking = await booking.save();

    // Notify farmer
    await Notification.create({
      userId: booking.renterId,
      title: 'Booking Approved',
      message: `Your booking request for "${booking.equipmentId.title}" has been approved by the owner!`,
      type: 'booking_approved',
      relatedEntityId: booking._id,
    });

    res.json(updatedBooking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Owner rejects booking request
// @route   PUT /api/bookings/:id/reject
// @access  Private (Owner only)
const rejectBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('equipmentId');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.ownerId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only the equipment owner can reject this request' });
    }

    if (booking.status !== 'pending') {
      return res.status(400).json({ message: `Cannot reject booking that is currently ${booking.status}` });
    }

    booking.status = 'rejected';
    booking.ownerResponseMessage = req.body.message || 'Rejected by owner';
    const updatedBooking = await booking.save();

    // Notify farmer
    await Notification.create({
      userId: booking.renterId,
      title: 'Booking Rejected',
      message: `Your booking request for "${booking.equipmentId.title}" has been rejected. Message: "${booking.ownerResponseMessage}"`,
      type: 'booking_rejected',
      relatedEntityId: booking._id,
    });

    res.json(updatedBooking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Owner marks approved booking as active (picked up)
// @route   PUT /api/bookings/:id/active
// @access  Private (Owner only)
const activeBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.ownerId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only the owner can activate the booking' });
    }

    if (booking.status !== 'approved') {
      return res.status(400).json({ message: `Cannot activate booking that is currently ${booking.status}` });
    }

    booking.status = 'active';
    const updatedBooking = await booking.save();

    // Notify renter
    await Notification.create({
      userId: booking.renterId,
      title: 'Rental Session Active',
      message: `Your booking is now active. You have officially picked up the equipment.`,
      type: 'system',
      relatedEntityId: booking._id,
    });

    res.json(updatedBooking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Owner marks active booking as completed (returned)
// @route   PUT /api/bookings/:id/complete
// @access  Private (Owner only)
const completeBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.ownerId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only the owner can complete the booking' });
    }

    if (booking.status !== 'active') {
      return res.status(400).json({ message: `Cannot complete booking that is currently ${booking.status}` });
    }

    booking.status = 'completed';
    const updatedBooking = await booking.save();

    // Update payment as paid if cash method completed
    const payment = await Payment.findOne({ bookingId: booking._id });
    if (payment && payment.paymentStatus === 'pending') {
      payment.paymentStatus = 'paid';
      payment.paidAt = new Date();
      await payment.save();
    }

    // Notify renter to review
    await Notification.create({
      userId: booking.renterId,
      title: 'Rental Completed',
      message: `Your rental session is complete! Please submit a review for the machinery.`,
      type: 'payment_update',
      relatedEntityId: booking._id,
    });

    res.json(updatedBooking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getOwnerBookings,
  approveBooking,
  rejectBooking,
  activeBooking,
  completeBooking,
};
