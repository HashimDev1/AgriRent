const express = require('express');
const router = express.Router();
const {
  createBooking,
  getFarmerBookings,
  cancelBooking,
} = require('../../controllers/farmer/bookingController');
const { protect } = require('../../middleware/authMiddleware');
const { authorize } = require('../../middleware/roleMiddleware');

router.route('/')
  .post(protect, authorize('farmer'), createBooking);

router.get('/farmer', protect, authorize('farmer'), getFarmerBookings);
router.put('/:id/cancel', protect, authorize('farmer'), cancelBooking);

module.exports = router;
