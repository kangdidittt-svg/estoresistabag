require('dotenv').config();
const { MongoClient } = require('mongodb');

// MongoDB connection string
const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/estore';

async function updateProductsWithFeaturedField() {
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db();
    const collection = db.collection('products');
    
    // Update all products that don't have isFeatured field
    const result = await collection.updateMany(
      { isFeatured: { $exists: false } },
      { $set: { isFeatured: false } }
    );
    
    console.log(`Updated ${result.modifiedCount} products with isFeatured field`);
    
    // Mark first 3 products as featured
    const products = await collection.find({ isPublished: true }).limit(3).toArray();
    
    if (products.length > 0) {
      const productIds = products.map(p => p._id);
      const featuredResult = await collection.updateMany(
        { _id: { $in: productIds } },
        { $set: { isFeatured: true } }
      );
      
      console.log(`Marked ${featuredResult.modifiedCount} products as featured:`);
      products.forEach(p => console.log(`- ${p.name} (${p._id})`));
    }
    
  } catch (error) {
    console.error('Error updating products:', error);
  } finally {
    await client.close();
  }
}

updateProductsWithFeaturedField();