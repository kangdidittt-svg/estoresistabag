import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Product from '@/models/Product';
import Category from '@/models/Category';
import { generateSlug, generateSKU } from '@/lib/utils';

// GET - List all products for admin
export async function GET(request: NextRequest) {
  try {
    await dbConnect();

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

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Execute query
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
    console.error('Error fetching admin products:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

// POST - Create new product
export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
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
      images,
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