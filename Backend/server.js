const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
require('dotenv').config();
require('mysql2'); // Explicitly require for Vercel static analyzer

const { connectDB, sequelize } = require('./src/config/database');

const app = express();

// Middleware
app.use(cors({
  origin: [
    'http://localhost:3000', 
    'http://localhost:3001', 
    'https://ppdb-mtsn3-web.vercel.app',
    'https://ppdb-mtsn3.vercel.app',
    /\.vercel\.app$/ // Allow all vercel subdomains
  ],
  credentials: true,
  optionsSuccessStatus: 200,
  maxAge: 86400 // Cache preflight for 24 hours
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Import Routes
const authRoutes = require('./src/routes/authRoutes');
const userRoutes = require('./src/routes/userRoutes');
const adminRoutes = require('./src/routes/adminRoutes');
const superAdminRoutes = require('./src/routes/superAdminRoutes');
const publicRoutes = require('./src/routes/publicRoutes');
const announcementRoutes = require('./src/routes/announcementRoutes');
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/superadmin', superAdminRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/announcements', announcementRoutes);

// Root Health Check Route
app.get('/', (req, res) => {
  res.status(200).json({ message: "PPDB MTsN 3 Sanggau API is running successfully on Vercel!" });
});

// Start Server
const startServer = async () => {
  try {
    await connectDB();
    await sequelize.sync({ alter: true });
    console.log('✅ Database models synced (alter: true)');

    const PORT = process.env.PORT || 5000;
    const server = app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });

    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`❌ Port ${PORT} is already in use. Please kill the process using it.`);
      } else {
        console.error('❌ Server error:', err);
      }
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// If not running on Vercel, start the server normally
if (process.env.VERCEL !== '1') {
  startServer();
} else {
  // For Vercel Serverless
  connectDB().then(() => sequelize.sync({ alter: true })).catch(console.error);
}

// Global error handler for Multer/Cloudinary or other unhandled errors
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err);
  
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ message: 'Ukuran file terlalu besar! Maksimal ukuran file adalah 2MB.' });
  }

  if (err.name === 'MulterError' || err.message.includes('Cloudinary')) {
    return res.status(500).json({ message: 'Gagal mengunggah file. Pastikan konfigurasi Cloudinary di Vercel sudah benar.', technicalDetail: err.message });
  }
  
  res.status(500).json({ message: err.message || 'Internal Server Error' });
});

module.exports = app;
