const { User, Pendaftar } = require('../models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const register = async (req, res) => {
  try {
    const { username, name, password, birthPlace, birthDate, gender } = req.body;

    // Check if pendaftar already exists
    const pendaftarExists = await Pendaftar.findOne({ where: { nik: username } });
    if (pendaftarExists) {
      return res.status(400).json({ message: 'User with this NIK already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create Pendaftar
    const lastPendaftar = await Pendaftar.findOne({
      order: [['createdAt', 'DESC']],
      paranoid: false
    });
    
    let nextNumber = 101;
    if (lastPendaftar && lastPendaftar.registrationNumber) {
      const parts = lastPendaftar.registrationNumber.split('-');
      const lastNum = parseInt(parts[parts.length - 1]);
      if (!isNaN(lastNum)) {
        nextNumber = lastNum + 1;
      }
    }
    const registrationNumber = `30112343-24-${nextNumber}`;

    const pendaftar = await Pendaftar.create({
      name,
      nik: username,
      password: hashedPassword,
      password_plain: password,
      registrationNumber,
      gender,
      birthPlace,
      birthDate,
    });

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: pendaftar.id,
        name: pendaftar.name,
        username: pendaftar.nik,
        role: 'user',
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    let user = null;
    let role = 'user';

    // Logic: If username is 16 digits, assume student (Pendaftar)
    if (username.length === 16 && /^\d+$/.test(username)) {
      user = await Pendaftar.findOne({ where: { nik: username } });
      role = 'user';
    } else {
      user = await User.findOne({ where: { username } });
      if (user) role = user.role;
    }

    console.log(`Login attempt for username: ${username}`);
    
    if (!user) {
      console.log(`User not found: ${username}`);
      return res.status(400).json({ message: 'NIK atau password salah' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    console.log(`Password match for ${username}: ${isMatch}`);
    
    if (!isMatch) {
      return res.status(400).json({ message: 'NIK atau password salah' });
    }

    // Auto-repair: Update password_plain if it's missing or incorrect
    if (user.password_plain !== password) {
      await user.update({ password_plain: password });
    }

    // Create token
    const token = jwt.sign(
      { id: user.id, role: role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    // Set cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        name: user.name,
        username: user.username || user.nik,
        role: role,
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: error.message });
  }
};

const logout = (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out successfully' });
};

const getMe = async (req, res) => {
  try {
    let user;
    if (req.user.role === 'admin' || req.user.role === 'superadmin') {
      user = await User.findByPk(req.user.id, {
        attributes: { exclude: ['password'] }
      });
    } else {
      user = await Pendaftar.findByPk(req.user.id, {
        attributes: { exclude: ['password'] }
      });
      if (user) {
        user = user.toJSON();
        user.role = 'user';
        user.username = user.nik;
      }
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { register, login, logout, getMe };
