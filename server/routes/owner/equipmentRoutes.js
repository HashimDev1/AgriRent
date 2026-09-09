const express = require('express');
const router = express.Router();
const {
  createEquipment,
  updateEquipment,
  deleteEquipment,
  getMyEquipment,
} = require('../../controllers/owner/equipmentController');
const { protect } = require('../../middleware/authMiddleware');
const { authorize } = require('../../middleware/roleMiddleware');
const { uploadEquipmentImages } = require('../../middleware/upload');

router.route('/')
  .post(protect, authorize('owner'), uploadEquipmentImages, createEquipment);

router.get('/owner/my-equipment', protect, authorize('owner'), getMyEquipment);

router.route('/:id')
  .put(protect, authorize('owner', 'admin'), uploadEquipmentImages, updateEquipment)
  .delete(protect, authorize('owner', 'admin'), deleteEquipment);

module.exports = router;
