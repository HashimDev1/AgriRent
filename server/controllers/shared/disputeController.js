const Dispute = require('../../models/Dispute');
const Booking = require('../../models/Booking');
const Notification = require('../../models/Notification');

// @desc    Lodge a new dispute
// @route   POST /api/disputes
// @access  Private
const createDispute = async (req, res) => {
  try {
    const { bookingId, reason, description, evidenceImages } = req.body;

    if (!bookingId || !reason || !description) {
      return res.status(400).json({ message: 'Booking ID, reason, and description are required' });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Determine the counterparty user ID
    let againstUserId;
    if (booking.renterId.toString() === req.user.id) {
      againstUserId = booking.ownerId;
    } else if (booking.ownerId.toString() === req.user.id) {
      againstUserId = booking.renterId;
    } else {
      return res.status(403).json({ message: 'You are not a participant in this booking' });
    }

    const dispute = new Dispute({
      bookingId,
      equipmentId: booking.equipmentId,
      createdBy: req.user.id,
      againstUserId,
      reason,
      description,
      evidenceImages: Array.isArray(evidenceImages) ? evidenceImages : (evidenceImages ? [evidenceImages] : []),
      status: 'open',
    });

    const savedDispute = await dispute.save();

    // Mark the booking status as disputed
    booking.status = 'disputed';
    await booking.save();

    // Notify the other user
    await Notification.create({
      userId: againstUserId,
      title: 'Dispute Filed',
      message: `${req.user.name} has filed a dispute regarding booking #${booking._id}. Status: Under Admin Review.`,
      type: 'dispute_update',
      relatedEntityId: savedDispute._id,
    });

    res.status(201).json(savedDispute);
  } catch (error) {
    console.error('Create Dispute Error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user's logged disputes (Created by or against them)
// @route   GET /api/disputes/my
// @access  Private
const getMyDisputes = async (req, res) => {
  try {
    const disputes = await Dispute.find({
      $or: [{ createdBy: req.user.id }, { againstUserId: req.user.id }],
    })
      .populate('bookingId')
      .populate('equipmentId')
      .populate('createdBy', 'name email role')
      .populate('againstUserId', 'name email role')
      .sort({ createdAt: -1 });

    res.json(disputes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all disputes (Admin only)
// @route   GET /api/disputes/admin
// @access  Private (Admin only)
const getAllDisputesAdmin = async (req, res) => {
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

// @desc    Update dispute status (Admin/Staff only)
// @route   PUT /api/disputes/:id/status
// @access  Private (Admin only)
const updateDisputeStatus = async (req, res) => {
  try {
    const { status, adminRemarks } = req.body;
    const dispute = await Dispute.findById(req.params.id);

    if (!dispute) {
      return res.status(404).json({ message: 'Dispute record not found' });
    }

    dispute.status = status || dispute.status;
    dispute.adminRemarks = adminRemarks || dispute.adminRemarks;

    if (status === 'resolved' || status === 'rejected') {
      dispute.resolvedBy = req.user.id;
      dispute.resolvedAt = new Date();
    }

    const updatedDispute = await dispute.save();

    // Notify creator
    await Notification.create({
      userId: dispute.createdBy,
      title: 'Dispute Status Updated',
      message: `Your filed dispute #${dispute._id} status is now: ${dispute.status}. Remarks: ${dispute.adminRemarks}`,
      type: 'dispute_update',
      relatedEntityId: dispute._id,
    });

    // Notify counterparty
    await Notification.create({
      userId: dispute.againstUserId,
      title: 'Dispute Status Updated',
      message: `Dispute #${dispute._id} filed against you has been updated to: ${dispute.status}. Remarks: ${dispute.adminRemarks}`,
      type: 'dispute_update',
      relatedEntityId: dispute._id,
    });

    res.json(updatedDispute);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createDispute,
  getMyDisputes,
  getAllDisputesAdmin,
  updateDisputeStatus,
};
