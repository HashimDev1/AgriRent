const express = require('express');
const router = express.Router();
const { getBookingById } = require('../../controllers/shared/bookingController');
const { protect } = require('../../middleware/authMiddleware');

router.route('/:id')
  .get(protect, getBookingById);

module.exports = router;
