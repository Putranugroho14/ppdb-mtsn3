const AuditLog = require('../models/AuditLog');

const logAction = async (req, action, tableName, recordId, details = null) => {
  try {
    await AuditLog.create({
      action,
      tableName,
      recordId,
      userId: req.user?.id || 'SYSTEM',
      userName: req.user?.name || 'SYSTEM',
      details: details ? JSON.stringify(details) : null,
      ipAddress: req.ip || req.connection.remoteAddress,
    });
  } catch (error) {
    console.error('Failed to create audit log:', error);
  }
};

module.exports = { logAction };
