const express = require('express');
const router = express.Router();
const {
  createDispute,
  getMyDisputes,
} = require('../../controllers/shared/disputeController');
const { protect } = require('../../middleware/authMiddleware');

router.route('/')
  .post(protect, createDispute);

router.get('/my', protect, getMyDisputes);

module.exports = router;
