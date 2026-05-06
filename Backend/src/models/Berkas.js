const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const Pendaftar = require('./Pendaftar');

const Berkas = sequelize.define('Berkas', {
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
  type: {
    type: DataTypes.ENUM('kk', 'akta', 'foto', 'ijazah'),
    allowNull: false,
  },
  filePath: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected'),
    defaultValue: 'pending',
  },
}, {
  timestamps: true,
});

Pendaftar.hasMany(Berkas, { foreignKey: 'pendaftarId' });
Berkas.belongsTo(Pendaftar, { foreignKey: 'pendaftarId' });

module.exports = Berkas;
