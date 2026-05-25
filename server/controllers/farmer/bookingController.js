const Booking = require('../../models/Booking');
const Equipment = require('../../models/Equipment');
const Notification = require('../../models/Notification');
const Payment = require('../../models/Payment');

// @desc    Create a new booking request
// @route   POST /api/bookings
// @access  Private (Farmer only)
const createBooking = async (req, res) => {
  try {
    const { equipmentId, startDate, endDate, purpose, pickupAddress } = req.body;

    if (!equipmentId || !startDate || !endDate) {
      return res.status(400).json({ message: 'Equipment, start date, and end date are required' });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start >= end) {
      return res.status(400).json({ message: 'Start date must be before end date' });
    }

    const equipment = await Equipment.findById(equipmentId);
    if (!equipment) {
      return res.status(404).json({ message: 'Equipment listing not found' });
    }

    if (!equipment.isAvailable || equipment.status !== 'approved') {
      return res.status(400).json({ message: 'Equipment is currently not available for rent' });
    }

    // Check for conflicting bookings
    const conflict = await Booking.findOne({
      equipmentId,
      status: { $in: ['pending', 'approved', 'active'] },
      startDate: { $lte: end },
      endDate: { $gte: start },
    });

    if (conflict) {
      return res.status(400).json({
        message: 'Conflict detected: The equipment is already booked or requested for these dates.',
      });
    }

    // Calculation
    const totalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) || 1;
    const rentPerDay = equipment.rentPerDay;
    const totalAmount = totalDays * rentPerDay;

    const booking = new Booking({
      equipmentId,
      renterId: req.user.id,
      ownerId: equipment.ownerId,
      startDate: start,
      endDate: end,
      totalDays,
      rentPerDay,
      totalAmount,
      purpose: purpose || '',
      pickupAddress: pickupAddress || '',
      status: 'pending',
    });

    const savedBooking = await booking.save();

    // Create payment entry as pending
    await Payment.create({
      bookingId: savedBooking._id,
      renterId: req.user.id,
      ownerId: equipment.ownerId,
      amount: totalAmount,
      paymentStatus: 'pending',
      method: 'cash',
    });

    // Create Notification for the Owner
    await Notification.create({
      userId: equipment.ownerId,
      title: 'New Booking Request',
      message: `${req.user.name} has requested to book your equipment: "${equipment.title}" from ${start.toLocaleDateString()} to ${end.toLocaleDateString()}.`,
      type: 'booking_request',
      relatedEntityId: savedBooking._id,
    });

    res.status(201).json(savedBooking);
  } catch (error) {
    console.error('Create Booking Error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get logged in farmer's bookings
// @route   GET /api/bookings/farmer
// @access  Private (Farmer only)
const getFarmerBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ renterId: req.user.id })
      .populate('equipmentId')
      .populate('ownerId', 'name email phone')
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Renter cancels booking request
// @route   PUT /api/bookings/:id/cancel
// @access  Private (Farmer only)
const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.renterId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only the farmer who booked can cancel it' });
    }

    if (booking.status !== 'pending') {
      return res.status(400).json({ message: 'Only pending bookings can be cancelled' });
    }

    booking.status = 'cancelled';
    booking.cancellationReason = req.body.reason || 'Cancelled by renter';
    const updatedBooking = await booking.save();

    // Notify owner
    await Notification.create({
      userId: booking.ownerId,
      title: 'Booking Cancelled',
      message: `The booking request for your equipment was cancelled by the renter.`,
      type: 'system',
      relatedEntityId: booking._id,
    });

    res.json(updatedBooking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createBooking,
  getFarmerBookings,
  cancelBooking,
};
