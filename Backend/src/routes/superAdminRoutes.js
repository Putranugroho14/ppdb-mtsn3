const express = require('express');
const router = express.Router();
const { 
  getUsers, 
  createUser, 
  updateUser, 
  deleteUser,
  getSettings,
  updateSettings,
  getStatistics,
  exportApplicants,
  exportApplicantsPDF,
  resetSystem,
  backupSystem,
  getSetups,
  createSetup,
  updateSetup,
  deleteSetup,
  activateSetup,
  updatePendaftar
} = require('../controllers/superAdminController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/statistics', (req, res, next) => {
  if (req.user.role === 'admin' || req.user.role === 'superadmin') {
    return getStatistics(req, res);
  }
  return res.status(403).json({ message: 'Akses ditolak' });
});

// Routes accessible by admin & superadmin
router.get('/export', exportApplicants);
router.get('/export-pdf', exportApplicantsPDF);

router.get('/settings', getSettings);
router.post('/settings', updateSettings);
router.get('/setups', getSetups);
router.post('/setups', createSetup);
router.put('/setups/:id', updateSetup);
router.delete('/setups/:id', deleteSetup);
router.put('/setups/:id/activate', activateSetup);

// Routes restricted to superadmin only
router.use(authorize('superadmin'));

router.get('/users', getUsers);
router.post('/users', createUser);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

router.put('/pendaftar/:id', updatePendaftar);
router.post('/reset', resetSystem);
router.get('/backup', backupSystem);

module.exports = router;
