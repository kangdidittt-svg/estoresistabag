import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Product from '@/models/Product';
import Category from '@/models/Category';
import Promo from '@/models/Promo';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    await dbConnect();

    const { slug } = await params;

    // Find product by slug
    const product = await Product.findOne({ slug, isPublished: true })
      .populate('category', 'name slug description')
      .populate('promo')
      .lean();

    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    // Get related products from the same category
    const relatedProducts = await Product.find({
      category: (product as any).category,
      _id: { $ne: (product as any)._id },
      isPublished: true
    })
      .populate('category', 'name slug')
      .populate('promo')
      .limit(4)
      .lean();

    return NextResponse.json({
      success: true,
      data: {
        product,
        relatedProducts
      }
    });

  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch product' },
      { status: 500 }
    );
  }
}