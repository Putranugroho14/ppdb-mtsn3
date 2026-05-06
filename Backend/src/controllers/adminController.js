const { Pendaftar, Berkas, User, HasilSeleksi, DaftarUlang } = require('../models');
const { logAction } = require('../utils/logger');
const bcrypt = require('bcryptjs');

const getAllApplicants = async (req, res) => {
  try {
    const applicants = await Pendaftar.findAll({
      include: [Berkas, HasilSeleksi, DaftarUlang]
    });
    console.log('Sample Applicant with DU:', applicants.find(a => a.DaftarUlang)?.name);
    res.json(applicants);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const verifyDocument = async (req, res) => {
  try {
    const { id, status } = req.body;
    const berkas = await Berkas.findByPk(id);
    if (!berkas) return res.status(404).json({ message: 'Document not found' });

    await berkas.update({ status });

    // LOG ACTION
    await logAction(req, 'VERIFY_DOCUMENT', 'Berkas', berkas.id, { type: berkas.type, status });

    res.json({ message: 'Document verification updated', berkas });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const { notifyStatusChange } = require('../config/notifications');

const updateRegistrationStatus = async (req, res) => {
  try {
    const { id, registrationStatus, verificationMessage } = req.body;
    const profile = await Pendaftar.findByPk(id);
    if (!profile) return res.status(404).json({ message: 'Applicant not found' });

    const oldStatus = profile.registrationStatus;

    const updateData = { registrationStatus };
    if (verificationMessage !== undefined) {
      updateData.verificationMessage = verificationMessage;
    }

    await profile.update(updateData);

    // LOG ACTION
    await logAction(req, 'UPDATE_STATUS', 'Pendaftar', profile.id, {
      oldStatus,
      newStatus: registrationStatus,
      message: verificationMessage
    });

    // Send notification if status changed
    if (oldStatus !== registrationStatus) {
      notifyStatusChange(profile, registrationStatus).catch(err =>
        console.error('Notification failed:', err)
      );
    }

    res.json({ message: 'Registration status updated', profile });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const inputScore = async (req, res) => {
  try {
    console.log('--- INPUT SCORE REQUEST ---');
    console.log('Body:', req.body);

    // Ambil data (mendukung berbagai nama kolom dari frontend)
    const pendaftarId = req.body.pendaftarId || req.body.id;
    const averageScore = req.body.averageScore || req.body.selectionScore || req.body.score;
    const notes = req.body.notes || '';

    console.log('Parsed Data:', { pendaftarId, averageScore, notes });

    if (!pendaftarId) {
      console.log('❌ Error: Pendaftar ID tidak ditemukan di body request');
      return res.status(400).json({ message: 'Pendaftar ID is required' });
    }

    let result = await HasilSeleksi.findOne({ where: { pendaftarId } });
    if (result) {
      console.log('Updating existing score for:', pendaftarId);
      await result.update({ averageScore, notes });
    } else {
      console.log('Creating new score for:', pendaftarId);
      result = await HasilSeleksi.create({ pendaftarId, averageScore, notes });
    }

    res.json({ message: 'Score updated successfully', result });

    // LOG ACTION
    await logAction(req, 'INPUT_SCORE', 'HasilSeleksi', result.id, { pendaftarId, averageScore });
    console.log('✅ Success: Score saved and logged');
  } catch (error) {
    console.error('❌ Error in inputScore:', error);
    res.status(500).json({ message: 'Input score failed: ' + error.message });
  }
};

const addApplicant = async (req, res) => {
  try {
    const data = req.body;
    
    // 1. Basic Validation
    if (!data.nik || !data.name || !data.birthDate) {
      return res.status(400).json({ message: 'NIK, Nama, dan Tanggal Lahir wajib diisi.' });
    }

    // Check if NIK already exists
    const existingNik = await Pendaftar.findOne({ where: { nik: data.nik } });
    if (existingNik) {
      return res.status(400).json({ message: 'NIK sudah terdaftar dalam sistem.' });
    }

    // 2. Auto generate registration number if not provided
    if (!data.registrationNumber) {
      const count = await Pendaftar.count();
      const yearSuffix = new Date().getFullYear().toString().slice(-2);
      data.registrationNumber = `30112343-${yearSuffix}-${101 + count}`;
    }

    // 3. Generate Default Password (DDMMYYYY from birthDate)
    const birthDate = new Date(data.birthDate);
    if (isNaN(birthDate.getTime())) {
      return res.status(400).json({ message: 'Format Tanggal Lahir tidak valid.' });
    }
    const day = String(birthDate.getDate()).padStart(2, '0');
    const month = String(birthDate.getMonth() + 1).padStart(2, '0');
    const year = birthDate.getFullYear();
    const defaultPassword = `${day}${month}${year}`;

    const salt = await bcrypt.genSalt(10);
    data.password = await bcrypt.hash(defaultPassword, salt);
    data.password_plain = defaultPassword;

    const applicant = await Pendaftar.create(data);
    
    // LOG ACTION
    await logAction(req, 'ADD_APPLICANT_MANUAL', 'Pendaftar', applicant.id, { name: data.name });

    res.json({ message: 'Applicant added successfully', applicant });
  } catch (error) {
    console.error('Add Applicant Error:', error);
    res.status(500).json({ message: error.message });
  }
};

const deleteApplicant = async (req, res) => {
  try {
    const { id } = req.params;
    const applicant = await Pendaftar.findByPk(id);
    if (!applicant) return res.status(404).json({ message: 'Applicant not found' });

    await applicant.destroy();

    // LOG ACTION
    await logAction(req, 'DELETE_APPLICANT', 'Pendaftar', id, { name: applicant.name });

    res.json({ message: 'Applicant deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const toggleLock = async (req, res) => {
  try {
    const { id } = req.body;
    const applicant = await Pendaftar.findByPk(id);
    if (!applicant) return res.status(404).json({ message: 'Applicant not found' });

    const newLockStatus = !applicant.isLocked;
    await applicant.update({ isLocked: newLockStatus });

    // LOG ACTION
    await logAction(req, 'TOGGLE_LOCK', 'Pendaftar', id, { isLocked: newLockStatus });

    res.json({ message: `Data ${newLockStatus ? 'dikunci' : 'dibuka'}`, applicant });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const resetPasswordPendaftar = async (req, res) => {
  try {
    const { id } = req.body;
    const applicant = await Pendaftar.findByPk(id);
    if (!applicant) return res.status(404).json({ message: 'Pendaftar not found' });

    // Format birthDate to DDMMYYYY for default password
    const birthDate = new Date(applicant.birthDate);
    const day = String(birthDate.getDate()).padStart(2, '0');
    const month = String(birthDate.getMonth() + 1).padStart(2, '0');
    const year = birthDate.getFullYear();
    const defaultPassword = `${day}${month}${year}`;

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(defaultPassword, salt);

    await applicant.update({
      password: hashedPassword,
      password_plain: defaultPassword
    });

    await logAction(req, 'RESET_PASSWORD_PENDAFTAR', 'Pendaftar', id, { name: applicant.name });

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const verifyEmis = async (req, res) => {
  try {
    const { pendaftarId } = req.body;
    const du = await DaftarUlang.findOne({ where: { pendaftarId } });
    if (!du) return res.status(404).json({ message: 'Data e-MIS not found' });

    await du.update({ statusDaftarUlang: 'verified' });

    await logAction(req, 'VERIFY_EMIS', 'DaftarUlang', du.id, { pendaftarId });

    res.json({ message: 'Data e-MIS verified' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllApplicants,
  verifyDocument,
  updateRegistrationStatus,
  inputScore,
  addApplicant,
  deleteApplicant,
  toggleLock,
  resetPasswordPendaftar,
  verifyEmis
};
