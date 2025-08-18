'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Search, ShoppingBag, Star, Eye, Tag, Menu, User, Heart, ShoppingCart, ChevronLeft, ChevronRight, Mail, Facebook, Instagram, Twitter, Grid, Package, X } from 'lucide-react';
import { formatCurrency, calculateDiscountPercentage } from '@/lib/utils';
import { useCart } from '@/contexts/CartContext';
import Navigation from '@/components/Navigation';
import { getWhatsAppNumber } from '@/lib/whatsapp';

interface Product {
  _id: string;
  name: string;
  slug: string;
  price: number;
  priceAfterDiscount?: number;
  images: string[];
  category: {
    _id: string;
    name: string;
    slug: string;
  };
  views: number;
  stock: number;
  promo?: {
    _id: string;
    title: string;
    type: string;
    value: number;
  };
}

interface Category {
  _id: string;
  name: string;
  slug: string;
  image?: string;
  productCount: number;
}

interface Promo {
  _id: string;
  title: string;
  type: string;
  value: number;
  productCount: number;
}

export default function HomePage() {
  const { state, dispatch } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [promos, setPromos] = useState<Promo[]>([]);
  const [popularProducts, setPopularProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const itemsPerSlide = 4;
  const [searchQuery, setSearchQuery] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('6281234567890');

  useEffect(() => {
    fetchData();
    fetchWhatsAppNumber();
  }, []);

  const fetchWhatsAppNumber = async () => {
    try {
      const number = await getWhatsAppNumber();
      setWhatsappNumber(number);
    } catch (error) {
      console.error('Error fetching WhatsApp number:', error);
    }
  };

  const fetchData = async () => {
    try {
      const [productsRes, categoriesRes, promosRes, popularRes] = await Promise.all([
        fetch('/api/products?limit=8'),
        fetch('/api/categories?withProductCount=true'),
        fetch('/api/promos?activeOnly=true'),
        fetch('/api/products?sort=views&order=desc&limit=6')
      ]);

      const [productsData, categoriesData, promosData, popularData] = await Promise.all([
        productsRes.json(),
        categoriesRes.json(),
        promosRes.json(),
        popularRes.json()
      ]);

      if (productsData.success) setProducts(productsData.data.products);
      if (categoriesData.success) setCategories(categoriesData.data);
      if (promosData.success) setPromos(promosData.data);
      if (popularData.success) setPopularProducts(popularData.data.products);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };



  if (loading) {
    return (
      <div className="loading-overlay">
        <div className="loading-dots">
          <div></div>
          <div></div>
          <div></div>
          <div></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-pink-50">
      {/* Header */}
      <Navigation />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-accent-peach to-accent-yellow text-theme-primary py-20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="animate-fade-in-up">
            <h1 className="text-4xl lg:text-5xl font-bold mb-6 leading-tight text-theme-primary">
              Koleksi Tas Terbaru
              <br />
              <span className="text-accent-mint">untuk Gaya Hidup Modern</span>
            </h1>
            <p className="text-lg text-theme-primary text-opacity-80 mb-8 max-w-2xl mx-auto leading-relaxed">
              Temukan tas impian kamu dari koleksi eksklusif kami. Kualitas premium dengan desain yang memukau.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href="/products"
                className="inline-block bg-accent-mint text-on-accent px-8 py-3 rounded-2xl font-semibold hover:bg-opacity-90 transition-all duration-200 shadow-soft"
              >
                Jelajahi Koleksi
              </Link>
              <Link
                href="/promos"
                className="inline-block border-2 border-accent-mint text-accent-mint px-8 py-3 rounded-2xl font-semibold hover:bg-accent-mint hover:bg-opacity-10 transition-all duration-200"
              >
                Lihat Promo
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Promo Section */}
        {promos.length > 0 && (
          <section className="py-16 bg-theme-main">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12 animate-fade-in-up">
                <div className="inline-flex items-center bg-accent-peach text-on-accent px-4 py-2 rounded-2xl text-sm font-semibold mb-4">
                  <Tag className="h-4 w-4 mr-2" />
                  PROMO SPESIAL
                </div>
                <h2 className="text-3xl font-bold text-theme-primary mb-3">Penawaran Terbaik Hari Ini</h2>
                <p className="text-theme-primary text-opacity-70 text-base">Jangan lewatkan kesempatan emas ini! Hemat hingga 70%</p>
              </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {promos.slice(0, 3).map((promo, index) => (
                <Link
                  key={promo._id}
                  href={`/promos`}
                  className="group card-theme rounded-3xl p-6 shadow-soft hover:shadow-medium transition-all duration-200 border border-theme-primary border-opacity-10 hover:border-opacity-20 relative"
                >
                  <div className="absolute top-0 right-0 bg-accent-peach text-on-accent px-3 py-1 rounded-bl-2xl rounded-tr-3xl">
                    <span className="text-xs font-semibold">HOT!</span>
                  </div>
                  <div className="flex items-center mb-4">
                    <div className="bg-accent-mint p-2 rounded-2xl mr-3">
                      <Tag className="h-5 w-5 text-on-accent" />
                    </div>
                    <span className="text-accent-peach font-semibold text-sm">PROMO SPESIAL</span>
                  </div>
                  <h3 className="font-bold text-theme-primary mb-3 text-lg">{promo.title}</h3>
                  <p className="text-2xl font-bold text-accent-peach mb-3">
                    {promo.type === 'percent' ? `${promo.value}%` : formatCurrency(promo.value)} OFF
                  </p>
                  <p className="text-theme-primary text-opacity-60 mb-4 text-sm">{promo.productCount} produk tersedia</p>
                  <div className="bg-accent-peach text-on-accent px-4 py-2 rounded-2xl text-center font-semibold text-sm group-hover:bg-opacity-90 transition-all duration-200">
                    Ambil Sekarang!
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Categories Section */}
      {categories.length > 0 && (
        <section className="py-16 bg-theme-main">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <div className="inline-flex items-center bg-accent-mint text-on-accent px-4 py-2 rounded-2xl text-sm font-semibold mb-4">
                <Menu className="h-4 w-4 mr-2" />
                KATEGORI PRODUK
              </div>
              <h2 className="text-3xl font-bold text-theme-primary mb-3">Jelajahi Kategori</h2>
              <p className="text-theme-primary text-opacity-70 text-base">Temukan produk sesuai kebutuhan Anda</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.slice(0, 6).map((category, index) => (
                <Link
                  key={category._id}
                  href={`/products?category=${category.slug}`}
                  className="group card-theme rounded-3xl p-5 shadow-soft hover:shadow-medium transition-all duration-200 border border-theme-primary border-opacity-10 hover:border-opacity-20 text-center"
                >
                  <div className="bg-accent-yellow w-12 h-12 rounded-2xl mx-auto mb-3 flex items-center justify-center">
                    <ShoppingBag className="h-6 w-6 text-on-accent" />
                  </div>
                  <h3 className="font-bold text-theme-primary mb-2 text-base">{category.name}</h3>
                  <p className="text-theme-primary text-opacity-60 text-xs mb-3">{category.productCount} produk</p>
                  <div className="bg-accent-mint text-on-accent px-3 py-1 rounded-2xl text-xs font-semibold group-hover:bg-opacity-90 transition-all duration-200">
                    Lihat Produk
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Popular Products Slider */}
      {popularProducts.length > 0 && (
        <section className="py-16 bg-theme-main">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8 animate-fade-in-up">
              <div>
                <h2 className="text-2xl font-bold text-accent-peach mb-2">Produk Populer</h2>
                <p className="text-theme-primary text-opacity-70 animate-fade-in animate-delay-100">Pilihan favorit pelanggan kami</p>
              </div>
              <div className="flex items-center space-x-4 animate-fade-in animate-delay-200">
                <button
                  onClick={() => setCurrentSlide(Math.max(0, currentSlide - 1))}
                  disabled={currentSlide === 0}
                  className="p-2 rounded-full bg-accent-mint bg-opacity-20 text-accent-mint hover:bg-opacity-30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setCurrentSlide(Math.min(Math.ceil(popularProducts.length / itemsPerSlide) - 1, currentSlide + 1))}
                  disabled={currentSlide >= Math.ceil(popularProducts.length / itemsPerSlide) - 1}
                  className="p-2 rounded-full bg-accent-mint bg-opacity-20 text-accent-mint hover:bg-opacity-30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
                <Link
                  href="/products?sort=views&order=desc"
                  className="text-accent-peach hover:text-opacity-80 font-medium text-sm transition-all duration-200 hover:translate-y-[-2px]"
                >
                  Lihat Semua →
                </Link>
              </div>
            </div>
            
            <div className="relative overflow-hidden">
              <div 
                className="flex transition-all duration-500 ease-out"
                style={{ transform: `translateX(-${currentSlide * 100}%)` }}
              >
                {Array.from({ length: Math.ceil(popularProducts.length / itemsPerSlide) }).map((_, slideIndex) => (
                  <div key={slideIndex} className="w-full flex-shrink-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      {popularProducts
                        .slice(slideIndex * itemsPerSlide, (slideIndex + 1) * itemsPerSlide)
                        .map((product, index) => (
                          <div key={product._id} className={`animate-scale-in animate-delay-${(index + 1) * 100}`}>
                            <ProductCard product={product} showPopularBadge />
                          </div>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Slide Indicators */}
            <div className="flex justify-center mt-6 space-x-2 animate-fade-in animate-delay-300">
              {Array.from({ length: Math.ceil(popularProducts.length / itemsPerSlide) }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-200 hover:scale-110 ${
                    currentSlide === index ? 'bg-accent-peach shadow-soft' : 'bg-theme-primary bg-opacity-30 hover:bg-accent-peach hover:bg-opacity-50'
                  }`}
                />
              ))}
            </div>
          </div>
        </section>
      )}



      {/* Featured Products */}
      {products.length > 0 && (
        <section className="py-16 bg-theme-main">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <div className="inline-flex items-center bg-accent-yellow text-on-accent px-4 py-2 rounded-2xl text-sm font-semibold mb-4">
                <Star className="h-4 w-4 mr-2" />
                PRODUK UNGGULAN
              </div>
              <h2 className="text-3xl font-bold text-theme-primary mb-3">Koleksi Terpopuler</h2>
              <p className="text-theme-primary text-opacity-70 text-base">Produk pilihan yang paling disukai pelanggan kami</p>
            </div>
            
            <div className="flex justify-center mb-8">
              <Link
                href="/products"
                className="bg-accent-peach text-on-accent px-6 py-3 rounded-2xl font-semibold hover:bg-opacity-90 transition-all duration-200 shadow-soft"
              >
                Lihat Semua →
              </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map((product, index) => (
                <div key={product._id}>
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}



      {/* Newsletter */}
      <section className="py-16 bg-theme-main">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center bg-theme-primary text-theme-main px-4 py-2 rounded-2xl text-sm font-semibold mb-4">
            <Mail className="h-4 w-4 mr-2" />
            NEWSLETTER
          </div>
          <h2 className="text-3xl font-bold text-theme-primary mb-3">Dapatkan Update Terbaru</h2>
          <p className="text-theme-primary text-opacity-80 text-base mb-8">Berlangganan newsletter kami dan dapatkan info promo eksklusif</p>
          
          <form className="max-w-md mx-auto flex gap-3">
            <input
              type="email"
              placeholder="Masukkan email Anda"
              className="flex-1 px-4 py-3 border border-theme-primary border-opacity-30 rounded-2xl focus:ring-2 focus:ring-accent-peach focus:border-accent-peach transition-all duration-200 bg-theme-main text-theme-primary"
            />
            <button
              type="submit"
              className="bg-accent-peach text-on-accent px-6 py-3 rounded-2xl font-semibold hover:bg-opacity-90 transition-all duration-200"
            >
              Berlangganan
            </button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-theme-main text-theme-primary py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="bg-accent-peach p-2 rounded-xl">
                  <ShoppingBag className="h-5 w-5 text-on-accent" />
                </div>
                <span className="text-xl font-bold text-accent-mint">SistaBag</span>
              </div>
              <p className="text-theme-primary text-opacity-70 text-sm leading-relaxed">
                Toko tas terpercaya dengan koleksi terlengkap dan kualitas terbaik. Kepuasan pelanggan adalah prioritas utama kami.
              </p>
            </div>
            
            <div>
              <h3 className="font-bold mb-4 text-lg text-accent-mint">Kategori</h3>
              <ul className="space-y-2 text-theme-primary text-opacity-70">
                {categories.slice(0, 4).map((category) => (
                  <li key={category._id}>
                    <Link href={`/categories/${category.slug}`} className="hover:text-accent-mint transition-all duration-200 text-sm">
                      {category.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h3 className="font-bold mb-4 text-lg text-accent-mint">Bantuan</h3>
              <ul className="space-y-2 text-theme-primary text-opacity-70">
                <li><a href="#" className="hover:text-accent-mint transition-all duration-200 text-sm">
                  Cara Pemesanan
                </a></li>
                <li><a href="#" className="hover:text-accent-mint transition-all duration-200 text-sm">
                  Kebijakan Privasi
                </a></li>
                <li><a href="#" className="hover:text-accent-mint transition-all duration-200 text-sm">
                  Syarat & Ketentuan
                </a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-bold mb-4 text-lg text-accent-mint">Kontak</h3>
              <ul className="space-y-2 text-theme-primary text-opacity-70">
                <li className="text-sm">
                  WhatsApp: +{whatsappNumber}
                </li>
                <li className="text-sm">
                  Email: info@sistabag.com
                </li>
                <li className="text-sm">
                  Alamat: Jakarta, Indonesia
                </li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-theme-primary border-opacity-20 pt-6 text-center">
            <p className="text-theme-primary text-opacity-50 text-sm">&copy; 2024 SistaBag. All rights reserved. Made with ❤️ for fashion lovers.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Product Card Component
function ProductCard({ product, showPopularBadge = false }: { product: Product; showPopularBadge?: boolean }) {
  const discountPercentage = product.priceAfterDiscount 
    ? calculateDiscountPercentage(product.price, product.priceAfterDiscount)
    : 0;

  const isPopular = product.views >= 100;

  return (
    <Link href={`/products/${product.slug}`} className="group">
      <div className="card-theme rounded-3xl shadow-soft hover:shadow-medium transition-all duration-200 border border-theme-primary border-opacity-10 hover:border-opacity-20 overflow-hidden">
        <div className="relative aspect-square">
          <Image
            src={product.images[0] || '/placeholder-bag.jpg'}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-all duration-200"
          />
          
          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {showPopularBadge && isPopular && (
              <span className="bg-accent-peach text-on-accent px-2 py-1 rounded-2xl text-xs font-semibold flex items-center gap-1">
                <Star className="h-3 w-3" />
                Populer
              </span>
            )}
            {discountPercentage > 0 && (
              <span className="bg-accent-mint text-on-accent px-2 py-1 rounded-2xl text-xs font-semibold">
                -{discountPercentage}%
              </span>
            )}
          </div>
          
          {/* Views */}
          <div className="absolute top-3 right-3 bg-theme-primary text-theme-main px-2 py-1 rounded-2xl text-xs flex items-center gap-1">
            <Eye className="h-3 w-3" />
            {product.views}
          </div>
        </div>
        
        <div className="p-4">
          <h3 className="font-bold text-theme-primary mb-2 line-clamp-2 text-base group-hover:text-accent-peach transition-all duration-200">{product.name}</h3>
          <p className="text-xs text-theme-primary text-opacity-60 mb-3">{product.category.name}</p>
          
          <div className="flex items-center justify-between">
            <div>
              {product.priceAfterDiscount ? (
                <div className="flex flex-col">
                  <span className="text-lg font-bold text-accent-peach">
                    {formatCurrency(product.priceAfterDiscount)}
                  </span>
                  <span className="text-xs text-theme-primary text-opacity-50 line-through">
                    {formatCurrency(product.price)}
                  </span>
                </div>
              ) : (
                <span className="text-lg font-bold text-theme-primary">
                  {formatCurrency(product.price)}
                </span>
              )}
            </div>
            
            <span className={`text-xs px-2 py-1 rounded-2xl font-semibold ${
              product.stock > 0 
                ? 'bg-accent-mint bg-opacity-20 text-accent-mint' 
                : 'bg-accent-peach bg-opacity-20 text-accent-peach'
            }`}>
              {product.stock > 0 ? 'Tersedia' : 'Habis'}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
