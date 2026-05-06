const express = require('express');
const router = express.Router();
const { 
  getAllApplicants, 
  verifyDocument, 
  updateRegistrationStatus, 
  inputScore,
  addApplicant,
  deleteApplicant,
  toggleLock,
  resetPasswordPendaftar,
  verifyEmis
} = require('../controllers/adminController');
const { generateBuktiPendaftaran, generateBuktiDaftarUlang, generateKartuPeserta } = require('../controllers/pdfController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);
router.use(authorize('admin', 'superadmin'));

router.get('/applicants', getAllApplicants);
router.post('/verify-document', verifyDocument);
router.post('/update-status', updateRegistrationStatus);
router.post('/input-score', inputScore);
router.post('/add-applicant', addApplicant);
router.post('/toggle-lock', toggleLock);
router.post('/reset-password-pendaftar', resetPasswordPendaftar);
router.post('/verify-emis', verifyEmis);
router.delete('/applicant/:id', deleteApplicant);
router.get('/print-bukti-v3/:id', generateBuktiPendaftaran);
router.get('/print-form-emis/:id', generateBuktiDaftarUlang);
router.get('/print-kartu-peserta/:id', generateKartuPeserta);

module.exports = router;
