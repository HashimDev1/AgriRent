const express = require('express');
const router = express.Router();
const {
  getAdminDashboard,
  getAllUsers,
  verifyUser,
  blockUser,
  getPendingEquipment,
  approveEquipment,
  rejectEquipment,
  getAdminDisputes,
  resolveDispute,
} = require('../../controllers/admin/adminController');
const { protect } = require('../../middleware/authMiddleware');
const { authorize } = require('../../middleware/roleMiddleware');

// All admin routes are protected by admin authorization
router.use(protect);
router.use(authorize('admin'));

router.get('/dashboard', getAdminDashboard);
router.get('/users', getAllUsers);
router.put('/users/:id/verify', verifyUser);
router.put('/users/:id/block', blockUser);
router.get('/equipment/pending', getPendingEquipment);
router.put('/equipment/:id/approve', approveEquipment);
router.put('/equipment/:id/reject', rejectEquipment);
router.get('/disputes', getAdminDisputes);
router.put('/disputes/:id/resolve', resolveDispute);

module.exports = router;
