const User = require('../../models/User');
const bcrypt = require('bcryptjs');
const { uploadStream, deleteFromCloudinary } = require('../../config/cloudinary');

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-passwordHash');
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (user) {
      user.name = req.body.name || user.name;
      user.phone = req.body.phone || user.phone;
      // Handle profileImage upload
      if (req.files && req.files.profileImage && req.files.profileImage[0]) {
        const file = req.files.profileImage[0];
        const uploadedProfile = await uploadStream(file.buffer, 'agrirent/profile');
        if (user.profileImage && typeof user.profileImage === 'object' && user.profileImage.public_id) {
          await deleteFromCloudinary(user.profileImage.public_id);
        }
        user.profileImage = uploadedProfile;
      } else {
        user.profileImage = req.body.profileImage !== undefined ? req.body.profileImage : user.profileImage;
      }
      user.cnicNumber = req.body.cnicNumber || user.cnicNumber;
      user.address = req.body.address || user.address;

      if (req.body.longitude !== undefined && req.body.latitude !== undefined) {
        const lng = parseFloat(req.body.longitude);
        const lat = parseFloat(req.body.latitude);
        if (!isNaN(lng) && !isNaN(lat)) {
          user.location = {
            type: 'Point',
            coordinates: [lng, lat],
          };
        }
      }

      if (req.body.password) {
        const salt = await bcrypt.genSalt(10);
        user.passwordHash = await bcrypt.hash(req.body.password, salt);
      }

      // Handle cnicFrontImage upload
      if (req.files && req.files.cnicFrontImage && req.files.cnicFrontImage[0]) {
        const file = req.files.cnicFrontImage[0];
        const uploadedFront = await uploadStream(file.buffer, 'agrirent/cnic');
        if (user.cnicFrontImage && user.cnicFrontImage.public_id) {
          await deleteFromCloudinary(user.cnicFrontImage.public_id);
        }
        user.cnicFrontImage = uploadedFront;
      }

      // Handle cnicBackImage upload
      if (req.files && req.files.cnicBackImage && req.files.cnicBackImage[0]) {
        const file = req.files.cnicBackImage[0];
        const uploadedBack = await uploadStream(file.buffer, 'agrirent/cnic');
        if (user.cnicBackImage && user.cnicBackImage.public_id) {
          await deleteFromCloudinary(user.cnicBackImage.public_id);
        }
        user.cnicBackImage = uploadedBack;
      }

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        role: updatedUser.role,
        profileImage: updatedUser.profileImage,
        cnicNumber: updatedUser.cnicNumber,
        cnicFrontImage: updatedUser.cnicFrontImage,
        cnicBackImage: updatedUser.cnicBackImage,
        address: updatedUser.address,
        location: updatedUser.location,
        isVerified: updatedUser.isVerified,
        isBlocked: updatedUser.isBlocked,
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error('Update User Profile Error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-passwordHash');
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getUserProfile,
  updateUserProfile,
  getUserById,
};
