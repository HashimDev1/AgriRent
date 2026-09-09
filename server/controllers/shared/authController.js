const bcrypt = require('bcryptjs');
const User = require('../../models/User');
const generateToken = require('../../utils/generateToken');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { name, email, password, phone, role, cnicNumber, address, longitude, latitude } = req.body;

    if (!name || !email || !password || !phone) {
      return res.status(400).json({ message: 'Please provide name, email, password, and phone number' });
    }

    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Prepare location coordinates
    const coordinates = [
      longitude ? parseFloat(longitude) : 0.0,
      latitude ? parseFloat(latitude) : 0.0
    ];

    // Create user
    const user = await User.create({
      name,
      email,
      passwordHash,
      phone,
      role: role || 'farmer',
      cnicNumber: cnicNumber || '',
      address: address || '',
      location: {
        type: 'Point',
        coordinates
      },
      isVerified: role === 'admin' ? true : false, // Admins auto-verified
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        profileImage: user.profileImage,
        cnicNumber: user.cnicNumber,
        cnicFrontImage: user.cnicFrontImage,
        cnicBackImage: user.cnicBackImage,
        address: user.address,
        location: user.location,
        isVerified: user.isVerified,
        isBlocked: user.isBlocked,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data provided' });
    }
  } catch (error) {
    console.error('Registration Error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please fill in all credentials' });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (user.isBlocked) {
      return res.status(403).json({ message: 'Your account has been blocked. Contact admin support.' });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.passwordHash);

    if (isMatch) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        profileImage: user.profileImage,
        cnicNumber: user.cnicNumber,
        cnicFrontImage: user.cnicFrontImage,
        cnicBackImage: user.cnicBackImage,
        address: user.address,
        location: user.location,
        isVerified: user.isVerified,
        isBlocked: user.isBlocked,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get current user profile session
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-passwordHash');
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'User session not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Reset password for forgotten credentials
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
  try {
    const { email, phone, newPassword } = req.body;

    if (!email || !phone || !newPassword) {
      return res.status(400).json({ message: 'Please provide email, phone, and new password' });
    }

    const user = await User.findOne({ email, phone });

    if (!user) {
      return res.status(404).json({ message: 'User not found with matching email and phone number' });
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({ message: 'Password reset successfully. You can now login.' });
  } catch (error) {
    console.error('Forgot Password Error:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getMe,
  forgotPassword,
};
