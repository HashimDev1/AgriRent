const express = require('express');
const router = express.Router();
const { getUserProfile, updateUserProfile, getUserById } = require('../../controllers/shared/userController');
const { protect } = require('../../middleware/authMiddleware');
const { uploadCNICImages } = require('../../middleware/upload');

router.route('/profile')
  .get(protect, getUserProfile)
  .put(protect, uploadCNICImages, updateUserProfile);

router.get('/:id', protect, getUserById);

module.exports = router;
