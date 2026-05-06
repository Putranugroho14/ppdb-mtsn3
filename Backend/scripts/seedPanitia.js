const bcrypt = require('bcryptjs');
const { sequelize } = require('../src/config/database');
const User = require('../src/models/User');

const seedPanitia = async () => {
  try {
    await sequelize.authenticate();
    
    const panitiaExists = await User.findOne({ where: { username: 'panitia' } });
    if (panitiaExists) {
      console.log('Account "panitia" already exists!');
      process.exit(0);
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('panitia123', salt);

    await User.create({
      name: 'Panitia PPDB',
      username: 'panitia',
      password: hashedPassword,
      role: 'admin',
    });

    console.log('✅ Panitia account created successfully!');
    console.log('Username: panitia');
    console.log('Password: panitia123');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating panitia account:', error);
    process.exit(1);
  }
};

seedPanitia();
