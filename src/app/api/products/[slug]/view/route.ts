import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Product from '@/models/Product';
import Lead from '@/models/Lead';
import Category from '@/models/Category';
import { getClientIP } from '@/lib/utils';

export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    await dbConnect();

    const { slug } = await params;
    const body = await request.json();
    const { createLead = false } = body;

    // Find and increment product views
    const product = await Product.findOneAndUpdate(
      { slug, isPublished: true },
      { $inc: { views: 1 } },
      { new: true }
    ).populate('category', 'name slug');

    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    // Create lead if requested (when user clicks "Pesan Sekarang")
    if (createLead) {
      const visitorIp = getClientIP(request);
      const userAgent = request.headers.get('user-agent') || '';
      const referrer = request.headers.get('referer') || '';

      // Get WhatsApp template from environment or default
      const waTemplate = process.env.WA_TEMPLATE || 
        'Halo, saya tertarik dengan produk {productName} seharga {price}.\n\nLink Produk: {productUrl}\n\nApakah masih tersedia?';

      // Get product URL from referrer or construct it
      const productUrl = referrer || `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/products/${product.slug}`;

      // Format WhatsApp message
      const waPrefillMessage = waTemplate
        .replace('{productName}', product.name)
        .replace('{price}', new Intl.NumberFormat('id-ID', {
          style: 'currency',
          currency: 'IDR',
          minimumFractionDigits: 0,
        }).format(product.priceAfterDiscount || product.price))
        .replace('{productUrl}', productUrl)
        .replace('{storeName}', process.env.APP_NAME || 'SistaBag');

      // Create lead record
      await Lead.create({
        productId: product._id,
        snapshot: {
          productName: product.name,
          productPrice: product.priceAfterDiscount || product.price,
          productImage: product.images[0] || '',
          categoryName: product.category.name
        },
        waPrefillMessage,
        visitorIp,
        userAgent,
        referrer
      });

      // Return WhatsApp URL
      const waNumber = process.env.WA_NUMBER || '6281234567890';
      const waUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(waPrefillMessage)}`;

      return NextResponse.json({
        success: true,
        data: {
          views: product.views,
          whatsappUrl: waUrl,
          message: waPrefillMessage
        }
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        views: product.views
      }
    });

  } catch (error) {
    console.error('Error updating product views:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update views' },
      { status: 500 }
    );
  }
}