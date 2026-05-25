const express = require('express');
const router = express.Router();
const { getEquipmentReviews } = require('../../controllers/shared/reviewController');

router.get('/equipment/:equipmentId', getEquipmentReviews);

module.exports = router;
