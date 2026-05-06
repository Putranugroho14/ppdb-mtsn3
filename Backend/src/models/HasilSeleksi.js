const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const Pendaftar = require('./Pendaftar');

const HasilSeleksi = sequelize.define('HasilSeleksi', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  pendaftarId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: Pendaftar,
      key: 'id',
    },
  },
  averageScore: {
    type: DataTypes.FLOAT,
    defaultValue: 0,
  },
  notes: {
    type: DataTypes.TEXT,
  },
  announcementStatus: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
}, {
  timestamps: true,
});

Pendaftar.hasOne(HasilSeleksi, { foreignKey: 'pendaftarId' });
HasilSeleksi.belongsTo(Pendaftar, { foreignKey: 'pendaftarId' });

module.exports = HasilSeleksi;
