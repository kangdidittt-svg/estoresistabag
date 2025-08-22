import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Product from '@/models/Product';
import Category from '@/models/Category';
import { generateSlug, generateSKU } from '@/lib/utils';
import { uploadToS3 } from '@/lib/s3';
import { uploadImageLocally, isS3Configured } from '@/lib/upload';

// Runtime configuration for handling larger payloads
export const runtime = 'nodejs';
export const maxDuration = 30;
export const dynamic = 'force-dynamic';

// API Route configuration for larger payloads
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
    responseLimit: '10mb',
  },
};

// GET - List all products for admin
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 GET /api/admin/products - Starting request');
    console.log('📊 Environment check:', {
      MONGODB_URI: process.env.MONGODB_URI ? 'Set' : 'Missing',
      NODE_ENV: process.env.NODE_ENV
    });
    
    console.log('🔗 Connecting to database...');
    await dbConnect();
    console.log('✅ Database connected successfully');

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search');
    const category = searchParams.get('category');
    const status = searchParams.get('status'); // published, unpublished, all

    // Build query
    const query: any = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    if (category) {
      query.category = category;
    }

    if (status === 'published') {
      query.isPublished = true;
    } else if (status === 'unpublished') {
      query.isPublished = false;
    }

    console.log('🔍 Query parameters:', { page, limit, search, category, status });
    console.log('🔍 MongoDB query:', query);

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Execute query
    console.log('🔍 Executing database query...');
    const [products, totalProducts] = await Promise.all([
      Product.find(query)
        .populate('category', 'name slug')
        .populate('promo', 'title type value')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Product.countDocuments(query)
    ]);
    
    console.log('✅ Query executed successfully:', {
      productsFound: products.length,
      totalProducts,
      skip,
      limit
    });

    const totalPages = Math.ceil(totalProducts / limit);

    return NextResponse.json({
      success: true,
      data: {
        products,
        pagination: {
          currentPage: page,
          totalPages,
          totalProducts,
          limit
        }
      }
    });

  } catch (error) {
    console.error('❌ Error in GET /api/admin/products:', error);
    console.error('❌ Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined
    });
    return NextResponse.json(
      { success: false, error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

// POST - Create new product
export async function POST(request: NextRequest) {
  try {
    console.log('🔍 POST /api/admin/products - Starting request');
    console.log('📊 Environment check:', {
      MONGODB_URI: process.env.MONGODB_URI ? 'Set' : 'Missing',
      NODE_ENV: process.env.NODE_ENV
    });
    
    console.log('🔗 Connecting to database...');
    await dbConnect();
    console.log('✅ Database connected successfully');

    // Parse FormData
    const formData = await request.formData();
    
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const price = parseFloat(formData.get('price') as string);
    const priceAfterDiscount = formData.get('priceAfterDiscount') ? parseFloat(formData.get('priceAfterDiscount') as string) : undefined;
    const category = formData.get('category') as string;
    const stock = parseInt(formData.get('stock') as string) || 0;
    const isPublished = formData.get('isPublished') === 'true';
    const promo = formData.get('promo') as string || undefined;
    const tagsString = formData.get('tags') as string;
    const tags = tagsString ? tagsString.split(',').map(tag => tag.trim()).filter(tag => tag) : [];
    
    // Get image files
    const imageFiles = formData.getAll('images') as File[];

    // Validation
    if (!name || !description || !price || !category || !imageFiles || imageFiles.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Semua field wajib diisi dan minimal satu gambar diperlukan' },
        { status: 400 }
      );
    }

    console.log('📝 Processing images...');
    const processedImages = [];
    const useS3 = isS3Configured();
    console.log(`📤 Using ${useS3 ? 'S3' : 'local'} upload method`);
    
    for (let i = 0; i < imageFiles.length; i++) {
      const file = imageFiles[i];
      
      if (file && file.size > 0) {
        console.log(`📤 Uploading image ${i + 1}...`);
        try {
          let imageUrl: string;
          
          if (useS3) {
            // Use S3 upload
            const buffer = await file.arrayBuffer();
            const base64 = Buffer.from(buffer).toString('base64');
            const mimeType = file.type;
            const base64String = `data:${mimeType};base64,${base64}`;
            imageUrl = await uploadToS3(base64String, 'products');
          } else {
            // Use local upload as fallback
            imageUrl = await uploadImageLocally(file, 'products');
          }
          
          processedImages.push({
            url: imageUrl,
            alt: `${name} - Image ${i + 1}`,
            isPrimary: i === 0
          });
          console.log(`✅ Image ${i + 1} uploaded successfully:`, imageUrl);
        } catch (uploadError) {
          console.error(`❌ Failed to upload image ${i + 1}:`, uploadError);
          return NextResponse.json(
            { success: false, error: `Gagal mengupload gambar ${i + 1}` },
            { status: 500 }
          );
        }
      }
    }

    // Check if category exists
    const categoryDoc = await Category.findById(category);
    if (!categoryDoc) {
      return NextResponse.json(
        { success: false, error: 'Category not found' },
        { status: 400 }
      );
    }

    // Generate slug and SKU
    const slug = generateSlug(name);
    const sku = generateSKU(name, categoryDoc.name);

    // Check if slug already exists
    const existingProduct = await Product.findOne({ slug });
    if (existingProduct) {
      return NextResponse.json(
        { success: false, error: 'Product with this name already exists' },
        { status: 400 }
      );
    }

    // Create product
    const product = await Product.create({
      name,
      slug,
      sku,
      description,
      price,
      priceAfterDiscount: priceAfterDiscount || undefined,
      images: processedImages,
      category,
      tags: tags || [],
      stock: stock || 0,
      isPublished: isPublished !== false,
      promo: promo || undefined
    });

    // Populate the created product
    await product.populate('category', 'name slug');
    await product.populate('promo', 'title type value');

    return NextResponse.json({
      success: true,
      data: product,
      message: 'Product created successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create product' },
      { status: 500 }
    );
  }
}