const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const DaftarUlang = sequelize.define('DaftarUlang', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  pendaftarId: {
    type: DataTypes.UUID,
    allowNull: false,
    unique: true,
  },
  // Data Tambahan Detail e-MIS
  jumlahSaudara: { type: DataTypes.INTEGER, defaultValue: 0 },
  anakKe: { type: DataTypes.INTEGER, defaultValue: 1 },
  noKIP: { type: DataTypes.STRING, allowNull: true },
  noKKS: { type: DataTypes.STRING, allowNull: true },
  noPKH: { type: DataTypes.STRING, allowNull: true },

  // Alamat & Koordinat
  statusTempatTinggal: { type: DataTypes.STRING, allowNull: true }, // Milik Sendiri, Orang Tua, dll
  estimasiJarak: { type: DataTypes.STRING, allowNull: true }, // KM
  estimasiWaktu: { type: DataTypes.STRING, allowNull: true }, // Menit
  lat: { type: DataTypes.STRING, allowNull: true },
  lng: { type: DataTypes.STRING, allowNull: true },

  // Informasi Siswa Detail
  hobi: { type: DataTypes.STRING, allowNull: true },
  citaCita: { type: DataTypes.STRING, allowNull: true },
  kebutuhanKhusus: { type: DataTypes.STRING, allowNull: true },
  praSekolah: { type: DataTypes.STRING, allowNull: true }, // Pernah TK/RA/PAUD
  disabilitas: { type: DataTypes.STRING, allowNull: true },
  imunisasi: { type: DataTypes.STRING, allowNull: true },
  yangMembiayai: { type: DataTypes.STRING, allowNull: true },
  transportasiKeSekolah: { type: DataTypes.STRING, allowNull: true },
  alamatSekolahAsal: { type: DataTypes.TEXT, allowNull: true },

  // Data Ayah Kandung
  keberadaanAyah: { type: DataTypes.STRING, allowNull: true }, // Masih Ada, Meninggal
  nikAyah: { type: DataTypes.STRING(16), allowNull: true },
  namaAyah: { type: DataTypes.STRING, allowNull: true },
  tempatLahirAyah: { type: DataTypes.STRING, allowNull: true },
  tglLahirAyah: { type: DataTypes.DATEONLY, allowNull: true },
  pendidikanAyah: { type: DataTypes.STRING, allowNull: true },
  pekerjaanAyah: { type: DataTypes.STRING, allowNull: true },
  penghasilanAyah: { type: DataTypes.STRING, allowNull: true },
  hpAyah: { type: DataTypes.STRING(15), allowNull: true },

  // Data Ibu Kandung
  keberadaanIbu: { type: DataTypes.STRING, allowNull: true },
  nikIbu: { type: DataTypes.STRING(16), allowNull: true },
  namaIbu: { type: DataTypes.STRING, allowNull: true },
  tempatLahirIbu: { type: DataTypes.STRING, allowNull: true },
  tglLahirIbu: { type: DataTypes.DATEONLY, allowNull: true },
  pendidikanIbu: { type: DataTypes.STRING, allowNull: true },
  pekerjaanIbu: { type: DataTypes.STRING, allowNull: true },
  penghasilanIbu: { type: DataTypes.STRING, allowNull: true },
  hpIbu: { type: DataTypes.STRING(15), allowNull: true },

  // Data Wali
  nikWali: { type: DataTypes.STRING(16), allowNull: true },
  namaWali: { type: DataTypes.STRING, allowNull: true },
  pendidikanWali: { type: DataTypes.STRING, allowNull: true },
  pekerjaanWali: { type: DataTypes.STRING, allowNull: true },
  penghasilanWali: { type: DataTypes.STRING, allowNull: true },
  hpWali: { type: DataTypes.STRING(15), allowNull: true },

  statusDaftarUlang: {
    type: DataTypes.ENUM('pending', 'completed', 'verified'),
    defaultValue: 'pending',
  }
}, {
  timestamps: true,
});

module.exports = DaftarUlang;
