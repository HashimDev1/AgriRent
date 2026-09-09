const express = require('express');
const router = express.Router();
const { getCategories } = require('../../controllers/admin/categoryController');

router.get('/', getCategories);

module.exports = router;
