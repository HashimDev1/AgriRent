const express = require('express');
const router = express.Router();
const { getFarmerPayments } = require('../../controllers/farmer/paymentController');
const { protect } = require('../../middleware/authMiddleware');
const { authorize } = require('../../middleware/roleMiddleware');

router.get('/farmer', protect, authorize('farmer'), getFarmerPayments);

module.exports = router;
