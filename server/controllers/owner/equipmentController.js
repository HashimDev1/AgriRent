const Equipment = require('../../models/Equipment');
const { uploadStream, deleteFromCloudinary } = require('../../config/cloudinary');

// @desc    Create new equipment listing
// @route   POST /api/equipment
// @access  Private (Owner only)
const createEquipment = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      brand,
      model,
      rentPerDay,
      securityDeposit,
      longitude,
      latitude,
      address,
      city,
      startDate,
      endDate,
    } = req.body;

    if (!title || !description || !category || !rentPerDay) {
      return res.status(400).json({ message: 'Title, description, category, and daily rent are required fields' });
    }

    const coordinates = [
      longitude ? parseFloat(longitude) : 73.0844, // Default coordinates if none provided
      latitude ? parseFloat(latitude) : 33.6844,
    ];

    // Handle existing images
    let bodyImages = [];
    if (req.body.images) {
      try {
        bodyImages = typeof req.body.images === 'string'
          ? JSON.parse(req.body.images)
          : req.body.images;
      } catch (err) {
        bodyImages = Array.isArray(req.body.images) ? req.body.images : [req.body.images];
      }
    }
    if (!Array.isArray(bodyImages)) {
      bodyImages = [bodyImages];
    }
    bodyImages = bodyImages.filter(img => img);

    // Upload new files to Cloudinary
    let uploadedImages = [];
    if (req.files && req.files.length > 0) {
      const uploadPromises = req.files.map(file => uploadStream(file.buffer, 'agrirent/equipment'));
      uploadedImages = await Promise.all(uploadPromises);
    }

    const finalImages = [...bodyImages, ...uploadedImages];
    const imagesToSave = finalImages.length > 0 ? finalImages : ['https://res.cloudinary.com/hashim055/image/upload/v1781209752/agrirent/equipment/qoio5kqeuxzh9ey0ybtw.jpg'];

    const equipment = new Equipment({
      ownerId: req.user.id,
      title,
      description,
      category,
      brand: brand || '',
      model: model || '',
      rentPerDay: parseFloat(rentPerDay),
      securityDeposit: securityDeposit ? parseFloat(securityDeposit) : 0,
      images: imagesToSave,
      location: {
        type: 'Point',
        coordinates,
        address: address || '',
        city: city || '',
      },
      availability: {
        startDate: startDate ? new Date(startDate) : new Date(),
        endDate: endDate ? new Date(endDate) : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      },
      status: 'pending_verification', // Requires admin verification
      isAvailable: true,
    });

    const savedEquipment = await equipment.save();
    res.status(201).json(savedEquipment);
  } catch (error) {
    console.error('Create Equipment Error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update equipment listing
// @route   PUT /api/equipment/:id
// @access  Private (Owner only)
const updateEquipment = async (req, res) => {
  try {
    console.log('--- UPDATE EQUIPMENT DEBUG ---');
    console.log('req.body:', req.body);
    console.log('req.files:', req.files);
    console.log('------------------------------');

    const {
      title,
      description,
      category,
      brand,
      model,
      rentPerDay,
      securityDeposit,
      longitude,
      latitude,
      address,
      city,
      startDate,
      endDate,
      isAvailable,
    } = req.body;

    const equipment = await Equipment.findById(req.params.id);

    if (!equipment) {
      return res.status(404).json({ message: 'Equipment listing not found' });
    }

    // Authorization: Must be owner
    if (equipment.ownerId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this listing' });
    }

    // Parse images to keep
    let keepImages = [];
    if (req.body.images !== undefined) {
      try {
        keepImages = typeof req.body.images === 'string'
          ? JSON.parse(req.body.images)
          : req.body.images;
      } catch (err) {
        keepImages = Array.isArray(req.body.images) ? req.body.images : [req.body.images];
      }
      if (!Array.isArray(keepImages)) {
        keepImages = [keepImages];
      }
      keepImages = keepImages.filter(img => img);
    } else {
      keepImages = equipment.images || [];
    }

    // Identify deleted images to remove from Cloudinary
    const oldImages = equipment.images || [];
    const deletedImages = oldImages.filter(oldImg => {
      if (typeof oldImg === 'object' && oldImg && oldImg.public_id) {
        const stillExists = keepImages.some(keepImg =>
          typeof keepImg === 'object' && keepImg && keepImg.public_id === oldImg.public_id
        );
        return !stillExists;
      }
      return false;
    });

    // Delete removed images from Cloudinary
    for (const delImg of deletedImages) {
      if (delImg.public_id) {
        await deleteFromCloudinary(delImg.public_id);
      }
    }

    // Upload new files
    let uploadedImages = [];
    if (req.files && req.files.length > 0) {
      const uploadPromises = req.files.map(file => uploadStream(file.buffer, 'agrirent/equipment'));
      uploadedImages = await Promise.all(uploadPromises);
    }

    equipment.title = title || equipment.title;
    equipment.description = description || equipment.description;
    equipment.category = category || equipment.category;
    equipment.brand = brand !== undefined ? brand : equipment.brand;
    equipment.model = model !== undefined ? model : equipment.model;
    equipment.rentPerDay = rentPerDay !== undefined ? parseFloat(rentPerDay) : equipment.rentPerDay;
    equipment.securityDeposit = securityDeposit !== undefined ? parseFloat(securityDeposit) : equipment.securityDeposit;
    equipment.images = [...keepImages, ...uploadedImages];
    equipment.isAvailable = isAvailable !== undefined ? isAvailable : equipment.isAvailable;

    if (longitude !== undefined && latitude !== undefined) {
      const lng = parseFloat(longitude);
      const lat = parseFloat(latitude);
      if (!isNaN(lng) && !isNaN(lat)) {
        equipment.location.coordinates = [lng, lat];
      }
    }
    equipment.location.address = address || equipment.location.address;
    equipment.location.city = city || equipment.location.city;

    if (startDate) equipment.availability.startDate = new Date(startDate);
    if (endDate) equipment.availability.endDate = new Date(endDate);

    // If edited by owner, it returns to pending_verification unless they are admin
    if (req.user.role !== 'admin') {
      equipment.status = 'pending_verification';
    }

    const updatedEquipment = await equipment.save();
    res.json(updatedEquipment);
  } catch (error) {
    console.error('Update Equipment Error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete equipment listing
// @route   DELETE /api/equipment/:id
// @access  Private (Owner/Admin only)
const deleteEquipment = async (req, res) => {
  try {
    const equipment = await Equipment.findById(req.params.id);

    if (!equipment) {
      return res.status(404).json({ message: 'Equipment listing not found' });
    }

    // Authorization: Must be owner or admin
    if (equipment.ownerId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this listing' });
    }

    // Delete associated Cloudinary images
    if (equipment.images && equipment.images.length > 0) {
      for (const img of equipment.images) {
        if (typeof img === 'object' && img && img.public_id) {
          await deleteFromCloudinary(img.public_id);
        }
      }
    }

    await Equipment.deleteOne({ _id: req.params.id });
    res.json({ message: 'Equipment listing removed successfully' });
  } catch (error) {
    console.error('Delete Equipment Error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get owner's own equipment listings
// @route   GET /api/equipment/owner/my-equipment
// @access  Private (Owner only)
const getMyEquipment = async (req, res) => {
  try {
    const equipment = await Equipment.find({ ownerId: req.user.id }).sort({ createdAt: -1 });
    res.json(equipment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createEquipment,
  updateEquipment,
  deleteEquipment,
  getMyEquipment,
};
