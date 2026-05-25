const Equipment = require('../../models/Equipment');

// @desc    Get all approved equipment (Public)
// @route   GET /api/equipment
// @access  Public
const getAllEquipment = async (req, res) => {
  try {
    const equipment = await Equipment.find({ status: 'approved' })
      .populate('ownerId', 'name email phone')
      .sort({ createdAt: -1 });
    res.json(equipment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Search and filter equipment (Public with parameters)
// @route   GET /api/equipment/search
// @access  Public
const searchEquipment = async (req, res) => {
  try {
    const { category, city, minPrice, maxPrice, rating, keyword, longitude, latitude, maxDistance, sort } = req.query;

    let query = { status: 'approved' };

    // Geospatial search
    if (longitude && latitude) {
      const lng = parseFloat(longitude);
      const lat = parseFloat(latitude);
      const distance = parseFloat(maxDistance) || 50000; // default 50km
      query.location = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [lng, lat],
          },
          $maxDistance: distance,
        },
      };
    }

    if (category) {
      query.category = category;
    }

    if (city) {
      query['location.city'] = { $regex: city, $options: 'i' };
    }

    if (minPrice || maxPrice) {
      query.rentPerDay = {};
      if (minPrice) query.rentPerDay.$gte = Number(minPrice);
      if (maxPrice) query.rentPerDay.$lte = Number(maxPrice);
    }

    if (rating) {
      query.averageRating = { $gte: Number(rating) };
    }

    if (keyword) {
      query.$or = [
        { title: { $regex: keyword, $options: 'i' } },
        { description: { $regex: keyword, $options: 'i' } },
        { brand: { $regex: keyword, $options: 'i' } },
        { model: { $regex: keyword, $options: 'i' } },
      ];
    }

    let equipmentQuery = Equipment.find(query).populate('ownerId', 'name email phone');

    // Sorting logic
    if (sort) {
      if (sort === 'price_asc') {
        equipmentQuery = equipmentQuery.sort({ rentPerDay: 1 });
      } else if (sort === 'price_desc') {
        equipmentQuery = equipmentQuery.sort({ rentPerDay: -1 });
      } else if (sort === 'rating') {
        equipmentQuery = equipmentQuery.sort({ averageRating: -1 });
      } else if (sort === 'newest') {
        equipmentQuery = equipmentQuery.sort({ createdAt: -1 });
      }
    } else {
      equipmentQuery = equipmentQuery.sort({ createdAt: -1 });
    }

    const results = await equipmentQuery;
    res.json(results);
  } catch (error) {
    console.error('Search Equipment Error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get equipment by ID
// @route   GET /api/equipment/:id
// @access  Public
const getEquipmentById = async (req, res) => {
  try {
    const equipment = await Equipment.findById(req.params.id).populate('ownerId', 'name email phone isVerified profileImage');
    if (equipment) {
      res.json(equipment);
    } else {
      res.status(404).json({ message: 'Equipment listing not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllEquipment,
  searchEquipment,
  getEquipmentById,
};
