const { User, Setting, SetupPPDB, Pendaftar, HasilSeleksi, DaftarUlang, Berkas, AuditLog, Pengumuman } = require('../models');
const bcrypt = require('bcryptjs');
const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');
const path = require('path');
const fs = require('fs');
const AdmZip = require('adm-zip');
const { sequelize } = require('../config/database');


const exportApplicantsPDF = async (req, res) => {
  try {
    const applicants = await Pendaftar.findAll({ order: [['registrationNumber', 'ASC']] });
    
    const doc = new PDFDocument({ 
      layout: 'landscape', 
      margin: 30,
      info: { Title: 'Daftar Pendaftar PPDB' }
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=daftar-pendaftar.pdf');
    doc.pipe(res);

    // Header
    doc.font('Helvetica-Bold').fontSize(14).text('DAFTAR CALON PESERTA DIDIK BARU', { align: 'center' });
    doc.fontSize(12).text('MTs NEGERI 3 SANGGAU', { align: 'center' });
    doc.moveDown(1.5);

    // Table Header
    const tableTop = doc.y;
    const colWidths = [30, 90, 150, 60, 150, 150, 80];
    const colNames = ['No', 'No Reg', 'Nama Lengkap', 'L/P', 'Asal Sekolah', 'Orang Tua', 'Status'];
    let currentX = 30;

    doc.fontSize(9).font('Helvetica-Bold');
    colNames.forEach((name, i) => {
      doc.text(name, currentX, tableTop, { width: colWidths[i], align: 'center' });
      currentX += colWidths[i];
    });

    doc.moveTo(30, tableTop + 15).lineTo(760, tableTop + 15).stroke();

    // Table Rows
    let currentY = tableTop + 20;
    doc.font('Helvetica').fontSize(8);

    applicants.forEach((app, index) => {
      if (currentY > 530) {
        doc.addPage({ layout: 'landscape', margin: 30 });
        currentY = 40;
      }

      let rowX = 30;
      const rowData = [
        (index + 1).toString(),
        app.registrationNumber,
        app.name?.toUpperCase(),
        app.gender,
        app.schoolOrigin?.toUpperCase(),
        app.parentName?.toUpperCase(),
        app.registrationStatus?.toUpperCase()
      ];

      rowData.forEach((val, i) => {
        doc.text(val || '-', rowX, currentY, { width: colWidths[i], align: i === 2 || i === 4 || i === 5 ? 'left' : 'center' });
        rowX += colWidths[i];
      });

      currentY += 15;
    });

    doc.end();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: [] } // Include everything including password_plain
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createUser = async (req, res) => {
  try {
    const { name, username, password, role } = req.body;

    const userExists = await User.findOne({ where: { username } });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      username,
      password: hashedPassword,
      password_plain: password,
      role
    });

    res.status(201).json({
      message: 'User created successfully',
      user: { id: user.id, name: user.name, username: user.username, role: user.role }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, username, role, password } = req.body;

    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const updates = { name, username, role };
    if (password) {
      const salt = await bcrypt.genSalt(10);
      updates.password = await bcrypt.hash(password, salt);
      updates.password_plain = password;
    }

    await user.update(updates);
    res.json({ message: 'User updated successfully', user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (user.role === 'superadmin') {
      return res.status(400).json({ message: 'Cannot delete superadmin' });
    }

    await user.destroy();
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getSettings = async (req, res) => {
  try {
    let settings = await Setting.findOne();
    if (!settings) {
      settings = await Setting.create({});
    }
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getPublicSettings = async (req, res) => {
  try {
    const settings = await Setting.findOne();
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateSettings = async (req, res) => {
  try {
    let settings = await Setting.findOne();
    const updateData = { ...req.body };
    
    // Ensure JSON fields are stringified if sent as objects
    if (updateData.persyaratan && typeof updateData.persyaratan !== 'string') {
      updateData.persyaratan = JSON.stringify(updateData.persyaratan);
    }
    if (updateData.alurPendaftaran && typeof updateData.alurPendaftaran !== 'string') {
      updateData.alurPendaftaran = JSON.stringify(updateData.alurPendaftaran);
    }

    if (!settings) {
      settings = await Setting.create(updateData);
    } else {
      await settings.update(updateData);
    }
    res.json({ message: 'Pengaturan berhasil diperbarui', settings });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getStatistics = async (req, res) => {
  try {
    const total = await Pendaftar.count();
    const verified = await Pendaftar.count({ where: { registrationStatus: 'verified' } });
    const pending = await Pendaftar.count({ where: { registrationStatus: 'pending' } });
    const accepted = await Pendaftar.count({ where: { registrationStatus: 'accepted' } });
    const rejected = await Pendaftar.count({ where: { registrationStatus: 'rejected' } });

    // Gender stats
    const male = await Pendaftar.count({ where: { gender: 'L' } });
    const female = await Pendaftar.count({ where: { gender: 'P' } });

    res.json({
      total, verified, pending, accepted, rejected,
      gender: { male, female }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const exportApplicants = async (req, res) => {
  try {
    const applicants = await Pendaftar.findAll({
      include: [DaftarUlang]
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Pendaftar');

    worksheet.columns = [
      { header: 'No. Pendaftaran', key: 'registrationNumber', width: 20 },
      { header: 'Nama Lengkap', key: 'name', width: 30 },
      { header: 'NIK Siswa', key: 'nik', width: 20 },
      { header: 'NISN', key: 'nisn', width: 15 },
      { header: 'L/P', key: 'gender', width: 5 },
      { header: 'Tempat Lahir', key: 'birthPlace', width: 20 },
      { header: 'Tanggal Lahir', key: 'birthDate', width: 15 },
      { header: 'Agama', key: 'agama', width: 15 },
      { header: 'Alamat', key: 'address', width: 40 },
      { header: 'Provinsi', key: 'provinsi', width: 20 },
      { header: 'Kab/Kota', key: 'kabupatenKota', width: 20 },
      { header: 'Kecamatan', key: 'kecamatan', width: 20 },
      { header: 'Kelurahan/Desa', key: 'kelurahanDesa', width: 20 },
      { header: 'RT', key: 'rt', width: 5 },
      { header: 'RW', key: 'rw', width: 5 },
      { header: 'Sekolah Asal', key: 'schoolOrigin', width: 30 },
      { header: 'Tahun Lulus', key: 'graduationYear', width: 10 },
      { header: 'Nama Ayah', key: 'parentName', width: 25 },
      { header: 'NIK Ayah', key: 'ayahNik', width: 20 },
      { header: 'Nama Ibu', key: 'ibuNama', width: 25 },
      { header: 'NIK Ibu', key: 'ibuNik', width: 20 },
      { header: 'Wali', key: 'waliNama', width: 25 },
      { header: 'No. HP/WA', key: 'parentPhone', width: 15 },
      { header: 'Jalur', key: 'jalurPendaftaran', width: 15 },
      { header: 'Rata-rata Raport', key: 'avgRaport', width: 15 },
      { header: 'Status PPDB', key: 'registrationStatus', width: 15 },
      { header: 'Status e-MIS/Regr', key: 'statusDaftarUlang', width: 15 },
    ];

    applicants.forEach(app => {
      // Calculate avg raport
      const scores = [
        parseFloat(app.nilaiRaportIVGanjil || 0),
        parseFloat(app.nilaiRaportIVGenap || 0),
        parseFloat(app.nilaiRaportVGanjil || 0),
        parseFloat(app.nilaiRaportVGenap || 0),
        parseFloat(app.nilaiRaportVIGanjil || 0)
      ];
      const avg = scores.reduce((a, b) => a + b, 0) / scores.length;

      worksheet.addRow({
        registrationNumber: app.registrationNumber,
        name: app.name,
        nik: app.nik,
        nisn: app.nisn,
        gender: app.gender,
        birthPlace: app.birthPlace,
        birthDate: app.birthDate,
        agama: app.agama,
        address: app.address,
        provinsi: app.provinsi,
        kabupatenKota: app.kabupatenKota,
        kecamatan: app.kecamatan,
        kelurahanDesa: app.kelurahanDesa,
        rt: app.rt,
        rw: app.rw,
        schoolOrigin: app.schoolOrigin,
        graduationYear: app.graduationYear,
        parentName: app.parentName,
        ayahNik: app.ayahNik,
        ibuNama: app.ibuNama,
        ibuNik: app.ibuNik,
        waliNama: app.waliNama,
        parentPhone: app.parentPhone,
        jalurPendaftaran: app.jalurPendaftaran,
        avgRaport: avg.toFixed(2),
        registrationStatus: app.registrationStatus,
        statusDaftarUlang: app.DaftarUlang?.statusDaftarUlang || 'Belum Isi',
      });
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=data-pendaftar.xlsx');

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const resetSystem = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    // Disable foreign key checks to allow truncation/deletion
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0', { transaction });

    // 1. Delete all related data from database
    await Berkas.destroy({ where: {}, transaction });
    await HasilSeleksi.destroy({ where: {}, transaction });
    await DaftarUlang.destroy({ where: {}, transaction });
    await Pendaftar.destroy({ where: {}, transaction });
    
    // 2. Clear uploads folder
    const uploadsDir = path.join(__dirname, '../../uploads');
    if (fs.existsSync(uploadsDir)) {
      const folders = fs.readdirSync(uploadsDir);
      for (const folder of folders) {
        const fullPath = path.join(uploadsDir, folder);
        if (fs.lstatSync(fullPath).isDirectory()) {
          // If files are in subfolders (e.g., nik-based folders)
          const files = fs.readdirSync(fullPath);
          for (const file of files) {
            fs.unlinkSync(path.join(fullPath, file));
          }
          fs.rmdirSync(fullPath);
        } else if (folder !== '.gitkeep') {
          // If files are directly in uploads
          fs.unlinkSync(fullPath);
        }
      }
    }

    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1', { transaction });
    
    await transaction.commit();
    res.json({ message: 'Sistem berhasil direset. Seluruh data pendaftar dan file berkas telah dihapus.' });
  } catch (error) {
    if (transaction) await transaction.rollback();
    console.error('Reset Error:', error);
    res.status(500).json({ message: 'Gagal mereset sistem: ' + error.message });
  }
};

const backupSystem = async (req, res) => {
  try {
    const zip = new AdmZip();
    
    // 1. Fetch all data from ALL tables
    const data = {
      pendaftar: await Pendaftar.findAll(),
      berkas: await Berkas.findAll(),
      hasilSeleksi: await HasilSeleksi.findAll(),
      daftarUlang: await DaftarUlang.findAll(),
      settings: await Setting.findAll(),
      setups: await SetupPPDB.findAll(),
      users: await User.findAll(),
      auditLogs: await AuditLog.findAll(),
      pengumuman: await Pengumuman.findAll()
    };

    // 2. Add database as JSON
    zip.addFile("database_backup.json", Buffer.from(JSON.stringify(data, null, 2), "utf8"));

    // 3. Add uploads folder
    const uploadsDir = path.join(__dirname, '../../uploads');
    if (fs.existsSync(uploadsDir)) {
      zip.addLocalFolder(uploadsDir, "uploads");
    }

    // 4. Generate buffer and send
    const zipBuffer = zip.toBuffer();
    const fileName = `BACKUP_FULL_PPDB_${new Date().toISOString().split('T')[0]}.zip`;

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
    res.send(zipBuffer);

  } catch (error) {
    console.error('Backup Error Details:', error);
    res.status(500).json({ 
      message: 'Gagal melakukan backup sistem', 
      details: error.message 
    });
  }
};

const getSetups = async (req, res) => {
  try {
    const setups = await SetupPPDB.findAll({ order: [['tahun', 'DESC']] });
    res.json(setups);
  } catch (error) {
    console.error('Error in getSetups:', error);
    res.status(500).json({ message: error.message });
  }
};

const getPublicSetup = async (req, res) => {
  try {
    // Paksa ambil data tahun terbaru (misal 2026) tanpa peduli status aktif
    const setup = await SetupPPDB.findOne({ 
      order: [['tahun', 'DESC'], ['createdAt', 'DESC']] 
    });

    // Matikan cache agar browser tidak menampilkan data lama (Februari)
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    
    res.json(setup);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createSetup = async (req, res) => {
  try {
    const { 
      tahun, 
      tanggalPendaftaranMulai, 
      tanggalPendaftaranSelesai, 
      tanggalVerifikasiRaw, 
      tanggalTestRaw, 
      tanggalPengumumanRaw, 
      tanggalDaftarUlangMulai, 
      tanggalDaftarUlangSelesai 
    } = req.body;

    // Helper untuk format tanggal
    const formatShort = (dateStr) => {
      if (!dateStr) return '';
      return new Date(dateStr).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });
    };

    const formatFull = (dateStr) => {
      if (!dateStr) return '';
      return new Date(dateStr).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
    };

    // Generate formatted strings
    const tanggalPendaftaran = (tanggalPendaftaranMulai && tanggalPendaftaranSelesai) 
      ? `${formatShort(tanggalPendaftaranMulai)} - ${formatShort(tanggalPendaftaranSelesai)}` 
      : '';
    
    const tanggalDaftarUlang = (tanggalDaftarUlangMulai && tanggalDaftarUlangSelesai) 
      ? `${formatShort(tanggalDaftarUlangMulai)} - ${formatShort(tanggalDaftarUlangSelesai)}` 
      : '';

    const payload = {
      tahun,
      tanggalPendaftaranMulai, tanggalPendaftaranSelesai,
      tanggalVerifikasiRaw, tanggalTestRaw, tanggalPengumumanRaw,
      tanggalDaftarUlangMulai, tanggalDaftarUlangSelesai,
      tanggalPendaftaran,
      tanggalVerifikasi: formatFull(tanggalVerifikasiRaw),
      tanggalTest: formatFull(tanggalTestRaw),
      tanggalPengumuman: formatFull(tanggalPengumumanRaw),
      tanggalDaftarUlang
    };

    let setup = await SetupPPDB.findOne({ where: { tahun } });
    
    if (setup) {
      await setup.update(payload);
      return res.status(200).json({ message: 'Jadwal tahun ini berhasil diperbarui', setup });
    }
    
    setup = await SetupPPDB.create(payload);
    res.status(201).json({ message: 'Jadwal baru berhasil dibuat', setup });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateSetup = async (req, res) => {
  try {
    const { id } = req.params;
    const { tahun, tanggalPendaftaran, tanggalVerifikasi, tanggalTest, tanggalPengumuman, tanggalDaftarUlang } = req.body;
    const setup = await SetupPPDB.findByPk(id);
    if (!setup) return res.status(404).json({ message: 'Setup not found' });

    await setup.update({
      tahun, tanggalPendaftaran, tanggalVerifikasi, tanggalTest, tanggalPengumuman, tanggalDaftarUlang
    });
    res.json({ message: 'Setup updated successfully', setup });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteSetup = async (req, res) => {
  try {
    const { id } = req.params;
    const setup = await SetupPPDB.findByPk(id);
    if (!setup) return res.status(404).json({ message: 'Setup not found' });
    await setup.destroy();
    res.json({ message: 'Setup deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const activateSetup = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { id } = req.params;
    await SetupPPDB.update({ isActive: false }, { where: {}, transaction });
    const setup = await SetupPPDB.findByPk(id);
    if (!setup) throw new Error('Setup not found');
    await setup.update({ isActive: true }, { transaction });
    await transaction.commit();
    res.json({ message: 'Setup activated successfully', setup });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ message: error.message });
  }
};

const updatePendaftar = async (req, res) => {
  try {
    const { id } = req.params;
    const pendaftar = await Pendaftar.findByPk(id);
    if (!pendaftar) return res.status(404).json({ message: 'Pendaftar tidak ditemukan' });

    const updateData = { ...req.body };

    // Validate NIK if changed
    if (updateData.nik && updateData.nik !== pendaftar.nik) {
      const existing = await Pendaftar.findOne({ where: { nik: updateData.nik } });
      if (existing) {
        return res.status(400).json({ message: 'NIK sudah digunakan oleh pendaftar lain' });
      }
    }

    // Handle password hashing if provided
    if (updateData.password) {
      const bcrypt = require('bcryptjs');
      updateData.password_plain = updateData.password;
      updateData.password = await bcrypt.hash(updateData.password, 10);
    } else {
      // Don't overwrite password if not provided
      delete updateData.password;
    }

    await pendaftar.update(updateData);
    res.json({ message: 'Data pendaftar berhasil diperbarui secara menyeluruh', pendaftar });
  } catch (error) {
    console.error('Update Pendaftar Error:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = { 
  getUsers, createUser, updateUser, deleteUser, 
  getSettings, getPublicSettings, updateSettings, 
  getStatistics, exportApplicants, exportApplicantsPDF, resetSystem, backupSystem,
  getSetups, getPublicSetup, createSetup, updateSetup, deleteSetup, activateSetup,
  updatePendaftar
};
