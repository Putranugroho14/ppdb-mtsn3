const { Pendaftar, Berkas, User, DaftarUlang } = require('../models');
const cloudinary = require('../config/cloudinary');

const getProfile = async (req, res) => {
  try {
    const profile = await Pendaftar.findByPk(req.user.id, { 
      include: [Berkas, DaftarUlang]
    });
    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createOrUpdateProfile = async (req, res) => {
  try {
    const { nik, name, nisn, gender, birthPlace, birthDate, parentPhone } = req.body;

    // 1. Comprehensive Validation
    const errors = [];
    if (!nik || !name || !gender || !birthPlace || !birthDate || !parentPhone) {
      errors.push('Mohon lengkapi data wajib (NIK, Nama, Gender, Tempat/Tgl Lahir, No. HP)');
    }

    // NIK Validation (16 digits, numeric)
    if (nik && (nik.length !== 16 || !/^\d+$/.test(nik))) {
      errors.push('NIK harus 16 digit angka');
    }

    // NISN Validation (10 digits, numeric)
    if (nisn && (nisn.length !== 10 || !/^\d+$/.test(nisn))) {
      errors.push('NISN harus 10 digit angka');
    }

    // Phone Validation (Indonesian format)
    if (parentPhone && !/^(08|628)\d{8,12}$/.test(parentPhone)) {
      errors.push('Nomor HP tidak valid (Gunakan format 08... atau 628...)');
    }

    // Birth Date Validation (Age check - roughly 11-17 years old for MTs)
    if (birthDate) {
      const birth = new Date(birthDate);
      const today = new Date();
      let age = today.getFullYear() - birth.getFullYear();
      if (age < 10 || age > 20) {
        errors.push('Tanggal lahir tidak valid untuk pendaftar tingkat MTs');
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({ message: errors[0], allErrors: errors });
    }
    
    // 2. Status Protection
    let profile = await Pendaftar.findByPk(req.user.id);
    
    if (profile && (profile.registrationStatus === 'verified' || profile.registrationStatus === 'accepted' || profile.isLocked)) {
      return res.status(400).json({ message: 'Data sudah dikunci atau diverifikasi, tidak dapat diubah lagi. Hubungi panitia jika ada kesalahan.' });
    }

    const updateData = { ...req.body };
    
    // Handle JSON fields if they come as strings
    if (typeof updateData.details === 'string' && updateData.details) {
      try {
        const parsed = JSON.parse(updateData.details);
        // If the frontend sends data inside details, we can spread it out or just keep it
        // The wizard sends many fields directly AND some in details
      } catch (e) {}
    }

    if (profile) {
      // Update existing profile with all data from body
      await profile.update(updateData);
    } else {
      // Create new profile
      // Generate registration number: NPSN-YEAR-COUNT
      const count = await Pendaftar.count();
      const registrationNumber = `30112343-24-${100 + count}`;
      
      updateData.registrationNumber = registrationNumber;

      profile = await Pendaftar.create(updateData);
    }

    res.json({ 
      message: profile ? 'Profil berhasil diperbarui' : 'Pendaftaran berhasil disimpan', 
      profile 
    });
  } catch (error) {
    console.error('Save Profile Error:', error);
    res.status(500).json({ message: error.message });
  }
};

const uploadDocument = async (req, res) => {
  try {
    const { type, isDrive, driveLink } = req.body;
    const profile = await Pendaftar.findByPk(req.user.id);

    if (!profile) {
      return res.status(400).json({ message: 'Silakan lengkapi profil Anda terlebih dahulu.' });
    }

    if (profile.isLocked || profile.registrationStatus === 'verified' || profile.registrationStatus === 'accepted') {
      return res.status(400).json({ message: 'Data Anda telah dikunci atau sudah diverifikasi. Anda tidak dapat mengunggah berkas baru.' });
    }

    // Check if it's a Google Drive link
    let filePath;
    if (isDrive && driveLink) {
      filePath = driveLink; // Save the URL directly
    } else {
      if (!req.file) {
        return res.status(400).json({ message: 'Tidak ada file yang diunggah.' });
      }

      // Upload buffer to Cloudinary using upload_stream
      filePath = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: 'ppdb_uploads', resource_type: 'auto' },
          (error, result) => {
            if (error) {
              console.error('Cloudinary Upload Error:', error);
              return reject(new Error('Gagal mengunggah gambar ke Cloudinary. Periksa konfigurasi API Anda.'));
            }
            resolve(result.secure_url);
          }
        );
        stream.end(req.file.buffer);
      });
    }

    // Check if document already exists
    let berkas = await Berkas.findOne({ 
      where: { pendaftarId: profile.id, type } 
    });

    if (berkas) {
      await berkas.update({ filePath, status: 'pending' });
    } else {
      berkas = await Berkas.create({
        pendaftarId: profile.id,
        type,
        filePath,
      });
    }

    res.json({ message: 'Dokumen berhasil disimpan', berkas });
  } catch (error) {
    console.error('[uploadDocument] ERROR:', error);
    res.status(500).json({ 
      message: error.message,
      detail: error.http_code || error.code || null,
      stack: process.env.NODE_ENV !== 'production' ? error.stack : undefined
    });
  }
};

const submitDaftarUlang = async (req, res) => {
  try {
    const { pendaftarId } = req.body;
    
    let du = await DaftarUlang.findOne({ where: { pendaftarId } });
    
    const payload = { ...req.body, statusDaftarUlang: 'completed' };
    
    if (du) {
      await du.update(payload);
    } else {
      du = await DaftarUlang.create(payload);
    }
    
    res.json({ message: 'Data Daftar Ulang berhasil disimpan', data: du });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getProfile, createOrUpdateProfile, uploadDocument, submitDaftarUlang };
