const Payment = require('../../models/Payment');
const Booking = require('../../models/Booking');
const Notification = require('../../models/Notification');

// @desc    Log/Create a payment record manually
// @route   POST /api/payments
// @access  Private
const createPayment = async (req, res) => {
  try {
    const { bookingId, amount, method, transactionId } = req.body;

    if (!bookingId || !amount) {
      return res.status(400).json({ message: 'Booking ID and amount are required' });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    const payment = new Payment({
      bookingId,
      renterId: booking.renterId,
      ownerId: booking.ownerId,
      amount: parseFloat(amount),
      method: method || 'cash',
      transactionId: transactionId || '',
      paymentStatus: 'pending',
    });

    const savedPayment = await payment.save();
    res.status(201).json(savedPayment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Mark payment as paid
// @route   PUT /api/payments/:id/paid
// @access  Private
const markPaymentAsPaid = async (req, res) => {
  try {
    const { transactionId, method } = req.body;
    const payment = await Payment.findById(req.params.id).populate('bookingId');

    if (!payment) {
      return res.status(404).json({ message: 'Payment record not found' });
    }

    payment.paymentStatus = 'paid';
    payment.paidAt = new Date();
    if (transactionId) payment.transactionId = transactionId;
    if (method) payment.method = method;

    const updatedPayment = await payment.save();

    // Create notifications for both
    await Notification.create({
      userId: payment.ownerId,
      title: 'Payment Status Updated',
      message: `Payment of PKR ${payment.amount} for booking #${payment.bookingId._id} is marked as PAID via ${payment.method}.`,
      type: 'payment_update',
      relatedEntityId: payment._id,
    });

    await Notification.create({
      userId: payment.renterId,
      title: 'Payment Complete',
      message: `Your payment of PKR ${payment.amount} has been processed successfully.`,
      type: 'payment_update',
      relatedEntityId: payment._id,
    });

    res.json(updatedPayment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createPayment,
  markPaymentAsPaid,
};
