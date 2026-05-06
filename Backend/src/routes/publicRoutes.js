const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { getPublicSetup, getPublicSettings } = require('../controllers/superAdminController');
const { getPublicAnnouncements } = require('../controllers/announcementController');

// Publicly accessible data
router.get('/setup', getPublicSetup);
router.get('/settings', getPublicSettings);
router.get('/announcements', getPublicAnnouncements);

module.exports = router;
