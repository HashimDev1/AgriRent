const User = require('../../models/User');
const Equipment = require('../../models/Equipment');
const Booking = require('../../models/Booking');
const Dispute = require('../../models/Dispute');
const Payment = require('../../models/Payment');
const Notification = require('../../models/Notification');

// @desc    Get admin dashboard metrics & aggregate analysis
// @route   GET /api/admin/dashboard
// @access  Private (Admin only)
const getAdminDashboard = async (req, res) => {
  try {
    const totalFarmers = await User.countDocuments({ role: 'farmer' });
    const totalOwners = await User.countDocuments({ role: 'owner' });
    const totalEquipment = await Equipment.countDocuments();
    const pendingEquipment = await Equipment.countDocuments({ status: 'pending_verification' });
    const totalBookings = await Booking.countDocuments();
    const openDisputes = await Dispute.countDocuments({ status: 'open' });

    // Most rented categories
    const mostRentedCategories = await Booking.aggregate([
      {
        $lookup: {
          from: 'equipments',
          localField: 'equipmentId',
          foreignField: '_id',
          as: 'equipment',
        },
      },
      { $unwind: '$equipment' },
      {
        $group: {
          _id: '$equipment.category',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    // Monthly revenue aggregation
    const monthlyRevenue = await Payment.aggregate([
      { $match: { paymentStatus: 'paid' } },
      {
        $group: {
          _id: {
            year: { $year: '$paidAt' },
            month: { $month: '$paidAt' },
          },
          total: { $sum: '$amount' },
        },
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
    ]);

    // Booking status counts
    const bookingStatusCounts = await Booking.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    res.json({
      metrics: {
        totalFarmers,
        totalOwners,
        totalEquipment,
        pendingEquipment,
        totalBookings,
        openDisputes,
      },
      mostRentedCategories,
      monthlyRevenue,
      bookingStatusCounts,
    });
  } catch (error) {
    console.error('Admin Dashboard Error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    List all system users
// @route   GET /api/admin/users
// @access  Private (Admin only)
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ role: { $ne: 'admin' } })
      .select('-passwordHash')
      .sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Verify owner/farmer credentials (CNIC verification)
// @route   PUT /api/admin/users/:id/verify
// @access  Private (Admin only)
const verifyUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.isVerified = !user.isVerified; // toggle verification status
    const updatedUser = await user.save();

    // Notify user
    await Notification.create({
      userId: user._id,
      title: user.isVerified ? 'Account Verified' : 'Verification Revoked',
      message: user.isVerified
        ? 'Congratulations! Your account has been verified by the administrator.'
        : 'Your account verification status has been suspended. Please contact support.',
      type: 'system',
    });

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      isVerified: updatedUser.isVerified,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Block / Unblock a user
// @route   PUT /api/admin/users/:id/block
// @access  Private (Admin only)
const blockUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.isBlocked = !user.isBlocked; // toggle blocked status
    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      isBlocked: updatedUser.isBlocked,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    List equipment pending verification
// @route   GET /api/admin/equipment/pending
// @access  Private (Admin only)
const getPendingEquipment = async (req, res) => {
  try {
    const equipment = await Equipment.find({ status: 'pending_verification' })
      .populate('ownerId', 'name email phone')
      .sort({ createdAt: -1 });
    res.json(equipment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Approve equipment listing
// @route   PUT /api/admin/equipment/:id/approve
// @access  Private (Admin only)
const approveEquipment = async (req, res) => {
  try {
    const equipment = await Equipment.findById(req.params.id);

    if (!equipment) {
      return res.status(404).json({ message: 'Equipment listing not found' });
    }

    equipment.status = 'approved';
    const updatedEquipment = await equipment.save();

    // Notify owner
    await Notification.create({
      userId: equipment.ownerId,
      title: 'Equipment Listing Approved',
      message: `Your equipment listing: "${equipment.title}" has been approved and is now active for renting.`,
      type: 'system',
      relatedEntityId: equipment._id,
    });

    res.json(updatedEquipment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Reject equipment listing
// @route   PUT /api/admin/equipment/:id/reject
// @access  Private (Admin only)
const rejectEquipment = async (req, res) => {
  try {
    const { message } = req.body;
    const equipment = await Equipment.findById(req.params.id);

    if (!equipment) {
      return res.status(404).json({ message: 'Equipment listing not found' });
    }

    equipment.status = 'rejected';
    const updatedEquipment = await equipment.save();

    // Notify owner
    await Notification.create({
      userId: equipment.ownerId,
      title: 'Equipment Listing Rejected',
      message: `Your equipment listing: "${equipment.title}" was rejected by admin. Reason: ${message || 'Requirements unmet.'}`,
      type: 'system',
      relatedEntityId: equipment._id,
    });

    res.json(updatedEquipment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all disputes (Admin list)
// @route   GET /api/admin/disputes
// @access  Private (Admin only)
const getAdminDisputes = async (req, res) => {
  try {
    const disputes = await Dispute.find()
      .populate('bookingId')
      .populate('equipmentId')
      .populate('createdBy', 'name email phone role')
      .populate('againstUserId', 'name email phone role')
      .sort({ createdAt: -1 });

    res.json(disputes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Resolve a dispute with remarks
// @route   PUT /api/admin/disputes/:id/resolve
// @access  Private (Admin only)
const resolveDispute = async (req, res) => {
  try {
    const { adminRemarks, status } = req.body; // status: 'resolved' or 'rejected'
    const dispute = await Dispute.findById(req.params.id).populate('bookingId');

    if (!dispute) {
      return res.status(404).json({ message: 'Dispute record not found' });
    }

    dispute.status = status || 'resolved';
    dispute.adminRemarks = adminRemarks || 'Resolved by Administrator.';
    dispute.resolvedBy = req.user.id;
    dispute.resolvedAt = new Date();

    const updatedDispute = await dispute.save();

    // Revert booking status back to completed or resolved based on action
    if (dispute.bookingId) {
      const booking = await Booking.findById(dispute.bookingId._id);
      if (booking) {
        booking.status = 'completed'; // clear dispute status on booking
        await booking.save();
      }
    }

    // Notify creator
    await Notification.create({
      userId: dispute.createdBy,
      title: 'Dispute Resolved',
      message: `Your dispute regarding booking #${dispute.bookingId._id} has been marked as ${dispute.status} by Admin.`,
      type: 'dispute_update',
      relatedEntityId: dispute._id,
    });

    // Notify counterparty
    await Notification.create({
      userId: dispute.againstUserId,
      title: 'Dispute Resolved',
      message: `The dispute regarding booking #${dispute.bookingId._id} has been marked as ${dispute.status} by Admin.`,
      type: 'dispute_update',
      relatedEntityId: dispute._id,
    });

    res.json(updatedDispute);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAdminDashboard,
  getAllUsers,
  verifyUser,
  blockUser,
  getPendingEquipment,
  approveEquipment,
  rejectEquipment,
  getAdminDisputes,
  resolveDispute,
};
