const Review = require('../../models/Review');

// @desc    Get reviews for specific equipment
// @route   GET /api/reviews/equipment/:equipmentId
// @access  Public
const getEquipmentReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ equipmentId: req.params.equipmentId })
      .populate('reviewerId', 'name profileImage')
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getEquipmentReviews,
};
