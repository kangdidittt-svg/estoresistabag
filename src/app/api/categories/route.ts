import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Category from '@/models/Category';
import Product from '@/models/Product';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const withProductCount = searchParams.get('withProductCount') === 'true';

    // Get all categories
    const categories = await Category.find({})
      .sort({ name: 1 })
      .lean();

    // Add product count if requested
    if (withProductCount) {
      const categoriesWithCount = await Promise.all(
        categories.map(async (category) => {
          const productCount = await Product.countDocuments({
            category: category._id,
            isPublished: true
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
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}