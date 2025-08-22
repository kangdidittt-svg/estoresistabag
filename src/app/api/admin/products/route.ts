import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Product from '@/models/Product';
import Category from '@/models/Category';
import { generateSlug, generateSKU } from '@/lib/utils';
import { uploadToS3 } from '@/lib/s3';

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

    // Check content length
    const contentLength = request.headers.get('content-length');
    if (contentLength && parseInt(contentLength) > 10 * 1024 * 1024) { // 10MB
      return NextResponse.json(
        { success: false, error: 'Request payload too large. Maximum size is 10MB.' },
        { status: 413 }
      );
    }

    let body;
    try {
      body = await request.json();
    } catch (jsonError) {
      return NextResponse.json(
        { success: false, error: 'Invalid JSON payload or payload too large' },
        { status: 400 }
      );
    }

    const {
      name,
      description,
      price,
      priceAfterDiscount,
      images,
      category,
      tags,
      stock,
      isPublished,
      promo
    } = body;

    // Validation
    if (!name || !description || !price || !category || !images || images.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Process images - upload base64 to S3 or keep existing URLs
    const formattedImages = [];
    
    for (let index = 0; index < images.length; index++) {
      const image = images[index];
      let imageUrl: string;
      let altText: string;
      
      if (typeof image === 'string') {
        // Check if it's a base64 image
        if (image.startsWith('data:image/')) {
          try {
            // Upload base64 to S3
            imageUrl = await uploadToS3(image, 'products');
            altText = `${name} - Gambar ${index + 1}`;
          } catch (error) {
            console.error('Error uploading image to S3:', error);
            return NextResponse.json(
              { success: false, error: 'Failed to upload image' },
              { status: 500 }
            );
          }
        } else {
          // It's already a URL
          imageUrl = image;
          altText = `${name} - Gambar ${index + 1}`;
        }
      } else {
        // It's an object with url and alt
        if (image.url && image.url.startsWith('data:image/')) {
          try {
            // Upload base64 to S3
            imageUrl = await uploadToS3(image.url, 'products');
            altText = image.alt || `${name} - Gambar ${index + 1}`;
          } catch (error) {
            console.error('Error uploading image to S3:', error);
            return NextResponse.json(
              { success: false, error: 'Failed to upload image' },
              { status: 500 }
            );
          }
        } else {
          // It's already a URL
          imageUrl = image.url;
          altText = image.alt || `${name} - Gambar ${index + 1}`;
        }
      }
      
      formattedImages.push({
        url: imageUrl,
        alt: altText,
        isPrimary: index === 0
      });
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
      images: formattedImages,
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