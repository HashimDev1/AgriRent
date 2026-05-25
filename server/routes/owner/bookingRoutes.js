const express = require('express');
const router = express.Router();
const {
  getOwnerBookings,
  approveBooking,
  rejectBooking,
  activeBooking,
  completeBooking,
} = require('../../controllers/owner/bookingController');
const { protect } = require('../../middleware/authMiddleware');
const { authorize } = require('../../middleware/roleMiddleware');

router.get('/owner', protect, authorize('owner'), getOwnerBookings);
router.put('/:id/approve', protect, authorize('owner'), approveBooking);
router.put('/:id/reject', protect, authorize('owner'), rejectBooking);
router.put('/:id/active', protect, authorize('owner'), activeBooking);
router.put('/:id/complete', protect, authorize('owner'), completeBooking);

module.exports = router;
