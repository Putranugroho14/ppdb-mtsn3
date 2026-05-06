const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Setting = sequelize.define('Setting', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  schoolName: {
    type: DataTypes.STRING,
    defaultValue: 'MTsN 3 Sanggau',
  },
  npsn: {
    type: DataTypes.STRING,
    defaultValue: '30112343',
  },
  statusSekolah: {
    type: DataTypes.STRING,
    defaultValue: 'Negeri',
  },
  bentukPendidikan: {
    type: DataTypes.STRING,
    defaultValue: 'MTs',
  },
  alamatSekolah: {
    type: DataTypes.TEXT,
    defaultValue: 'Desa Pedalaman, Kec. Tayan Hilir, Kab. Sanggau, Kalimantan Barat.',
  },
  akreditasi: {
    type: DataTypes.STRING,
    defaultValue: 'B',
  },
  tahunAkreditasi: {
    type: DataTypes.STRING,
    defaultValue: '2018',
  },
  totalSiswa: {
    type: DataTypes.INTEGER,
    defaultValue: 318,
  },
  siswaL: {
    type: DataTypes.INTEGER,
    defaultValue: 185,
  },
  siswaP: {
    type: DataTypes.INTEGER,
    defaultValue: 133,
  },
  registrationOpen: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  quota: {
    type: DataTypes.INTEGER,
    defaultValue: 100,
  },
  welcomeAboutText: {
    type: DataTypes.TEXT,
    defaultValue: 'MTsN 3 Sanggau merupakan lembaga pendidikan tingkat menengah pertama berbasis madrasah di bawah naungan Kementerian Agama, berkomitmen mencetak generasi berkualitas di wilayah Tayan Hilir.',
  },
  gambaranUmum: {
    type: DataTypes.TEXT,
    defaultValue: 'MTsN 3 Sanggau merupakan lembaga pendidikan tingkat menengah pertama berbasis madrasah di bawah naungan Kementerian Agama. Sekolah ini berkomitmen untuk menyelenggarakan pendidikan yang mengintegrasikan ilmu pengetahuan umum dengan nilai-nilai keislaman, sehingga mampu membentuk peserta didik yang berakhlak mulia, berprestasi, serta memiliki wawasan yang luas.',
  },
  googleMapsUrl: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  whatsappNumber: {
    type: DataTypes.STRING,
    defaultValue: '08981335197',
  },
  persyaratan: {
    type: DataTypes.TEXT,
    defaultValue: JSON.stringify([
      { num: "1", text: "Pendaftar maksimal berusia 15th per 1 Juli 2026" },
      { num: "2", text: "Mengisi Formulir Pendaftaran Online (Data Diri & Orang Tua)" },
      { num: "3", text: "Mengupload Scan / Foto Berkas (KK & Akta Kelahiran)" },
      { num: "4", text: "Mengupload Pas Foto berwarna berseragam SD/MI" }
    ]),
  },
  alurPendaftaran: {
    type: DataTypes.TEXT,
    defaultValue: JSON.stringify([
      { title: "Akses Website PMB", desc: "Buka laman pmb.mtsn3sanggau.sch.id" },
      { title: "Registrasi Akun & Login", desc: "Buat akun pendaftar dan masuk ke dashboard." },
      { title: "Isi Formulir Online", desc: "Lengkapi Data Diri, Orang Tua, dan Upload Berkas." },
      { title: "Cetak Bukti Pendaftaran", desc: "Simpan dan cetak kartu bukti pendaftaran." },
      { title: "Cek Status Verifikasi", desc: "Pantau hasil verifikasi berkas secara berkala." }
    ]),
  }
}, {
  timestamps: true,
});

module.exports = Setting;
