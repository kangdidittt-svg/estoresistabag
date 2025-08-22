import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Guide, { IGuide, IGuideStep } from '@/models/Guide';

// GET - Ambil konten panduan
export async function GET() {
  try {
    await dbConnect();
    
    const guide = await Guide.findOne({});
    
    if (!guide) {
      // Return default guide content if none exists
      const defaultGuide = {
        title: "Panduan Cara Memesan Produk",
        content: "Ikuti langkah-langkah mudah berikut untuk memesan produk di SistaBag:",
        steps: [
          {
            title: "1. Pilih Produk",
            description: "Jelajahi koleksi produk kami dan pilih tas yang Anda inginkan. Klik pada produk untuk melihat detail lengkap termasuk gambar, harga, dan deskripsi."
          },
          {
            title: "2. Tambah ke Keranjang",
            description: "Setelah memilih produk, klik tombol 'Tambah ke Keranjang' atau langsung 'Beli Sekarang' jika ingin checkout langsung."
          },
          {
            title: "3. Review Keranjang",
            description: "Periksa kembali produk di keranjang Anda. Pastikan jumlah dan produk yang dipilih sudah sesuai keinginan."
          },
          {
            title: "4. Checkout",
            description: "Klik tombol 'Checkout' untuk melanjutkan ke proses pemesanan. Isi data diri Anda dengan lengkap dan benar."
          },
          {
            title: "5. Konfirmasi via WhatsApp",
            description: "Setelah checkout, Anda akan diarahkan ke WhatsApp untuk konfirmasi pesanan dengan admin kami. Pastikan nomor WhatsApp aktif."
          },
          {
            title: "6. Pembayaran",
            description: "Admin akan memberikan informasi rekening untuk pembayaran. Lakukan transfer sesuai total yang tertera dan kirim bukti pembayaran."
          },
          {
            title: "7. Pengiriman",
            description: "Setelah pembayaran dikonfirmasi, pesanan akan diproses dan dikirim ke alamat Anda. Estimasi pengiriman 2-5 hari kerja."
          }
        ]
      };
      
      return NextResponse.json({
        success: true,
        data: defaultGuide
      });
    }
    
    return NextResponse.json({
      success: true,
      data: guide
    });
  } catch (error) {
    console.error('Error fetching guide:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch guide' },
      { status: 500 }
    );
  }
}

// PUT - Update konten panduan
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, content, steps } = body;
    
    if (!title || !content || !steps || !Array.isArray(steps)) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    await dbConnect();
    
    const guideData = {
      title,
      content,
      steps
    };
    
    const existingGuide = await Guide.findOne({});
    
    if (existingGuide) {
      // Update existing guide
      const result = await Guide.updateOne(
        { _id: existingGuide._id },
        { $set: guideData }
      );
      
      if (result.modifiedCount === 0) {
        return NextResponse.json(
          { success: false, error: 'Failed to update guide' },
          { status: 500 }
        );
      }
    } else {
      // Create new guide
      const newGuide = new Guide(guideData);
      const result = await newGuide.save();
      
      if (!result) {
        return NextResponse.json(
          { success: false, error: 'Failed to create guide' },
          { status: 500 }
        );
      }
    }
    
    return NextResponse.json({
      success: true,
      message: 'Guide updated successfully'
    });
  } catch (error) {
    console.error('Error updating guide:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update guide' },
      { status: 500 }
    );
  }
}