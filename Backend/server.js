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
    process.env.CLIENT_URL // Allow production frontend URL from .env
  ].filter(Boolean),
  credentials: true
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
    await sequelize.sync();
    console.log('✅ Database models synced');

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
  connectDB().then(() => sequelize.sync()).catch(console.error);
}

module.exports = app;
