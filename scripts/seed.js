const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

// Sample data for seeding
const categories = [
  {
    name: 'Tas Ransel',
    slug: 'tas-ransel',
    description: 'Koleksi tas ransel wanita yang stylish dan fungsional untuk aktivitas sehari-hari',
    image: '/images/categories/backpack.jpg',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'Tas Punggung',
    slug: 'tas-punggung',
    description: 'Tas punggung berkualitas tinggi dengan desain modern dan nyaman digunakan',
    image: '/images/categories/shoulder-bag.jpg',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'Tas Pinggang',
    slug: 'tas-pinggang',
    description: 'Tas pinggang praktis dan trendy untuk gaya hidup aktif',
    image: '/images/categories/waist-bag.jpg',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'Tas Selempang',
    slug: 'tas-selempang',
    description: 'Tas selempang elegan dengan berbagai ukuran dan warna menarik',
    image: '/images/categories/crossbody-bag.jpg',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'Tas Tote',
    slug: 'tas-tote',
    description: 'Tas tote spacious dan stylish untuk kebutuhan belanja dan kerja',
    image: '/images/categories/tote-bag.jpg',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'Tas Clutch',
    slug: 'tas-clutch',
    description: 'Tas clutch mewah untuk acara formal dan pesta',
    image: '/images/categories/clutch-bag.jpg',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

const products = [
  // Tas Ransel
  {
    name: 'Ransel Kulit Premium Coklat',
    slug: 'ransel-kulit-premium-coklat',
    sku: 'RKP001',
    description: 'Tas ransel kulit asli dengan desain minimalis dan elegan. Dilengkapi dengan kompartemen laptop dan berbagai kantong penyimpanan.',
    price: 450000,
    priceAfterDiscount: 380000,
    images: ['/placeholder-bag.jpg', '/placeholder-bag.jpg'],
    tags: ['ransel', 'kulit', 'premium', 'laptop'],
    stock: 15,
    views: 245,
    isPublished: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'Ransel Canvas Hitam Modern',
    slug: 'ransel-canvas-hitam-modern',
    sku: 'RCH002',
    description: 'Tas ransel canvas berkualitas tinggi dengan desain modern dan praktis. Cocok untuk kuliah dan kerja.',
    price: 280000,
    images: ['/placeholder-bag.jpg', '/placeholder-bag.jpg'],
    tags: ['ransel', 'canvas', 'modern', 'kuliah'],
    stock: 22,
    views: 189,
    isPublished: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'Ransel Mini Pink Cute',
    slug: 'ransel-mini-pink-cute',
    sku: 'RMP003',
    description: 'Tas ransel mini dengan desain cute dan warna pink yang manis. Perfect untuk hangout dan jalan-jalan.',
    price: 180000,
    priceAfterDiscount: 150000,
    images: ['/placeholder-bag.jpg', '/placeholder-bag.jpg'],
    tags: ['ransel', 'mini', 'pink', 'cute'],
    stock: 30,
    views: 156,
    isPublished: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  
  // Tas Punggung
  {
    name: 'Shoulder Bag Kulit Mewah',
    slug: 'shoulder-bag-kulit-mewah',
    sku: 'SBK004',
    description: 'Tas punggung kulit mewah dengan detail hardware emas. Sempurna untuk acara formal dan bisnis.',
    price: 650000,
    images: ['/placeholder-bag.jpg', '/placeholder-bag.jpg'],
    tags: ['punggung', 'kulit', 'mewah', 'formal'],
    stock: 8,
    views: 312,
    isPublished: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'Tas Punggung Casual Denim',
    slug: 'tas-punggung-casual-denim',
    sku: 'TPC005',
    description: 'Tas punggung casual dengan bahan denim berkualitas. Cocok untuk gaya santai sehari-hari.',
    price: 220000,
    priceAfterDiscount: 180000,
    images: ['/placeholder-bag.jpg', '/placeholder-bag.jpg'],
    tags: ['punggung', 'casual', 'denim', 'santai'],
    stock: 18,
    views: 98,
    isPublished: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  
  // Tas Pinggang
  {
    name: 'Waist Bag Sport Active',
    slug: 'waist-bag-sport-active',
    sku: 'WBS008',
    description: 'Tas pinggang untuk aktivitas olahraga dan outdoor. Tahan air dan sangat praktis.',
    price: 120000,
    images: ['/placeholder-bag.jpg', '/placeholder-bag.jpg'],
    tags: ['pinggang', 'sport', 'outdoor', 'waterproof'],
    stock: 35,
    views: 76,
    isPublished: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'Belt Bag Kulit Stylish',
    slug: 'belt-bag-kulit-stylish',
    sku: 'BBK009',
    description: 'Tas pinggang kulit dengan desain stylish dan modern. Cocok untuk fashion statement.',
    price: 320000,
    priceAfterDiscount: 280000,
    images: ['/placeholder-bag.jpg', '/placeholder-bag.jpg'],
    tags: ['pinggang', 'kulit', 'stylish', 'fashion'],
    stock: 12,
    views: 134,
    isPublished: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  
  // Tas Selempang
  {
    name: 'Crossbody Bag Vintage',
    slug: 'crossbody-bag-vintage',
    sku: 'CBV006',
    description: 'Tas selempang dengan gaya vintage yang timeless. Cocok untuk berbagai outfit dan acara.',
    price: 380000,
    images: ['/placeholder-bag.jpg', '/placeholder-bag.jpg'],
    tags: ['selempang', 'vintage', 'crossbody', 'timeless'],
    stock: 14,
    views: 203,
    isPublished: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'Sling Bag Minimalis Putih',
    slug: 'sling-bag-minimalis-putih',
    sku: 'SBM007',
    description: 'Tas selempang minimalis dengan warna putih yang clean. Perfect untuk gaya minimalist.',
    price: 250000,
    priceAfterDiscount: 200000,
    images: ['/placeholder-bag.jpg', '/placeholder-bag.jpg'],
    tags: ['selempang', 'minimalis', 'putih', 'clean'],
    stock: 20,
    views: 167,
    isPublished: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  
  // Tas Tote
  {
    name: 'Tote Bag Canvas Besar',
    slug: 'tote-bag-canvas-besar',
    sku: 'TBC010',
    description: 'Tas tote canvas berukuran besar untuk kebutuhan belanja dan travel. Sangat spacious dan kuat.',
    price: 180000,
    images: ['/placeholder-bag.jpg', '/placeholder-bag.jpg'],
    tags: ['tote', 'canvas', 'besar', 'travel'],
    stock: 25,
    views: 89,
    isPublished: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'Tote Bag Kulit Elegan',
    slug: 'tote-bag-kulit-elegan',
    sku: 'TBK011',
    description: 'Tas tote kulit dengan desain elegan untuk kebutuhan kerja dan formal. Dilengkapi dengan organizer dalam.',
    price: 580000,
    priceAfterDiscount: 520000,
    images: ['/placeholder-bag.jpg', '/placeholder-bag.jpg'],
    tags: ['tote', 'kulit', 'elegan', 'formal'],
    stock: 10,
    views: 278,
    isPublished: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  
  // Tas Clutch
  {
    name: 'Clutch Pesta Glitter Emas',
    slug: 'clutch-pesta-glitter-emas',
    sku: 'CPG012',
    description: 'Tas clutch dengan glitter emas untuk acara pesta dan formal. Dilengkapi dengan rantai panjang.',
    price: 280000,
    images: ['/placeholder-bag.jpg', '/placeholder-bag.jpg'],
    tags: ['clutch', 'pesta', 'glitter', 'formal'],
    stock: 6,
    views: 145,
    isPublished: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'Clutch Kulit Minimalis',
    slug: 'clutch-kulit-minimalis',
    sku: 'CKM013',
    description: 'Tas clutch kulit dengan desain minimalis yang versatile. Bisa digunakan untuk berbagai acara.',
    price: 350000,
    priceAfterDiscount: 300000,
    images: ['/placeholder-bag.jpg', '/placeholder-bag.jpg'],
    tags: ['clutch', 'kulit', 'minimalis', 'versatile'],
    stock: 8,
    views: 112,
    isPublished: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

const promos = [
  {
    title: 'Flash Sale Weekend',
    description: 'Diskon besar-besaran untuk semua produk tas ransel dan tas punggung. Jangan sampai terlewat!',
    type: 'percentage',
    value: 25,
    startDate: new Date('2024-01-15'),
    endDate: new Date('2024-12-31'),
    isActive: true,
    minPurchase: 200000,
    maxDiscount: 150000,
    usageLimit: 100,
    usageCount: 23,
    image: '/images/promos/flash-sale.jpg',
    applicableProducts: [], // Will be populated after products are inserted
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    title: 'Promo Tas Kulit Premium',
    description: 'Potongan harga khusus untuk semua produk tas kulit premium. Kualitas terbaik dengan harga terjangkau.',
    type: 'fixed',
    value: 100000,
    startDate: new Date('2024-01-10'),
    endDate: new Date('2024-12-25'),
    isActive: true,
    minPurchase: 400000,
    usageLimit: 50,
    usageCount: 12,
    image: '/images/promos/leather-promo.jpg',
    applicableProducts: [],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    title: 'Diskon Tas Mini & Clutch',
    description: 'Diskon spesial untuk koleksi tas mini dan clutch. Perfect untuk acara formal dan kasual.',
    type: 'percentage',
    value: 20,
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-06-30'),
    isActive: false,
    minPurchase: 150000,
    maxDiscount: 80000,
    usageLimit: 75,
    usageCount: 45,
    image: '/images/promos/mini-clutch.jpg',
    applicableProducts: [],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    title: 'Bundle Promo 2+1',
    description: 'Beli 2 tas apapun, gratis 1 tas pilihan. Hemat lebih banyak dengan promo bundle terbaik.',
    type: 'percentage',
    value: 30,
    startDate: new Date('2024-02-01'),
    endDate: new Date('2024-12-31'),
    isActive: true,
    minPurchase: 500000,
    maxDiscount: 200000,
    usageLimit: 30,
    usageCount: 8,
    image: '/images/promos/bundle-promo.jpg',
    applicableProducts: [],
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

async function seedDatabase() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db();
    
    // Clear existing data
    console.log('Clearing existing data...');
    await db.collection('categories').deleteMany({});
    await db.collection('products').deleteMany({});
    await db.collection('promos').deleteMany({});
    
    // Insert categories
    console.log('Inserting categories...');
    const categoryResult = await db.collection('categories').insertMany(categories);
    console.log(`Inserted ${categoryResult.insertedCount} categories`);
    
    // Get category IDs for products
    const insertedCategories = await db.collection('categories').find({}).toArray();
    const categoryMap = {};
    insertedCategories.forEach(cat => {
      categoryMap[cat.slug] = cat._id;
    });
    
    // Assign categories to products
    const productsWithCategories = products.map(product => {
      let categoryId;
      if (product.slug.includes('ransel')) {
        categoryId = categoryMap['tas-ransel'];
      } else if (product.slug.includes('shoulder') || product.slug.includes('punggung')) {
        categoryId = categoryMap['tas-punggung'];
      } else if (product.slug.includes('waist') || product.slug.includes('belt')) {
        categoryId = categoryMap['tas-pinggang'];
      } else if (product.slug.includes('crossbody') || product.slug.includes('sling')) {
        categoryId = categoryMap['tas-selempang'];
      } else if (product.slug.includes('tote')) {
        categoryId = categoryMap['tas-tote'];
      } else if (product.slug.includes('clutch')) {
        categoryId = categoryMap['tas-clutch'];
      } else {
        categoryId = categoryMap['tas-ransel']; // default
      }
      
      return {
        ...product,
        category: categoryId
      };
    });
    
    // Insert products
    console.log('Inserting products...');
    const productResult = await db.collection('products').insertMany(productsWithCategories);
    console.log(`Inserted ${productResult.insertedCount} products`);
    
    // Get product IDs for promos
    const insertedProducts = await db.collection('products').find({}).toArray();
    
    // Assign products to promos
    const promosWithProducts = promos.map((promo, index) => {
      let applicableProducts = [];
      
      if (index === 0) { // Flash Sale Weekend - ransel & punggung
        applicableProducts = insertedProducts
          .filter(p => p.slug.includes('ransel') || p.slug.includes('punggung'))
          .map(p => p._id);
      } else if (index === 1) { // Promo Tas Kulit Premium
        applicableProducts = insertedProducts
          .filter(p => p.name.toLowerCase().includes('kulit'))
          .map(p => p._id);
      } else if (index === 2) { // Diskon Tas Mini & Clutch
        applicableProducts = insertedProducts
          .filter(p => p.slug.includes('mini') || p.slug.includes('clutch'))
          .map(p => p._id);
      } else { // Bundle Promo 2+1 - all products
        applicableProducts = insertedProducts.map(p => p._id);
      }
      
      return {
        ...promo,
        applicableProducts
      };
    });
    
    // Insert promos
    console.log('Inserting promos...');
    const promoResult = await db.collection('promos').insertMany(promosWithProducts);
    console.log(`Inserted ${promoResult.insertedCount} promos`);
    
    // Update products with promo information
    console.log('Updating products with promo information...');
    const activePromos = await db.collection('promos').find({ isActive: true }).toArray();
    
    for (const promo of activePromos) {
      for (const productId of promo.applicableProducts) {
        await db.collection('products').updateOne(
          { _id: productId },
          { 
            $set: { 
              promo: promo._id,
              updatedAt: new Date()
            }
          }
        );
      }
    }
    
    console.log('\n✅ Database seeding completed successfully!');
    console.log(`📊 Summary:`);
    console.log(`   - Categories: ${categoryResult.insertedCount}`);
    console.log(`   - Products: ${productResult.insertedCount}`);
    console.log(`   - Promos: ${promoResult.insertedCount}`);
    console.log(`\n🎉 Your SistaBag e-commerce database is ready!`);
    
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await client.close();
  }
}

// Run the seeder
seedDatabase();