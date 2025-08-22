import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Category from '@/models/Category';
import Product from '@/models/Product';
import { generateSlug } from '@/lib/utils';
import { uploadToS3 } from '@/lib/s3';

// GET - List all categories for admin
export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const withProductCount = searchParams.get('withProductCount') === 'true';

    const categories = await Category.find({})
      .sort({ createdAt: -1 })
      .lean();

    if (withProductCount) {
      const categoriesWithCount = await Promise.all(
        categories.map(async (category) => {
          const productCount = await Product.countDocuments({
            category: category._id
          });
          return {
            ...category,
            productCount
          };
        })
      );

      return NextResponse.json({
        success: true,
        data: categoriesWithCount
      });
    }

    return NextResponse.json({
      success: true,
      data: categories
    });

  } catch (error) {
    console.error('Error fetching admin categories:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}

// POST - Create new category
export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const { name, description, image } = body;

    // Validation
    if (!name) {
      return NextResponse.json(
        { success: false, error: 'Category name is required' },
        { status: 400 }
      );
    }

    // Generate slug
    const slug = generateSlug(name);

    // Check if slug already exists
    const existingCategory = await Category.findOne({ slug });
    if (existingCategory) {
      return NextResponse.json(
        { success: false, error: 'Category with this name already exists' },
        { status: 400 }
      );
    }

    // Process image if it's base64
    let finalImageUrl = image || '';
    if (image && image.startsWith('data:image/')) {
      try {
        finalImageUrl = await uploadToS3(image, 'categories');
      } catch (error) {
        console.error('Error uploading image to S3:', error);
        return NextResponse.json(
          { success: false, error: 'Failed to upload image to S3' },
          { status: 500 }
        );
      }
    }

    // Create category
    const category = await Category.create({
      name,
      slug,
      description: description || '',
      image: finalImageUrl
    });

    return NextResponse.json({
      success: true,
      data: category,
      message: 'Category created successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create category' },
      { status: 500 }
    );
  }
}