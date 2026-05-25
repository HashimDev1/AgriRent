const Payment = require('../../models/Payment');

// @desc    Get owner's payment receivables
// @route   GET /api/payments/owner
// @access  Private (Owner only)
const getOwnerPayments = async (req, res) => {
  try {
    const payments = await Payment.find({ ownerId: req.user.id })
      .populate('bookingId')
      .populate('renterId', 'name email phone')
      .sort({ createdAt: -1 });
    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getOwnerPayments,
};
