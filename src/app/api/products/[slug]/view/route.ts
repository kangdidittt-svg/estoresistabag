import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Product from '@/models/Product';
import Lead from '@/models/Lead';
import Category from '@/models/Category';
import AppConfig from '@/models/AppConfig';
import { getClientIP } from '@/lib/utils';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
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

      // Get WhatsApp number from app config
      let appConfig;
      try {
        appConfig = await AppConfig.findOne();
      } catch (error) {
        console.error('Error fetching app config:', error);
      }
      
      const waNumber = appConfig?.whatsappNumber || '6281234567890';
      const waTemplate = process.env.WHATSAPP_TEMPLATE || 
        `Halo, saya tertarik dengan produk:\n\n*{productName}*\nHarga: {productPrice}\nLink: {productUrl}\n\nBisakah saya mendapatkan informasi lebih lanjut?`;
      
      // Get product URL
      const productUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/products/${product.slug}`;
      
      // Format WhatsApp message
      const waPrefillMessage = waTemplate
        .replace('{productName}', product.name)
        .replace('{productPrice}', `Rp ${(product.priceAfterDiscount || product.price).toLocaleString('id-ID')}`)
        .replace('{productUrl}', productUrl);

      // Create lead record
      await Lead.create({
        productId: product._id,
        snapshot: {
          productName: product.name,
          productPrice: product.priceAfterDiscount || product.price,
          productImage: product.images[0]?.url || '',
          categoryName: product.category.name
        },
        waPrefillMessage,
        visitorIp,
        userAgent,
        referrer
      });

      // Return WhatsApp URL
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