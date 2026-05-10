const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');


const Pendaftar = sequelize.define('Pendaftar', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  registrationNumber: {
    type: DataTypes.STRING,
    unique: true,
  },
  nik: {
    type: DataTypes.STRING(16),
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  password_plain: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  nisn: {
    type: DataTypes.STRING(10),
    allowNull: true,
  },
  gender: {
    type: DataTypes.ENUM('L', 'P'),
    allowNull: false,
  },
  birthPlace: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  birthDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  
  // Additional Identity Fields
  agama: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  noKK: {
    type: DataTypes.STRING(16),
    allowNull: true,
  },
  namaKepalaKeluarga: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  
  // Location Details
  provinsi: { type: DataTypes.STRING, allowNull: true },
  kabupatenKota: { type: DataTypes.STRING, allowNull: true },
  kecamatan: { type: DataTypes.STRING, allowNull: true },
  kelurahanDesa: { type: DataTypes.STRING, allowNull: true },
  rt: { type: DataTypes.STRING(5), allowNull: true },
  rw: { type: DataTypes.STRING(5), allowNull: true },
  kodePos: { type: DataTypes.STRING(10), allowNull: true },
  
  // Education History
  schoolOrigin: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  sekolahAsalLainnya: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  npsn: {
    type: DataTypes.STRING(20),
    allowNull: true,
  },
  graduationYear: {
    type: DataTypes.STRING(4),
    allowNull: true,
  },
  
  // Parents Information
  parentName: { // Father's name for legacy/general use
    type: DataTypes.STRING,
    allowNull: true,
  },
  parentPhone: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  ayahNik: { type: DataTypes.STRING(16), allowNull: true },
  ibuNik: { type: DataTypes.STRING(16), allowNull: true },
  ibuNama: { type: DataTypes.STRING, allowNull: true },
  ibuPhone: { type: DataTypes.STRING, allowNull: true },
  waliCalonSiswa: { type: DataTypes.STRING, allowNull: true },
  waliNama: { type: DataTypes.STRING, allowNull: true },
  
  // Academic & Achievements
  nilaiRaportIVGanjil: { type: DataTypes.DECIMAL(5,2), defaultValue: 0 },
  nilaiRaportIVGenap: { type: DataTypes.DECIMAL(5,2), defaultValue: 0 },
  nilaiRaportVGanjil: { type: DataTypes.DECIMAL(5,2), defaultValue: 0 },
  nilaiRaportVGenap: { type: DataTypes.DECIMAL(5,2), defaultValue: 0 },
  nilaiRaportVIGanjil: { type: DataTypes.DECIMAL(5,2), defaultValue: 0 },
  
  jalurPendaftaran: {
    type: DataTypes.STRING,
    defaultValue: 'Reguler'
  },
  
  details: { // Still keep this for any other dynamic data
    type: DataTypes.TEXT,
    allowNull: true,
  },
  
  registrationStatus: {
    type: DataTypes.ENUM('pending', 'verified', 'rejected', 'accepted', 'not_accepted'),
    defaultValue: 'pending',
  },
  verificationMessage: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  isLocked: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
}, {
  timestamps: true,
  paranoid: true
});


module.exports = Pendaftar;
