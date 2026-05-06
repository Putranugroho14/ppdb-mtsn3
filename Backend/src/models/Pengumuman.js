const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Pengumuman = sequelize.define('Pengumuman', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  category: {
    type: DataTypes.ENUM('Berita Utama', 'Jadwal & Agenda', 'Pengumuman Seleksi', 'Panduan Pendaftaran', 'Informasi Alur', 'Kegiatan Madrasah', 'Lainnya'),
    defaultValue: 'Berita Utama',
  },
  isPublished: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  publishedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  authorId: {
    type: DataTypes.UUID,
    allowNull: true,
  }
}, {
  timestamps: true,
});

module.exports = Pengumuman;
