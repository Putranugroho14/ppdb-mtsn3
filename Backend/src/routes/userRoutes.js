const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { getProfile, createOrUpdateProfile, uploadDocument, submitDaftarUlang } = require('../controllers/userController');
const { generateBuktiPendaftaran, generateBuktiDaftarUlang, generateKartuPeserta } = require('../controllers/pdfController');
const { protect } = require('../middleware/authMiddleware');

const cloudinary = require('../config/cloudinary');

const storage = multer.memoryStorage();

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|pdf/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only images and PDFs are allowed!'));
  }
});

router.get('/debug-cloudinary', async (req, res) => {
  const cloudinary = require('../config/cloudinary');
  const cfg = cloudinary.config();
  res.json({
    cloud_name: cfg.cloud_name || '❌ MISSING',
    api_key: cfg.api_key ? `✅ ${String(cfg.api_key).slice(0,6)}...` : '❌ MISSING',
    api_secret: cfg.api_secret ? '✅ SET' : '❌ MISSING',
    cloudinary_url_env: process.env.CLOUDINARY_URL ? '✅ SET' : '❌ NOT SET',
    node_env: process.env.NODE_ENV,
  });
});

router.use(protect);

router.get('/profile', getProfile);
router.post('/profile', createOrUpdateProfile);
router.post('/upload', upload.single('document'), uploadDocument);
router.get('/print-bukti-v3/:id', generateBuktiPendaftaran);
router.get('/print-form-emis/:id', generateBuktiDaftarUlang);
router.get('/print-kartu-peserta/:id', generateKartuPeserta);
router.post('/daftar-ulang', submitDaftarUlang);

module.exports = router;
