const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    let user;
    if (decoded.role === 'admin' || decoded.role === 'superadmin') {
      user = await User.findByPk(decoded.id, {
        attributes: { exclude: ['password'] }
      });
    } else {
      const Pendaftar = require('../models/Pendaftar');
      user = await Pendaftar.findByPk(decoded.id, {
        attributes: { exclude: ['password'] }
      });
      if (user) {
        user = user.toJSON();
        user.role = 'user';
      }
    }

    if (!user) {
      return res.status(401).json({ message: 'Not authorized, user not found' });
    }

    // Ensure we have a plain object with the correct role
    const userData = user.toJSON ? user.toJSON() : user;
    if (decoded.role === 'admin' || decoded.role === 'superadmin') {
      // Use role from database for admin/superadmin
      req.user = { ...userData, role: userData.role };
    } else {
      // For pendaftar, we already set role to 'user'
      req.user = { ...userData, role: 'user' };
    }
    
    next();
  } catch (error) {
    console.error('Auth Middleware Error:', error);
    return res.status(401).json({ message: 'Not authorized, token failed' });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      console.log(`Authorization Failed: User ${req.user.id} with name ${req.user.name} has role ${req.user.role}, but required roles are ${roles}`);
      return res.status(403).json({
        message: `Akses Ditolak: Peran Anda (${req.user.role}) tidak diizinkan untuk melakukan aksi ini. Pastikan Anda login sebagai Admin.`
      });
    }
    next();
  };
};

module.exports = { protect, authorize };
