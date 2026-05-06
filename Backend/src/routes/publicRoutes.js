const express = require('express');
const router = express.Router();
const { getPublicSetup, getPublicSettings } = require('../controllers/superAdminController');
const { getPublicAnnouncements } = require('../controllers/announcementController');

// Publicly accessible data
router.get('/setup', getPublicSetup);
router.get('/settings', getPublicSettings);
router.get('/announcements', getPublicAnnouncements);

module.exports = router;
