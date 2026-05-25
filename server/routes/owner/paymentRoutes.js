const express = require('express');
const router = express.Router();
const { getOwnerPayments } = require('../../controllers/owner/paymentController');
const { protect } = require('../../middleware/authMiddleware');
const { authorize } = require('../../middleware/roleMiddleware');

router.get('/owner', protect, authorize('owner'), getOwnerPayments);

module.exports = router;
