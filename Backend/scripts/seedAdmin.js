const bcrypt = require('bcryptjs');
const { sequelize } = require('../src/config/database');
const User = require('../src/models/User');

const seedAdmin = async () => {
  try {
    await sequelize.authenticate();
    
    const adminExists = await User.findOne({ where: { role: 'superadmin' } });
    if (adminExists) {
      console.log('Superadmin already exists!');
      process.exit(0);
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);

    await User.create({
      name: 'Super Admin',
      username: 'admin',
      password: hashedPassword,
      role: 'superadmin',
    });

    console.log('✅ Superadmin account created successfully!');
    console.log('Username: admin');
    console.log('Password: admin123');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating superadmin:', error);
    process.exit(1);
  }
};

seedAdmin();
