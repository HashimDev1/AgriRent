const express = require('express');
const router = express.Router();
const { createReview } = require('../../controllers/farmer/reviewController');
const { protect } = require('../../middleware/authMiddleware');
const { authorize } = require('../../middleware/roleMiddleware');

router.post('/', protect, authorize('farmer'), createReview);

module.exports = router;
