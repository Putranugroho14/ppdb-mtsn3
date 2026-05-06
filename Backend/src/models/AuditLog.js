const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const AuditLog = sequelize.define('AuditLog', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  action: {
    type: DataTypes.STRING, // e.g., 'UPDATE_STATUS', 'UPDATE_PROFILE', 'DELETE_PENDAPTAR'
    allowNull: false,
  },
  tableName: {
    type: DataTypes.STRING, // e.g., 'Pendaftar', 'Berkas'
    allowNull: false,
  },
  recordId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  userId: {
    type: DataTypes.STRING, // ID of the admin who performed the action
    allowNull: true,
  },
  userName: {
    type: DataTypes.STRING, // Name of the person who performed the action
    allowNull: true,
  },
  details: {
    type: DataTypes.TEXT, // JSON string of what was changed
    allowNull: true,
  },
  ipAddress: {
    type: DataTypes.STRING,
    allowNull: true,
  }
}, {
  timestamps: true,
  updatedAt: false, // Audit logs are immutable
});

module.exports = AuditLog;
