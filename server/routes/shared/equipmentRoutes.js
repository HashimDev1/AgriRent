const express = require('express');
const router = express.Router();
const {
  getAllEquipment,
  searchEquipment,
  getEquipmentById,
} = require('../../controllers/shared/equipmentController');

router.get('/search', searchEquipment);

router.route('/')
  .get(getAllEquipment);

router.route('/:id')
  .get(getEquipmentById);

module.exports = router;
