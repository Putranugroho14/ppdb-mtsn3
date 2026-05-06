const express = require('express');
const router = express.Router();
const { 
  getAnnouncements, 
  getAnnouncementById, 
  createAnnouncement, 
  updateAnnouncement, 
  deleteAnnouncement 
} = require('../controllers/announcementController');
const { protect, authorize } = require('../middleware/authMiddleware');

// All routes here require login and admin/superadmin role
router.use(protect);
router.use(authorize('superadmin'));

router.get('/', getAnnouncements);
router.get('/:id', getAnnouncementById);
router.post('/', createAnnouncement);
router.put('/:id', updateAnnouncement);
router.delete('/:id', deleteAnnouncement);

module.exports = router;
