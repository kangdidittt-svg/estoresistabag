require('dotenv').config({ path: '.env.local' });
const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');

const MONGODB_URI = process.env.MONGODB_URI;
const DEFAULT_ADMIN_PASSWORD = 'admin123';

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI is not defined in environment variables');
  process.exit(1);
}

async function setupAdmin() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    console.log('🔗 Connecting to MongoDB...');
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db();
    
    // Check if admin config already exists
    const existingAdmin = await db.collection('adminconfigs').findOne({});
    
    if (existingAdmin) {
      console.log('⚠️  Admin account already exists!');
      console.log('📝 Default admin password: admin123');
      console.log('🔐 You can login at: http://localhost:3006/admin/login');
      return;
    }
    
    // Hash the default password
    console.log('🔐 Creating admin account...');
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(DEFAULT_ADMIN_PASSWORD, saltRounds);
    
    // Create admin config
    const adminConfig = {
      adminSecretHash: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Insert admin config
    const result = await db.collection('adminconfigs').insertOne(adminConfig);
    
    if (result.insertedId) {
      console.log('✅ Admin account created successfully!');
      console.log('');
      console.log('🎉 ADMIN LOGIN CREDENTIALS:');
      console.log('📧 URL: http://localhost:3006/admin/login');
      console.log('🔑 Password: admin123');
      console.log('');
      console.log('⚠️  IMPORTANT: Please change this password after first login!');
      console.log('💡 You can update the password by modifying the AdminConfig in the database.');
    } else {
      console.error('❌ Failed to create admin account');
    }
    
  } catch (error) {
    console.error('❌ Error setting up admin:', error);
  } finally {
    await client.close();
    console.log('🔌 Database connection closed');
  }
}

// Run the setup
setupAdmin();