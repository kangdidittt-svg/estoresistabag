require('dotenv').config();
const { MongoClient } = require('mongodb');

// MongoDB connection string - get from environment or use default
const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/estore';

async function checkFeaturedProducts() {
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    console.log('Connection URI:', uri.replace(/\/\/.*@/, '//***:***@')); // Hide credentials
    
    const db = client.db();
    console.log('Database name:', db.databaseName);
    
    // List all collections
    const collections = await db.listCollections().toArray();
    console.log('Available collections:', collections.map(c => c.name));
    
    const collection = db.collection('products');
    
    // Check collection exists and count documents
    const totalCount = await collection.countDocuments();
    console.log(`Total products in collection: ${totalCount}`);
    
    if (totalCount > 0) {
      // Check all products and their isFeatured status
      const allProducts = await collection.find({}, { name: 1, isFeatured: 1, isPublished: 1 }).limit(10).toArray();
      console.log('\nFirst 10 products:');
      allProducts.forEach(p => {
        console.log(`- ${p.name}: isFeatured=${p.isFeatured}, isPublished=${p.isPublished}`);
      });
      
      // Check specifically for featured products
      const featuredProducts = await collection.find({ isFeatured: true }).toArray();
      console.log(`\nFeatured products count: ${featuredProducts.length}`);
      
      if (featuredProducts.length > 0) {
        console.log('Featured products:');
        featuredProducts.forEach(p => {
          console.log(`- ${p.name} (${p._id})`);
        });
      }
      
      // Check for products with isFeatured field missing
      const missingFeatured = await collection.find({ isFeatured: { $exists: false } }).toArray();
      console.log(`\nProducts missing isFeatured field: ${missingFeatured.length}`);
    }
    
  } catch (error) {
    console.error('Error checking products:', error);
  } finally {
    await client.close();
  }
}

checkFeaturedProducts();