const { MongoClient } = require('mongodb');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const sharp = require('sharp');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config({ path: '.env.local' });

// S3 Configuration
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME;
const S3_PREFIX = process.env.S3_PREFIX || 'sistabag';

// Helper functions
function base64ToBuffer(base64String) {
  const matches = base64String.match(/^data:image\/([a-zA-Z]+);base64,(.+)$/);
  if (!matches) {
    throw new Error('Invalid base64 image format');
  }
  return {
    buffer: Buffer.from(matches[2], 'base64'),
    mimeType: `image/${matches[1]}`,
    extension: matches[1] === 'jpeg' ? 'jpg' : matches[1]
  };
}

async function uploadToS3(data, folder) {
  try {
    let buffer, mimeType, extension;
    
    if (typeof data === 'string' && data.startsWith('data:image/')) {
      // Base64 image
      const parsed = base64ToBuffer(data);
      buffer = parsed.buffer;
      mimeType = parsed.mimeType;
      extension = parsed.extension;
    } else if (Buffer.isBuffer(data)) {
      // Buffer data
      buffer = data;
      mimeType = 'image/jpeg'; // Default
      extension = 'jpg';
    } else {
      throw new Error('Unsupported data format');
    }
    
    // Optimize image with Sharp
    const optimizedBuffer = await sharp(buffer)
      .resize(1200, 1200, { 
        fit: 'inside', 
        withoutEnlargement: true 
      })
      .jpeg({ quality: 85 })
      .toBuffer();
    
    // Generate unique filename
    const filename = `${uuidv4()}.jpg`;
    const key = `${S3_PREFIX}/${folder}/${filename}`;
    
    // Upload to S3
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: optimizedBuffer,
      ContentType: 'image/jpeg',
      CacheControl: 'max-age=31536000', // 1 year
    });
    
    await s3Client.send(command);
    
    // Return S3 URL
    return `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${key}`;
    
  } catch (error) {
    console.error('Error uploading to S3:', error);
    throw error;
  }
}

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

// AWS S3 configuration check
if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY || !process.env.AWS_S3_BUCKET_NAME) {
  throw new Error('Please define AWS S3 environment variables in .env.local');
}

async function migrateToS3() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    console.log('🔄 Connecting to MongoDB...');
    await client.connect();
    const db = client.db();
    
    console.log('✅ Connected to MongoDB');
    console.log('🚀 Starting migration to S3...');
    
    // Migrate Products
    await migrateProducts(db);
    
    // Migrate Categories
    await migrateCategories(db);
    
    // Migrate Promos
    await migratePromos(db);
    
    console.log('🎉 Migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await client.close();
  }
}

async function migrateProducts(db) {
  console.log('\n📦 Migrating Products...');
  
  const products = await db.collection('products').find({}).toArray();
  console.log(`Found ${products.length} products to migrate`);
  
  let migratedCount = 0;
  let skippedCount = 0;
  
  for (const product of products) {
    try {
      let hasChanges = false;
      const updatedImages = [];
      
      if (product.images && Array.isArray(product.images)) {
        for (const image of product.images) {
          if (typeof image === 'string') {
            // Handle old format (string URL)
            if (image.startsWith('data:image/')) {
              // Base64 image - upload to S3
              console.log(`  📤 Uploading base64 image for product: ${product.name}`);
              const s3Url = await uploadToS3(image, 'products');
              updatedImages.push({
                url: s3Url,
                alt: product.name || 'Product Image',
                isPrimary: updatedImages.length === 0
              });
              hasChanges = true;
            } else if (image.startsWith('/uploads/')) {
              // Local file - keep as is for now (could be migrated later)
              updatedImages.push({
                url: image,
                alt: product.name || 'Product Image',
                isPrimary: updatedImages.length === 0
              });
            } else {
              // External URL - keep as is
              updatedImages.push({
                url: image,
                alt: product.name || 'Product Image',
                isPrimary: updatedImages.length === 0
              });
            }
          } else if (typeof image === 'object' && image.url) {
            // Handle new format (object)
            if (image.url.startsWith('data:image/')) {
              // Base64 image - upload to S3
              console.log(`  📤 Uploading base64 image for product: ${product.name}`);
              const s3Url = await uploadToS3(image.url, 'products');
              updatedImages.push({
                ...image,
                url: s3Url
              });
              hasChanges = true;
            } else {
              // Keep existing object format
              updatedImages.push(image);
            }
          }
        }
      }
      
      if (hasChanges) {
        await db.collection('products').updateOne(
          { _id: product._id },
          { $set: { images: updatedImages } }
        );
        migratedCount++;
        console.log(`  ✅ Migrated product: ${product.name}`);
      } else {
        skippedCount++;
      }
      
    } catch (error) {
      console.error(`  ❌ Error migrating product ${product.name}:`, error.message);
    }
  }
  
  console.log(`📦 Products migration completed: ${migratedCount} migrated, ${skippedCount} skipped`);
}

async function migrateCategories(db) {
  console.log('\n📂 Migrating Categories...');
  
  const categories = await db.collection('categories').find({}).toArray();
  console.log(`Found ${categories.length} categories to migrate`);
  
  let migratedCount = 0;
  let skippedCount = 0;
  
  for (const category of categories) {
    try {
      if (category.image && category.image.startsWith('data:image/')) {
        console.log(`  📤 Uploading base64 image for category: ${category.name}`);
        const s3Url = await uploadToS3(category.image, 'categories');
        
        await db.collection('categories').updateOne(
          { _id: category._id },
          { $set: { image: s3Url } }
        );
        
        migratedCount++;
        console.log(`  ✅ Migrated category: ${category.name}`);
      } else {
        skippedCount++;
      }
    } catch (error) {
      console.error(`  ❌ Error migrating category ${category.name}:`, error.message);
    }
  }
  
  console.log(`📂 Categories migration completed: ${migratedCount} migrated, ${skippedCount} skipped`);
}

async function migratePromos(db) {
  console.log('\n🎯 Migrating Promos...');
  
  const promos = await db.collection('promos').find({}).toArray();
  console.log(`Found ${promos.length} promos to migrate`);
  
  let migratedCount = 0;
  let skippedCount = 0;
  
  for (const promo of promos) {
    try {
      if (promo.image && promo.image.startsWith('data:image/')) {
        console.log(`  📤 Uploading base64 image for promo: ${promo.title}`);
        const s3Url = await uploadToS3(promo.image, 'promos');
        
        await db.collection('promos').updateOne(
          { _id: promo._id },
          { $set: { image: s3Url } }
        );
        
        migratedCount++;
        console.log(`  ✅ Migrated promo: ${promo.title}`);
      } else {
        skippedCount++;
      }
    } catch (error) {
      console.error(`  ❌ Error migrating promo ${promo.title}:`, error.message);
    }
  }
  
  console.log(`🎯 Promos migration completed: ${migratedCount} migrated, ${skippedCount} skipped`);
}

// Run migration
if (require.main === module) {
  migrateToS3();
}

module.exports = { migrateToS3 };