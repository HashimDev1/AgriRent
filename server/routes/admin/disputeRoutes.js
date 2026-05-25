const express = require('express');
const router = express.Router();
const {
  getAllDisputesAdmin,
  updateDisputeStatus,
} = require('../../controllers/shared/disputeController');
const { protect } = require('../../middleware/authMiddleware');
const { authorize } = require('../../middleware/roleMiddleware');

router.get('/admin', protect, authorize('admin'), getAllDisputesAdmin);
router.put('/:id/status', protect, authorize('admin'), updateDisputeStatus);

module.exports = router;
