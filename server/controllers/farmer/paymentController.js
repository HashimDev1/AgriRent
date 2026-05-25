const Payment = require('../../models/Payment');

// @desc    Get farmer's payments / receipts
// @route   GET /api/payments/farmer
// @access  Private (Farmer only)
const getFarmerPayments = async (req, res) => {
  try {
    const payments = await Payment.find({ renterId: req.user.id })
      .populate('bookingId')
      .populate('ownerId', 'name email phone')
      .sort({ createdAt: -1 });
    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getFarmerPayments,
};
