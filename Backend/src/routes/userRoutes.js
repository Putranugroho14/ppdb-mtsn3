const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { getProfile, createOrUpdateProfile, uploadDocument, submitDaftarUlang } = require('../controllers/userController');
const { generateBuktiPendaftaran, generateBuktiDaftarUlang, generateKartuPeserta } = require('../controllers/pdfController');
const { protect } = require('../middleware/authMiddleware');

const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;

if (process.env.CLOUDINARY_URL) {
  // Automatically uses CLOUDINARY_URL from env
} else {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
}

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'ppdb_uploads',
    resource_type: 'auto', // Allow images and PDFs
  },
});

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

router.use(protect);

router.get('/profile', getProfile);
router.post('/profile', createOrUpdateProfile);
router.post('/upload', upload.single('document'), uploadDocument);
router.get('/print-bukti-v3/:id', generateBuktiPendaftaran);
router.get('/print-form-emis/:id', generateBuktiDaftarUlang);
router.get('/print-kartu-peserta/:id', generateKartuPeserta);
router.post('/daftar-ulang', submitDaftarUlang);

module.exports = router;
