const Pendaftar = require('./Pendaftar');
const Berkas = require('./Berkas');
const User = require('./User');
const Setting = require('./Setting');
const SetupPPDB = require('./SetupPPDB');
const DaftarUlang = require('./DaftarUlang');
const HasilSeleksi = require('./HasilSeleksi');
const AuditLog = require('./AuditLog');
const Pengumuman = require('./Pengumuman');

// Associations
Pendaftar.hasMany(Berkas, { foreignKey: 'pendaftarId' });
Berkas.belongsTo(Pendaftar, { foreignKey: 'pendaftarId' });

Pendaftar.hasOne(DaftarUlang, { foreignKey: 'pendaftarId' });
DaftarUlang.belongsTo(Pendaftar, { foreignKey: 'pendaftarId' });

Pendaftar.hasOne(HasilSeleksi, { foreignKey: 'pendaftarId' });
HasilSeleksi.belongsTo(Pendaftar, { foreignKey: 'pendaftarId' });

module.exports = {
  Pendaftar,
  Berkas,
  User,
  Setting,
  SetupPPDB,
  DaftarUlang,
  HasilSeleksi,
  AuditLog,
  Pengumuman
};
