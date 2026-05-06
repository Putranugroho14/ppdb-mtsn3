const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const SetupPPDB = sequelize.define('SetupPPDB', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  tahun: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true,
  },
  tanggalPendaftaranMulai: {
    type: DataTypes.STRING(10), // YYYY-MM-DD
    allowNull: true,
  },
  tanggalPendaftaranSelesai: {
    type: DataTypes.STRING(10), // YYYY-MM-DD
    allowNull: true,
  },
  tanggalVerifikasiRaw: {
    type: DataTypes.STRING(10),
    allowNull: true,
  },
  tanggalTestRaw: {
    type: DataTypes.STRING(10),
    allowNull: true,
  },
  tanggalPengumumanRaw: {
    type: DataTypes.STRING(10),
    allowNull: true,
  },
  tanggalDaftarUlangMulai: {
    type: DataTypes.STRING(10),
    allowNull: true,
  },
  tanggalDaftarUlangSelesai: {
    type: DataTypes.STRING(10),
    allowNull: true,
  },
  // Keep the old ones for backward compatibility or simple display if needed, 
  // but we will primarily use the Raw ones now.
  tanggalPendaftaran: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  tanggalVerifikasi: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  tanggalTest: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  tanggalPengumuman: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  tanggalDaftarUlang: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  }
}, {
  timestamps: true,
});

module.exports = SetupPPDB;
