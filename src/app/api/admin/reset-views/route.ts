import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Product from '@/models/Product';
import { verifyAdminAuth } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    const authResult = await verifyAdminAuth(request);
    if (!authResult.success) {
      return NextResponse.json(
        { success: false, error: authResult.error },
        { status: 401 }
      );
    }

    await connectDB();

    // Reset all product views to 0
    const result = await Product.updateMany(
      {}, // Empty filter to match all products
      { $set: { views: 0 } }
    );

    return NextResponse.json({
      success: true,
      message: `Successfully reset view count for ${result.modifiedCount} products`,
      data: {
        modifiedCount: result.modifiedCount
      }
    });

  } catch (error) {
    console.error('Error resetting product views:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to reset product views' },
      { status: 500 }
    );
  }
}