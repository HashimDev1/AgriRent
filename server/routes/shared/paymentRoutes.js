const express = require('express');
const router = express.Router();
const {
  createPayment,
  markPaymentAsPaid,
} = require('../../controllers/shared/paymentController');
const { protect } = require('../../middleware/authMiddleware');

router.post('/', protect, createPayment);
router.put('/:id/paid', protect, markPaymentAsPaid);

module.exports = router;
