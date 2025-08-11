require('dotenv').config({ path: '.env.local' });
const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');

async function createAdminUser() {
  const client = new MongoClient(process.env.MONGODB_URI);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db();
    const adminsCollection = db.collection('admins');
    
    // Check if admin already exists
    const existingAdmin = await adminsCollection.findOne({ username: 'admin' });
    
    if (existingAdmin) {
      console.log('Admin user already exists!');
      console.log('Username: admin');
      console.log('You can update the password if needed.');
      return;
    }
    
    // Hash the default password
    const defaultPassword = 'admin123';
    const hashedPassword = await bcrypt.hash(defaultPassword, 12);
    
    // Create admin user
    const adminUser = {
      username: 'admin',
      password: hashedPassword,
      email: 'admin@sistabag.com',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    await adminsCollection.insertOne(adminUser);
    
    console.log('✅ Admin user created successfully!');
    console.log('Username: admin');
    console.log('Password: admin123');
    console.log('\n🔗 Login URL: http://localhost:3006/admin/login');
    console.log('\n⚠️  IMPORTANT: Please change the default password after first login!');
    
  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    await client.close();
  }
}

createAdminUser();