const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/estore-siska')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Product schema for migration
const ProductSchema = new mongoose.Schema({
  name: String,
  slug: String,
  sku: String,
  description: String,
  price: Number,
  priceAfterDiscount: Number,
  images: mongoose.Schema.Types.Mixed, // Allow both old and new format
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  tags: [String],
  stock: Number,
  views: Number,
  isPublished: Boolean,
  promo: { type: mongoose.Schema.Types.ObjectId, ref: 'Promo' }
}, { timestamps: true });

const Product = mongoose.model('Product', ProductSchema);

async function migrateProductImages() {
  try {
    console.log('Starting product images migration...');
    
    // Find all products with old image format (array of strings)
    const products = await Product.find({
      $or: [
        { 'images.0': { $type: 'string' } }, // First element is string
        { images: { $type: 'string' } } // Single string
      ]
    });
    
    console.log(`Found ${products.length} products to migrate`);
    
    let migratedCount = 0;
    
    for (const product of products) {
      try {
        let newImages = [];
        
        // Handle different old formats
        if (Array.isArray(product.images)) {
          // Array of strings
          newImages = product.images.map((imageUrl, index) => ({
            url: imageUrl,
            alt: `${product.name} - Image ${index + 1}`,
            isPrimary: index === 0
          }));
        } else if (typeof product.images === 'string') {
          // Single string
          newImages = [{
            url: product.images,
            alt: `${product.name} - Main Image`,
            isPrimary: true
          }];
        }
        
        // Update the product with new image format
        await Product.findByIdAndUpdate(
          product._id,
          { images: newImages },
          { new: true, runValidators: false } // Skip validation during migration
        );
        
        migratedCount++;
        console.log(`Migrated product: ${product.name} (${migratedCount}/${products.length})`);
        
      } catch (error) {
        console.error(`Error migrating product ${product.name}:`, error.message);
      }
    }
    
    console.log(`\nMigration completed! Migrated ${migratedCount} products.`);
    
    // Verify migration
    const remainingOldFormat = await Product.countDocuments({
      $or: [
        { 'images.0': { $type: 'string' } },
        { images: { $type: 'string' } }
      ]
    });
    
    console.log(`Remaining products with old format: ${remainingOldFormat}`);
    
    if (remainingOldFormat === 0) {
      console.log('✅ All products successfully migrated!');
    } else {
      console.log('⚠️  Some products still have old format. Please check manually.');
    }
    
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed.');
  }
}

// Run migration
migrateProductImages();