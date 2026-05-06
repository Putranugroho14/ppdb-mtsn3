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

// TEMPORARY ROUTE TO SEED ADMIN AND PANITIA
router.get('/seed-admin', async (req, res) => {
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPasswordAdmin = await bcrypt.hash('admin123', salt);
    const hashedPasswordPanitia = await bcrypt.hash('panitia123', salt);

    await User.findOrCreate({
      where: { username: 'admin' },
      defaults: { name: 'Super Admin', password: hashedPasswordAdmin, role: 'superadmin' }
    });

    await User.findOrCreate({
      where: { username: 'panitia' },
      defaults: { name: 'Panitia PPDB', password: hashedPasswordPanitia, role: 'panitia' }
    });

    res.json({ message: 'BERHASIL! Akun Admin dan Panitia telah dibuat di Database TiDB.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
