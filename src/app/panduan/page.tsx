'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, ShoppingCart, CreditCard, MessageCircle, CheckCircle, Package, Truck } from 'lucide-react';
import Navigation from '@/components/Navigation';

interface GuideContent {
  _id?: string;
  title: string;
  content: string;
  steps: {
    title: string;
    description: string;
    image?: string;
  }[];
  updatedAt?: string;
}

export default function PanduanPage() {
  const [guideContent, setGuideContent] = useState<GuideContent>({
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
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGuideContent();
  }, []);

  const fetchGuideContent = async () => {
    try {
      const response = await fetch('/api/admin/guide');
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          setGuideContent(data.data);
        }
      }
    } catch (error) {
      console.error('Error fetching guide content:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-theme-main">
        <Navigation />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-peach"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-theme-main">
      <Navigation />
      
      {/* Header */}
      <div className="bg-gradient-to-r from-accent-peach to-accent-yellow py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/" className="inline-flex items-center text-theme-primary hover:text-opacity-80 transition-colors mb-6">
              <ArrowLeft className="h-5 w-5 mr-2" />
              Kembali ke Beranda
            </Link>
          
          <h1 className="text-3xl md:text-4xl font-bold text-theme-primary mb-4">
              {guideContent.title}
            </h1>
            <p className="text-theme-primary text-opacity-90 text-lg">
              {guideContent.content}
            </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-8">
          {guideContent.steps.map((step, index) => (
            <div key={index} className="card-theme p-6 animate-fade-in-up" style={{ animationDelay: `${index * 0.1}s` }}>
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-accent-peach rounded-full flex items-center justify-center text-white font-bold">
                    {index + 1}
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-theme-primary mb-3">
                    {step.title}
                  </h3>
                  <p className="text-theme-primary text-opacity-80 leading-relaxed">
                    {step.description}
                  </p>
                  {step.image && (
                    <div className="mt-4">
                      <Image
                        src={step.image}
                        alt={step.title}
                        width={400}
                        height={200}
                        className="rounded-lg shadow-soft"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Additional Info */}
        <div className="mt-12 grid md:grid-cols-2 gap-6">
          <div className="card-theme p-6">
            <div className="flex items-center gap-3 mb-4">
              <MessageCircle className="h-6 w-6 text-accent-mint" />
              <h3 className="text-lg font-semibold text-theme-primary">Butuh Bantuan?</h3>
            </div>
            <p className="text-theme-primary text-opacity-80 mb-4">
              Tim customer service kami siap membantu Anda 24/7 melalui WhatsApp.
            </p>
            <Link
              href="https://wa.me/6281351990003"
              target="_blank"
              className="inline-flex items-center bg-accent-mint text-white px-4 py-2 rounded-lg hover:bg-opacity-90 transition-colors"
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Chat Admin
            </Link>
          </div>

          <div className="card-theme p-6">
            <div className="flex items-center gap-3 mb-4">
              <Truck className="h-6 w-6 text-accent-blue" />
              <h3 className="text-lg font-semibold text-theme-primary">Informasi Pengiriman</h3>
            </div>
            <ul className="text-theme-primary text-opacity-80 space-y-2">
              <li>• Pengiriman ke seluruh Indonesia</li>
              <li>• Estimasi 2-5 hari kerja</li>
              <li>• Harga belum termasuk ongkos kirim</li>
              <li>• Chat admin untuk konsultasi ongkir ya kak, siapa tau lagi promo hehe</li>
            </ul>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-12 text-center">
          <div className="card-theme p-8">
            <h3 className="text-2xl font-bold text-theme-primary mb-4">
              Siap Berbelanja?
            </h3>
            <p className="text-theme-primary text-opacity-80 mb-6">
              Jelajahi koleksi tas berkualitas kami dan temukan yang sesuai dengan gaya Anda!
            </p>
            <Link
              href="/products"
              className="inline-flex items-center bg-accent-peach text-white px-8 py-3 rounded-lg font-semibold hover:bg-opacity-90 transition-colors shadow-soft"
            >
              <ShoppingCart className="h-5 w-5 mr-2" />
              Mulai Belanja
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}