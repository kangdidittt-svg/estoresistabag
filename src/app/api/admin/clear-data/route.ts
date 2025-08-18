import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Product from '@/models/Product';
import Promo from '@/models/Promo';
import { verifyAdminToken } from '@/lib/auth';
import fs from 'fs';
import path from 'path';

// DELETE - Bersihkan semua data produk dan promo
export async function DELETE(request: NextRequest) {
  try {
    const adminData = await verifyAdminToken(request);
    if (!adminData) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await dbConnect();

    // Hitung jumlah data sebelum dihapus
    const productCount = await Product.countDocuments();
    const promoCount = await Promo.countDocuments();

    // Hapus semua produk
    await Product.deleteMany({});
    
    // Hapus semua promo
    await Promo.deleteMany({});

    // Bersihkan folder upload produk dan promo
    try {
      const productUploadPath = path.join(process.cwd(), 'public', 'uploads', 'products');
      const promoUploadPath = path.join(process.cwd(), 'public', 'uploads', 'promos');
      
      // Hapus semua file di folder products (kecuali .gitkeep jika ada)
      if (fs.existsSync(productUploadPath)) {
        const productFiles = fs.readdirSync(productUploadPath);
        for (const file of productFiles) {
          if (file !== '.gitkeep') {
            fs.unlinkSync(path.join(productUploadPath, file));
          }
        }
      }
      
      // Hapus semua file di folder promos (kecuali .gitkeep jika ada)
      if (fs.existsSync(promoUploadPath)) {
        const promoFiles = fs.readdirSync(promoUploadPath);
        for (const file of promoFiles) {
          if (file !== '.gitkeep') {
            fs.unlinkSync(path.join(promoUploadPath, file));
          }
        }
      }
    } catch (fileError) {
      console.error('Error cleaning upload folders:', fileError);
      // Lanjutkan meskipun ada error saat menghapus file
    }

    return NextResponse.json({
      success: true,
      message: `Berhasil menghapus ${productCount} produk dan ${promoCount} promo beserta file-filenya`,
      data: {
        deletedProducts: productCount,
        deletedPromos: promoCount
      }
    });
  } catch (error) {
    console.error('Error clearing data:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}