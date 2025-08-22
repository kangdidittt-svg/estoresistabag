import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Product from '@/models/Product';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();

    const { id } = await params;
    const { isFeatured } = await request.json();

    // Check if product exists
    const existingProduct = await Product.findById(id);
    if (!existingProduct) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    // Update only the isFeatured field
    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { isFeatured: isFeatured },
      { new: true, runValidators: true }
    )
      .populate('category', 'name slug')
      .populate('promo', 'title type value');

    return NextResponse.json({
      success: true,
      data: updatedProduct,
      message: `Product ${isFeatured ? 'marked as featured' : 'unmarked as featured'} successfully`
    });

  } catch (error) {
    console.error('Error toggling featured status:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to toggle featured status' },
      { status: 500 }
    );
  }
}