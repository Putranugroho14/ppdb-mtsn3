const { sequelize } = require('./src/config/database');
const User = require('./src/models/User');
const bcrypt = require('bcryptjs');

const seedSuperAdmin = async () => {
  try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('superadmin123', salt);

    const [user, created] = await User.findOrCreate({
      where: { email: 'superadmin@gmail.com' },
      defaults: {
        name: 'Super Admin',
        email: 'superadmin@gmail.com',
        password: hashedPassword,
        role: 'superadmin'
      }
    });

    if (created) {
      console.log('✅ Super Admin created successfully');
    } else {
      console.log('ℹ️ Super Admin already exists');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding Super Admin:', error);
    process.exit(1);
  }
};

seedSuperAdmin();
