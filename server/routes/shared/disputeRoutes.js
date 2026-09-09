const express = require('express');
const router = express.Router();
const {
  createDispute,
  getMyDisputes,
} = require('../../controllers/shared/disputeController');
const { protect } = require('../../middleware/authMiddleware');
const { uploadEvidenceImages } = require('../../middleware/upload');

router.route('/')
  .post(protect, uploadEvidenceImages, createDispute);

router.get('/my', protect, getMyDisputes);

module.exports = router;
